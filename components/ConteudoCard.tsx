import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import BadgeDificuldade from "@/components/BadgeDificuldade";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import type { DificuldadeConteudo } from "@/hooks/useConteudoTeorico";

interface ConteudoCardProps {
  tema: string;
  topico: string;
  conceito: string;
  dificuldade: DificuldadeConteudo;
  formula?: string;
  etapa?: "essencial" | "aprofundamento";
  ordem?: number;
  onPress: () => void;
}

export default function ConteudoCard({
  tema,
  topico,
  conceito,
  dificuldade,
  formula,
  etapa,
  ordem,
  onPress,
}: ConteudoCardProps) {
  return (
    <Pressable cssInterop={false}
      accessibilityHint={`Abre o conteúdo ${topico}`}
      accessibilityLabel={topico}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        ui.card,
        {
          padding: 19,
          gap: 12,
          backgroundColor: pressed ? colors.primaryLight : colors.surface,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text
          numberOfLines={1}
          style={[
            ui.eyebrow,
            {
              flex: 1,
              fontSize: 14,
              color: colors.primary,
              letterSpacing: 0.2,
            },
          ]}
        >
          {tema.toUpperCase()}
        </Text>
        <BadgeDificuldade dificuldade={dificuldade} />
      </View>
      <Text
        style={{
          fontFamily,
          fontSize: 17,
          fontWeight: "600",
          lineHeight: 24,
          color: colors.text,
          letterSpacing: -0.35,
        }}
      >
        {ordem ? `${String(ordem).padStart(2, "0")} · ` : ""}
        {topico}
      </Text>
      {etapa === "aprofundamento" && (
        <Text style={[ui.body, { fontSize: 14, color: colors.warning }]}>
          Aprofundamento · retome os pré-requisitos antes de começar.
        </Text>
      )}
      <Text
        numberOfLines={2}
        style={[ui.body, { fontSize: 14, lineHeight: 21 }]}
      >
        {conceito}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        {formula ? (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily,
              color: colors.primary,
              fontSize: 14,
              backgroundColor: colors.primaryLight,
              borderRadius: 8,
              padding: 9,
            }}
          >
            {formula}
          </Text>
        ) : (
          <Text
            style={{
              fontFamily,
              color: colors.primary,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            Ver explicação
          </Text>
        )}
        <Ionicons name="arrow-forward" size={19} color={colors.primary} />
      </View>
    </Pressable>
  );
}
