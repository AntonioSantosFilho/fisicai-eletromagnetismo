import { useState } from "react";
import { Pressable, Text } from "react-native";
import { colors } from "@/constants";
import { fontFamily } from "@/components/StudyUI";
import BotaoSecundario from "@/components/BotaoSecundario";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function BotaoReiniciar({
  onPress,
  label = "Reiniciar",
  compact = false,
}: {
  onPress: () => void;
  label?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {compact ? (
        <Pressable cssInterop={false}
          accessibilityRole="button"
          accessibilityLabel="Reiniciar atividade"
          onPress={() => setOpen(true)}
          style={({ pressed }) => ({
            minHeight: 44,
            justifyContent: "center",
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: pressed ? colors.primaryLight : "transparent",
          })}
        >
          <Text style={{ fontFamily, fontSize: 14, color: colors.primary }}>
            Reiniciar atividade
          </Text>
        </Pressable>
      ) : (
        <BotaoSecundario
          accessibilityHint="Permite confirmar o reinício da atividade"
          label={label}
          onPress={() => setOpen(true)}
        />
      )}
      <ConfirmDialog
        visible={open}
        title="Recomeçar esta atividade?"
        message="O andamento atual será descartado. Os resultados que já foram salvos neste perfil serão mantidos."
        confirmLabel="Recomeçar atividade"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          onPress();
        }}
      />
    </>
  );
}
