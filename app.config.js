// A distribuição escolar é explícita e não altera a configuração da prévia local.
const publication = require("./publicacao/release.json");
module.exports = ({ config }) => {
  const schoolBeta = process.env.EXPO_PUBLIC_RELEASE_CHANNEL === "school-beta";
  return {
    ...config,
    ...(schoolBeta ? { web: { ...config.web, output: "server" } } : {}),
    ...(schoolBeta
      ? { name: `${publication.publicName} Beta`, version: publication.version }
      : {}),
    android: {
      ...config.android,
      ...(schoolBeta
        ? {
            versionCode: publication.versionCode,
            allowBackup: false,
            blockedPermissions: [
              "android.permission.READ_EXTERNAL_STORAGE",
              "android.permission.WRITE_EXTERNAL_STORAGE",
              "android.permission.SYSTEM_ALERT_WINDOW",
              "android.permission.RECORD_AUDIO",
              "android.permission.CAMERA",
              "android.permission.ACCESS_FINE_LOCATION",
              "android.permission.ACCESS_COARSE_LOCATION",
              "android.permission.VIBRATE",
            ],
          }
        : {}),
    },
  };
};
