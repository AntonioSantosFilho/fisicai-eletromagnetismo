import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HelpButton from "@/components/HelpButton";
import { fontFamily } from "@/components/StudyUI";
import { colors } from "@/constants";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  helpTitle?: string;
  helpInstructions?: string;
  showHomeButton?: boolean;
}
export default function Header({
  title,
  showBackButton = false,
  onBackPress,
  helpTitle,
  helpInstructions,
  showHomeButton = showBackButton,
}: HeaderProps) {
  function handleBackPress() {
    if (onBackPress) return onBackPress();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ backgroundColor: colors.surface }}
    >
      <View
        style={{
          minHeight: 64,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        {showBackButton ? (
          <Pressable cssInterop={false}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={handleBackPress}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              backgroundColor: pressed
                ? colors.primaryDisabled
                : colors.primaryLight,
            })}
          >
            <Ionicons name="arrow-back" size={23} color={colors.primary} />
          </Pressable>
        ) : (
          <Image
            source={require("../assets/images/logo-univasf.png")}
            accessibilityLabel="UNIVASF — Universidade Federal do Vale do São Francisco"
            resizeMode="contain"
            style={{ width: 112, height: 34 }}
          />
        )}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily,
            fontWeight: "700",
            fontSize: title === "FisicAI" ? 21 : 18,
            color: colors.text,
            textAlign: showBackButton ? "left" : "right",
          }}
        >
          {title}
        </Text>
        {showHomeButton && (
          <Pressable cssInterop={false}
            accessibilityRole="button"
            accessibilityLabel="Ir ao início"
            accessibilityHint="Sai desta tela e abre o menu inicial"
            onPress={() => router.dismissTo("/")}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed
                ? colors.primaryDisabled
                : colors.primaryLight,
            })}
          >
            <Ionicons name="home-outline" size={22} color={colors.primary} />
          </Pressable>
        )}
        <HelpButton
          compact
          title={helpTitle}
          instructions={helpInstructions}
          actionLabel={helpInstructions ? "Fechar" : undefined}
        />
      </View>
      <View style={{ height: 3, backgroundColor: colors.brandBlue }}>
        <View
          style={{ height: 3, width: 46, backgroundColor: colors.brandYellow }}
        />
      </View>
    </SafeAreaView>
  );
}
