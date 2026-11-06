import { useMemo } from "react";
import { useLearningSession } from "@/hooks/useLearningSession";

import flashcardsData from "@/data/flashcards.json";

export type DificuldadeJogo = "facil" | "medio" | "dificil";
export type DificuldadeFlashcards = DificuldadeJogo | "todas";
export type TipoFlashcard = "conceito" | "formula" | "aplicacao";

export interface FlashcardData {
  referencias_apoio?: string[];
  id: string;
  frente: string;
  verso: string;
  formula_latex?: string;
  tipo: TipoFlashcard;
  dificuldade: DificuldadeJogo;
  fonte: string;
}

interface FlashcardsJson {
  modulos: Array<{
    id: string;
    titulo: string;
    descricao?: string;
    flashcards: FlashcardData[];
  }>;
}

export interface FeedbackJogo {
  type: "success" | "error";
  title: string;
  message: string;
  explanation: string;
}

const dadosFlashcards = flashcardsData as FlashcardsJson;
const modulosFlashcards = dadosFlashcards.modulos ?? [];

export function getFlashcardModules() {
  return modulosFlashcards.map((modulo) => ({
    id: modulo.id,
    modulo: modulo.titulo,
    descricao: modulo.descricao,
    dificuldades: Array.from(
      new Set(modulo.flashcards.map((flashcard) => flashcard.dificuldade)),
    ),
    total: modulo.flashcards.length,
  }));
}

export function getFlashcardsByModuleAndDifficulty(
  modulo: string,
  dificuldade: DificuldadeFlashcards,
) {
  const moduloEncontrado = modulosFlashcards.find(
    (item) => item.titulo === modulo || item.id === modulo,
  );

  if (!moduloEncontrado) {
    return [];
  }

  if (dificuldade === "todas") return moduloEncontrado.flashcards;
  return moduloEncontrado.flashcards.filter(
    (flashcard) => flashcard.dificuldade === dificuldade,
  );
}

export function useFlashcardSession(
  modulo: string,
  dificuldade: DificuldadeFlashcards,
) {
  const pool = useMemo(
    () => getFlashcardsByModuleAndDifficulty(modulo, dificuldade),
    [modulo, dificuldade],
  );
  const total = Math.min(pool.length, 3);
  const lifecycle = useLearningSession({
    tipo: "flashcards",
    modulo,
    dificuldade,
    conteudo: pool,
    total,
    selecao: { ids: pool.map((c) => c.id), limite: total },
  });
  const s = lifecycle.state;
  const flashcards = s.order
    .map((id) => pool.find((c) => c.id === id))
    .filter((c): c is FlashcardData => !!c);
  const isComplete = total > 0 && s.acertos + s.erros >= total;
  function answerCard(known: boolean) {
    lifecycle.update((previous) => {
      const card = pool.find(
        (c) => c.id === previous.order[previous.currentIndex],
      );
      if (
        !card ||
        !previous.isFlipped ||
        previous.feedback ||
        previous.answeredItemId ||
        previous.acertos + previous.erros >= total
      )
        return previous;
      return {
        ...previous,
        answeredItemId: card.id,
        acertos: previous.acertos + (known ? 1 : 0),
        erros: previous.erros + (known ? 0 : 1),
        feedback: {
          type: known ? "success" : "error",
          title: known ? "Resposta lembrada" : "Ponto para revisar",
          message:
            "Esta é uma autoavaliação. Ela não é uma nota nem entra no percentual de acertos das questões.",
          explanation: card.verso,
          referencias: card.referencias_apoio,
        },
      };
    });
  }
  function nextCard() {
    lifecycle.update((previous) =>
      previous.feedback && previous.answeredItemId
        ? {
            ...previous,
            feedback: null,
            answeredItemId: null,
            isFlipped: false,
            currentIndex: Math.min(previous.currentIndex + 1, total),
          }
        : previous,
    );
  }
  return {
    ...lifecycle,
    moduloNome:
      modulosFlashcards.find(
        (item) => item.id === modulo || item.titulo === modulo,
      )?.titulo ?? modulo,
    flashcards,
    currentFlashcard: flashcards[s.currentIndex],
    currentIndex: s.currentIndex,
    total,
    bankTotal: pool.length,
    isFlipped: s.isFlipped,
    setIsFlipped: (value: boolean) =>
      lifecycle.update((p) => ({ ...p, isFlipped: value })),
    acertos: s.acertos,
    erros: s.erros,
    elapsedSeconds: s.elapsedSeconds,
    feedback: s.feedback,
    isComplete,
    answerCard,
    nextCard,
    resetSession: lifecycle.reset,
  };
}
