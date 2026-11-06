import {
  AsyncStorage,
  DadosLocaisInvalidos,
  serializar,
} from "@/services/storage";
import { embaralhar } from "@/utils/embaralhar";

const keyFor = (owner: string, scope: string) =>
  `@fisicai-independente:rodizio:${owner}:${scope}`;
export const selecaoService = {
  selecionar(owner: string, scope: string, ids: string[], limit: number) {
    const key = keyFor(owner, scope);
    return serializar(key, async () => {
      const unique = [...new Set(ids)];
      if (!unique.length) return [];
      const raw = await AsyncStorage.getItem(key);
      let queue: string[] = [];
      if (raw !== null) {
        try {
          const value = JSON.parse(raw);
          if (
            !Array.isArray(value) ||
            !value.every((id) => typeof id === "string") ||
            new Set(value).size !== value.length
          )
            throw Error();
          queue = value.filter((id) => unique.includes(id));
        } catch {
          throw new DadosLocaisInvalidos(
            "Não foi possível abrir o rodízio de atividades. A cópia anterior foi preservada.",
          );
        }
      }
      const selected: string[] = [];
      const target = Math.min(Math.max(0, Math.floor(limit)), unique.length);
      while (selected.length < target) {
        if (!queue.length) queue = embaralhar(unique);
        const index = queue.findIndex((id) => !selected.includes(id));
        const [id] = queue.splice(index, 1);
        selected.push(id);
      }
      await AsyncStorage.setItem(key, JSON.stringify(queue));
      return selected;
    });
  },
};
