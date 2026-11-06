export type NivelDificuldade = 'basico' | 'intermediario' | 'avancado';

export type AreaFisica =
  | 'mecanica'
  | 'cinematica'
  | 'dinamica'
  | 'energia'
  | 'termologia'
  | 'ondas'
  | 'optica'
  | 'eletricidade'
  | 'magnetismo'
  | 'fisica-moderna';

export interface FormulaFisica {
  nome: string;
  expressao: string;
  descricao?: string;
  unidades?: string[];
}

export interface Flashcard {
  id: string;
  conteudoId?: string;
  titulo: string;
  frente: string;
  verso: string;
  area: AreaFisica;
  dificuldade: NivelDificuldade;
  tags: string[];
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface AlternativaQuestao {
  id: string;
  texto: string;
  correta: boolean;
}

export interface Questao {
  id: string;
  conteudoId?: string;
  enunciado: string;
  alternativas: AlternativaQuestao[];
  explicacao: string;
  area: AreaFisica;
  dificuldade: NivelDificuldade;
  tags: string[];
  formulaRelacionada?: FormulaFisica;
}

export interface ParMemoria {
  id: string;
  conteudoId?: string;
  conceito: string;
  definicao: string;
  area: AreaFisica;
  dificuldade: NivelDificuldade;
  imagemUrl?: string;
  tags: string[];
}

export interface ConteudoTeorico {
  id: string;
  titulo: string;
  subtitulo?: string;
  resumo: string;
  corpo: string;
  area: AreaFisica;
  dificuldade: NivelDificuldade;
  ordem: number;
  tempoLeituraMinutos: number;
  formulas: FormulaFisica[];
  exemplos: string[];
  tags: string[];
  simulacoesRelacionadasIds?: string[];
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ProgressoAluno {
  alunoId: string;
  conteudosConcluidosIds: string[];
  flashcardsRevisadosIds: string[];
  questoesRespondidasIds: string[];
  paresMemoriaConcluidosIds: string[];
  simulacoesAcessadasIds: string[];
  totalAcertos: number;
  totalErros: number;
  minutosEstudados: number;
  sequenciaDias: number;
  pontuacaoPorArea: Partial<Record<AreaFisica, number>>;
  ultimaAtividadeEm?: string;
  atualizadoEm: string;
}

export type PapelMensagemIA = 'usuario' | 'assistente' | 'sistema';

export interface MensagemIA {
  respostaId?: string;
  id: string;
  papel: PapelMensagemIA;
  conteudo: string;
  criadaEm: string;
  status?: 'enviando' | 'enviada' | 'erro';
  contexto?: {
    conteudoId?: string;
    questaoId?: string;
    area?: AreaFisica;
  };
}

export interface SimulacaoPhET {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
  area: AreaFisica;
  dificuldade: NivelDificuldade;
  objetivos: string[];
  instrucoes: string[];
  conteudosRelacionadosIds: string[];
  tempoEstimadoMinutos: number;
  thumbnailUrl?: string;
  tags: string[];
}
