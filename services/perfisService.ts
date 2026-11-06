import {
  AsyncStorage,
  DadosLocaisInvalidos,
  serializar,
} from "@/services/storage";
import { novoId } from "@/utils/identificadores";

export interface PerfilLocal {
  id: string;
  nome: string;
}
interface Perfis {
  ativo: string;
  perfis: PerfilLocal[];
}
const KEY = "@fisicai-independente:perfis";
export const PERFIL_PRINCIPAL: PerfilLocal = {
  id: "principal",
  nome: "Perfil principal",
};

async function ler(): Promise<Perfis> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { ativo: PERFIL_PRINCIPAL.id, perfis: [PERFIL_PRINCIPAL] };
  try {
    const value = JSON.parse(raw);
    if (
      !value ||
      typeof value.ativo !== "string" ||
      !Array.isArray(value.perfis) ||
      value.perfis.length < 1 ||
      value.perfis.length > 8
    )
      throw new Error();
    if (
      !value.perfis.every(
        (item: PerfilLocal) =>
          item &&
          typeof item.id === "string" &&
          /^[a-z0-9-]{1,100}$/.test(item.id) &&
          typeof item.nome === "string" &&
          item.nome.length > 0 &&
          item.nome.length <= 24,
      )
    )
      throw new Error();
    if (
      new Set(value.perfis.map((item: PerfilLocal) => item.id)).size !==
        value.perfis.length ||
      !value.perfis.some((item: PerfilLocal) => item.id === value.ativo)
    )
      throw new Error();
    return value;
  } catch {
    throw new DadosLocaisInvalidos(
      "Não conseguimos abrir os perfis locais. Os dados foram preservados.",
    );
  }
}

export const perfisService = {
  listar: ler,
  async ativo() {
    const data = await ler();
    return data.perfis.find((item) => item.id === data.ativo)!;
  },
  selecionar(id: string) {
    return serializar(KEY, async () => {
      const data = await ler();
      if (!data.perfis.some((item) => item.id === id))
        throw new Error("Perfil não encontrado.");
      await AsyncStorage.setItem(KEY, JSON.stringify({ ...data, ativo: id }));
    });
  },
  criar() {
    return serializar(KEY, async () => {
      const data = await ler();
      if (data.perfis.length >= 8)
        throw new Error("Este aparelho já tem oito perfis.");
      const profile = {
        id: novoId("perfil"),
        nome: `Aluno ${data.perfis.length + 1}`,
      };
      const next = { ativo: profile.id, perfis: [...data.perfis, profile] };
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
      return profile;
    });
  },
};
