import { useState } from "react";
import { router, type Href } from "expo-router";
import { Linking, Pressable, Text, View } from "react-native";
import { colors } from "@/constants";
import { fontFamily, ui } from "@/components/StudyUI";
import type { ConteudoTeoricoItem } from "@/hooks/useConteudoTeorico";

export function LessonPreparation({
  content,
  prerequisites,
}: {
  content: ConteudoTeoricoItem;
  prerequisites: ConteudoTeoricoItem[];
}) {
  return (
    <View style={[ui.card, { gap: 12, backgroundColor: colors.primaryLight }]}>
      <Text
        style={{
          fontFamily,
          fontSize: 16,
          fontWeight: "700",
          color: colors.primary,
        }}
      >
        {content.etapa === "aprofundamento"
          ? "Aprofundamento"
          : "O que você vai aprender"}
      </Text>
      {content.objetivos.map((goal) => (
        <Text key={goal} style={ui.body}>
          {goal}
        </Text>
      ))}
      {!!prerequisites.length && (
        <>
          <Text style={[ui.body, { fontSize: 14, fontWeight: "700" }]}>
            Antes, vale conhecer:
          </Text>
          {prerequisites.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="link"
              accessibilityLabel={`Revisar ${item.topico}`}
              onPress={() =>
                router.push(`/estudar/${encodeURIComponent(item.id)}` as Href)
              }
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text
                style={[
                  ui.body,
                  {
                    fontSize: 14,
                    color: colors.primary,
                    textDecorationLine: "underline",
                  },
                ]}
              >
                {item.topico}
              </Text>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}

export default function PedagogicalGuide({
  content,
}: {
  content: ConteudoTeoricoItem;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={{ gap: 22 }}>
      <View
        style={[
          ui.card,
          { gap: 12, borderRadius: 6, backgroundColor: colors.surfaceAlt },
        ]}
      >
        <Text
          accessibilityRole="header"
          style={{
            fontFamily,
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          Uma confusão comum
        </Text>
        <Text style={[ui.body, { fontStyle: "italic" }]}>
          “{content.erro_comum.afirmacao}”
        </Text>
        <Text style={ui.body}>{content.erro_comum.correcao}</Text>
      </View>
      <View style={[ui.card, { gap: 14 }]}>
        <Text
          accessibilityRole="header"
          style={{
            fontFamily,
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          Pare e pense
        </Text>
        <Text style={ui.body}>{content.pergunta_reflexao.pergunta}</Text>
        <Text style={[ui.body, { fontSize: 14 }]}>
          Tente explicar com suas palavras antes de conferir.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: revealed }}
          onPress={() => setRevealed((value) => !value)}
          style={[ui.button, { backgroundColor: colors.primaryLight }]}
        >
          <Text style={[ui.buttonText, { color: colors.primary }]}>
            {revealed ? "Ocultar raciocínio" : "Conferir raciocínio"}
          </Text>
        </Pressable>
        {revealed && (
          <Text accessibilityLiveRegion="polite" style={ui.body}>
            {content.pergunta_reflexao.resposta}
          </Text>
        )}
      </View>
      {content.investigacao && (
        <View style={[ui.card, { gap: 14 }]}>
          <Text
            accessibilityRole="header"
            style={{
              fontFamily,
              fontSize: 18,
              fontWeight: "700",
              color: colors.text,
            }}
          >
            Investigue na simulação
          </Text>
          {(["prever", "observar", "explicar"] as const).map((key, i) => (
            <View key={key} style={{ gap: 5 }}>
              <Text
                style={[ui.body, { fontWeight: "700", color: colors.primary }]}
              >
                {i + 1}. {["Preveja", "Observe", "Explique"][i]}
              </Text>
              <Text style={ui.body}>{content.investigacao![key]}</Text>
            </View>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push(
                `/estudar/phet/${content.investigacao!.simulacao_id}` as Href,
              )
            }
            style={[ui.button, { backgroundColor: colors.primary }]}
          >
            <Text style={[ui.buttonText, { color: colors.textInverse }]}>
              Abrir simulação
            </Text>
          </Pressable>
        </View>
      )}
      {content.leitura_apoio && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Leitura complementar: ${content.leitura_apoio.titulo}`}
          onPress={() =>
            void Linking.openURL(content.leitura_apoio!.url).catch(
              () => undefined,
            )
          }
          style={[ui.card, { gap: 8 }]}
        >
          <Text style={[ui.body, { fontWeight: "700", color: colors.primary }]}>
            Para saber mais
          </Text>
          <Text
            style={[
              ui.body,
              { color: colors.primary, textDecorationLine: "underline" },
            ]}
          >
            {content.leitura_apoio.titulo}
          </Text>
          <Text style={[ui.body, { fontSize: 14 }]}>
            Leitura de apoio em inglês, no OpenStax.
          </Text>
        </Pressable>
      )}
    </View>
  );
}
