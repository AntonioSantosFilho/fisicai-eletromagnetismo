import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  progressoService,
  type ResumoProgresso,
} from "@/services/progressoService";
import { usePerfil } from "@/context/PerfilContext";

export function useProgressSummary() {
  const { perfil } = usePerfil();
  const [summary, setSummary] = useState<ResumoProgresso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError("");
      setSummary(null);
      void progressoService
        .obterResumo(perfil.id)
        .then((data) => {
          if (active) setSummary(data);
        })
        .catch((cause) => {
          if (active)
            setError(
              cause instanceof Error
                ? cause.message
                : "Não foi possível abrir os registros.",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [revision, perfil.id]),
  );

  return {
    summary,
    loading,
    error,
    reload: () => setRevision((value) => value + 1),
  };
}
