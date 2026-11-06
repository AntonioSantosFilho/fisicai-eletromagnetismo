import { SafeAreaView } from "react-native-safe-area-context";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <SafeAreaView
        style={{
          flex: 1,
          padding: 24,
          backgroundColor: "#15293FCC",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          accessibilityViewIsModal
          style={[
            ui.card,
            { width: "100%", maxWidth: 480, maxHeight: "90%", gap: 20 },
          ]}
        >
          <ScrollView>
            <Text
              accessibilityRole="header"
              style={[ui.title, { fontSize: 22, lineHeight: 29 }]}
            >
              {title}
            </Text>
            <Text style={[ui.body, { marginTop: 14 }]}>{message}</Text>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
            onPress={onCancel}
            style={[
              ui.button,
              {
                borderWidth: 1,
                borderColor: colors.primary,
                backgroundColor: colors.primaryLight,
              },
            ]}
          >
            <Text style={[ui.buttonText, { color: colors.primary }]}>
              Cancelar
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            onPress={onConfirm}
            style={[
              ui.button,
              { backgroundColor: destructive ? colors.error : colors.primary },
            ]}
          >
            <Text style={[ui.buttonText, { color: "#FFF" }]}>
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
