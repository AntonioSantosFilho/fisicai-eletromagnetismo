import {
  getQuizModules,
  getQuestoesByModuleAndDifficulty,
  type DificuldadeFiltro,
} from "@/hooks/useQuizSession";
import {
  getFlashcardModules,
  getFlashcardsByModuleAndDifficulty,
} from "@/hooks/useFlashcardSession";
import {
  getLacunasModules,
  getLacunasByModuleAndDifficulty,
} from "@/hooks/useLacunasSession";
import {
  buildCards,
  getMemoriaModules,
  getParesByModuleAndDifficulty,
} from "@/hooks/useMemoriaGame";
import { chaveConteudo, normalizarModulo } from "@/utils/identificadores";
import { estadoValido, temAndamento } from "@/utils/estadoSessao";
import type { SavedDraft } from "@/services/sessoesService";

const difficulties: DificuldadeFiltro[] = [
  "todas",
  "facil",
  "medio",
  "dificil",
];
const labels = {
  quiz: "Quiz",
  desafio: "Desafio",
  memoria: "Memória",
  lacunas: "Lacunas",
  flashcards: "Flashcards",
};
const levels = {
  todas: "Todos os níveis",
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};
type Mode = keyof typeof labels;

// Usa os mesmos seletores e a mesma validação do carregamento de sessões.
// A chave inclui o conteúdo: rascunhos de versões antigas não viram atalhos.
export function catalogoRetomada() {
  const catalog = [];
  for (const tipo of Object.keys(labels) as Mode[]) {
    const modules =
      tipo === "quiz" || tipo === "desafio"
        ? getQuizModules(tipo).map((m) => ({ id: m.id, titulo: m.titulo }))
        : tipo === "flashcards"
          ? getFlashcardModules().map((m) => ({ id: m.id, titulo: m.modulo }))
          : tipo === "memoria"
            ? getMemoriaModules().map((m) => ({ id: m.id, titulo: m.modulo }))
            : getLacunasModules();
    for (const module of modules)
      for (const dificuldade of difficulties) {
        const pool =
          tipo === "quiz" || tipo === "desafio"
            ? getQuestoesByModuleAndDifficulty(module.id, dificuldade, tipo)
            : tipo === "flashcards"
              ? getFlashcardsByModuleAndDifficulty(module.id, dificuldade)
              : tipo === "lacunas"
                ? getLacunasByModuleAndDifficulty(module.id, dificuldade)
                : getParesByModuleAndDifficulty(module.id, dificuldade);
        const content =
          tipo === "desafio"
            ? [...pool].sort(
                (a, b) =>
                  ["facil", "medio", "dificil"].indexOf(a.dificuldade) -
                  ["facil", "medio", "dificil"].indexOf(b.dificuldade),
              )
            : pool;
        const total =
          tipo === "memoria"
            ? pool.length
            : Math.min(
                pool.length,
                tipo === "flashcards" ||
                  (tipo === "quiz" && dificuldade !== "todas")
                  ? 3
                  : 5,
              );
        if (!total) continue;
        const ids =
          tipo === "memoria"
            ? buildCards(
                getParesByModuleAndDifficulty(module.id, dificuldade),
              ).map((c) => c.id)
            : pool.map((c) => c.id);
        catalog.push({
          tipo,
          modulo: module.id,
          tema: module.titulo,
          dificuldade,
          total,
          ids,
          chave: `${tipo}:${normalizarModulo(module.id)}:${dificuldade}:${chaveConteudo(content)}`,
        });
      }
  }
  return catalog;
}

export function encontrarRetomada(drafts: SavedDraft[], owner: string) {
  const catalog = catalogoRetomada();
  for (const draft of [...drafts].sort(
    (a, b) => Date.parse(b.atualizadoEm) - Date.parse(a.atualizadoEm),
  )) {
    if (
      draft.perfilId !== owner ||
      !Number.isFinite(Date.parse(draft.atualizadoEm))
    )
      continue;
    const item = catalog.find((c) => c.chave === draft.chave);
    if (!item) continue;
    const memory = item.tipo === "memoria";
    const state = draft.estado;
    if (
      !estadoValido(
        state,
        item.total,
        new Set(item.ids),
        memory ? item.ids.length : item.total,
        memory,
      ) ||
      !temAndamento(state)
    )
      continue;
    const completed = memory
      ? state.matchedPairIds.length
      : state.acertos + state.erros;
    if (completed >= item.total) continue;
    return {
      ...item,
      completed,
      atividade: labels[item.tipo],
      nivel: levels[item.dificuldade],
    };
  }
  return null;
}
