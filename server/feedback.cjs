const { randomUUID } = require("node:crypto");
const { containsPrivateData } = require("./openai-provider.cjs");
const categories = new Set([
  "conteudo_inadequado",
  "fora_do_tema",
  "erro_de_fisica",
  "outro",
]);
function createFeedbackHandler({
  enabled = false,
  logger = console.info,
  now = Date.now,
  allowedOrigins = [],
} = {}) {
  let windowStart = now(),
    count = 0;
  return async (req, res, next) => {
    if (req.url?.split("?")[0] !== "/api/feedback")
      return next ? next() : res.writeHead(404).end();
    const send = (status, body) => {
      res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(body));
    };
    const origin = req.headers?.origin?.replace(/\/$/, "");
    const sameOrigin =
      origin ===
      `${req.socket?.encrypted ? "https" : "http"}://${req.headers?.host}`;
    if (origin && !sameOrigin && !allowedOrigins.includes(origin))
      return send(403, { error: "Origem não autorizada." });
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "POST");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return send(204, {});
    }
    if (req.method !== "POST") return send(405, { error: "Use POST." });
    if (!enabled)
      return send(503, {
        error:
          "O recebimento de relatos está temporariamente indisponível. Tente novamente mais tarde.",
      });
    if (now() - windowStart > 3600000) {
      windowStart = now();
      count = 0;
    }
    if (count >= 100)
      return send(429, {
        error: "Limite de relatos atingido. Tente mais tarde.",
      });
    let data;
    try {
      let raw;
      if (req.body !== undefined)
        raw =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      else {
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 20000) throw new Error();
          chunks.push(chunk);
        }
        raw = Buffer.concat(chunks).toString("utf8");
      }
      if (!raw || Buffer.byteLength(raw) > 20000) throw new Error();
      data = JSON.parse(raw);
      if (
        data.confirmed !== true ||
        !categories.has(data.category) ||
        typeof data.responseText !== "string" ||
        !data.responseText.trim() ||
        data.responseText.length > 10000 ||
        typeof data.details !== "string" ||
        data.details.length > 500 ||
        typeof data.responseId !== "string" ||
        !/^[A-Za-z0-9_-]{1,150}$/.test(data.responseId)
      )
        throw new Error();
      if (containsPrivateData(data.responseText + "\n" + data.details))
        return send(400, {
          error: "Remova dados pessoais do relato antes de enviar.",
        });
    } catch {
      return send(400, { error: "Confira o conteúdo do relato." });
    }
    const id = randomUUID();
    try {
      // Somente relatos enviados voluntariamente chegam aos registros privados
      // da hospedagem. Perguntas e conversas comuns não são registradas aqui.
      await logger(
        JSON.stringify({
          event: "fisicai_ai_report",
          id,
          at: new Date(now()).toISOString(),
          category: data.category,
          responseId: data.responseId,
          responseText: data.responseText,
          details: data.details,
        }),
      );
      count++;
      return send(201, { id });
    } catch {
      return send(503, {
        error: "O relato não foi registrado. Tente novamente mais tarde.",
      });
    }
  };
}
module.exports = { createFeedbackHandler };
