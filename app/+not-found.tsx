import { router } from "expo-router";
import { Text, View } from "react-native";
import Header from "@/components/Header";
import BotaoPrimario from "@/components/BotaoPrimario";
import { ui } from "@/components/StudyUI";
export default function NotFoundScreen() {
  return (
    <View style={ui.screen}>
      <Header showBackButton title="Página não encontrada" />
      <View style={[ui.content, { flex: 1, justifyContent: "center" }]}>
        <Text style={ui.title}>Esta página não está disponível</Text>
        <Text style={ui.body}>
          Volte ao início para acessar os conteúdos e as atividades.
        </Text>
        <BotaoPrimario
          label="Ir ao início"
          onPress={() => router.dismissTo("/")}
        />
      </View>
    </View>
  );
}
