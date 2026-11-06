import { useMemo } from "react";
import { useLearningSession } from "@/hooks/useLearningSession";

import lacunasData from "@/data/lacunas.json";
import type {
  DificuldadeJogo,
  FeedbackJogo,
} from "@/hooks/useFlashcardSession";
import type { DificuldadeFiltro } from "@/hooks/useQuizSession";
import { compararResposta } from "@/utils/normalizarResposta";

export interface LacunaData {
  referencias_apoio?: string[];
  id: string;
  modulo_id: string;
  frase: string;
  resposta: string;
  respostas_aceitas: string[];
  explicacao: string;
  dificuldade: DificuldadeJogo;
  fonte: string;
}

interface LacunasJson {
  lacunas: LacunaData[];
}

const lacunas = (lacunasData as LacunasJson).lacunas;

function titleFromModuloId(moduloId: string) {
  return moduloId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getLacunasModules() {
  const moduloIds = Array.from(
    new Set(lacunas.map((lacuna) => lacuna.modulo_id)),
  );

  return moduloIds.map((moduloId) => {
    const itens = lacunas.filter((lacuna) => lacuna.modulo_id === moduloId);

    return {
      id: moduloId,
      titulo: titleFromModuloId(moduloId),
      total: itens.length,
      dificuldades: Array.from(new Set(itens.map((item) => item.dificuldade))),
    };
  });
}

export function getLacunasByModuleAndDifficulty(
  moduloId: string,
  dificuldade: DificuldadeFiltro,
) {
  const itens = lacunas.filter((lacuna) => lacuna.modulo_id === moduloId);

  if (dificuldade === "todas") {
    return itens;
  }

  return itens.filter((lacuna) => lacuna.dificuldade === dificuldade);
}

export function useLacunasSession(
  moduloId: string,
  dificuldade: DificuldadeFiltro,
) {
  const pool = useMemo(
    () => getLacunasByModuleAndDifficulty(moduloId, dificuldade),
    [moduloId, dificuldade],
  );
  const total = Math.min(pool.length, 5);
  const lifecycle = useLearningSession({
    tipo: "lacunas",
    modulo: moduloId,
    dificuldade,
    conteudo: pool,
    total,
    selecao: { ids: pool.map((c) => c.id), limite: total },
  });
  const s = lifecycle.state;
  const itens = s.order
    .map((id) => pool.find((c) => c.id === id))
    .filter((c): c is LacunaData => !!c);
  const isComplete = total > 0 && s.acertos + s.erros >= total;
  function submitAnswer() {
    lifecycle.update((previous) => {
      const item = pool.find(
        (c) => c.id === previous.order[previous.currentIndex],
      );
      if (
        !item ||
        !previous.respostaDigitada.trim() ||
        previous.feedback ||
        previous.answeredItemId ||
        previous.acertos + previous.erros >= total
      )
        return previous;
      const correct = compararResposta(previous.respostaDigitada, [
        item.resposta,
        ...item.respostas_aceitas,
      ]);
      return {
        ...previous,
        answeredItemId: item.id,
        acertos: previous.acertos + (correct ? 1 : 0),
        erros: previous.erros + (correct ? 0 : 1),
        feedback: {
          type: correct ? "success" : "error",
          title: correct ? "Resposta aceita" : "Vamos revisar",
          message: correct
            ? "Confira o significado do termo."
            : "Observe o termo esperado e compare com sua resposta.",
          explanation:
            item.explicacao +
            (correct ? "" : "\n\nResposta esperada: " + item.resposta),
          referencias: item.referencias_apoio,
        },
      };
    });
  }
  function nextLacuna() {
    lifecycle.update((previous) =>
      previous.feedback && previous.answeredItemId
        ? {
            ...previous,
            feedback: null,
            answeredItemId: null,
            respostaDigitada: "",
            currentIndex: Math.min(previous.currentIndex + 1, total),
          }
        : previous,
    );
  }
  return {
    ...lifecycle,
    itens,
    currentLacuna: itens[s.currentIndex],
    currentIndex: s.currentIndex,
    total,
    bankTotal: pool.length,
    respostaDigitada: s.respostaDigitada,
    setRespostaDigitada: (value: string) =>
      lifecycle.update((p) => ({
        ...p,
        respostaDigitada: value.slice(0, 160),
      })),
    acertos: s.acertos,
    erros: s.erros,
    elapsedSeconds: s.elapsedSeconds,
    feedback: s.feedback,
    isComplete,
    submitAnswer,
    nextLacuna,
    resetSession: lifecycle.reset,
  };
}
