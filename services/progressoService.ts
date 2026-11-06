import {
  AsyncStorage,
  DadosLocaisInvalidos,
  serializar,
} from "@/services/storage";
import { perfisService } from "@/services/perfisService";
import { normalizarModulo, novoId } from "@/utils/identificadores";

export type TipoAtividadeProgresso =
  "flashcards" | "memoria" | "quiz" | "desafio" | "lacunas";
export interface RegistroProgresso {
  id: string;
  tipo: TipoAtividadeProgresso;
  modulo: string;
  dificuldade: string;
  acertos: number;
  erros: number;
  tempoGastoSegundos: number;
  totalItens: number;
  criadoEm: string;
}
export interface ResumoModuloProgresso {
  modulo: string;
  totalSessoes: number;
  totalAcertos: number;
  totalErros: number;
  totalItens: number;
  tempoTotalSegundos: number;
  mediaAcertosPercentual: number;
  totalTentativas: number;
}
export interface ResumoProgresso {
  totalSessoes: number;
  totalAcertos: number;
  totalErros: number;
  totalItens: number;
  tempoTotalSegundos: number;
  mediaAcertosPercentual: number;
  totalTentativas: number;
  cartoesLembrados: number;
  cartoesRevisar: number;
  porModulo: ResumoModuloProgresso[];
  ultimasSessoes: RegistroProgresso[];
}
const STORAGE_KEY = "@fisicai-independente:progresso-jogos";
const tipos = new Set(["quiz", "desafio", "flashcards", "memoria", "lacunas"]);
export function chaveProgresso(perfilId: string) {
  return perfilId === "principal"
    ? STORAGE_KEY
    : `@fisicai-independente:perfil:${perfilId}:progresso`;
}
const natural = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export function validarRegistros(raw: string | null): RegistroProgresso[] {
  if (raw === null) return [];
  try {
    const rows: unknown = JSON.parse(raw);
    if (!Array.isArray(rows)) throw new Error();
    const ids = new Set<string>();
    return rows.map((row, index) => {
      if (
        !row ||
        typeof row !== "object" ||
        typeof row.id !== "string" ||
        row.id.length < 1 ||
        row.id.length > 200 ||
        !tipos.has(row.tipo) ||
        typeof row.modulo !== "string" ||
        !normalizarModulo(row.modulo) ||
        typeof row.dificuldade !== "string"
      )
        throw new Error();
      if (
        ![row.acertos, row.erros, row.tempoGastoSegundos, row.totalItens].every(
          natural,
        ) ||
        row.totalItens < 1 ||
        row.acertos > row.totalItens ||
        typeof row.criadoEm !== "string" ||
        !Number.isFinite(Date.parse(row.criadoEm))
      )
        throw new Error();
      const difficulty = normalizarModulo(row.dificuldade);
      if (!["facil", "medio", "dificil", "todas"].includes(difficulty))
        throw new Error();
      let id = row.id;
      if (ids.has(id)) id = `${id}-legado-${index}`;
      ids.add(id);
      return {
        id,
        tipo: row.tipo,
        modulo: normalizarModulo(row.modulo),
        dificuldade: difficulty,
        acertos: row.acertos,
        erros: row.erros,
        tempoGastoSegundos: row.tempoGastoSegundos,
        totalItens: row.totalItens,
        criadoEm: row.criadoEm,
      } as RegistroProgresso;
    });
  } catch {
    throw new DadosLocaisInvalidos();
  }
}
async function perfilId(id?: string) {
  return id ?? (await perfisService.ativo()).id;
}
async function lerRegistros(id: string) {
  return validarRegistros(await AsyncStorage.getItem(chaveProgresso(id)));
}
function ordenar(rows: RegistroProgresso[]) {
  return [...rows].sort(
    (a, b) => Date.parse(b.criadoEm) - Date.parse(a.criadoEm),
  );
}
const precisao = (acertos: number, tentativas: number) =>
  tentativas > 0 ? Math.round((acertos / tentativas) * 100) : 0;

