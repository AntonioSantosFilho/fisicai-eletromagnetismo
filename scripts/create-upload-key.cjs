// Gera uma chave local, sem imprimir senhas ou colocá-las nos argumentos.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const folder = path.join(root, ".credentials");
const credentialsPath = path.join(folder, "upload-key.json");
const keystorePath = path.join(folder, "fisicai-upload.jks");
if (fs.existsSync(credentialsPath) || fs.existsSync(keystorePath)) {
  if (!fs.existsSync(credentialsPath) || !fs.existsSync(keystorePath))
    throw new Error(
      "A chave ou o arquivo de acesso está ausente. A cópia existente foi preservada.",
    );
  console.log("Chave de assinatura existente preservada.");
  process.exit(0);
}
const javaHome =
  process.env.JAVA_HOME || "C:/Program Files/Android/Android Studio/jbr";
const keytool = path.join(
  javaHome,
  "bin",
  process.platform === "win32" ? "keytool.exe" : "keytool",
);
if (!fs.existsSync(keytool))
  throw new Error("Configure JAVA_HOME com um JDK compatível.");
fs.mkdirSync(folder, { recursive: true });
const password = crypto.randomBytes(32).toString("base64url");
const result = spawnSync(
  keytool,
  [
    "-genkeypair",
    "-keystore",
    keystorePath,
    "-alias",
    "fisicai-upload",
    "-keyalg",
    "RSA",
    "-keysize",
    "4096",
    "-validity",
    "10000",
    "-storetype",
    "JKS",
    "-storepass:env",
    "FISICAI_SIGNING_PASSWORD",
    "-keypass:env",
    "FISICAI_SIGNING_PASSWORD",
    "-dname",
    "CN=FisicAI, O=FisicAI, C=BR",
    "-noprompt",
  ],
  {
    env: { ...process.env, FISICAI_SIGNING_PASSWORD: password },
    encoding: "utf8",
    windowsHide: true,
  },
);
if (result.status !== 0)
  throw new Error(
    result.stderr || "Não foi possível gerar a chave de assinatura.",
  );
fs.writeFileSync(
  credentialsPath,
  JSON.stringify(
    {
      keystoreFile: "fisicai-upload.jks",
      storePassword: password,
      keyPassword: password,
      keyAlias: "fisicai-upload",
    },
    null,
    2,
  ) + "\n",
  { mode: 0o600 },
);
console.log(
  "Chave criada na pasta privada .credentials. Nenhuma senha foi exibida.",
);
