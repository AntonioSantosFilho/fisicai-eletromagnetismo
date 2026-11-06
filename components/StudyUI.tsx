import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps, ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants";

export type StudyIcon = ComponentProps<typeof Ionicons>["name"];
export const fontFamily = Platform.select({
  web: "Arial, sans-serif",
  ios: "Arial",
  default: "sans-serif",
});

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 20, paddingBottom: 32, gap: 22 },
  eyebrow: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.textMuted,
  },
  title: {
    fontFamily,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 33,
    color: colors.text,
  },
  body: { fontFamily, fontSize: 16, lineHeight: 24, color: colors.textMuted },
  card: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: { fontFamily, fontSize: 16, fontWeight: "700" },
});

export function SectionHeading({
  title,
  detail,
  action,
  onPress,
}: {
  title: string;
  detail?: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          accessibilityRole="header"
          style={{
            fontFamily,
            fontSize: 19,
            fontWeight: "700",
            letterSpacing: -0.5,
            color: colors.text,
          }}
        >
          {title}
        </Text>
        {detail && (
          <Text style={[ui.body, { fontSize: 14, marginTop: 3 }]}>
            {detail}
          </Text>
        )}
      </View>
      {action && onPress && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={onPress}
          hitSlop={8}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text
            style={{
              fontFamily,
              color: colors.primary,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {action} ↗
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function IconTile({
  icon,
  background = colors.primaryLight,
  color = colors.primary,
  size = 44,
}: {
  icon: StudyIcon;
  background?: string;
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: background,
      }}
    >
      <Ionicons name={icon} color={color} size={size * 0.48} />
    </View>
  );
}

export function ActivityCard({
  title,
  description,
  icon,
  background,
  color,
  onPress,
}: {
  title: string;
  description: string;
  icon: StudyIcon;
  background: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable cssInterop={false}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      style={({ pressed }) => ({
        flexBasis: "46%",
        flexGrow: 1,
        minHeight: 145,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <IconTile icon={icon} background={background} color={color} size={40} />
        <Ionicons
          name="arrow-forward"
          size={15}
          color={colors.textMuted}
          style={{ transform: [{ rotate: "-45deg" }] }}
        />
      </View>
      <Text
        style={{
          fontFamily,
          fontSize: 15,
          fontWeight: "700",
          color: colors.text,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily,
          fontSize: 14,
          lineHeight: 21,
          color: colors.textMuted,
          marginTop: 5,
        }}
      >
        {description}
      </Text>
    </Pressable>
  );
}

export function Pill({
  label,
  selected,
  onPress,
  disabled = false,
  tone,
  role = "button",
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  tone?: { color: string; background: string };
  role?: "button" | "radio";
}) {
  return (
    <Pressable cssInterop={false}
      disabled={disabled}
      accessibilityRole={role}
      aria-checked={role === "radio" ? selected : undefined}
      aria-pressed={role === "button" ? selected : undefined}
      accessibilityState={
        role === "radio"
          ? { checked: selected, disabled }
          : { selected, disabled }
      }
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.45 : 1,
        paddingHorizontal: 15,
        minHeight: 44,
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: selected
          ? (tone?.color ?? colors.primary)
          : pressed
            ? (tone?.background ?? colors.primaryLight)
            : colors.surface,
        borderWidth: 1,
        borderColor: selected ? (tone?.color ?? colors.primary) : colors.border,
      })}
    >
      <Text
        style={{
          fontFamily,
          fontSize: 14,
          fontWeight: "600",
          color: selected
            ? colors.textInverse
            : (tone?.color ?? colors.textMuted),
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon: StudyIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <View
      style={[ui.card, { alignItems: "center", paddingVertical: 30, gap: 12 }]}
    >
      <IconTile icon={icon} size={56} />
      <Text
        style={{
          fontFamily,
          color: colors.text,
          fontWeight: "700",
          fontSize: 18,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text style={[ui.body, { textAlign: "center", fontSize: 14 }]}>
        {description}
      </Text>
      {children}
    </View>
  );
}
