import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import Header from "@/components/Header";
import { Pill, SectionHeading, fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import { temaDificuldade } from "@/constants/dificuldade";
import {
  getFlashcardModules,
  getFlashcardsByModuleAndDifficulty,
  type DificuldadeJogo,
} from "@/hooks/useFlashcardSession";
import {
  getMemoriaModules,
  getParesByModuleAndDifficulty,
} from "@/hooks/useMemoriaGame";
import {
  getQuizModules,
  getQuestoesByModuleAndDifficulty,
  type DificuldadeFiltro,
} from "@/hooks/useQuizSession";
import {
  getLacunasModules,
  getLacunasByModuleAndDifficulty,
} from "@/hooks/useLacunasSession";

type GameMode = "flashcards" | "quiz" | "memoria" | "desafio" | "lacunas";
const configurations: Record<
  GameMode,
  {
    title: string;
    description: string;
    unit: string;
  }
> = {
  flashcards: {
    title: "Flashcards",
    description:
      "Tente explicar antes de virar. Depois, compare e indique o que precisa revisar.",
    unit: "cartões",
  },
  quiz: {
    title: "Quiz",
    description:
      "Escolha uma alternativa e leia a explicação antes de passar à próxima questão. A opção Todas mistura os níveis de dificuldade.",
    unit: "questões",
  },
  memoria: {
    title: "Memória",
    description:
      "Associe os conceitos em rodadas de até três pares. Todos os pares da sessão serão apresentados.",
    unit: "pares",
  },
  desafio: {
    title: "Desafio",
    description:
      "Questões do básico ao avançado. Alcance pelo menos 80% de acertos. O quiz permite treinar por nível.",
    unit: "questões",
  },
  lacunas: {
    title: "Lacunas",
    description: "Complete as ideias com os conceitos e termos da física.",
    unit: "frases",
  },
};
const levelLabels: Record<DificuldadeFiltro, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
  todas: "Todas",
};
const moduleNames: Record<string, string> = {
  magnetismo: "Magnetismo",
  eletrodinamica: "Eletrodinâmica",
  eletrostatica: "Eletrostática",
  "ondas-eletromagneticas": "Ondas eletromagnéticas",
};

function quantityLabel(total: number, unit: string) {
  const singular: Record<string, string> = {
    cartões: "cartão",
    questões: "questão",
    pares: "par",
    frases: "frase",
  };
  return `${total} ${total === 1 ? (singular[unit] ?? unit) : unit}`;
}

function getModules(mode: GameMode) {
  if (mode === "flashcards")
    return getFlashcardModules().map((item) => ({
      id: item.id,
      title: item.modulo,
      total: item.total,
    }));
  if (mode === "memoria")
    return getMemoriaModules().map((item) => ({
      id: item.id,
      title: item.modulo,
      total: item.total,
    }));
  if (mode === "lacunas")
    return getLacunasModules().map((item) => ({
      id: item.id,
      title: moduleNames[item.id] ?? item.titulo,
      total: item.total,
    }));
  return getQuizModules(mode === "desafio" ? "desafio" : "quiz").map(
    (item) => ({
      id: item.id,
      title: item.titulo,
      total: item.questoes.length,
    }),
  );
}

function countItems(
  mode: GameMode,
  moduleId: string,
  difficulty: DificuldadeFiltro,
) {
  if (mode === "flashcards")
    return getFlashcardsByModuleAndDifficulty(
      moduleId,
      difficulty as DificuldadeJogo,
    ).length;
  if (mode === "memoria")
    return getParesByModuleAndDifficulty(
      moduleId,
      difficulty as DificuldadeJogo,
    ).length;
  if (mode === "lacunas")
    return getLacunasByModuleAndDifficulty(moduleId, difficulty).length;
  return getQuestoesByModuleAndDifficulty(
    moduleId,
    difficulty,
    mode === "desafio" ? "desafio" : "quiz",
  ).length;
}

