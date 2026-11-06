const theory = require("../data/teoria.json").conteudos;
const refs = require("../data/referencias.json").referencias;
const {
  requestOpenAITutor,
  UnsafeContent,
  SAFE_REPLY,
  containsPrivateData,
} = require("./openai-provider.cjs");
const {
  criarInstrucaoTutor,
  MARCADOR_FORA_ESCOPO,
  RESPOSTA_FORA_ESCOPO,
} = require("./politica-tutor.cjs");
const normalize = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function createTutorHandler({
  apiKey,
  model,
  provider = "gemini",
  requirePrivacyAcknowledgement = false,
  fetchImpl = fetch,
  now = Date.now,
  hourlyLimit = 100,
  timeoutMs = 18000,
  allowedOrigins = [],
} = {}) {
  const requests = new Map();
  let start = now(),
    total = 0;
  return async (req, res, next) => {
    if (req.url?.split("?")[0] !== "/api/tutor")
      return next ? next() : res.writeHead(404).end();
    const reply = (status, data) => {
      if (!res.destroyed && !res.writableEnded) {
        res.writeHead(status, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(JSON.stringify(data));
      }
    };
    const origin = req.headers.origin?.replace(/\/$/, "");
    const sameOrigin =
      origin ===
      `${req.socket.encrypted ? "https" : "http"}://${req.headers.host}`;
    if (origin && !sameOrigin && !allowedOrigins.includes(origin))
      return reply(403, { error: "Origem não autorizada." });
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "POST");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return reply(204, {});
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return reply(405, { error: "Use POST." });
    }
    if (!req.headers["content-type"]?.startsWith("application/json"))
      return reply(415, { error: "Envie JSON." });
    if (Number(req.headers["content-length"]) > 32768)
      return reply(413, { error: "Pergunta muito longa." });
    if (!apiKey || !model || !/^[a-zA-Z0-9._-]+$/.test(model))
      return reply(503, {
        error:
          "O assistente está indisponível. Você pode continuar estudando e praticando.",
      });
    const time = now();
    if (time - start >= 3600000) {
      start = time;
      total = 0;
      requests.clear();
    }
    const ip = req.socket.remoteAddress || "local",
      recent = (requests.get(ip) || []).filter((t) => time - t < 60000);
    if (
      recent.length >= 6 ||
      total >= hourlyLimit ||
      (!requests.has(ip) && requests.size >= 1000)
    )
      return reply(429, {
        error: "O limite de perguntas foi atingido. Aguarde e tente novamente.",
      });
    requests.set(ip, [...recent, time]);
    total++;
    let messages;
    let safetyId;
    try {
      let input;
      if (req.body !== undefined) {
        const raw =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);
        if (Buffer.byteLength(raw) > 32768)
          return reply(413, { error: "Pergunta muito longa." });
        input = JSON.parse(raw);
      } else {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 32768)
            return reply(413, { error: "Pergunta muito longa." });
          chunks.push(chunk);
        }
        input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      }
      messages = input.messages;
      if (
        requirePrivacyAcknowledgement &&
        (input.privacyAcknowledged !== true ||
          typeof input.sessionId !== "string" ||
          !/^[A-Za-z0-9_-]{8,120}$/.test(input.sessionId))
      )
        return reply(400, {
          error:
            "Leia o aviso de privacidade e confirme a faixa etária antes de usar o assistente.",
        });
      safetyId =
        typeof input.sessionId === "string" ? input.sessionId : undefined;
      if (
        !Array.isArray(messages) ||
        !messages.length ||
        messages.length > 8 ||
        !messages.every(
          (m) =>
            m &&
            ["usuario", "assistente"].includes(m.papel) &&
            typeof m.conteudo === "string" &&
            m.conteudo.trim().length &&
            m.conteudo.length <= 2000,
        ) ||
        messages.at(-1).papel !== "usuario" ||
        messages.reduce((n, m) => n + m.conteudo.length, 0) > 12000
      )
        throw Error();
      if (messages.some((message) => containsPrivateData(message.conteudo)))
        return reply(400, {
          error:
            "Remova e-mails, telefones, documentos e chaves da conversa. Envie apenas sua dúvida de eletromagnetismo.",
        });
    } catch {
      return reply(400, {
        error: "Confira o tamanho e o conteúdo da pergunta.",
      });
    }
    const words = new Set(
      normalize(messages.at(-1).conteudo)
        .split(/\W+/)
        .filter((w) => w.length > 3),
    );
    const matched = theory
      .map((item) => ({
        item,
        score: [...words].filter((w) =>
          normalize(`${item.tema} ${item.topico} ${item.conceito}`).includes(w),
        ).length,
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.item);
    const context = matched
      .map(
        (i) =>
          `${i.topico}: ${i.conceito}\n${i.formula_legivel}\n${i.contexto_expressao}`,
      )
      .join("\n\n")
      .slice(0, 7000);
    const sources = [...new Set(matched.flatMap((i) => i.referencias))]
      .map((id) => refs.find((r) => r.id === id))
      .filter(Boolean)
      .map((r) => ({ titulo: r.titulo, url: r.url }));
    const controller = new AbortController(),
      abort = () => {
        if (!res.writableEnded) controller.abort();
      };
    res.on("close", abort);
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      if (provider === "openai") {
        const result = await requestOpenAITutor({
          apiKey,
          model,
          messages,
          instructions: criarInstrucaoTutor(context),
          safetyId,
          signal: controller.signal,
          fetchImpl,
        });
        if (result.reply.includes(MARCADOR_FORA_ESCOPO))
          return reply(200, { reply: RESPOSTA_FORA_ESCOPO, sources: [] });
        return reply(200, {
          reply: result.reply,
          responseId: result.responseId,
          sources,
        });
      }
      const response = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: criarInstrucaoTutor(context),
                },
              ],
            },
            contents: messages.map((m) => ({
              role: m.papel === "usuario" ? "user" : "model",
              parts: [{ text: m.conteudo }],
            })),
            generationConfig: { maxOutputTokens: 700 },
            safetySettings: [
              "HARM_CATEGORY_HARASSMENT",
              "HARM_CATEGORY_HATE_SPEECH",
              "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              "HARM_CATEGORY_DANGEROUS_CONTENT",
            ].map((category) => ({
              category,
              threshold: "BLOCK_LOW_AND_ABOVE",
            })),
          }),
        },
      );
      if (!response.ok)
        return reply(response.status === 429 ? 429 : 502, {
          error:
            response.status === 429
              ? "O assistente atingiu seu limite. Tente mais tarde."
              : "O assistente não conseguiu responder agora. Tente novamente depois.",
        });
      const data = await response.json();
      if (
        data.promptFeedback?.blockReason ||
        ["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII"].includes(
          data.candidates?.[0]?.finishReason,
        )
      )
        return reply(200, { reply: SAFE_REPLY, sources: [] });
      const text = data.candidates?.[0]?.content?.parts
        ?.map((p) => (typeof p.text === "string" ? p.text : ""))
        .join("\n")
        .trim()
        .slice(0, 10000);
      if (!text)
        return reply(502, {
          error: "Não veio uma resposta em texto. Tente reformular a pergunta.",
        });
      if (containsPrivateData(text))
        return reply(200, { reply: SAFE_REPLY, sources: [] });
      if (text.includes(MARCADOR_FORA_ESCOPO))
        return reply(200, { reply: RESPOSTA_FORA_ESCOPO, sources: [] });
      return reply(200, {
        reply: text,
        responseId: data.responseId || require("node:crypto").randomUUID(),
        sources,
      });
    } catch (error) {
      if (error instanceof UnsafeContent)
        return reply(200, { reply: SAFE_REPLY, sources: [] });
      if (error?.status === 429)
        return reply(429, {
          error: "O assistente atingiu seu limite. Tente mais tarde.",
        });
      return reply(502, {
        error: controller.signal.aborted
          ? "A resposta demorou demais. Tente uma pergunta mais curta."
          : "Não foi possível conectar ao assistente.",
      });
    } finally {
      clearTimeout(timer);
      res.off("close", abort);
    }
  };
}
function fromEnvironment() {
  try {
    process.loadEnvFile(require("path").join(__dirname, ".env"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  try {
    process.loadEnvFile(require("path").join(__dirname, "../.env.local"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return createTutorHandler(optionsFromEnvironment());
}
function optionsFromEnvironment(env = process.env) {
  const provider = env.TUTOR_PROVIDER === "openai" ? "openai" : "gemini";
  return {
    provider,
    apiKey: provider === "openai" ? env.OPENAI_API_KEY : env.GEMINI_API_KEY,
    model: provider === "openai" ? env.OPENAI_MODEL : env.GEMINI_MODEL,
    requirePrivacyAcknowledgement: true,
    timeoutMs: provider === "openai" ? 35000 : 18000,
    hourlyLimit: Math.max(
      1,
      Math.min(100, Number(env.TUTOR_HOURLY_LIMIT) || 100),
    ),
    allowedOrigins: (env.TUTOR_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}
module.exports = {
  createTutorHandler,
  fromEnvironment,
  optionsFromEnvironment,
};
