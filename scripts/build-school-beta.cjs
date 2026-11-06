const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const publication = require("../publicacao/release.json");
if (
  !publication.aiProviderApproved ||
  !publication.developerName ||
  !publication.supportEmail ||
  (!publication.backendVerified &&
    !process.argv.includes("--allow-unverified-tutor")) ||
  !publication.backendUrl?.startsWith("https://")
)
  throw new Error(
    "Faltam responsável, contato ou servidor HTTPS de IA verificado. Não foi gerado um pacote de distribuição.",
  );
const env = {
  ...process.env,
  EXPO_PUBLIC_RELEASE_CHANNEL: "school-beta",
  NODE_ENV: "production",
  CI: "1",
  JAVA_HOME:
    process.env.JAVA_HOME || "C:/Program Files/Android/Android Studio/jbr",
  ANDROID_HOME:
    process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(
      require("node:os").homedir(),
      process.platform === "win32" ? "AppData/Local/Android/Sdk" : process.platform === "darwin" ? "Library/Android/sdk" : "Android/Sdk",
    ),
};
env.EXPO_PUBLIC_TUTOR_URL = publication.backendUrl;
const auditDir = path.join(root, "publicacao", new Date().toISOString().slice(0, 10));
fs.mkdirSync(auditDir, { recursive: true });
function runNode(args, name) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    env,
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.status !== 0) throw new Error(`Etapa interrompida: ${name}`);
}
runNode(["scripts/prepare-publication.cjs"], "documentos legais");
runNode(["scripts/sync-brand-assets.cjs"], "marca");
runNode(["scripts/render-math.cjs"], "expressões matemáticas");
runNode(["scripts/create-upload-key.cjs"], "assinatura");
runNode(
  [
    "node_modules/expo/bin/cli",
    "prebuild",
    "--platform",
    "android",
    "--no-install",
  ],
  "projeto Android",
);
const signing = JSON.parse(
  fs.readFileSync(path.join(root, ".credentials/upload-key.json"), "utf8"),
);
Object.assign(env, {
  FISICAI_UPLOAD_STORE_FILE: path.join(
    root,
    ".credentials",
    signing.keystoreFile,
  ),
  FISICAI_UPLOAD_STORE_PASSWORD: signing.storePassword,
  FISICAI_UPLOAD_KEY_PASSWORD: signing.keyPassword,
  FISICAI_UPLOAD_KEY_ALIAS: signing.keyAlias,
});
const gradleFile = path.join(root, "android/app/build.gradle");
let gradle = fs.readFileSync(gradleFile, "utf8");
if (!gradle.includes("fisicaiRelease {")) {
  gradle = gradle.replace(
    "signingConfigs {",
    `signingConfigs {
        fisicaiRelease {
            storeFile file(System.getenv('FISICAI_UPLOAD_STORE_FILE'))
            storePassword System.getenv('FISICAI_UPLOAD_STORE_PASSWORD')
            keyAlias System.getenv('FISICAI_UPLOAD_KEY_ALIAS')
            keyPassword System.getenv('FISICAI_UPLOAD_KEY_PASSWORD')
        }`,
  );
}
const releaseIndex = gradle.indexOf(
  "release {",
  gradle.indexOf("buildTypes {"),
);
if (releaseIndex < 0)
  throw new Error(
    "Configuração de release não encontrada; nada foi publicado.",
  );
gradle =
  gradle.slice(0, releaseIndex) +
  gradle
    .slice(releaseIndex)
    .replace(
      "signingConfig signingConfigs.debug",
      "signingConfig signingConfigs.fisicaiRelease",
    );
fs.writeFileSync(gradleFile, gradle);
const logFile = path.join(auditDir, "build-release.log");
const log = fs.openSync(logFile, "w");
console.log(
  `Compilando APK e AAB assinados. O andamento está em ${logFile}.`,
);
const args = [
  ":app:assembleRelease",
  ":app:bundleRelease",
  "-PreactNativeArchitectures=arm64-v8a,armeabi-v7a",
  "--no-daemon",
  "--console=plain",
  "--max-workers=4",
];
const result =
  process.platform === "win32"
    ? spawnSync("cmd.exe", ["/d", "/c", "gradlew.bat", ...args], {
        cwd: path.join(root, "android"),
        env,
        stdio: ["ignore", log, log],
        windowsHide: true,
      })
    : spawnSync("./gradlew", args, {
        cwd: path.join(root, "android"),
        env,
        stdio: ["ignore", log, log],
      });
fs.closeSync(log);
if (result.status !== 0)
  throw new Error(
    "A compilação falhou. Consulte o log; nenhum arquivo foi enviado ao Google Play.",
  );
const destination = path.join(root, "publicacao/artifacts");
fs.mkdirSync(destination, { recursive: true });
const artifacts = [];
for (const [source, extension] of [
  ["android/app/build/outputs/apk/release/app-release.apk", "apk"],
  ["android/app/build/outputs/bundle/release/app-release.aab", "aab"],
]) {
  const filename = `FisicAI-${publication.version}.${extension}`;
  const output = path.join(destination, filename);
  fs.copyFileSync(path.join(root, source), output);
  const bytes = fs.readFileSync(output);
  artifacts.push({
    filename,
    path: output,
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  });
}
fs.writeFileSync(
  path.join(auditDir, "artefatos.json"),
  JSON.stringify(
    {
      date: new Date().toISOString(),
      package: publication.androidPackage,
      version: publication.version,
      channel: "school-beta",
      artifacts,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    built: true,
    artifacts: artifacts.map(({ filename, bytes, sha256 }) => ({
      filename,
      bytes,
      sha256,
    })),
  }),
);
