import Constants from "expo-constants";
import { Platform } from "react-native";
import type { MensagemIA } from "@/types";
declare const process: { env: { EXPO_PUBLIC_TUTOR_URL?: string } };
function endpoint() {
  const configured = process.env.EXPO_PUBLIC_TUTOR_URL;
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== "https:" && !__DEV__)
      throw new Error("O assistente está indisponível.");
    return `${configured.replace(/\/$/, "")}/api/tutor`;
  }
  if (Platform.OS === "web") return "/api/tutor";
  const host = Constants.expoConfig?.hostUri;
  if (__DEV__ && host) return `http://${host}/api/tutor`;
  throw new Error(
    "O assistente está indisponível. Você pode continuar estudando e praticando.",
  );
}
export async function gerarRespostaTutor(
  historico: MensagemIA[],
  signal?: AbortSignal,
  privacyAcknowledged = false,
  sessionId = "",
) {
  const controller = new AbortController(),
    abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(abort, 40000);
  try {
    const messages = historico
      .filter((m) => m.papel !== "sistema")
      .slice(-7)
      .map((m) => ({ papel: m.papel, conteudo: m.conteudo.slice(0, 2000) }));
    while (
      messages.length &&
      (messages[0]?.papel === "assistente" ||
        messages.reduce(
          (total, message) => total + message.conteudo.length,
          0,
        ) > 12000)
    )
      messages.shift();
    const response = await fetch(endpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, privacyAcknowledged, sessionId }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => {
      throw new Error(
        "O assistente está indisponível. Tente novamente mais tarde.",
      );
    });
    if (!response.ok)
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : "O assistente está indisponível.",
      );
    if (typeof data.reply !== "string" || !data.reply.trim())
      throw new Error("A resposta veio vazia. Tente novamente.");
    return {
      texto: data.reply,
      responseId:
        typeof data.responseId === "string" ? data.responseId : undefined,
      fontes: Array.isArray(data.sources)
        ? (data.sources
            .filter(
              (s: { titulo?: unknown; url?: unknown }) =>
                typeof s?.titulo === "string" &&
                typeof s.url === "string" &&
                s.url.startsWith("https://"),
            )
            .slice(0, 3) as Array<{ titulo: string; url: string }>)
        : [],
    };
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error("A solicitação foi interrompida. Tente novamente.");
    throw error instanceof Error
      ? error
      : new Error("Não foi possível conectar ao assistente.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

export async function enviarRelatoIA(report: {
  category: string;
  responseId: string;
  responseText: string;
  details: string;
  confirmed: boolean;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const url = endpoint().replace(/\/api\/tutor$/, "/api/feedback");
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.id !== "string")
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : "Não foi possível registrar o relato. Tente novamente.",
      );
    return data.id as string;
  } finally {
    clearTimeout(timeout);
  }
}
