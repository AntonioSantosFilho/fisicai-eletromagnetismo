import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import CardFlip from "@/components/CardFlip";
import UniversityCardBack from "@/components/UniversityCardBack";
import { fontFamily } from "@/components/StudyUI";
import { colors } from "@/constants";
import type { TipoConteudoCarta } from "@/hooks/useMemoriaGame";
interface Props {
  conteudo: string;
  tipoConteudo: TipoConteudoCarta;
  isRevealed: boolean;
  isMatched: boolean;
  isMismatch: boolean;
  disabled?: boolean;
  number: number;
  height: number;
  onMeasure: (height: number) => void;
  onPress: () => void;
}
export default function CartaMemoria({
  conteudo,
  tipoConteudo,
  isRevealed,
  isMatched,
  isMismatch,
  disabled,
  number,
  height,
  onMeasure,
  onPress,
}: Props) {
  const visible = isRevealed || isMatched || isMismatch;
  const color = isMatched
    ? colors.success
    : isMismatch
      ? colors.error
      : colors.primary;
  return (
    <Pressable cssInterop={false}
      accessibilityRole="button"
      accessibilityLabel={`Carta ${number}. ${visible ? conteudo : "Fechada. Toque para revelar."}${isMatched ? " Par encontrado." : ""}`}
      accessibilityState={{
        disabled: !!disabled || isMatched,
        expanded: visible,
      }}
      disabled={disabled || isMatched}
      onPress={onPress}
      style={({ pressed }) => ({
        width: "47%",
        flexGrow: 1,
        opacity: pressed ? 0.88 : 1,
        borderRadius: 12,
      })}
    >
      <CardFlip
        minHeight={220}
        revealed={visible}
        height={height}
        onMeasure={onMeasure}
        borderColor={color}
        frontColor={
          isMatched
            ? colors.successLight
            : isMismatch
              ? colors.errorLight
              : colors.surface
        }
        back={<UniversityCardBack number={number} />}
        front={
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text
                style={{ fontFamily, fontSize: 14, fontWeight: "700", color }}
              >
                {" "}
                {String(number).padStart(2, "0")}
              </Text>
              <Ionicons
                accessible={false}
                name={
                  isMatched
                    ? "checkmark-circle"
                    : isMismatch
                      ? "refresh-outline"
                      : "reader-outline"
                }
                size={19}
                color={color}
              />
            </View>
            <Text
              style={{
                fontFamily,
                fontSize: tipoConteudo === "formula" ? 17 : 15,
                lineHeight: 23,
                fontWeight: "600",
                textAlign: "center",
                color: colors.text,
              }}
            >
              {conteudo}
            </Text>
          </>
        }
      />
    </Pressable>
  );
}
