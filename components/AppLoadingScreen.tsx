import { ActivityIndicator, Image, View } from "react-native";
import { colors } from "@/constants";

// A mesma marca da abertura nativa aparece enquanto o perfil local é carregado.
// A tela acompanha a operação real, sem acrescentar um tempo de espera artificial.
export default function AppLoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Image
        source={require("../assets/images/splash-icon.png")}
        accessibilityLabel="FisicAI"
        resizeMode="contain"
        style={{ width: 320, height: 320, maxWidth: "100%" }}
      />
      <ActivityIndicator
        accessibilityLabel="Abrindo perfil local"
        color={colors.primary}
      />
    </View>
  );
}
