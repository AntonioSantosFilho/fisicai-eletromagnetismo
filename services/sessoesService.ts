import {
  AsyncStorage,
  DadosLocaisInvalidos,
  serializar,
} from "@/services/storage";

export interface RascunhoSessao {
  id: string;
  [key: string]: unknown;
}
export interface SavedDraft {
  chave: string;
  perfilId: string;
  atualizadoEm: string;
  estado: RascunhoSessao;
}
const storageKey = (owner: string) => `@fisicai-independente:sessoes:${owner}`;

async function ler(owner: string): Promise<SavedDraft[]> {
  const raw = await AsyncStorage.getItem(storageKey(owner));
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (
      !Array.isArray(data) ||
      !data.every(
        (row) =>
          row &&
          typeof row.chave === "string" &&
          row.perfilId === owner &&
          typeof row.atualizadoEm === "string" &&
          Number.isFinite(Date.parse(row.atualizadoEm)) &&
          row.estado &&
          typeof row.estado.id === "string",
      )
    )
      throw new Error();
    return data;
  } catch {
    throw new DadosLocaisInvalidos(
      "Não foi possível retomar o andamento. A cópia anterior foi preservada.",
    );
  }
}

export const sessoesService = {
  listar: ler,
  async carregar(chave: string, owner: string) {
    return (await ler(owner)).find((row) => row.chave === chave)?.estado;
  },
  salvar(chave: string, owner: string, estado: RascunhoSessao) {
    return serializar(storageKey(owner), async () => {
      const drafts = await ler(owner);
      const next = [
        {
          chave,
          perfilId: owner,
          atualizadoEm: new Date().toISOString(),
          estado,
        },
        ...drafts.filter((row) => row.chave !== chave),
      ].slice(0, 24);
      await AsyncStorage.setItem(storageKey(owner), JSON.stringify(next));
    });
  },
  remover(chave: string, owner: string, sessionId?: string) {
    return serializar(storageKey(owner), async () => {
      const drafts = await ler(owner);
      await AsyncStorage.setItem(
        storageKey(owner),
        JSON.stringify(
          drafts.filter(
            (row) =>
              row.chave !== chave || (sessionId && row.estado.id !== sessionId),
          ),
        ),
      );
    });
  },
  reiniciar(chave: string, owner: string) {
    return serializar(storageKey(owner), async () => {
      try {
        const drafts = await ler(owner);
        await AsyncStorage.setItem(
          storageKey(owner),
          JSON.stringify(drafts.filter((row) => row.chave !== chave)),
        );
      } catch {
        const raw = await AsyncStorage.getItem(storageKey(owner));
        if (raw !== null)
          await AsyncStorage.setItem(`${storageKey(owner)}:recuperacao`, raw);
        await AsyncStorage.setItem(storageKey(owner), "[]");
      }
    });
  },
};
