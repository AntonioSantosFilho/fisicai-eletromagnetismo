import { Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { colors } from "@/constants";
import { fontFamily, ui } from "@/components/StudyUI";
import type { QuestaoData } from "@/hooks/useQuizSession";

export default function QuestionEvidence({
  question,
}: {
  question: QuestaoData;
}) {
  const table = question.dados_tabela,
    graph = question.grafico;
  if (!table && !graph) return null;
  return (
    <View style={[ui.card, { gap: 16 }]}>
      {graph && (
        <View style={{ gap: 10 }}>
          <Text
            accessibilityRole="header"
            style={[ui.body, { fontWeight: "700", color: colors.text }]}
          >
            {graph.titulo}
          </Text>
          <Svg
            width="100%"
            height={220}
            viewBox="0 0 320 220"
            accessible
            accessibilityLabel={`${graph.titulo}. Eixo horizontal: ${graph.eixo_x}. Eixo vertical: ${graph.eixo_y}. Valores também disponíveis na tabela abaixo.`}
          >
            <Line
              x1={45}
              y1={175}
              x2={302}
              y2={175}
              stroke={colors.text}
              strokeWidth={2}
            />
            <Line
              x1={45}
              y1={175}
              x2={45}
              y2={25}
              stroke={colors.text}
              strokeWidth={2}
            />
            <SvgText
              x={175}
              y={210}
              textAnchor="middle"
              fontSize={14}
              fill={colors.text}
            >
              {graph.eixo_x}
            </SvgText>
            <SvgText x={50} y={16} fontSize={14} fill={colors.text}>
              {graph.eixo_y}
            </SvgText>
            <Polyline
              points={graph.pontos
                .map(
                  ([x, y]) =>
                    `${45 + (x / graph.max_x) * 240},${175 - (y / graph.max_y) * 140}`,
                )
                .join(" ")}
              fill="none"
              stroke={colors.primary}
              strokeWidth={3}
            />
            {graph.pontos.map(([x, y], i) => (
              <Circle
                key={i}
                cx={45 + (x / graph.max_x) * 240}
                cy={175 - (y / graph.max_y) * 140}
                r={4}
                fill={colors.primary}
              />
            ))}
            {graph.pontos
              .filter(([x]) => x > 0)
              .map(([x, y], i) => (
                <SvgText
                  key={i}
                  x={45 + (x / graph.max_x) * 240}
                  y={192}
                  textAnchor="middle"
                  fontSize={13}
                  fill={colors.text}
                >
                  {String(x).replace(".", ",")}
                </SvgText>
              ))}
            {graph.pontos
              .filter(([, y]) => y > 0)
              .map(([, y], i) => (
                <SvgText
                  key={i}
                  x={36}
                  y={180 - (y / graph.max_y) * 140}
                  textAnchor="end"
                  fontSize={13}
                  fill={colors.text}
                >
                  {String(y).replace(".", ",")}
                </SvgText>
              ))}
            <SvgText x={33} y={192} fontSize={13} fill={colors.text}>
              0
            </SvgText>
          </Svg>
        </View>
      )}
      {table && (
        <View style={{ gap: 10 }}>
          <Text style={[ui.body, { fontSize: 14 }]}>{table.legenda}</Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: colors.primaryLight,
              }}
            >
              {table.colunas.map((label) => (
                <Text
                  key={label}
                  style={{
                    fontFamily,
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.primary,
                    flex: 1,
                    padding: 12,
                  }}
                >
                  {label}
                </Text>
              ))}
            </View>
            {table.linhas.map((row, index) => (
              <View
                accessible
                accessibilityLabel={row
                  .map((value, i) => `${table.colunas[i]}: ${value}`)
                  .join("; ")}
                key={index}
                style={{
                  flexDirection: "row",
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                {row.map((value, i) => (
                  <Text
                    key={i}
                    style={{
                      fontFamily,
                      fontSize: 15,
                      color: colors.text,
                      flex: 1,
                      padding: 12,
                    }}
                  >
                    {value}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
