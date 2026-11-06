import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import BotaoPrimario from "@/components/BotaoPrimario";
import BotaoSecundario from "@/components/BotaoSecundario";
import { ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import { AI_PROVIDER } from "@/constants/distribuicao";

export default function ChatPrivacyNotice({
  checked,
  onToggle,
  onContinue,
}: {
  checked: boolean;
  onToggle: () => void;
  onContinue: () => void;
}) {
  return (
    <View style={[ui.card, { gap: 16 }]}>
      <Text accessibilityRole="header" style={ui.title}>
        Antes de usar o assistente
      </Text>
      <Text style={ui.body}>
        As perguntas e parte da conversa passam pelo servidor do FisicAI e pelo
        provedor {AI_PROVIDER} para gerar respostas e aplicar seus filtros de
        segurança.
      </Text>
      <Text style={ui.body}>
        Envie apenas dúvidas de eletromagnetismo. Não inclua nome, escola,
        contato, documentos ou dados sensíveis. A IA pode errar; confira a
        explicação com seu professor.
      </Text>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel="Li o aviso sobre o envio das mensagens"
        accessibilityState={{ checked }}
        onPress={onToggle}
        style={{
          minHeight: 48,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 8,
        }}
      >
        <Ionicons
          accessible={false}
          name={checked ? "checkbox" : "square-outline"}
          color={colors.primary}
          size={26}
        />
        <Text style={[ui.body, { flex: 1 }]}>
          Li o aviso sobre o envio das mensagens.
        </Text>
      </Pressable>
      <BotaoPrimario
        label="Habilitar chat"
        disabled={!checked}
        onPress={onContinue}
      />
      <BotaoSecundario
        label="Ler política de privacidade"
        onPress={() => router.push("/privacidade")}
      />
      <Text style={ui.body}>
        O tutor é experimental e depende de configuração do servidor. Os
        conteúdos e atividades locais continuam disponíveis sem o chat.
      </Text>
    </View>
  );
}
