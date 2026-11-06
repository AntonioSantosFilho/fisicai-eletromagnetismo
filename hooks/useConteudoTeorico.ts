import { useMemo } from "react";

import teoriaData from "@/data/teoria.json";

export type DificuldadeConteudo = "facil" | "medio" | "dificil";

export interface VariavelFormula {
  simbolo: string;
  significado: string;
}

export interface ExercicioResolvidoData {
  enunciado: string;
  passo_a_passo: string;
  resolucao_legivel: string;
  resolucao_latex: string;
  resposta_final: string;
  referencias_apoio: string[];
  fonte_exata_confirmada: boolean;
  origem_editorial?: string;
}

export type NaturezaExpressao =
  | "conceitual"
  | "equacao-definicao"
  | "lei-fisica"
  | "relacao-constitutiva"
  | "expressao-derivada";
export type DiagramaFisico = "forca-magnetica" | "inducao" | "coulomb" | "onda";

export interface ConteudoTeoricoSchema {
  id?: string;
  objetivos: string[];
  etapa: "essencial" | "aprofundamento";
  ordem_estudo: number;
  pre_requisitos: string[];
  erro_comum: { afirmacao: string; correcao: string };
  pergunta_reflexao: { pergunta: string; resposta: string };
  leitura_apoio?: { titulo: string; url: string };
  investigacao?: {
    simulacao_id: string;
    prever: string;
    observar: string;
    explicar: string;
  };
  dificuldade: DificuldadeConteudo;
  tema: string;
  topico: string;
  conceito: string;
  formula_legivel: string;
  formula_latex: string;
  variaveis: VariavelFormula[];
  nota_pedagogica: string;
  exercicio_resolvido: ExercicioResolvidoData;
  fonte_externa_necessaria: boolean;
  fonte: string;
  natureza_expressao: NaturezaExpressao;
  contexto_expressao: string;
  referencias: string[];
  diagrama?: DiagramaFisico;
  relacao_complementar?: {
    natureza: NaturezaExpressao;
    latex: string;
    legivel: string;
    contexto: string;
  };
}

export interface ConteudoTeoricoItem extends ConteudoTeoricoSchema {
  id: string;
  dificuldade: DificuldadeConteudo;
}

interface TeoriaJson {
  conteudos: ConteudoTeoricoSchema[];
}

const dificuldadeLabels: Record<DificuldadeConteudo, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

const ordemDificuldade: DificuldadeConteudo[] = ["facil", "medio", "dificil"];

function criarIdConteudo(conteudo: ConteudoTeoricoSchema) {
  if (conteudo.id) return conteudo.id;
  return `${conteudo.tema}-${conteudo.topico}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function useConteudoTeorico(dificuldade?: DificuldadeConteudo) {
  return useMemo(() => {
    const conteudosJson = (teoriaData as TeoriaJson).conteudos;
    const conteudos = conteudosJson
      .map<ConteudoTeoricoItem>((conteudo) => ({
        ...conteudo,
        id: criarIdConteudo(conteudo),
      }))
      .sort((a, b) => a.ordem_estudo - b.ordem_estudo);

    const conteudosFiltrados = dificuldade
      ? conteudos.filter((conteudo) => conteudo.dificuldade === dificuldade)
      : conteudos;

    const agrupadosPorDificuldade = ordemDificuldade.map((nivel) => ({
      dificuldade: nivel,
      titulo: dificuldadeLabels[nivel],
      conteudos: conteudos.filter((conteudo) => conteudo.dificuldade === nivel),
    }));

    return {
      conteudos: conteudosFiltrados,
      todosConteudos: conteudos,
      agrupadosPorDificuldade,
      dificuldadeLabels,
      getConteudoById: (id: string) =>
        conteudos.find((conteudo) => conteudo.id === id),
      getConteudosPorDificuldade: (nivel: DificuldadeConteudo) =>
        conteudos.filter((conteudo) => conteudo.dificuldade === nivel),
    };
  }, [dificuldade]);
}
