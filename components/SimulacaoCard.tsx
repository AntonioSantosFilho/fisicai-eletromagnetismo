import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import type { TemaSimulacao } from "@/hooks/useSimulacoes";

interface SimulacaoCardProps {
  nome: string;
  tema: TemaSimulacao;
  descricao: string;
  onPress: () => void;
}
const temaLabels: Record<TemaSimulacao, string> = {
  eletromagnetismo: "Eletromagnetismo",
  eletrostatica: "Eletrostática",
  circuitos: "Circuitos",
};
export default function SimulacaoCard({
  nome,
  tema,
  descricao,
  onPress,
}: SimulacaoCardProps) {
  return (
    <Pressable cssInterop={false}
      accessibilityHint={`Abre detalhes da simulação ${nome}, de ${temaLabels[tema]}`}
      accessibilityLabel={nome}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        ui.card,
        {
          backgroundColor: pressed ? colors.primaryLight : colors.surface,
          gap: 10,
          padding: 16,
        },
      ]}
    >
      <View style={[ui.row, { justifyContent: "space-between" }]}>
        <Text
          style={{
            fontFamily,
            fontSize: 18,
            fontWeight: "600",
            lineHeight: 25,
            color: colors.text,
            flex: 1,
          }}
        >
          {nome}
        </Text>
        <Ionicons
          accessible={false}
          name="chevron-forward"
          size={19}
          color={colors.primary}
        />
      </View>
      <Text style={[ui.body, { fontSize: 14 }]} numberOfLines={3}>
        {descricao}
      </Text>
    </Pressable>
  );
}
