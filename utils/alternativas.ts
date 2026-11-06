import type { QuestaoData } from "@/hooks/useQuizSession";

// O ID da sessão mantém a disposição ao retomar, sem revelar uma posição fixa do gabarito.
export function variarAlternativas(
  question: QuestaoData,
  sessionId: string,
): QuestaoData {
  let seed = 2166136261;
  for (const char of sessionId + question.id)
    seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const rows = question.alternativas.map((item) => ({
    ...item,
    correta: item.letra === question.resposta_correta,
  }));
  for (let i = rows.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  const correctIndex = rows.findIndex((item) => item.correta);
  return {
    ...question,
    resposta_correta: "ABCD"[correctIndex],
    alternativas: rows.map(({ correta, ...item }, i) => ({
      ...item,
      letra: "ABCD"[i],
    })),
  };
}
