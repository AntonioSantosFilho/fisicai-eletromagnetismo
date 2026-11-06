import { Text, View } from "react-native";
import { fontFamily } from "@/components/StudyUI";
import { colors } from "@/constants";

export type Dificuldade =
  "facil" | "medio" | "dificil" | "basico" | "intermediario" | "avancado";
const badges = {
  facil: {
    label: "Fácil",
    background: colors.successLight,
    color: colors.success,
  },
  medio: {
    label: "Médio",
    background: colors.secondaryLight,
    color: colors.warning,
  },
  dificil: {
    label: "Difícil",
    background: colors.errorLight,
    color: colors.error,
  },
};
export default function BadgeDificuldade({
  dificuldade,
}: {
  dificuldade: Dificuldade;
}) {
  const key =
    dificuldade === "basico"
      ? "facil"
      : dificuldade === "intermediario"
        ? "medio"
        : dificuldade === "avancado"
          ? "dificil"
          : dificuldade;
  const badge = badges[key] ?? {
    label: "Nível não informado",
    background: colors.surfaceAlt,
    color: colors.textMuted,
  };
  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 7,
        paddingHorizontal: 9,
        paddingVertical: 5,
        backgroundColor: badge.background,
      }}
    >
      <Text
        style={{
          fontFamily,
          fontSize: 14,
          fontWeight: "600",
          color: badge.color,
        }}
      >
        {badge.label}
      </Text>
    </View>
  );
}
