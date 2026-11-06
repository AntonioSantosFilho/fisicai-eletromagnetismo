import ResumeActivity from "@/components/ResumeActivity";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import Header from "@/components/Header";
import { fontFamily, ui, type StudyIcon } from "@/components/StudyUI";
import { colors } from "@/constants";

const modes: {
  title: string;
  description: string;
  icon: StudyIcon;
  path: Href;
}[] = [
  {
    title: "Quiz",
    description: "Responda questões de múltipla escolha.",
    icon: "list-outline",
    path: "/jogos/quiz",
  },
  {
    title: "Flashcards",
    description: "Leia a pergunta e vire para revisar a resposta.",
    icon: "albums-outline",
    path: "/jogos/flashcards",
  },
  {
    title: "Memória",
    description: "Encontre os pares de conceitos e definições.",
    icon: "extension-puzzle-outline",
    path: "/jogos/memoria",
  },
  {
    title: "Desafio",
    description: "Aplique conceitos em situações diferentes do quiz.",
    icon: "flag-outline",
    path: "/jogos/desafio" as Href,
  },
  {
    title: "Lacunas",
    description: "Complete as frases com o termo que falta.",
    icon: "create-outline",
    path: "/jogos/lacunas" as Href,
  },
];

export default function PracticeScreen() {
  return (
    <View style={ui.screen}>
      <Header showBackButton title="Praticar" />
      <ScrollView contentContainerStyle={ui.content}>
        <View style={{ gap: 8 }}>
          <Text accessibilityRole="header" style={ui.title}>
            Escolha uma atividade
          </Text>
        </View>
        <ResumeActivity />
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {modes.map((mode, index) => (
            <Pressable cssInterop={false}
              key={mode.title}
              accessibilityRole="button"
              accessibilityLabel={mode.title}
              accessibilityHint={mode.description}
              onPress={() => router.push(mode.path)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                minHeight: 84,
                padding: 14,
                backgroundColor: pressed ? colors.primaryLight : colors.surface,
                borderTopWidth: index ? 1 : 0,
                borderTopColor: colors.border,
              })}
            >
              <Ionicons
                name={mode.icon}
                size={23}
                color={colors.primary}
                accessible={false}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    fontFamily,
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {mode.title}
                </Text>
                <Text
                  style={{
                    fontFamily,
                    fontSize: 14,
                    lineHeight: 21,
                    color: colors.textMuted,
                  }}
                >
                  {mode.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.primary}
                accessible={false}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
