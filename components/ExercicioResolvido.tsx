import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import MathExpression from "@/components/MathExpression";
import References from "@/components/References";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import type { ExercicioResolvidoData } from "@/hooks/useConteudoTeorico";

interface ExercicioResolvidoProps {
  exercicio: ExercicioResolvidoData;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}
export default function ExercicioResolvido({
  exercicio,
  expanded,
  onExpandedChange,
}: ExercicioResolvidoProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = expanded ?? localExpanded;
  function toggle() {
    if (onExpandedChange) onExpandedChange(!isExpanded);
    else setLocalExpanded(!isExpanded);
  }
  return (
    <View style={[ui.card, { padding: 0, overflow: "hidden" }]}>
      <View style={{ padding: 20, gap: 14 }}>
        <Text
          style={{
            fontFamily,
            fontSize: 19,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          Exemplo resolvido
        </Text>
        <Text style={ui.body}>{exercicio.enunciado}</Text>
        <Pressable cssInterop={false}
          accessibilityRole="button"
          accessibilityLabel={
            isExpanded ? "Ocultar resolução" : "Ver resolução passo a passo"
          }
          accessibilityState={{ expanded: isExpanded }}
          onPress={toggle}
          style={({ pressed }) => [
            ui.button,
            {
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: colors.primary,
              backgroundColor: pressed ? colors.primaryLight : colors.surface,
            },
          ]}
        >
          <Text style={[ui.buttonText, { color: colors.primary, flex: 1 }]}>
            {isExpanded ? "Ocultar resolução" : "Ver resolução"}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.primary}
          />
        </Pressable>
      </View>
      {isExpanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            padding: 20,
            gap: 24,
          }}
        >
          <View style={{ gap: 14 }}>
            {exercicio.passo_a_passo
              .split(/\n+/)
              .filter(Boolean)
              .map((step, index) => (
                <View key={index} style={{ flexDirection: "row", gap: 11 }}>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 5,
                      backgroundColor: colors.primaryLight,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily,
                        color: colors.primary,
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[ui.body, { flex: 1, fontSize: 15 }]}>
                    {step.trim().replace(/^\d+\.\s*/, "")}
                  </Text>
                </View>
              ))}
          </View>
          {!!exercicio.resolucao_latex && (
            <View
              style={{
                padding: 12,
                borderRadius: 6,
                backgroundColor: colors.surfaceAlt,
              }}
            >
              <Text
                style={{
                  fontFamily,
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Resolução matemática
              </Text>
              <MathExpression
                latex={exercicio.resolucao_latex}
                readable={exercicio.resolucao_legivel}
              />
            </View>
          )}
          <View
            style={{
              padding: 16,
              gap: 8,
              borderRadius: 6,
              backgroundColor: colors.surfaceAlt,
            }}
          >
            <Text
              style={{
                fontFamily,
                fontSize: 14,
                color: colors.text,
                fontWeight: "700",
              }}
            >
              Resultado
            </Text>
            <Text
              selectable
              style={{
                fontFamily,
                fontSize: 23,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {exercicio.resposta_final}
            </Text>
          </View>
          {!!exercicio.origem_editorial && (
            <Text style={ui.body}>{exercicio.origem_editorial}</Text>
          )}
          <References
            ids={exercicio.referencias_apoio}
            exercise={
              !exercicio.fonte_exata_confirmada && !exercicio.origem_editorial
            }
          />
        </View>
      )}
    </View>
  );
}
