import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import Header from "@/components/Header";
import BotaoSecundario from "@/components/BotaoSecundario";
import { ui } from "@/components/StudyUI";
import {
  BETA_VERSION,
  SCHOOL_BETA,
  DEVELOPER_NAME,
  SUPPORT_EMAIL,
} from "@/constants/distribuicao";

export default function AboutScreen() {
  return (
    <View style={ui.screen}>
      <Header showBackButton title="Sobre o aplicativo" />
      <ScrollView contentContainerStyle={ui.content}>
        <Text accessibilityRole="header" style={ui.title}>
          FisicAI
        </Text>
        <Text style={ui.body}>
          Conteúdos e atividades de eletromagnetismo para apoiar o estudo no
          ensino médio.
        </Text>
        <Text style={ui.body}>
          {SCHOOL_BETA
            ? `Versão de testes ${BETA_VERSION}. O chat de IA requer internet e pode cometer erros.`
            : "Prévia de desenvolvimento. Os documentos abaixo descrevem a versão beta escolar em preparação."}
        </Text>
        {DEVELOPER_NAME && (
          <Text style={ui.body}>
            Responsável pela distribuição: {DEVELOPER_NAME}
          </Text>
        )}
        {SUPPORT_EMAIL && (
          <Text selectable style={ui.body}>
            Contato: {SUPPORT_EMAIL}
          </Text>
        )}
        <BotaoSecundario
          label="Política de privacidade"
          onPress={() => router.push("/privacidade")}
        />
        <BotaoSecundario
          label="Termos de uso"
          onPress={() => router.push("/termos")}
        />
        <Text style={ui.body}>
          Projeto acadêmico independente. A distribuição não representa
          publicação oficial ou endosso das instituições citadas. O conteúdo
          continua sujeito à revisão docente.
        </Text>
      </ScrollView>
    </View>
  );
}
