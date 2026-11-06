const { createTutorHandler, optionsFromEnvironment } = require("./tutor.cjs");
const { createFeedbackHandler } = require("./feedback.cjs");
const publication = require("../publicacao/release.json");
const options = optionsFromEnvironment();
// EAS reescreve request.url para o domínio da implantação, mas mantém Origin
// no domínio público utilizado pelo cliente. Aceita somente o alias configurado.
const allowedOrigins = [
  ...options.allowedOrigins,
  ...(publication.backendUrl ? [new URL(publication.backendUrl).origin] : []),
];
const tutor = createTutorHandler({ ...options, allowedOrigins });
const feedback = createFeedbackHandler({
  enabled: process.env.TUTOR_FEEDBACK_LOGGING === "enabled",
  allowedOrigins,
});

async function runWebHandler(request, handler) {
  let body;
  if (request.method === "POST") {
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return Response.json({ error: "Envie JSON." }, { status: 415 });
    if (Number(request.headers.get("content-length")) > 32768)
      return Response.json({ error: "Conteúdo muito longo." }, { status: 413 });
    const reader = request.body?.getReader();
    if (!reader)
      return Response.json({ error: "Envie uma pergunta." }, { status: 400 });
    const decoder = new TextDecoder();
    let raw = "",
      bytes = 0;
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > 32768) {
          await reader.cancel();
          return Response.json(
            { error: "Conteúdo muito longo." },
            { status: 413 },
          );
        }
        raw += decoder.decode(part.value, { stream: true });
      }
      raw += decoder.decode();
      body = JSON.parse(raw);
    } catch {
      return Response.json(
        { error: "Envie um conteúdo JSON válido." },
        { status: 400 },
      );
    }
  }
  const url = new URL(request.url);
  const headers = Object.fromEntries(request.headers.entries());
  headers.host = url.host;
  // Não confia em cabeçalhos de IP informados pelo cliente. No runtime hospedado,
  // a cota é por instância. Não equivale a um teto financeiro global.
  const req = {
    url: url.pathname + url.search,
    method: request.method,
    headers,
    body,
    socket: { encrypted: url.protocol === "https:", remoteAddress: "hosting" },
  };
  let status = 200,
    result = "";
  const outputHeaders = new Headers();
  const res = {
    destroyed: false,
    writableEnded: false,
    writeHead(code, values = {}) {
      status = code;
      for (const [key, value] of Object.entries(values))
        outputHeaders.set(key, String(value));
      return this;
    },
    setHeader(key, value) {
      outputHeaders.set(key, String(value));
    },
    on(event, callback) {
      if (event === "close") request.signal.addEventListener("abort", callback);
    },
    off(event, callback) {
      if (event === "close")
        request.signal.removeEventListener("abort", callback);
    },
    end(value = "") {
      result = value;
      this.writableEnded = true;
    },
  };
  await handler(req, res);
  return new Response(status === 204 ? null : result, {
    status,
    headers: outputHeaders,
  });
}
module.exports = { runWebHandler, tutor, feedback };
