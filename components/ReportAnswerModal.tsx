import { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { MensagemIA } from "@/types";
import { enviarRelatoIA } from "@/services/iaService";
import BotaoPrimario from "@/components/BotaoPrimario";
import BotaoSecundario from "@/components/BotaoSecundario";
import { Pill, ui } from "@/components/StudyUI";
import { colors } from "@/constants";

const categories = [
  { value: "conteudo_inadequado", label: "Conteúdo inadequado" },
  { value: "erro_de_fisica", label: "Erro de física" },
  { value: "fora_do_tema", label: "Fora do tema" },
  { value: "outro", label: "Outro problema" },
];
export default function ReportAnswerModal({
  message,
  onClose,
}: {
  message: MensagemIA | null;
  onClose: () => void;
}) {
  const [category, setCategory] = useState("conteudo_inadequado");
  const [text, setText] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  useEffect(() => {
    setText(
      (message?.conteudo ?? "")
        .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[e-mail removido]")
        .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[documento removido]"),
    );
    setDetails("");
    setError("");
    setReceipt("");
    setCategory("conteudo_inadequado");
  }, [message?.id]);
  async function submit() {
    if (!message || busy || !text.trim()) return;
    setBusy(true);
    setError("");
    try {
      setReceipt(
        await enviarRelatoIA({
          category,
          responseId: message.respostaId || message.id,
          responseText: text,
          details,
          confirmed: true,
        }),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível registrar o relato.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      visible={!!message}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!busy) onClose();
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          padding: 24,
          backgroundColor: "#15293FCC",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          accessibilityViewIsModal
          style={[
            ui.card,
            { width: "100%", maxWidth: 520, maxHeight: "92%", gap: 16 },
          ]}
        >
          <ScrollView
            style={{ flexGrow: 0, flexShrink: 1 }}
            contentContainerStyle={{ gap: 14 }}
          >
            <Text accessibilityRole="header" style={ui.title}>
              Denunciar resposta
            </Text>
            {receipt ? (
              <Text accessibilityLiveRegion="polite" style={ui.body}>
                Relato registrado para análise. Protocolo: {receipt}
              </Text>
            ) : (
              <>
                <Text style={ui.body}>
                  Serão enviados ao responsável apenas o trecho abaixo, a
                  categoria e sua observação. Revise e remova dados pessoais
                  antes de enviar.
                </Text>
                <View
                  accessibilityRole="radiogroup"
                  accessibilityLabel="Tipo de problema"
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  {categories.map((item) => (
                    <Pill
                      key={item.value}
                      role="radio"
                      label={item.label}
                      selected={category === item.value}
                      onPress={() => setCategory(item.value)}
                    />
                  ))}
                </View>
                <Text style={ui.body}>Trecho da resposta</Text>
                <TextInput
                  accessibilityLabel="Trecho da resposta a denunciar"
                  multiline
                  editable={!busy}
                  value={text}
                  onChangeText={setText}
                  maxLength={10000}
                  style={[
                    ui.body,
                    {
                      minHeight: 100,
                      maxHeight: 180,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      textAlignVertical: "top",
                    },
                  ]}
                />
                <TextInput
                  accessibilityLabel="Observação opcional sobre o problema"
                  multiline
                  editable={!busy}
                  value={details}
                  onChangeText={setDetails}
                  maxLength={500}
                  placeholder="Observação opcional, sem dados pessoais"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    ui.body,
                    {
                      minHeight: 72,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      textAlignVertical: "top",
                    },
                  ]}
                />
                {!!error && (
                  <Text
                    accessibilityLiveRegion="assertive"
                    style={[ui.body, { color: colors.error }]}
                  >
                    {error}
                  </Text>
                )}
              </>
            )}
          </ScrollView>
          {!receipt && (
            <BotaoPrimario
              label={busy ? "Enviando relato…" : "Enviar relato"}
              disabled={busy || !text.trim()}
              onPress={() => void submit()}
            />
          )}
          <BotaoSecundario
            label={receipt ? "Fechar" : "Cancelar"}
            disabled={busy}
            onPress={onClose}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
