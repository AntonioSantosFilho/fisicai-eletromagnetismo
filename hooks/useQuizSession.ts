import { useMemo } from "react";
import { useLearningSession } from "@/hooks/useLearningSession";

import questoesData from "@/data/questoes.json";
import desafiosData from "@/data/desafios.json";
import { variarAlternativas } from "@/utils/alternativas";
import type {
  DificuldadeJogo,
  FeedbackJogo,
} from "@/hooks/useFlashcardSession";

export type DificuldadeFiltro = DificuldadeJogo | "todas";
export type TipoQuestao = "multipla_escolha" | "calculo";
export type ModoQuiz = "quiz" | "desafio";

export interface AlternativaQuestaoData {
  letra: string;
  texto: string;
}

export interface QuestaoData {
  dados_tabela?: { colunas: string[]; linhas: string[][]; legenda: string };
  grafico?: {
    titulo: string;
    eixo_x: string;
    eixo_y: string;
    pontos: number[][];
    max_x: number;
    max_y: number;
  };
  habilidade?: "interpretar" | "calcular" | "analisar" | "aplicar" | "recordar";
  conceito_id?: string;
  referencias_apoio?: string[];
  id: string;
  tipo: TipoQuestao;
  enunciado: string;
  alternativas: AlternativaQuestaoData[];
  resposta_correta: string;
  explicacao: string;
  dificuldade: DificuldadeJogo;
  fonte: string;
}

export interface ModuloQuestoes {
  id: string;
  titulo: string;
  descricao: string;
  questoes: QuestaoData[];
}

type QuestoesJson =
  { modulos: ModuloQuestoes[] } | { modulo: string; questoes: QuestaoData[] };

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeQuestoesData(): ModuloQuestoes[] {
  const data = questoesData as QuestoesJson;

  if ("modulos" in data) {
    return data.modulos;
  }

  return [
    {
      id: slugify(data.modulo),
      titulo: data.modulo,
      descricao: `Questões de ${data.modulo}`,
      questoes: data.questoes,
    },
  ];
}

const modulosQuestoes = normalizeQuestoesData();

export function getQuizModules(modo: ModoQuiz = "quiz") {
  return (
    modo === "desafio"
      ? (desafiosData.modulos as ModuloQuestoes[])
      : modulosQuestoes
  ).map((modulo) => ({
    ...modulo,
    dificuldades: Array.from(
      new Set(modulo.questoes.map((questao) => questao.dificuldade)),
    ),
    tipos: Array.from(new Set(modulo.questoes.map((questao) => questao.tipo))),
  }));
}

export function getQuestoesByModuleAndDifficulty(
  moduloId: string,
  dificuldade: DificuldadeFiltro,
  modo: ModoQuiz = "quiz",
) {
  const modulo = getQuizModules(modo).find((item) => item.id === moduloId);

  if (!modulo) {
    return [];
  }

  if (dificuldade === "todas") {
    return modulo.questoes;
  }

  return modulo.questoes.filter(
    (questao) => questao.dificuldade === dificuldade,
  );
}

export function getQuizModuleById(moduloId: string, modo: ModoQuiz = "quiz") {
  return getQuizModules(modo).find((modulo) => modulo.id === moduloId);
}

export function useQuizSession(
  moduloId: string,
  dificuldade: DificuldadeFiltro,
  modo: ModoQuiz = "quiz",
) {
  const pool = useMemo(() => {
    const rows = getQuestoesByModuleAndDifficulty(moduloId, dificuldade, modo);
    return modo === "desafio"
      ? [...rows].sort(
          (a, b) =>
            ["facil", "medio", "dificil"].indexOf(a.dificuldade) -
            ["facil", "medio", "dificil"].indexOf(b.dificuldade),
        )
      : rows;
  }, [moduloId, dificuldade, modo]);
  const total = Math.min(
    pool.length,
    modo === "desafio" || dificuldade === "todas" ? 5 : 3,
  );
  const lifecycle = useLearningSession({
    tipo: modo,
    modulo: moduloId,
    dificuldade,
    conteudo: pool,
    total,
    selecao: {
      ids: pool.map((q) => q.id),
      limite: total,
      ordenar: modo === "desafio",
    },
  });
  const state = lifecycle.state;
  const questoes = state.order
    .map((id) => pool.find((q) => q.id === id))
    .filter((q): q is QuestaoData => !!q)
    .map((q) => variarAlternativas(q, state.id));
  const isComplete = total > 0 && state.acertos + state.erros >= total;
  function answerQuestion(letra: string) {
    lifecycle.update((previous) => {
      const raw = pool.find(
        (q) => q.id === previous.order[previous.currentIndex],
      );
      const question = raw ? variarAlternativas(raw, previous.id) : undefined;
      if (
        !question ||
        previous.feedback ||
        previous.answeredItemId ||
        previous.acertos + previous.erros >= total ||
        !question.alternativas.some((a) => a.letra === letra)
      )
        return previous;
      const correct = letra === question.resposta_correta;
      return {
        ...previous,
        selectedAnswer: letra,
        answeredItemId: question.id,
        acertos: previous.acertos + (correct ? 1 : 0),
        erros: previous.erros + (correct ? 0 : 1),
        feedback: {
          type: correct ? "success" : "error",
          title: correct ? "Resposta correta!" : "Resposta incorreta",
          message: correct
            ? "Você acertou. Confira o raciocínio na explicação."
            : `Você marcou a alternativa ${letra}. A resposta correta é ${question.resposta_correta}. Veja a explicação abaixo.`,
          explanation:
            question.explicacao +
            (correct
              ? ""
              : "\n\nAlternativa correta nesta sessão: " +
                question.resposta_correta),
          referencias: question.referencias_apoio,
        },
      };
    });
  }
  function nextQuestion() {
    lifecycle.update((previous) =>
      previous.feedback && previous.answeredItemId
        ? {
            ...previous,
            feedback: null,
            selectedAnswer: null,
            answeredItemId: null,
            currentIndex: Math.min(previous.currentIndex + 1, total),
          }
        : previous,
    );
  }
  return {
    ...lifecycle,
    modulo: getQuizModuleById(moduloId, modo),
    questoes,
    currentQuestion: questoes[state.currentIndex],
    currentIndex: state.currentIndex,
    total,
    bankTotal: pool.length,
    selectedAnswer: state.selectedAnswer,
    acertos: state.acertos,
    erros: state.erros,
    elapsedSeconds: state.elapsedSeconds,
    feedback: state.feedback,
    isComplete,
    answerQuestion,
    nextQuestion,
    resetSession: lifecycle.reset,
    desafioAprovado: isComplete && state.acertos / total >= 0.8,
  };
}
