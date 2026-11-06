import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { ajudaAssistente } from "@/constants/assistente";
import BubbleChat from "@/components/BubbleChat";
import Header from "@/components/Header";
import { SectionHeading, fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import { useChat } from "@/hooks/useChat";
import ChatPrivacyNotice from "@/components/ChatPrivacyNotice";
import ReportAnswerModal from "@/components/ReportAnswerModal";
import type { MensagemIA } from "@/types";

const suggestions = [
  { label: "Como funciona um ímã?", icon: "magnet-outline" as const },
  { label: "Me explique a Lei de Ohm", icon: "flash-outline" as const },
  {
    label: "O que são ondas eletromagnéticas?",
    icon: "pulse-outline" as const,
  },
];

export default function AiHelpScreen() {
  const [input, setInput] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [reportMessage, setReportMessage] = useState<MensagemIA | null>(null);
  const chat = useChat({ privacyAcknowledged });
  const scroll = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const started = chat.mensagens.length > 1;
  function handleSend() {
    const text = input.trim();
    if (!text || !chat.podeEnviar || !privacyAcknowledged) return;
    setInput("");
    void chat.enviarMensagem(text);
  }
  return (
    <View style={ui.screen}>
      <Header
        title="Dúvidas"
        helpTitle="Sobre o assistente"
        helpInstructions={ajudaAssistente}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[ui.content, { flexGrow: 1, gap: 18 }]}
          onContentSizeChange={() => {
            if (started) scroll.current?.scrollToEnd({ animated: true });
          }}
        >
          {!privacyAcknowledged ? (
            <ChatPrivacyNotice
              checked={ageChecked}
              onToggle={() => setAgeChecked((value) => !value)}
              onContinue={() => {
                if (ageChecked) setPrivacyAcknowledged(true);
              }}
            />
          ) : !started ? (
            <>
              <View style={{ paddingTop: 14, gap: 17 }}>
                <View style={{ gap: 9 }}>
                  <Text style={ui.title}>Qual é sua dúvida?</Text>
                  <Text style={ui.body}>
                    Pergunte sobre eletromagnetismo. O assistente usa IA e pode
                    errar.
                  </Text>
                </View>
              </View>
              <View style={{ gap: 9, marginTop: 5 }}>
                <SectionHeading title="Exemplos de perguntas" />
                {suggestions.map((suggestion) => (
                  <Pressable cssInterop={false}
                    key={suggestion.label}
                    accessibilityRole="button"
                    accessibilityLabel={suggestion.label}
                    onPress={() => {
                      setInput(suggestion.label);
                      inputRef.current?.focus();
                    }}
                    style={({ pressed }) => [
                      ui.row,
                      {
                        backgroundColor: pressed
                          ? colors.primaryLight
                          : colors.surface,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        padding: 15,
                        minHeight: 52,
                      },
                    ]}
                  >
                    <Ionicons
                      name={suggestion.icon}
                      size={19}
                      color={colors.primary}
                    />
                    <Text
                      style={{
                        fontFamily,
                        flex: 1,
                        fontSize: 14,
                        lineHeight: 21,
                        color: colors.text,
                      }}
                    >
                      {suggestion.label}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color={colors.textMuted}
                    />
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            chat.mensagens.map((message, index) => (
              <BubbleChat
                key={message.id}
                mensagem={message}
                onReport={
                  message.papel === "assistente" && index > 0
                    ? () => setReportMessage(message)
                    : undefined
                }
              />
            ))
          )}
          {chat.isTyping && (
            <View accessibilityLiveRegion="polite" style={ui.row}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[ui.body, { fontSize: 14 }]}>
                Pensando na sua pergunta…
              </Text>
            </View>
          )}
          {!!chat.error && (
            <Text
              accessibilityLiveRegion="assertive"
              style={[ui.body, { color: colors.error }]}
            >
              {chat.error} Sua pergunta permanece na conversa; você pode
              reenviá-la.
            </Text>
          )}
          {!!chat.fontes.length && (
            <View style={{ gap: 10 }}>
              <Text style={ui.body}>
                Leituras de apoio relacionadas à pergunta:
              </Text>
              {chat.fontes.map((source) => (
                <Pressable
                  key={source.url}
                  accessibilityRole="link"
                  onPress={() =>
                    void Linking.openURL(source.url).catch(() => undefined)
                  }
                >
                  <Text
                    style={[
                      ui.body,
                      {
                        color: colors.primary,
                        textDecorationLine: "underline",
                      },
                    ]}
                  >
                    {source.titulo}
                  </Text>
                </Pressable>
              ))}
              <Text style={ui.body}>
                Estas leituras ajudam a conferir os conceitos; não confirmam
                automaticamente a resposta da IA.
              </Text>
            </View>
          )}
          {chat.isTyping && (
            <Pressable
              accessibilityRole="button"
              onPress={chat.cancelar}
              style={ui.button}
            >
              <Text style={[ui.buttonText, { color: colors.primary }]}>
                Interromper resposta
              </Text>
            </Pressable>
          )}
        </ScrollView>
        {privacyAcknowledged && (
          <View
            style={{
              paddingHorizontal: 18,
              paddingTop: 12,
              paddingBottom: 12,
              gap: 8,
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                borderRadius: 10,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 7,
                gap: 5,
              }}
            >
              <TextInput
                ref={inputRef}
                accessibilityLabel="Sua pergunta de eletromagnetismo"
                maxLength={2000}
                placeholder="Digite sua pergunta"
                placeholderTextColor={colors.textMuted}
                multiline
                onChangeText={setInput}
                value={input}
                style={{
                  flex: 1,
                  fontFamily,
                  fontSize: 14,
                  lineHeight: 21,
                  color: colors.text,
                  padding: 9,
                  minHeight: 42,
                  maxHeight: 110,
                }}
              />
              <Pressable cssInterop={false}
                accessibilityRole="button"
                accessibilityLabel="Enviar pergunta"
                disabled={!input.trim() || !chat.podeEnviar}
                onPress={handleSend}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  backgroundColor:
                    !input.trim() || !chat.podeEnviar
                      ? colors.primaryDisabled
                      : colors.primary,
                  borderRadius: 13,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Ionicons
                  name="arrow-up"
                  size={21}
                  color={
                    !input.trim() || !chat.podeEnviar
                      ? colors.textMuted
                      : "#FFF"
                  }
                />
              </Pressable>
            </View>
            <Text
              style={{
                fontFamily,
                color: colors.textMuted,
                textAlign: "center",
                fontSize: 14,
                lineHeight: 21,
              }}
            >
              A IA pode cometer erros. Confira as explicações.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
      <ReportAnswerModal
        message={reportMessage}
        onClose={() => setReportMessage(null)}
      />
    </View>
  );
}
