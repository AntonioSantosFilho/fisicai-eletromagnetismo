import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import CardFlip from "@/components/CardFlip";
import { fontFamily } from "@/components/StudyUI";
import { colors } from "@/constants";
interface Props {
  frente: string;
  verso: string;
  tipo: string;
  isFlipped: boolean;
  onFlip: () => void;
}
export default function FlashCard({
  frente,
  verso,
  tipo,
  isFlipped,
  onFlip,
}: Props) {
  const label =
    (
      {
        formula: "Expressão matemática",
        conceito: "Conceito",
        aplicacao: "Aplicação",
      } as Record<string, string>
    )[tipo] ?? tipo;
  const face = (answer: boolean) => (
    <View style={{ gap: 22 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text
          style={{
            fontFamily,
            fontSize: 14,
            fontWeight: "700",
            color: colors.primary,
          }}
        >
          {label}
        </Text>
        <Ionicons
          accessible={false}
          name={answer ? "checkmark-circle-outline" : "albums-outline"}
          size={22}
          color={colors.primary}
        />
      </View>
      <Text
        style={{
          fontFamily,
          fontSize: 14,
          fontWeight: "700",
          color: colors.textMuted,
        }}
      >
        {answer ? "RESPOSTA" : "PERGUNTA"}
      </Text>
      <Text
        style={{
          fontFamily,
          fontSize: answer ? 18 : 21,
          lineHeight: answer ? 28 : 30,
          fontWeight: answer ? "400" : "600",
          color: colors.text,
        }}
      >
        {answer ? verso : frente}
      </Text>
      <Text
        style={{
          fontFamily,
          fontSize: 14,
          lineHeight: 21,
          color: colors.primary,
        }}
      >
        {answer
          ? "Toque para voltar à pergunta"
          : "Pense na resposta e toque para conferir"}
      </Text>
    </View>
  );
  return (
    <Pressable cssInterop={false}
      accessibilityRole="button"
      accessibilityLabel={`${isFlipped ? "Resposta" : "Pergunta"}: ${isFlipped ? verso : frente} Toque para ${isFlipped ? "voltar à pergunta" : "ver a resposta"}.`}
      accessibilityState={{ expanded: isFlipped }}
      aria-expanded={isFlipped}
      onPress={onFlip}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        borderRadius: 12,
      })}
    >
      <CardFlip
        revealed={isFlipped}
        minHeight={320}
        backColor={colors.surface}
        frontColor={colors.primaryLight}
        back={face(false)}
        front={face(true)}
      />
    </Pressable>
  );
}
