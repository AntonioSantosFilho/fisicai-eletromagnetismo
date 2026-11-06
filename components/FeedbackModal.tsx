import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { usePresentedFeedback } from "@/hooks/useFeedbackPresentation";
import BotaoPrimario from "@/components/BotaoPrimario";
import BotaoSecundario from "@/components/BotaoSecundario";
import References from "@/components/References";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
interface Props {
  rotulo?: string;
  referencias?: string[];
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  explanation: string;
  onClose: () => void;
  actionLabel?: string;
  comparison?: string[];
  onDismiss: () => void;
  onExit?: () => void;
}
export default function FeedbackModal(props: Props) {
  const { visible, onClose, onDismiss, onExit } = props;
  const {
    rotulo,
    referencias,
    type,
    title,
    message,
    explanation,
    actionLabel = "Continuar",
    comparison,
  } = usePresentedFeedback(visible, props);
  const accent = type === "success" ? colors.success : colors.error;
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onDismiss}
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
          style={{
            width: "100%",
            maxWidth: 520,
            maxHeight: "92%",
            padding: 20,
            gap: 18,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <ScrollView
            style={{ flexGrow: 0, flexShrink: 1 }}
            contentContainerStyle={{ gap: 16 }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Ionicons
                accessible={false}
                name={
                  type === "success"
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
                }
                size={25}
                color={accent}
              />
              <Text
                style={{
                  fontFamily,
                  fontSize: 14,
                  fontWeight: "700",
                  color: accent,
                  flex: 1,
                }}
              >
                {rotulo ?? (type === "success" ? "Acerto" : "Vamos revisar")}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar explicação"
                accessibilityHint="Volta à atividade sem avançar. Você pode reabrir a explicação."
                onPress={onDismiss}
                style={{
                  width: 48,
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  backgroundColor: colors.surfaceAlt,
                }}
              >
                <Ionicons
                  accessible={false}
                  name="close"
                  size={24}
                  color={colors.primary}
                />
              </Pressable>
            </View>
            <Text
              accessibilityRole="header"
              style={{
                fontFamily,
                fontSize: 23,
                lineHeight: 30,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {title}
            </Text>
            <Text style={ui.body}>{message}</Text>
            {!!comparison?.length && (
              <View style={{ gap: 10 }}>
                <Text
                  style={[ui.body, { fontWeight: "700", color: colors.text }]}
                >
                  As cartas que você escolheu
                </Text>
                {comparison.map((text, index) => (
                  <View
                    key={index}
                    style={{
                      padding: 14,
                      gap: 6,
                      backgroundColor: colors.surfaceAlt,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily,
                        fontSize: 14,
                        fontWeight: "700",
                        color: colors.primary,
                      }}
                    >
                      {index === 0 ? "Primeira carta" : "Segunda carta"}
                    </Text>
                    <Text style={ui.body}>{text}</Text>
                  </View>
                ))}
              </View>
            )}
            <View
              style={{
                padding: 16,
                gap: 8,
                borderRadius: 8,
                backgroundColor:
                  type === "success" ? colors.successLight : colors.errorLight,
              }}
            >
              <Text
                style={{
                  fontFamily,
                  fontSize: 15,
                  fontWeight: "700",
                  color: accent,
                }}
              >
                Entenda a relação
              </Text>
              <Text style={[ui.body, { color: colors.text }]}>
                {explanation}
              </Text>
            </View>
            {!!referencias?.length && <References ids={referencias} />}
          </ScrollView>
          <View style={{ gap: 10 }}>
            <BotaoPrimario label={actionLabel} onPress={onClose} />
            {onExit && (
              <BotaoSecundario label="Sair da atividade" onPress={onExit} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
