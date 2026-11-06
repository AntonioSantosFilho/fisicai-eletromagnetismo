import { colors } from "@/constants/colors";

export type NivelAtividade = "facil" | "medio" | "dificil" | "todas";
export const temasDificuldade = {
  facil: {
    label: "Fácil",
    color: colors.success,
    background: colors.successLight,
  },
  medio: {
    label: "Médio",
    color: colors.warning,
    background: colors.warningLight,
  },
  dificil: {
    label: "Difícil",
    color: colors.error,
    background: colors.errorLight,
  },
  todas: {
    label: "Todas",
    color: colors.primary,
    background: colors.primaryLight,
  },
} as const;
export function temaDificuldade(nivel?: string) {
  return temasDificuldade[nivel as NivelAtividade] ?? temasDificuldade.todas;
}
