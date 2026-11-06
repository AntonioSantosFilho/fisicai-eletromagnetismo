import AsyncStorage from "@react-native-async-storage/async-storage";

const queues = new Map<string, Promise<unknown>>();

export function serializar<T>(
  key: string,
  operation: () => Promise<T>,
): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(operation);
  queues.set(key, next);
  void next.then(
    () => {
      if (queues.get(key) === next) queues.delete(key);
    },
    () => {
      if (queues.get(key) === next) queues.delete(key);
    },
  );
  return next;
}

export class DadosLocaisInvalidos extends Error {
  readonly codigo = "dados-locais-invalidos";
  constructor(
    message = "Não conseguimos ler os dados locais. Eles foram preservados para recuperação.",
  ) {
    super(message);
    this.name = "DadosLocaisInvalidos";
  }
}

export { AsyncStorage };
