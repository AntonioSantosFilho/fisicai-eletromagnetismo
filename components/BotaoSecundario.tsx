import { Pressable, Text } from "react-native";
import { colors } from "@/constants";
import { fontFamily } from "@/components/StudyUI";
interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityHint?: string;
}
export default function BotaoSecundario({
  label,
  onPress,
  disabled = false,
  accessibilityHint,
}: Props) {
  return (
    <Pressable cssInterop={false}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 50,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: disabled ? colors.border : colors.primary,
        backgroundColor: disabled
          ? colors.surfaceAlt
          : pressed
            ? colors.primaryDisabled
            : colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <Text
        style={{
          fontFamily,
          fontSize: 16,
          lineHeight: 23,
          fontWeight: "700",
          textAlign: "center",
          color: disabled ? colors.textMuted : colors.primary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
