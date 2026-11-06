import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";

interface SessionInfo {
  ready: boolean;
  resumed: boolean;
  draftError: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  saveError: string;
  retrySave: () => void;
}
export default function SessionStatus({ session }: { session: SessionInfo }) {
  if (!session.ready)
    return (
      <View style={{ padding: 18 }}>
        <ActivityIndicator
          color={colors.primary}
          accessibilityLabel="Carregando andamento da atividade"
        />
      </View>
    );
  if (session.saveStatus === "saving")
    return (
      <View
        style={[ui.row, { padding: 14, backgroundColor: colors.primaryLight }]}
      >
        <ActivityIndicator color={colors.primary} />
        <Text
          accessibilityLiveRegion="polite"
          style={[ui.body, { fontSize: 14 }]}
        >
          Salvando seu resultado…
        </Text>
      </View>
    );
  if (session.saveStatus === "error")
    return (
      <View
        accessibilityLiveRegion="assertive"
        style={{ padding: 16, backgroundColor: colors.errorLight, gap: 12 }}
      >
        <Text style={ui.body}>
          O resultado ainda não foi salvo. {session.saveError}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tentar salvar resultado novamente"
          onPress={session.retrySave}
          style={[ui.button, { backgroundColor: colors.primary }]}
        >
          <Text style={[ui.buttonText, { color: "#FFF" }]}>
            Tentar salvar novamente
          </Text>
        </Pressable>
      </View>
    );
  if (session.saveStatus === "saved")
    return (
      <Text
        accessibilityLiveRegion="polite"
        style={{
          fontFamily,
          fontSize: 14,
          padding: 14,
          backgroundColor: colors.successLight,
          color: colors.success,
        }}
      >
        Resultado salvo neste perfil.
      </Text>
    );
  if (session.draftError)
    return (
      <Text
        accessibilityLiveRegion="polite"
        style={{
          fontFamily,
          fontSize: 14,
          padding: 14,
          color: colors.error,
          backgroundColor: colors.errorLight,
        }}
      >
        {session.draftError} Use Reiniciar para começar um novo andamento.
      </Text>
    );
  if (session.resumed)
    return (
      <Text
        style={{
          fontFamily,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textMuted,
        }}
      >
        Atividade retomada.
      </Text>
    );
  return null;
}