export default function GameSetup({ mode }: { mode: GameMode }) {
  const config = configurations[mode];
  const modules = getModules(mode);
  const [selectedModule, setSelectedModule] = useState(modules[0]?.id ?? "");
  const [difficulty, setDifficulty] = useState<DificuldadeFiltro>("todas");
  const levels: DificuldadeFiltro[] =
    mode === "desafio" ? ["todas"] : ["todas", "facil", "medio", "dificil"];
  const difficultyTheme = temaDificuldade(difficulty);
  const bankTotal = countItems(mode, selectedModule, difficulty);
  const total =
    mode === "memoria"
      ? bankTotal
      : Math.min(
          bankTotal,
          mode === "flashcards" || (mode === "quiz" && difficulty !== "todas")
            ? 3
            : 5,
        );

  return (
    <View style={ui.screen}>
      <Header
        showBackButton
        title={config.title}
        helpTitle={`Como jogar: ${config.title}`}
        helpInstructions={config.description}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 20 }}
      >
        <View>
          <SectionHeading
            title={
              mode === "desafio" ? "01 · Níveis do desafio" : "01 · Dificuldade"
            }
            detail={
              mode === "desafio"
                ? "Todos os níveis, do básico ao avançado."
                : undefined
            }
          />
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Dificuldade da atividade"
            style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
          >
            {levels.map((level) => (
              <Pill
                key={level}
                tone={temaDificuldade(level)}
                role="radio"
                disabled={!countItems(mode, selectedModule, level)}
                label={`${levelLabels[level]} (${countItems(mode, selectedModule, level)})`}
                selected={level === difficulty}
                onPress={() => setDifficulty(level)}
              />
            ))}
          </View>
        </View>
        <View>
          <SectionHeading title="02 · Escolha um tema" />
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {modules.map((module, index) => {
              const selected = module.id === selectedModule;
              return (
                <Pressable cssInterop={false}
                  key={module.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  aria-pressed={selected}
                  accessibilityLabel={module.title}
                  onPress={() => {
                    setSelectedModule(module.id);
                    if (!countItems(mode, module.id, difficulty))
                      setDifficulty(
                        levels.find((level) =>
                          countItems(mode, module.id, level),
                        ) ?? difficulty,
                      );
                  }}
                  style={({ pressed }) => [
                    ui.row,
                    {
                      borderTopWidth: index ? 1 : 0,
                      borderTopColor: colors.border,
                      minHeight: 64,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      backgroundColor:
                        selected || pressed
                          ? colors.primaryLight
                          : colors.surface,
                    },
                  ]}
                >
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text
                      style={{
                        fontFamily,
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.text,
                      }}
                    >
                      {module.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily,
                        fontSize: 14,
                        color: colors.textMuted,
                      }}
                    >
                      {quantityLabel(
                        countItems(mode, module.id, difficulty),
                        config.unit,
                      )}{" "}
                      disponíveis
                    </Text>
                  </View>
                  <Ionicons
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={21}
                    color={selected ? colors.primary : "#9BA79C"}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={{ backgroundColor: colors.surface }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text
            accessibilityLiveRegion="polite"
            style={{
              fontFamily,
              fontSize: 14,
              lineHeight: 20,
              color: colors.textMuted,
            }}
          >
            {total
              ? `${quantityLabel(total, config.unit)} nesta sessão${mode === "memoria" ? ` · ${Math.ceil(total / 3)} ${Math.ceil(total / 3) === 1 ? "rodada" : "rodadas"}` : ""}${mode === "desafio" ? " · Meta: 80% de acertos" : ""}`
              : "Sem itens neste nível. Escolha outra dificuldade."}
          </Text>
          <Pressable cssInterop={false}
            accessibilityRole="button"
            accessibilityLabel={`Começar ${config.title.toLowerCase()}`}
            disabled={!total}
            onPress={() =>
              router.push(
                `/jogos/${mode}/${encodeURIComponent(selectedModule)}?dificuldade=${difficulty}` as Href,
              )
            }
            style={({ pressed }) => [
              ui.button,
              {
                backgroundColor: !total
                  ? colors.primaryDisabled
                  : difficultyTheme.color,
              },
            ]}
          >
            <Text
              style={[
                ui.buttonText,
                { color: total ? colors.textInverse : colors.textMuted },
              ]}
            >
              Começar {config.title.toLowerCase()}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={total ? colors.textInverse : colors.textMuted}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
