import {
  estadoValido,
  temAndamento,
  type EstadoSessao,
} from "@/utils/estadoSessao";
export type { EstadoSessao, FeedbackSessao } from "@/utils/estadoSessao";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePerfil } from "@/context/PerfilContext";
import { useAtividadeVisivel } from "@/hooks/useAtividadeVisivel";
import {
  progressoService,
  type TipoAtividadeProgresso,
} from "@/services/progressoService";
import { sessoesService } from "@/services/sessoesService";
import { selecaoService } from "@/services/selecaoService";
import {
  chaveConteudo,
  normalizarModulo,
  novoId,
} from "@/utils/identificadores";

function novoEstado(order: string[] = []): EstadoSessao {
  return {
    id: novoId("sessao"),
    currentIndex: 0,
    acertos: 0,
    erros: 0,
    elapsedSeconds: 0,
    feedback: null,
    selectedAnswer: null,
    answeredItemId: null,
    isFlipped: false,
    respostaDigitada: "",
    selectedIds: [],
    matchedPairIds: [],
    pendingMismatchIds: [],
    order,
  };
}

interface Options {
  tipo: TipoAtividadeProgresso;
  modulo: string;
  dificuldade: string;
  conteudo: unknown;
  total: number;
  order?: () => string[];
  selecao?: { ids: string[]; limite: number; ordenar?: boolean };
  complete?: (state: EstadoSessao) => boolean;
}

