import { Text, View } from "react-native";

import { colors } from "@/constants";

interface GraficoAcertosItem {
  label: string;
  valor: number;
}

interface GraficoAcertosProps {
  data: GraficoAcertosItem[];
}

export default function GraficoAcertos({ data }: GraficoAcertosProps) {
  const maxValue = Math.max(100, ...data.map((item) => item.valor));

  return (
    <View className="rounded-3xl border border-border bg-card p-lg">
      <Text className="font-arial text-xl font-bold text-primary">
        Acertos por módulo
      </Text>
      <View className="mt-lg gap-md">
        {data.length === 0 ? (
          <Text className="font-arial text-sm leading-5 text-text-muted">
            Complete uma sessão para visualizar o gráfico.
          </Text>
        ) : (
          data.map((item) => (
            <View key={item.label} className="gap-xs">
              <View className="flex-row items-center justify-between gap-md">
                <Text
                  className="flex-1 font-arial text-sm font-bold text-text"
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                <Text className="font-arial text-sm font-bold text-primary">
                  {item.valor}%
                </Text>
              </View>
              <View className="h-4 overflow-hidden rounded-full bg-primary-light">
                <View
                  className="h-4 rounded-full"
                  style={{
                    width: `${Math.min(100, (item.valor / maxValue) * 100)}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
