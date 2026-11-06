import { useMemo } from "react";

import simulacoesData from "@/data/phet-simulacoes.json";

export type TemaSimulacao = "eletromagnetismo" | "eletrostatica" | "circuitos";

export interface SimulacaoPhetData {
  id: string;
  nome: string;
  url: string;
  tema: TemaSimulacao;
  descricao: string;
  topicos: string[];
  objetivos: string[];
}

interface SimulacoesJson {
  simulacoes: SimulacaoPhetData[];
}

const temaLabels: Record<TemaSimulacao, string> = {
  eletromagnetismo: "Eletromagnetismo",
  eletrostatica: "Eletrostática",
  circuitos: "Circuitos",
};

const ordemTemas: TemaSimulacao[] = [
  "eletromagnetismo",
  "eletrostatica",
  "circuitos",
];

export function useSimulacoes() {
  return useMemo(() => {
    const simulacoes = (simulacoesData as SimulacoesJson).simulacoes;
    const agrupadasPorTema = ordemTemas.map((tema) => ({
      tema,
      titulo: temaLabels[tema],
      simulacoes: simulacoes.filter((simulacao) => simulacao.tema === tema),
    }));

    return {
      simulacoes,
      agrupadasPorTema,
      temaLabels,
      getSimulacaoById: (id: string) =>
        simulacoes.find((simulacao) => simulacao.id === id),
    };
  }, []);
}
