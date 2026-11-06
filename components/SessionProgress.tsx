import { View } from "react-native";
import { colors } from "@/constants";
import { completedProgress } from "@/utils/progressoVisual";

export default function SessionProgress({
  completed,
  total,
  label = "Itens concluídos",
}: {
  completed: number;
  total: number;
  label?: string;
}) {
  const value = completedProgress(completed, total);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      aria-valuemin={0}
      aria-valuemax={value.total}
      aria-valuenow={value.completed}
      aria-valuetext={`${value.completed} de ${value.total}`}
      accessibilityValue={{
        min: 0,
        max: value.total,
        now: value.completed,
        text: `${value.completed} de ${value.total}`,
      }}
      style={{
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.border,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${value.percent}%`,
          backgroundColor: colors.primary,
        }}
      />
    </View>
  );
}
