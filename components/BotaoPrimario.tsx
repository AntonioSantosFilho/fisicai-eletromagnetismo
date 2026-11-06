import { ActivityIndicator, Pressable, Text } from "react-native";
import { colors } from "@/constants";
import { fontFamily } from "@/components/StudyUI";
interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
}
export default function BotaoPrimario({
  label,
  onPress,
  disabled = false,
  loading = false,
  accessibilityHint,
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable cssInterop={false}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 50,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: inactive ? colors.border : colors.primary,
        backgroundColor: inactive
          ? colors.primaryDisabled
          : pressed
            ? colors.primaryPressed
            : colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      })}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text
          style={{
            fontFamily,
            fontSize: 16,
            lineHeight: 23,
            fontWeight: "700",
            textAlign: "center",
            color: inactive ? colors.textMuted : colors.textInverse,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
