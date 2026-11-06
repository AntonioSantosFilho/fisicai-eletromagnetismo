import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { colors } from "@/constants";
import { fontFamily } from "@/components/StudyUI";
export type AlternativaEstado = "neutro" | "correto" | "incorreto";
interface Props {
  letra: string;
  texto: string;
  estado?: AlternativaEstado;
  disabled?: boolean;
  onPress: () => void;
}
export default function AlternativaButton({
  letra,
  texto,
  estado = "neutro",
  disabled = false,
  onPress,
}: Props) {
  const tone =
    estado === "correto"
      ? colors.success
      : estado === "incorreto"
        ? colors.error
        : colors.primary;
  return (
    <Pressable cssInterop={false}
      accessibilityRole="button"
      accessibilityLabel={`Alternativa ${letra}: ${texto}${estado === "correto" ? ". Resposta correta." : estado === "incorreto" ? ". Resposta selecionada incorreta." : ""}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 12,
        minHeight: 54,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: tone,
        backgroundColor:
          estado === "correto"
            ? colors.successLight
            : estado === "incorreto"
              ? colors.errorLight
              : pressed
                ? colors.primaryLight
                : colors.surfaceAlt,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        <View
          style={{
            minWidth: 30,
            height: 30,
            borderRadius: 7,
            backgroundColor: tone,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily,
              fontSize: 15,
              fontWeight: "700",
              color: colors.textInverse,
            }}
          >
            {letra}
          </Text>
        </View>
        <Text
          style={{
            fontFamily,
            flex: 1,
            fontSize: 16,
            lineHeight: 24,
            color: colors.text,
          }}
        >
          {texto}
        </Text>
        {estado !== "neutro" && (
          <Ionicons
            accessible={false}
            name={estado === "correto" ? "checkmark-circle" : "close-circle"}
            size={20}
            color={tone}
          />
        )}
      </View>
    </Pressable>
  );
}
