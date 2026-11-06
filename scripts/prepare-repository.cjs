// Prepara uma cópia pública sem copiar o histórico Git nem os arquivos privados.
// Não imprime credenciais, não apaga arquivos e não publica na rede.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

function git(root, args, input) {
  const result = spawnSync("git", ["-C", root, ...args], {
    input,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error || ![0, 1].includes(result.status))
    throw new Error("Não foi possível consultar o Git.");
  return result;
}
function privatePath(file) {
  const parts = file.replace(/\\/g, "/").split("/");
  return (
    parts.some((part) =>
      [".git", ".credentials", "node_modules", ".audit-tmp"].includes(part),
    ) ||
    parts.some(
      (part) => part !== ".env.example" && /^\.env(?:\.|$)/.test(part),
    ) ||
    /\.(?:jks|keystore|p8|p12|pfx|pem|key|mobileprovision|apk|aab|ipa)$/i.test(
      file,
    ) ||
    /(?:^|\/)(?:credentials\.json|[^/]*service[-_]account[^/]*\.json)$/i.test(
      file,
    )
  );
}
function knownSecrets(root) {
  const secrets = [];
  for (const name of [".env.local", "server/.env"]) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(
        /^\s*([A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD))\s*=\s*(.*?)\s*$/,
      );
      if (!match) continue;
      const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
      if (value.length >= 12) secrets.push(value);
    }
  }
  return secrets;
}
function check(root) {
  root = fs.realpathSync(root);
  const candidates = git(root, [
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "-z",
    "--",
    ".",
  ])
    .stdout.split("\0")
    .filter(Boolean);
  const ignoredResult = git(
    root,
    ["check-ignore", "--no-index", "--stdin", "-z"],
    candidates.join("\0") + "\0",
  );
  const ignored = new Set(ignoredResult.stdout.split("\0").filter(Boolean));
  const tracked = new Set(git(root, ["ls-files", "--cached", "-z", "--", "."]).stdout.split("\0").filter(Boolean));
  const secrets = knownSecrets(root);
  const files = [];
  const issues = [];
  for (const name of [...new Set(candidates)].sort()) {
    if (ignored.has(name)) {
      if (tracked.has(name) && privatePath(name)) issues.push({ file: name, reason: "arquivo privado já versionado; gitignore não remove o histórico" });
      continue;
    }
    const source = path.resolve(root, name);
    if (!source.startsWith(root + path.sep) || privatePath(name)) {
      issues.push({ file: name, reason: "arquivo privado" });
      continue;
    }
    const stat = fs.lstatSync(source);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      issues.push({ file: name, reason: "tipo de arquivo inesperado" });
      continue;
    }
    const data = fs.readFileSync(source);
    if (data.length > 10 * 1024 * 1024) {
      issues.push({ file: name, reason: "arquivo maior que 10 MiB" });
      continue;
    }
    const text = data.toString("utf8");
    const credentialPattern =
      /AIza[0-9A-Za-z_-]{30,}|\b(?:sk-(?:or-v1|proj|svcacct)-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{32,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
    if (
      credentialPattern.test(text) ||
      secrets.some((value) => text.includes(value))
    )
      issues.push({ file: name, reason: "possível credencial no conteúdo" });
    files.push({
      path: name,
      bytes: data.length,
      sha256: crypto.createHash("sha256").update(data).digest("hex"),
    });
  }
  return {
    root,
    files,
    issues,
    totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  };
}
function prepare(root, destination) {
  const result = check(root);
  if (result.issues.length)
    throw new Error(
      "A verificação encontrou arquivos que precisam de revisão; nada foi copiado.",
    );
  destination = path.resolve(destination);
  const parent = fs.realpathSync(path.dirname(destination));
  destination = path.join(parent, path.basename(destination));
  const sourceNormalized = result.root.toLowerCase();
  const destinationNormalized = destination.toLowerCase();
  if (
    destinationNormalized === sourceNormalized ||
    destinationNormalized.startsWith(sourceNormalized + path.sep)
  )
    throw new Error("O destino deve ficar fora da pasta de origem.");
  if (
    fs.existsSync(destination) &&
    (fs.lstatSync(destination).isSymbolicLink() ||
      fs.readdirSync(destination).length)
  )
    throw new Error("O destino precisa ser uma pasta nova ou vazia.");
  fs.mkdirSync(destination, { recursive: true });
  for (const file of result.files) {
    const target = path.join(destination, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(
      path.join(result.root, file.path),
      target,
      fs.constants.COPYFILE_EXCL,
    );
  }
  const initialized = spawnSync(
    "git",
    ["init", "--initial-branch=main", destination],
    { encoding: "utf8", windowsHide: true },
  );
  if (initialized.status !== 0)
    throw new Error("Arquivos copiados; inicialização do Git não concluída.");
  fs.writeFileSync(
    path.join(destination, "repository-manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "FisicAI independente",
        files: result.files,
        totalBytes: result.totalBytes,
        issues: [],
      },
      null,
      2,
    ) + "\n",
  );
  return { ...result, destination };
}
if (require.main === module) {
  try {
    const root = path.resolve(__dirname, "..");
    const destination = process.argv
      .slice(2)
      .find((arg) => !arg.startsWith("--"));
    const result = destination ? prepare(root, destination) : check(root);
    console.log(
      JSON.stringify(
        {
          files: result.files.length,
          bytes: result.totalBytes,
          issues: result.issues,
          ...(result.destination ? { destination: result.destination } : {}),
        },
        null,
        2,
      ),
    );
    if (result.issues.length) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { check, prepare, privatePath };
