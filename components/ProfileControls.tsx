import { useState } from "react";
import { router } from "expo-router";
import BotaoSecundario from "@/components/BotaoSecundario";
import { Pressable, Text, View } from "react-native";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SectionHeading, ui } from "@/components/StudyUI";
import { usePerfil } from "@/context/PerfilContext";
import { colors } from "@/constants";
import { progressoService } from "@/services/progressoService";

export default function ProfileControls({
  onChange,
}: {
  onChange: () => void;
}) {
  const { perfil } = usePerfil();
  const [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false),
    [message, setMessage] = useState("");
  async function reset() {
    if (busy) return;
    setBusy(true);
    setConfirm(false);
    setMessage("");
    try {
      await progressoService.limparRegistros(perfil.id);
      onChange();
      setMessage("Seu progresso foi resetado. Você pode começar de novo.");
    } catch {
      setMessage("Não foi possível resetar seus dados. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <View
      style={{
        gap: 12,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <SectionHeading title="Seus dados" />
      <Text style={ui.body}>
        Para começar de novo, apague o histórico e as atividades em andamento
        deste perfil.
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        accessibilityState={{ disabled: busy }}
        onPress={() => setConfirm(true)}
        style={[
          ui.button,
          { backgroundColor: colors.errorLight, opacity: busy ? 0.5 : 1 },
        ]}
      >
        <Text style={[ui.buttonText, { color: colors.error }]}>
          {busy ? "Resetando…" : "Resetar meus dados"}
        </Text>
      </Pressable>
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={ui.body}>
          {message}
        </Text>
      )}
      <ConfirmDialog
        visible={confirm}
        title="Resetar meus dados?"
        message="Seu histórico, os resultados e as atividades em andamento deste perfil serão apagados. Essa ação não pode ser desfeita."
        confirmLabel="Resetar dados"
        destructive
        onCancel={() => setConfirm(false)}
        onConfirm={() => void reset()}
      />
      <BotaoSecundario
        label="Sobre, privacidade e termos"
        onPress={() => router.push("/sobre")}
      />
    </View>
  );
}
