const http = require("node:http");
const tutor = require("./tutor.cjs").fromEnvironment();
const feedback = require("./feedback.cjs").createFeedbackHandler({
  enabled: process.env.TUTOR_FEEDBACK_LOGGING === "enabled",
});
const server = http.createServer((req, res) =>
  tutor(req, res, () => feedback(req, res)),
);
server.requestTimeout = 45000;
server.headersTimeout = 10000;
server.listen(
  Number(process.env.TUTOR_PORT || 8084),
  process.env.TUTOR_HOST || "127.0.0.1",
  () => console.log("Servidor do tutor iniciado."),
);
