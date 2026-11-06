import { useEffect, useRef, useState } from "react";
import { usePerfil } from "@/context/PerfilContext";
import { gerarRespostaTutor } from "@/services/iaService";
import { novoId } from "@/utils/identificadores";
import type { MensagemIA } from "@/types";
function mensagem(papel: MensagemIA["papel"], conteudo: string): MensagemIA {
  return {
    id: novoId(papel),
    papel,
    conteudo,
    criadaEm: new Date().toISOString(),
    status: "enviada",
  };
}
const inicial = () => [
  mensagem(
    "assistente",
    "Envie uma dúvida de eletromagnetismo. Vou ajudar você a raciocinar e conferir as unidades.",
  ),
];
export function useChat({
  privacyAcknowledged = false,
}: { privacyAcknowledged?: boolean } = {}) {
  const { perfil } = usePerfil();
  const [mensagens, setMensagens] = useState<MensagemIA[]>(inicial);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [fontes, setFontes] = useState<Array<{ titulo: string; url: string }>>(
    [],
  );
  const current = useRef(mensagens);
  current.current = mensagens;
  const request = useRef<AbortController | null>(null);
  const sessionId = useRef(novoId("chat"));
  useEffect(() => {
    request.current?.abort();
    request.current = null;
    setMensagens(inicial());
    setIsTyping(false);
    setError("");
    setFontes([]);
    sessionId.current = novoId("chat");
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [perfil.id]);
  async function enviarMensagem(conteudo: string) {
    const text = conteudo.trim();
    if (!text || text.length > 2000 || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const history = [...current.current, mensagem("usuario", text)].slice(-20);
    current.current = history;
    setMensagens(history);
    setIsTyping(true);
    setError("");
    setFontes([]);
    try {
      const result = await gerarRespostaTutor(
        history,
        controller.signal,
        privacyAcknowledged,
        sessionId.current,
      );
      if (request.current === controller && !controller.signal.aborted) {
        setMensagens((previous) =>
          [
            ...previous,
            {
              ...mensagem("assistente", result.texto),
              respostaId: result.responseId,
            },
          ].slice(-20),
        );
        setFontes(result.fontes);
      }
    } catch (cause) {
      if (request.current === controller && !controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Não foi possível responder.",
        );
    } finally {
      if (request.current === controller) {
        request.current = null;
        setIsTyping(false);
      }
    }
  }
  return {
    mensagens,
    isTyping,
    podeEnviar: !isTyping,
    error,
    fontes,
    enviarMensagem,
    cancelar: () => {
      request.current?.abort();
      request.current = null;
      setIsTyping(false);
      setError("Solicitação interrompida.");
    },
  };
}
