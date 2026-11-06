import { Text, View } from "react-native";
import BotaoPrimario from "@/components/BotaoPrimario";
import BotaoReiniciar from "@/components/BotaoReiniciar";
import { ui } from "@/components/StudyUI";
import { colors } from "@/constants";

interface ResultadoSessaoProps {
  titulo: string;
  acertos: number;
  erros: number;
  tempoGastoSegundos: number;
  total: number;
  continuarLabel: string;
  onContinuar: () => void;
  onReiniciar?: () => void;
}
export default function ResultadoSessao({
  titulo,
  acertos,
  tempoGastoSegundos,
  total,
  continuarLabel,
  onContinuar,
  onReiniciar,
}: ResultadoSessaoProps) {
  const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;
  const time =
    Math.floor(tempoGastoSegundos / 60) +
    ":" +
    (tempoGastoSegundos % 60).toString().padStart(2, "0");
  return (
    <View style={[ui.card, { gap: 20 }]}>
      <Text accessibilityRole="header" style={ui.title}>
        {titulo}
      </Text>
      <View
        style={{
          gap: 8,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={[
            ui.title,
            { color: colors.primary, fontSize: 30, lineHeight: 38 },
          ]}
        >
          {percentual}% de acertos
        </Text>
        <Text style={ui.body}>
          {acertos} de {total} respostas corretas · Tempo {time}
        </Text>
      </View>
      <BotaoPrimario label={continuarLabel} onPress={onContinuar} />
      {onReiniciar && (
        <BotaoReiniciar label="Reiniciar sessão" onPress={onReiniciar} />
      )}
    </View>
  );
}
