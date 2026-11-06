export interface FeedbackSessao {
  referencias?: string[];
  type: "success" | "error";
  title: string;
  message: string;
  explanation: string;
}
export interface EstadoSessao {
  id: string;
  currentIndex: number;
  acertos: number;
  erros: number;
  elapsedSeconds: number;
  feedback: FeedbackSessao | null;
  selectedAnswer: string | null;
  answeredItemId: string | null;
  isFlipped: boolean;
  respostaDigitada: string;
  selectedIds: string[];
  matchedPairIds: string[];
  pendingMismatchIds: string[];
  order: string[];
  [key: string]: unknown;
}
export function temAndamento(state: EstadoSessao) {
  return !!(
    state.elapsedSeconds ||
    state.acertos ||
    state.erros ||
    state.currentIndex ||
    state.selectedIds.length ||
    state.isFlipped ||
    state.respostaDigitada.trim()
  );
}
export function estadoValido(
  value: unknown,
  total: number,
  allowedCards: Set<string>,
  expectedOrder: number,
  memory: boolean,
): value is EstadoSessao {
  if (!value || typeof value !== "object") return false;
  const s = value as EstadoSessao;
  const natural = (n: unknown) =>
    typeof n === "number" && Number.isSafeInteger(n) && n >= 0 && n <= 1000000;
  if (
    typeof s.id !== "string" ||
    s.id.length > 150 ||
    !s.id ||
    ![s.currentIndex, s.acertos, s.erros, s.elapsedSeconds].every(natural) ||
    s.currentIndex > total ||
    s.acertos > total ||
    typeof s.isFlipped !== "boolean" ||
    typeof s.respostaDigitada !== "string" ||
    s.respostaDigitada.length > 160
  )
    return false;
  if (
    ![s.selectedAnswer, s.answeredItemId].every(
      (value) =>
        value === null || (typeof value === "string" && value.length < 200),
    )
  )
    return false;
  if (
    ![s.selectedIds, s.matchedPairIds, s.pendingMismatchIds, s.order].every(
      (values) =>
        Array.isArray(values) &&
        values.every(
          (value) => typeof value === "string" && value.length < 200,
        ) &&
        new Set(values).size === values.length,
    )
  )
    return false;
  if (
    s.selectedIds.length > 2 ||
    s.pendingMismatchIds.length > 2 ||
    s.matchedPairIds.length > total
  )
    return false;
  if (
    allowedCards.size &&
    (s.order.length !== expectedOrder ||
      !s.order.every((id) => allowedCards.has(id)) ||
      ![...s.selectedIds, ...s.pendingMismatchIds].every((id) =>
        allowedCards.has(id),
      ))
  )
    return false;
  if (
    memory &&
    allowedCards.size &&
    (!s.matchedPairIds.every(
      (id) => allowedCards.has(`${id}-a`) && allowedCards.has(`${id}-b`),
    ) ||
      s.acertos !== s.matchedPairIds.length)
  )
    return false;
  if (!memory && s.acertos + s.erros > total) return false;
  if (
    s.feedback?.referencias !== undefined &&
    (!Array.isArray(s.feedback.referencias) ||
      s.feedback.referencias.length > 8 ||
      !s.feedback.referencias.every(
        (id) => typeof id === "string" && id.length < 100,
      ))
  )
    return false;
  if (
    s.feedback !== null &&
    (!s.feedback ||
      !["success", "error"].includes(s.feedback.type) ||
      !["title", "message", "explanation"].every((key) => {
        const text = (s.feedback as unknown as Record<string, unknown>)[key];
        return typeof text === "string" && text.length <= 10000;
      }))
  )
    return false;
  return true;
}
