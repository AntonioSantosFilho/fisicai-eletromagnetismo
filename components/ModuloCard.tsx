import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants";

interface ModuloCardProps {
  title: string;
  description: string;
  iconName: ComponentProps<typeof FontAwesome>["name"];
  onPress: () => void;
  accessibilityHint?: string;
}

export default function ModuloCard({
  title,
  description,
  iconName,
  onPress,
  accessibilityHint,
}: ModuloCardProps) {
  return (
    <Pressable
      cssInterop={false}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 178,
        flex: 1,
        flexBasis: "45%",
        overflow: "hidden",
        borderRadius: 24,
        borderWidth: 1,
        backgroundColor: pressed ? colors.primaryLight : colors.card,
        borderColor: pressed ? colors.primary : colors.border,
      })}
    >
      <View className="flex-row items-center gap-sm bg-primary px-md py-md">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
          <FontAwesome
            name={iconName}
            size={20}
            color={colors.textOnSecondary}
          />
        </View>
        <Text
          className="flex-1 font-arial text-md font-bold"
          numberOfLines={2}
          style={{ color: colors.textOnPrimary }}
        >
          {title}
        </Text>
      </View>

      <View className="flex-1 justify-between p-md">
        <Text
          className="font-arial text-sm leading-5"
          style={{ color: colors.textMuted }}
        >
          {description}
        </Text>
      </View>
    </Pressable>
  );
}
