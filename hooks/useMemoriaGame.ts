import { useMemo } from "react";
import { useLearningSession } from "@/hooks/useLearningSession";

import memoriaData from "@/data/memoria.json";
import type {
  DificuldadeJogo,
  FeedbackJogo,
} from "@/hooks/useFlashcardSession";

type TipoParMemoria =
  | "conceito_definicao"
  | "conceito_formula"
  | "termo_simbolo"
  | "fenomeno_aplicacao";

export type TipoConteudoCarta = "texto" | "formula";

export interface ConteudoCartaMemoria {
  tipo_conteudo: TipoConteudoCarta;
  conteudo: string;
}

export interface ParMemoriaData {
  referencias_apoio?: string[];
  id: string;
  tipo_par: TipoParMemoria;
  carta_a: ConteudoCartaMemoria;
  carta_b: ConteudoCartaMemoria;
  explicacao_pos_acerto: string;
  dificuldade: DificuldadeJogo;
  fonte: string;
}

export interface CartaMemoriaData extends ConteudoCartaMemoria {
  referencias_apoio?: string[];
  id: string;
  pairId: string;
  explicacao: string;
  fonte: string;
}

interface MemoriaJson {
  modulos: Array<{
    id: string;
    titulo: string;
    descricao?: string;
    pares: ParMemoriaData[];
  }>;
}

const dadosMemoria = memoriaData as MemoriaJson;
const modulosMemoria = dadosMemoria.modulos ?? [];

function shuffleCards(cards: CartaMemoriaData[]) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function buildCards(pares: ParMemoriaData[]) {
  return pares.flatMap<CartaMemoriaData>((par, index) => {
    const pairId = `${par.id}-${index}`;

    return [
      {
        id: `${pairId}-a`,
        pairId,
        explicacao: par.explicacao_pos_acerto,
        fonte: par.fonte,
        referencias_apoio: par.referencias_apoio,
        ...par.carta_a,
      },
      {
        id: `${pairId}-b`,
        pairId,
        explicacao: par.explicacao_pos_acerto,
        fonte: par.fonte,
        referencias_apoio: par.referencias_apoio,
        ...par.carta_b,
      },
    ];
  });
}

export function getMemoriaModules() {
  return modulosMemoria.map((modulo) => ({
    id: modulo.id,
    modulo: modulo.titulo,
    descricao: modulo.descricao,
    dificuldades: Array.from(
      new Set(modulo.pares.map((par) => par.dificuldade)),
    ),
    total: modulo.pares.length,
  }));
}

export function getParesByModuleAndDifficulty(
  modulo: string,
  dificuldade: DificuldadeJogo | "todas",
) {
  const moduloEncontrado = modulosMemoria.find(
    (item) => item.titulo === modulo || item.id === modulo,
  );

  if (!moduloEncontrado) {
    return [];
  }

  if (dificuldade === "todas") return moduloEncontrado.pares;
  return moduloEncontrado.pares.filter(
    (par) => par.dificuldade === dificuldade,
  );
}

