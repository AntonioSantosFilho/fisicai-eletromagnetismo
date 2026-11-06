import { useRef, useState } from "react";
import { useDelayedFeedback } from "@/hooks/useDelayedFeedback";
import { useAtividadeVisivel } from "@/hooks/useAtividadeVisivel";

// Fechar a explicação mantém a resposta e não equivale a avançar a atividade.
export function useFeedbackPresentation(key: string | null, delayed = false) {
  const active = useAtividadeVisivel();
  const automatic = useDelayedFeedback(delayed ? key : null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  return {
    visible: Boolean(
      key &&
      active &&
      (opened === key || (dismissed !== key && (!delayed || automatic))),
    ),
    dismiss: () => {
      setDismissed(key);
      setOpened(null);
    },
    reopen: () => setOpened(key),
  };
}

// O Modal continua montado enquanto fecha. Seu texto deve continuar sendo o
// texto apresentado, mesmo que a sessão já tenha limpado a resposta anterior.
export function usePresentedFeedback<T>(visible: boolean, payload: T) {
  const presented = useRef(payload);
  if (visible) presented.current = payload;
  return presented.current;
}
