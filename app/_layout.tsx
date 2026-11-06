import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import "react-native-reanimated";
import { PerfilProvider } from "@/context/PerfilContext";
import { colors } from "@/constants";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <PerfilProvider>
      {/* Expo Router fornece o SafeAreaProvider. A borda inferior é reservada
          uma única vez, para abas e para todas as telas abertas no Stack. */}
      <SafeAreaView
        edges={["bottom"]}
        style={{ flex: 1, backgroundColor: colors.surface }}
      >
        <Stack screenOptions={{ headerShown: false, orientation: "portrait" }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaView>
      <StatusBar style="dark" />
    </PerfilProvider>
  );
}