function agregarResumo(registros: RegistroProgresso[]): ResumoProgresso {
  const objective = registros.filter((row) => row.tipo !== "flashcards");
  const sum = (
    rows: RegistroProgresso[],
    key: "acertos" | "erros" | "totalItens" | "tempoGastoSegundos",
  ) => rows.reduce((total, row) => total + row[key], 0);
  const acertos = sum(objective, "acertos");
  const erros = sum(objective, "erros");
  const byModule = new Map<string, ResumoModuloProgresso>();
  for (const row of objective) {
    const previous = byModule.get(row.modulo) ?? {
      modulo: row.modulo,
      totalSessoes: 0,
      totalAcertos: 0,
      totalErros: 0,
      totalItens: 0,
      tempoTotalSegundos: 0,
      mediaAcertosPercentual: 0,
      totalTentativas: 0,
    };
    previous.totalSessoes += 1;
    previous.totalAcertos += row.acertos;
    previous.totalErros += row.erros;
    previous.totalItens += row.totalItens;
    previous.tempoTotalSegundos += row.tempoGastoSegundos;
    previous.totalTentativas += row.acertos + row.erros;
    previous.mediaAcertosPercentual = precisao(
      previous.totalAcertos,
      previous.totalTentativas,
    );
    byModule.set(row.modulo, previous);
  }
  const flashcards = registros.filter((row) => row.tipo === "flashcards");
  return {
    totalSessoes: registros.length,
    totalAcertos: acertos,
    totalErros: erros,
    totalItens: sum(objective, "totalItens"),
    totalTentativas: acertos + erros,
    tempoTotalSegundos: sum(registros, "tempoGastoSegundos"),
    mediaAcertosPercentual: precisao(acertos, acertos + erros),
    cartoesLembrados: sum(flashcards, "acertos"),
    cartoesRevisar: sum(flashcards, "erros"),
    porModulo: [...byModule.values()].sort(
      (a, b) => b.totalSessoes - a.totalSessoes,
    ),
    ultimasSessoes: ordenar(registros).slice(0, 5),
  };
}

export const progressoService = {
  async listarRegistros(id?: string) {
    return ordenar(await lerRegistros(await perfilId(id)));
  },
  async salvarRegistro(
    registro: Omit<RegistroProgresso, "id" | "criadoEm">,
    options: { perfilId?: string; sessionId?: string } = {},
  ) {
    const owner = await perfilId(options.perfilId);
    const key = chaveProgresso(owner);
    return serializar(key, async () => {
      const raw = await AsyncStorage.getItem(key);
      const registros = validarRegistros(raw);
      const id = options.sessionId ?? novoId("sessao");
      const existing = registros.find((row) => row.id === id);
      if (existing) return existing;
      const candidate = {
        ...registro,
        id,
        modulo: normalizarModulo(registro.modulo),
        criadoEm: new Date().toISOString(),
      };
      const validated = validarRegistros(JSON.stringify([candidate]))[0];
      await AsyncStorage.setItem(`${key}:backup`, JSON.stringify(registros));
      await AsyncStorage.setItem(
        key,
        JSON.stringify([validated, ...registros]),
      );
      return validated;
    });
  },
  async obterResumo(id?: string) {
    return agregarResumo(await lerRegistros(await perfilId(id)));
  },
  async possuiBackup(id?: string) {
    const key = chaveProgresso(await perfilId(id));
    const raw = await AsyncStorage.getItem(`${key}:backup`);
    if (raw === null) return false;
    try {
      validarRegistros(raw);
      return true;
    } catch {
      return false;
    }
  },
  async restaurarBackup(id?: string) {
    const key = chaveProgresso(await perfilId(id));
    return serializar(key, async () => {
      const backup = await AsyncStorage.getItem(`${key}:backup`);
      if (backup === null)
        throw new Error("Não há cópia de recuperação disponível.");
      const restored = validarRegistros(backup);
      const raw = await AsyncStorage.getItem(key);
      if (raw !== null)
        await AsyncStorage.setItem(`${key}:danificado:${novoId("copia")}`, raw);
      await AsyncStorage.setItem(key, JSON.stringify(restored));
    });
  },
  async limparRegistros(id?: string) {
    const owner = await perfilId(id);
    const key = chaveProgresso(owner);
    return serializar(key, async () => {
      const keys = await AsyncStorage.getAllKeys();
      const owned = keys.filter(
        (item) =>
          item === key ||
          item === `${key}:backup` ||
          item.startsWith(`${key}:danificado:`) ||
          item === `@fisicai-independente:sessoes:${owner}` ||
          item === `@fisicai-independente:sessoes:${owner}:recuperacao` ||
          item.startsWith(`@fisicai-independente:rodizio:${owner}:`),
      );
      for (const item of owned) await AsyncStorage.removeItem(item);
    });
  },
};
