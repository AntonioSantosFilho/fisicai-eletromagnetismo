import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import BadgeDificuldade from "@/components/BadgeDificuldade";
import BotaoSecundario from "@/components/BotaoSecundario";
import ExercicioResolvido from "@/components/ExercicioResolvido";
import FormulaBox from "@/components/FormulaBox";
import Header from "@/components/Header";
import PhysicsDiagram from "@/components/PhysicsDiagram";
import PedagogicalGuide, {
  LessonPreparation,
} from "@/components/PedagogicalGuide";
import References from "@/components/References";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import { useConteudoTeorico } from "@/hooks/useConteudoTeorico";

export default function TheoryContentScreen() {
  const { modulo } = useLocalSearchParams<{ modulo?: string }>();
  const { getConteudoById } = useConteudoTeorico();
  const content = modulo ? getConteudoById(modulo) : undefined;
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({
    concept: 0,
    expression: 0,
    exercise: 0,
  });
  const [exerciseExpanded, setExerciseExpanded] = useState(false);
  if (!content)
    return (
      <View style={ui.screen}>
        <Header showBackButton title="Conteúdo" />
        <View style={[ui.content, { gap: 16 }]}>
          <Text style={ui.title}>Conteúdo não encontrado</Text>
          <BotaoSecundario
            label="Abrir conteúdos"
            onPress={() => router.replace("/estudar")}
          />
        </View>
      </View>
    );
  const quantities = [
    ...content.variaveis,
    ...(content.relacao_complementar
      ? [
          {
            simbolo: "H",
            significado:
              "Intensidade de campo magnético, medida em ampere por metro (A/m).",
          },
        ]
      : []),
  ];
  function goTo(section: string) {
    if (section === "exercise") setExerciseExpanded(true);
    scroll.current?.scrollTo({ y: positions.current[section], animated: true });
  }
  return (
    <View style={ui.screen}>
      <Header showBackButton title="Conteúdo" />
      <ScrollView
        ref={scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ui.content}
      >
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily,
              fontSize: 14,
              fontWeight: "600",
              color: colors.primary,
            }}
          >
            {content.tema}
          </Text>
          <Text accessibilityRole="header" style={ui.title}>
            {content.topico}
          </Text>
          <BadgeDificuldade dificuldade={content.dificuldade} />
        </View>
        <LessonPreparation
          content={content}
          prerequisites={content.pre_requisitos
            .map((id) => getConteudoById(id))
            .filter((item): item is typeof content => !!item)}
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[
            { id: "concept", label: "Conceito" },
            ...(content.formula_latex
              ? [{ id: "expression", label: "Expressão" }]
              : []),
            { id: "exercise", label: "Exemplo" },
          ].map((step, index) => (
            <Pressable cssInterop={false}
              key={step.id}
              accessibilityRole="button"
              accessibilityLabel={`Ir para ${step.label.toLowerCase()}`}
              onPress={() => goTo(step.id)}
              style={({ pressed }) => ({
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: pressed ? colors.primaryLight : colors.surface,
                borderRadius: 6,
                minHeight: 54,
                justifyContent: "center",
                alignItems: "center",
                gap: 3,
              })}
            >
              <Text
                style={{
                  fontFamily,
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                {index + 1}
              </Text>
              <Text style={{ fontFamily, fontSize: 14, color: colors.text }}>
                {step.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View
          onLayout={(event) => {
            positions.current.concept = event.nativeEvent.layout.y;
          }}
          style={{ gap: 12 }}
        >
          <Text
            style={{
              fontFamily,
              fontSize: 19,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            Entenda o conceito
          </Text>
          <Text style={ui.body}>{content.conceito}</Text>
        </View>
        {content.diagrama && (
          <PhysicsDiagram key={content.diagrama} kind={content.diagrama} />
        )}
        {!!content.formula_latex && (
          <View
            onLayout={(event) => {
              positions.current.expression = event.nativeEvent.layout.y;
            }}
          >
            <FormulaBox
              natureza={content.natureza_expressao}
              contexto={content.contexto_expressao}
              formulaLatex={content.formula_latex}
              formulaLegivel={content.formula_legivel}
              notaPedagogica={content.nota_pedagogica}
            />
          </View>
        )}
        {content.relacao_complementar && (
          <FormulaBox
            natureza={content.relacao_complementar.natureza}
            contexto={content.relacao_complementar.contexto}
            formulaLatex={content.relacao_complementar.latex}
            formulaLegivel={content.relacao_complementar.legivel}
          />
        )}
        {!!quantities.length && (
          <View style={[ui.card, { gap: 16 }]}>
            <Text
              accessibilityRole="header"
              style={{
                fontFamily,
                fontSize: 19,
                lineHeight: 26,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              Grandezas e constantes físicas envolvidas
            </Text>
            {quantities.map((quantity) => (
              <View
                key={`${quantity.simbolo}-${quantity.significado}`}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    minWidth: 45,
                    padding: 9,
                    borderRadius: 5,
                    backgroundColor: colors.primaryLight,
                  }}
                >
                  <Text
                    style={{
                      fontFamily,
                      color: colors.primary,
                      fontSize: 18,
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {quantity.simbolo}
                  </Text>
                </View>
                <Text
                  style={[ui.body, { flex: 1, fontSize: 14, lineHeight: 22 }]}
                >
                  {quantity.significado}
                </Text>
              </View>
            ))}
          </View>
        )}
        <PedagogicalGuide key={content.id} content={content} />
        <View
          onLayout={(event) => {
            positions.current.exercise = event.nativeEvent.layout.y;
          }}
        >
          <ExercicioResolvido
            exercicio={content.exercicio_resolvido}
            expanded={exerciseExpanded}
            onExpandedChange={setExerciseExpanded}
          />
        </View>
        <View style={ui.card}>
          <References ids={content.referencias} />
        </View>
        <BotaoSecundario
          label="Voltar para conteúdos"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/estudar")
          }
        />
      </ScrollView>
    </View>
  );
}