export function useMemoriaGame(
  modulo: string,
  dificuldade: DificuldadeJogo | "todas",
) {
  const pares = useMemo(
    () => getParesByModuleAndDifficulty(modulo, dificuldade),
    [modulo, dificuldade],
  );
  const baseCards = useMemo(() => buildCards(pares), [pares]);
  const lifecycle = useLearningSession({
    tipo: "memoria",
    modulo,
    dificuldade,
    conteudo: pares,
    total: pares.length,
    order: () => shuffleCards(baseCards).map((card) => card.id),
    complete: (state) =>
      pares.length > 0 &&
      state.matchedPairIds.length === pares.length &&
      !state.feedback,
  });
  const s = lifecycle.state;
  const cards = s.order
    .map((id) => baseCards.find((card) => card.id === id))
    .filter((card): card is CartaMemoriaData => !!card);
  const isComplete =
    pares.length > 0 && s.matchedPairIds.length === pares.length && !s.feedback;
  // Rodadas pequenas mantêm todos os pares da sessão, sem separar suas cartas.
  const pairOrder = [...new Set(cards.map((card) => card.pairId))];
  const rounds = Array.from(
    { length: Math.ceil(pairOrder.length / 3) },
    (_, i) => pairOrder.slice(i * 3, i * 3 + 3),
  );
  const pendingPair = baseCards.find(
    (card) => card.id === s.selectedIds[0],
  )?.pairId;
  const firstUnfinished = rounds.findIndex((round) =>
    round.some((id) => !s.matchedPairIds.includes(id)),
  );
  const pendingRound = rounds.findIndex((round) =>
    round.includes(pendingPair ?? ""),
  );
  const roundIndex =
    s.feedback &&
    pendingRound >= 0 &&
    (firstUnfinished < 0 || pendingRound <= firstUnfinished)
      ? pendingRound
      : firstUnfinished < 0
        ? Math.max(0, rounds.length - 1)
        : firstUnfinished;
  const roundPairs = rounds[roundIndex] ?? [];
  const visibleCards = cards.filter(
    (card) =>
      roundPairs.includes(card.pairId) || s.selectedIds.includes(card.id),
  );
  const roundComplete =
    roundPairs.length > 0 &&
    roundPairs.every((id) => s.matchedPairIds.includes(id));
  function selectCard(cardId: string) {
    lifecycle.update((previous) => {
      const card = baseCards.find((item) => item.id === cardId);
      if (
        !card ||
        previous.selectedIds.includes(cardId) ||
        previous.matchedPairIds.includes(card.pairId)
      )
        return previous;
      if (previous.feedback || previous.pendingMismatchIds.length)
        return {
          ...previous,
          feedback: null,
          pendingMismatchIds: [],
          selectedIds: [cardId],
        };
      if (!previous.selectedIds.length)
        return { ...previous, selectedIds: [cardId] };
      const first = baseCards.find(
        (item) => item.id === previous.selectedIds[0],
      );
      if (!first) return { ...previous, selectedIds: [cardId] };
      const matched = first.pairId === card.pairId;
      return {
        ...previous,
        selectedIds: [first.id, card.id],
        matchedPairIds: matched
          ? [...previous.matchedPairIds, card.pairId]
          : previous.matchedPairIds,
        pendingMismatchIds: matched ? [] : [first.id, card.id],
        acertos: previous.acertos + (matched ? 1 : 0),
        erros: previous.erros + (matched ? 0 : 1),
        feedback: {
          referencias: [
            ...new Set([
              ...(first.referencias_apoio ?? []),
              ...(card.referencias_apoio ?? []),
            ]),
          ],
          type: matched ? "success" : "error",
          title: matched ? "Par correto!" : "Ainda não é esse par",
          message: matched
            ? "Você associou os conceitos."
            : "Compare os significados antes da próxima tentativa.",
          explanation: matched
            ? card.explicacao
            : `Sobre a primeira carta: ${first.explicacao}\n\nSobre a segunda carta: ${card.explicacao}`,
        },
      };
    });
  }
  function closeFeedback() {
    lifecycle.update((previous) =>
      previous.feedback
        ? {
            ...previous,
            feedback: null,
            selectedIds: [],
            pendingMismatchIds: [],
          }
        : previous,
    );
  }
  return {
    ...lifecycle,
    moduloNome:
      modulosMemoria.find(
        (item) => item.id === modulo || item.titulo === modulo,
      )?.titulo ?? modulo,
    cards,
    visibleCards,
    roundIndex,
    roundCount: rounds.length,
    roundComplete,
    pares,
    selectedIds: s.selectedIds,
    matchedPairIds: s.matchedPairIds,
    pendingMismatchIds: s.pendingMismatchIds,
    acertos: s.acertos,
    erros: s.erros,
    elapsedSeconds: s.elapsedSeconds,
    feedback: s.feedback,
    reviewCards: (s.selectedIds.length === 2
      ? s.selectedIds
      : s.pendingMismatchIds.length === 2
        ? s.pendingMismatchIds
        : s.feedback?.type === "success"
          ? cards
              .filter((card) => card.pairId === s.matchedPairIds.at(-1))
              .map((card) => card.id)
          : []
    )
      .map((id) => baseCards.find((card) => card.id === id))
      .filter((card): card is CartaMemoriaData => !!card),
    isComplete,
    selectCard,
    closeFeedback,
    resetGame: lifecycle.reset,
  };
}
