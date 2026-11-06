import { Text, View } from "react-native";
import MathExpression from "@/components/MathExpression";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import type { NaturezaExpressao } from "@/hooks/useConteudoTeorico";

export const naturezaLabels: Record<NaturezaExpressao, string> = {
  conceitual: "Relações conceituais",
  "equacao-definicao": "Equação de definição",
  "lei-fisica": "Lei física",
  "relacao-constitutiva": "Relação constitutiva",
  "expressao-derivada": "Expressão matemática derivada",
};
interface FormulaBoxProps {
  formulaLegivel: string;
  formulaLatex?: string;
  notaPedagogica?: string;
  natureza: NaturezaExpressao;
  contexto: string;
}
export default function FormulaBox({
  formulaLegivel,
  formulaLatex,
  notaPedagogica,
  natureza,
  contexto,
}: FormulaBoxProps) {
  return (
    <View
      style={[
        ui.card,
        { gap: 14, borderRadius: 6, backgroundColor: colors.surfaceAlt },
      ]}
    >
      <Text
        style={{
          fontFamily,
          fontSize: 16,
          fontWeight: "700",
          color: colors.primary,
        }}
      >
        {naturezaLabels[natureza]}
      </Text>
      <MathExpression latex={formulaLatex} readable={formulaLegivel} />
      <Text style={ui.body}>{contexto}</Text>
      {!!notaPedagogica && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 14,
            gap: 6,
          }}
        >
          <Text
            style={{
              fontFamily,
              fontSize: 14,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            Para interpretar
          </Text>
          <Text style={[ui.body, { fontSize: 14, lineHeight: 22 }]}>
            {notaPedagogica}
          </Text>
        </View>
      )}
    </View>
  );
}
