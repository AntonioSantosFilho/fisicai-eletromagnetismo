const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const { check, prepare } = require("../scripts/prepare-repository.cjs");

function fixture(t) {
  const parent = fs.realpathSync(os.tmpdir());
  const directory = fs.mkdtempSync(path.join(parent, "fisicai-repository-"));
  const source = path.join(directory, "source");
  fs.mkdirSync(source);
  assert.equal(
    spawnSync("git", ["init", "--initial-branch=main", source], {
      windowsHide: true,
    }).status,
    0,
  );
  fs.copyFileSync(
    path.join(__dirname, "../.gitignore"),
    path.join(source, ".gitignore"),
  );
  fs.writeFileSync(path.join(source, "readme.md"), "# Projeto de teste\n");
  t.after(() => {
    const resolved = fs.realpathSync(directory);
    if (
      !resolved.startsWith(parent + path.sep) ||
      !path.basename(resolved).startsWith("fisicai-repository-")
    )
      throw new Error("Diretório temporário fora do escopo");
    fs.rmSync(resolved, { recursive: true });
  });
  return { directory, source };
}

test("exportação respeita exclusões de segredos, builds e capturas particulares", (t) => {
  const { source } = fixture(t);
  for (const [file, content] of [
    [".env.local", "GEMINI_API_KEY=" + "AIza" + "x".repeat(35)],
    [".credentials/upload-key.json", "segredo de teste"],
    ["publicacao/artifacts/app.aab", "binário de teste"],
    ["problemas loja ui/foto.jpeg", "captura de teste"],
    [".env.example", "GEMINI_API_KEY=\n"],
  ]) {
    fs.mkdirSync(path.dirname(path.join(source, file)), { recursive: true });
    fs.writeFileSync(path.join(source, file), content);
  }
  const result = check(source);
  assert.equal(result.issues.length, 0);
  assert.deepEqual(
    result.files.map((file) => file.path),
    [".env.example", ".gitignore", "readme.md"],
  );
});

test("credencial escrita em arquivo público impede a cópia sem exibir seu valor", (t) => {
  const { source, directory } = fixture(t);
  const credential = "AIza" + "x".repeat(35);
  fs.writeFileSync(path.join(source, "readme.md"), credential);
  const result = check(source);
  assert.equal(result.issues[0].file, "readme.md");
  assert.ok(!JSON.stringify(result.issues).includes(credential));
  const target = path.join(directory, "blocked");
  assert.throws(() => prepare(source, target), /nada foi copiado/);
  assert.equal(fs.existsSync(target), false);
});

test("cópia recebe novo Git e preserva arquivos existentes no destino", (t) => {
  const { source, directory } = fixture(t);
  const destination = path.join(directory, "public");
  prepare(source, destination);
  assert.ok(fs.existsSync(path.join(destination, ".git")));
  assert.equal(
    fs.readFileSync(path.join(destination, "readme.md"), "utf8"),
    "# Projeto de teste\n",
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(destination, "repository-manifest.json"), "utf8"),
  );
  assert.equal(manifest.files.length, 2);
  assert.throws(() => prepare(source, destination), /nova ou vazia/);
  assert.throws(
    () => prepare(source, path.join(source, "nested")),
    /fora da pasta/,
  );
});

test("gitignore não esconde credencial já adicionada ao Git", (t) => {
  const { source } = fixture(t);
  fs.writeFileSync(path.join(source, ".env.local"), "GEMINI_API_KEY=\n");
  assert.equal(spawnSync("git", ["-C", source, "add", "-f", ".env.local"], { windowsHide: true }).status, 0);
  const result = check(source);
  assert.equal(result.issues[0].file, ".env.local");
  assert.match(result.issues[0].reason, /já versionado/);
});
