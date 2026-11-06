import { useEffect, useState } from "react";
import { useAtividadeVisivel } from "@/hooks/useAtividadeVisivel";

export const FEEDBACK_DELAY_MS = 1000;

// A correção acontece imediatamente; só a apresentação do popup é adiada.
export function useDelayedFeedback(key: string | null) {
  const active = useAtividadeVisivel();
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  useEffect(() => {
    setVisibleKey(null);
    if (!key || !active) return;
    const timer = setTimeout(() => setVisibleKey(key), FEEDBACK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [key, active]);
  return Boolean(key && active && key === visibleKey);
}
