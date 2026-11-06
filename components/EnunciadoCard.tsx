import { Text, View } from "react-native";
import BadgeDificuldade from "@/components/BadgeDificuldade";
import { colors } from "@/constants";
import { fontFamily } from "@/components/StudyUI";
import type { DificuldadeJogo } from "@/hooks/useFlashcardSession";
import { temaDificuldade } from "@/constants/dificuldade";
interface EnunciadoCardProps {
  titulo: string;
  enunciado: string;
  dificuldade?: DificuldadeJogo;
  tipo?: string;
  progresso?: string;
}
export default function EnunciadoCard({
  titulo,
  enunciado,
  dificuldade,
  tipo,
  progresso,
}: EnunciadoCardProps) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: temaDificuldade(dificuldade).color,
        backgroundColor: colors.surface,
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            fontFamily,
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            flex: 1,
          }}
        >
          {titulo}
        </Text>
        {dificuldade && <BadgeDificuldade dificuldade={dificuldade} />}
      </View>
      {(tipo || progresso) && (
        <Text
          style={{
            fontFamily,
            fontSize: 14,
            lineHeight: 20,
            color: colors.textMuted,
          }}
        >
          {[tipo, progresso].filter(Boolean).join(" · ")}
        </Text>
      )}
      <Text
        style={{
          fontFamily,
          fontSize: 18,
          lineHeight: 26,
          fontWeight: "500",
          color: colors.text,
        }}
      >
        {enunciado}
      </Text>
    </View>
  );
}
