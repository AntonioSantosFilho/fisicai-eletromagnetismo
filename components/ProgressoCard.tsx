import { Text, View } from "react-native";

import { colors, typography } from "@/constants";

interface ProgressoCardProps {
  modulo: string;
  totalSessoes: number;
  mediaAcertosPercentual: number;
  tempoTotal: string;
}

export default function ProgressoCard({
  modulo,
  totalSessoes,
  mediaAcertosPercentual,
  tempoTotal,
}: ProgressoCardProps) {
  return (
    <View className="rounded-3xl border border-border bg-card p-lg">
      <Text className="font-arial text-sm font-bold uppercase tracking-widest text-secondary-ink">
        {modulo}
      </Text>
      <Text
        className="mt-sm font-arial font-bold text-primary"
        style={{ fontSize: typography.sizes.xl }}
      >
        {mediaAcertosPercentual}% de acertos
      </Text>
      <View className="mt-md flex-row gap-md">
        <View className="flex-1 rounded-2xl bg-primary-light p-md">
          <Text className="font-arial text-xs font-bold text-primary">
            Sessões
          </Text>
          <Text className="mt-xs font-arial text-lg font-bold text-text">
            {totalSessoes}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-secondary-light p-md">
          <Text className="font-arial text-xs font-bold text-primary">
            Tempo
          </Text>
          <Text
            className="mt-xs font-arial text-lg font-bold"
            style={{ color: colors.text }}
          >
            {tempoTotal}
          </Text>
        </View>
      </View>
    </View>
  );
}