export function useLearningSession(options: Options) {
  const { perfil } = usePerfil();
  const foreground = useAtividadeVisivel();
  const config = useRef(options);
  config.current = options;
  const key = `${options.tipo}:${normalizarModulo(options.modulo)}:${options.dificuldade}:${chaveConteudo(options.conteudo)}`;
  const owner = perfil.id;
  const [state, setState] = useState<EstadoSessao>(() =>
    novoEstado(options.order?.()),
  );
  const [loadedScope, setLoadedScope] = useState("");
  const scope = `${owner}|${key}`;
  const ready = loadedScope === scope;
  const [resumed, setResumed] = useState(false);
  const [draftError, setDraftError] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState("");
  const [retry, setRetry] = useState(0);
  const current = useRef({ key, owner, state, ready });
  current.current = { key, owner, state, ready };
  const complete = options.complete
    ? options.complete(state)
    : options.total > 0 && state.acertos + state.erros >= options.total;
  const completeRef = useRef(complete);
  completeRef.current = complete;

  useEffect(() => {
    let active = true;
    setLoadedScope("");
    setResumed(false);
    setDraftError("");
    setSaveStatus("idle");
    const fresh = novoEstado(
      config.current.order?.() ??
        config.current.selecao?.ids.slice(0, config.current.total),
    );
    void sessoesService
      .carregar(key, owner)
      .then(async (draft) => {
        if (!active) return;
        const selection = config.current.selecao;
        const allowed = new Set(selection?.ids ?? fresh.order);
        if (
          draft &&
          !estadoValido(
            draft,
            config.current.total,
            allowed,
            selection ? config.current.total : fresh.order.length,
            config.current.tipo === "memoria",
          )
        )
          throw new Error(
            "O andamento salvo pertence a outra versão ou contém dados inválidos.",
          );
        if (!draft && selection) {
          fresh.order = await selecaoService.selecionar(
            owner,
            key,
            selection.ids,
            selection.limite,
          );
          if (selection.ordenar)
            fresh.order.sort(
              (a, b) => selection.ids.indexOf(a) - selection.ids.indexOf(b),
            );
        }
        if (!active) return;
        if (!draft) await sessoesService.salvar(key, owner, fresh);
        if (!active) return;
        setState(draft ? (draft as EstadoSessao) : fresh);
        setResumed(!!draft);
      })
      .catch((error) => {
        if (active) {
          setState(fresh);
          setDraftError(
            error instanceof Error
              ? error.message
              : "Não foi possível retomar o andamento.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadedScope(scope);
      });
    return () => {
      active = false;
    };
  }, [key, owner]);

  useEffect(() => {
    if (!ready || complete || state.feedback || !foreground || !options.total)
      return;
    const timer = setInterval(
      () =>
        setState((previous) => ({
          ...previous,
          elapsedSeconds: previous.elapsedSeconds + 1,
        })),
      1000,
    );
    return () => clearInterval(timer);
  }, [ready, complete, !!state.feedback, foreground, options.total]);

  useEffect(() => {
    if (!ready || complete || draftError || !temAndamento(state)) return;
    const timer = setTimeout(() => {
      void sessoesService
        .salvar(key, owner, state)
        .catch(() =>
          setDraftError(
            "Não conseguimos salvar o andamento. Mantenha o app aberto e tente novamente.",
          ),
        );
    }, 180);
    return () => clearTimeout(timer);
  }, [state, ready, complete, draftError, key, owner]);

  useEffect(() => {
    if (!foreground && ready && !complete && !draftError)
      void sessoesService
        .salvar(key, owner, state)
        .catch(() =>
          setDraftError(
            "Não conseguimos salvar o andamento. Tente novamente antes de sair.",
          ),
        );
  }, [foreground, ready, complete, key, owner]);

  useEffect(
    () => () => {
      const latest = current.current;
      if (latest.ready && !completeRef.current && temAndamento(latest.state))
        void sessoesService
          .salvar(latest.key, latest.owner, latest.state)
          .catch(() => undefined);
    },
    [],
  );

  useEffect(() => {
    if (!ready || !complete) return;
    let active = true;
    const snapshot = state;
    const settings = config.current;
    setSaveStatus("saving");
    setSaveError("");
    void (async () => {
      await sessoesService.salvar(key, owner, snapshot);
      await progressoService.salvarRegistro(
        {
          tipo: settings.tipo,
          modulo: normalizarModulo(settings.modulo),
          dificuldade: settings.dificuldade,
          acertos: snapshot.acertos,
          erros: snapshot.erros,
          tempoGastoSegundos: snapshot.elapsedSeconds,
          totalItens: settings.total,
        },
        { perfilId: owner, sessionId: snapshot.id },
      );
      await sessoesService.remover(key, owner, snapshot.id);
    })()
      .then(() => {
        if (active) setSaveStatus("saved");
      })
      .catch((error) => {
        if (active) {
          setSaveStatus("error");
          setSaveError(
            error instanceof Error
              ? error.message
              : "Não conseguimos salvar o resultado.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [ready, complete, state.id, key, owner, retry]);

  const update = useCallback(
    (action: (previous: EstadoSessao) => EstadoSessao) => {
      if (current.current.ready) setState(action);
    },
    [],
  );
  function reset() {
    const settings = config.current;
    const fresh = novoEstado(
      settings.order?.() ?? settings.selecao?.ids.slice(0, settings.total),
    );
    setLoadedScope("");
    setResumed(false);
    setSaveStatus("idle");
    setSaveError("");
    setDraftError("");
    void (async () => {
      await sessoesService.reiniciar(key, owner);
      if (settings.selecao) {
        fresh.order = await selecaoService.selecionar(
          owner,
          key,
          settings.selecao.ids,
          settings.selecao.limite,
        );
        if (settings.selecao.ordenar)
          fresh.order.sort(
            (a, b) =>
              settings.selecao!.ids.indexOf(a) -
              settings.selecao!.ids.indexOf(b),
          );
      }
      await sessoesService.salvar(key, owner, fresh);
      if (current.current.key === key && current.current.owner === owner) {
        current.current.state = fresh;
        setState(fresh);
        setLoadedScope(scope);
      }
    })().catch(() => {
      if (current.current.key === key && current.current.owner === owner) {
        setState(fresh);
        setLoadedScope(scope);
        setDraftError("Não conseguimos reiniciar o andamento salvo.");
      }
    });
  }
  return {
    state,
    update,
    ready,
    resumed,
    draftError,
    saveStatus,
    saveError,
    retrySave: () => setRetry((value) => value + 1),
    reset,
    perfil: perfil.nome,
  };
}
