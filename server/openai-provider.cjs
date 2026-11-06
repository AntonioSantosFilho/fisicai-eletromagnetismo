const { createHash } = require("node:crypto");

class ProviderUnavailable extends Error {
  constructor(status = 502) {
    super("Serviço de IA indisponível.");
    this.status = status;
  }
}
class UnsafeContent extends Error {}
const SAFE_REPLY =
  "Não consegui responder a esse pedido com segurança. Se o assunto envolver sua segurança ou a de outra pessoa, procure um adulto de confiança. Posso ajudar com dúvidas de eletromagnetismo.";

function containsPrivateData(text) {
  return (
    /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text) ||
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/.test(text) ||
    /\bcpf\s*[:=]?\s*\d{11}\b/i.test(text) ||
    /\b(?:telefone|celular|whatsapp|meu n[uú]mero)\s*[:=]?\s*[+()\d\s-]{8,}/i.test(
      text,
    ) ||
    /\b(?:sk-[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{20,})/.test(text)
  );
}

async function requestOpenAITutor({
  apiKey,
  model,
  messages,
  instructions,
  safetyId,
  signal,
  fetchImpl = fetch,
}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  async function post(endpoint, body) {
    const response = await fetchImpl(`https://api.openai.com/v1/${endpoint}`, {
      method: "POST",
      headers,
      signal,
      body: JSON.stringify(body),
    });
    if (!response.ok)
      throw new ProviderUnavailable(response.status === 429 ? 429 : 502);
    return response.json();
  }
  async function moderate(text) {
    const result = await post("moderations", {
      model: "omni-moderation-latest",
      input: text,
    });
    if (typeof result.results?.[0]?.flagged !== "boolean")
      throw new ProviderUnavailable();
    if (result.results[0].flagged) throw new UnsafeContent();
  }
  // Modera o contexto enviado, e não apenas a última mensagem.
  await moderate(messages.map((message) => message.conteudo).join("\n\n"));
  const result = await post("responses", {
    model,
    instructions,
    store: false,
    service_tier: "default",
    input: messages.map((message) => ({
      role: message.papel === "usuario" ? "user" : "assistant",
      content: message.conteudo,
    })),
    max_output_tokens: 1600,
    reasoning: { effort: "low" },
    safety_identifier: createHash("sha256")
      .update(safetyId || "fisicai-session")
      .digest("hex"),
  });
  if (result.status !== "completed") throw new ProviderUnavailable();
  if (
    (result.output || []).some(
      (item) =>
        item.type === "message" &&
        item.content?.some((part) => part.type === "refusal"),
    )
  )
    throw new UnsafeContent();
  const reply = (result.output || [])
    .filter((item) => item.type === "message" && item.role === "assistant")
    .flatMap((item) => item.content || [])
    .filter(
      (item) => item.type === "output_text" && typeof item.text === "string",
    )
    .map((item) => item.text)
    .join("\n")
    .trim()
    .slice(0, 10000);
  if (!reply) throw new ProviderUnavailable();
  await moderate(reply);
  if (containsPrivateData(reply)) throw new UnsafeContent();
  return {
    reply,
    responseId: typeof result.id === "string" ? result.id : undefined,
  };
}

module.exports = {
  requestOpenAITutor,
  ProviderUnavailable,
  UnsafeContent,
  SAFE_REPLY,
  containsPrivateData,
};
