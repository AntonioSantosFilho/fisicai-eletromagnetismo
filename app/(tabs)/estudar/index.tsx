import ThemeSelector from "@/components/ThemeSelector";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import ConteudoCard from "@/components/ConteudoCard";
import Header from "@/components/Header";
import {
  EmptyState,
  IconTile,
  Pill,
  SectionHeading,
  fontFamily,
  ui,
} from "@/components/StudyUI";
import { colors } from "@/constants";
import { temaDificuldade } from "@/constants/dificuldade";
import {
  useConteudoTeorico,
  type DificuldadeConteudo,
} from "@/hooks/useConteudoTeorico";

const levels: { value: DificuldadeConteudo | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os níveis" },
  { value: "facil", label: "Fácil" },
  { value: "medio", label: "Médio" },
  { value: "dificil", label: "Difícil" },
];
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function StudyScreen() {
  const { tema } = useLocalSearchParams<{ tema?: string }>();
  const { todosConteudos } = useConteudoTeorico();
  const themes = useMemo(
    () => ["Todos", ...new Set(todosConteudos.map((item) => item.tema))],
    [todosConteudos],
  );
  const [selectedTheme, setSelectedTheme] = useState("Todos");
  const [difficulty, setDifficulty] = useState<DificuldadeConteudo | "todos">(
    "todos",
  );
  const [search, setSearch] = useState("");
  useEffect(() => {
    setSelectedTheme(tema && themes.includes(tema) ? tema : "Todos");
    setSearch("");
    setDifficulty("todos");
  }, [tema, themes]);
  const contents = todosConteudos.filter(
    (item) =>
      (selectedTheme === "Todos" || item.tema === selectedTheme) &&
      (difficulty === "todos" || item.dificuldade === difficulty) &&
      normalize(
        `${item.tema} ${item.topico} ${item.conceito} ${item.formula_legivel}`,
      ).includes(normalize(search.trim())),
  );
  function clearFilters() {
    setSearch("");
    setSelectedTheme("Todos");
    setDifficulty("todos");
  }
  return (
    <View style={ui.screen}>
      <Header
        title="Estudar"
        helpTitle="Como estudar"
        helpInstructions="Comece por cargas e campo elétrico; depois avance para correntes, campos magnéticos e ondas. Os circuitos magnéticos são aprofundamentos. Cada conteúdo apresenta seus pré-requisitos, explicação e exemplos."
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ui.content}
      >
        <View style={[ui.card, { padding: 16, gap: 16 }]}>
          <View>
            <SectionHeading title="Dificuldade" />
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Dificuldade dos conteúdos"
              style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
            >
              {levels.map((level) => (
                <Pill
                  key={level.value}
                  role="radio"
                  tone={temaDificuldade(
                    level.value === "todos" ? "todas" : level.value,
                  )}
                  label={level.label}
                  selected={difficulty === level.value}
                  onPress={() => setDifficulty(level.value)}
                />
              ))}
            </View>
          </View>
          <View
            style={[
              ui.row,
              {
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 15,
                borderRadius: 15,
                minHeight: 50,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={19}
              color={colors.textMuted}
            />
            <TextInput
              accessibilityLabel="Buscar conteúdos"
              placeholder="Busque um conceito ou equação"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              style={{
                flex: 1,
                fontFamily,
                fontSize: 14,
                color: colors.text,
                paddingVertical: 14,
              }}
            />
            {!!search && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
                style={{
                  width: 48,
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: -10,
                }}
                onPress={() => setSearch("")}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            )}
          </View>
          <View>
            <SectionHeading title="Tema" />
            <ThemeSelector
              themes={themes}
              value={selectedTheme}
              onChange={setSelectedTheme}
            />
          </View>
        </View>
        <View>
          <SectionHeading
            title={selectedTheme === "Todos" ? "Conteúdos" : selectedTheme}
            detail={`${contents.length} ${contents.length === 1 ? "conteúdo disponível" : "conteúdos disponíveis"}`}
          />
          <View style={{ gap: 13 }}>
            {contents.length ? (
              contents.map((content) => (
                <ConteudoCard
                  key={content.id}
                  tema={content.tema}
                  topico={content.topico}
                  conceito={content.conceito}
                  dificuldade={content.dificuldade}
                  formula={content.formula_legivel}
                  etapa={content.etapa}
                  ordem={content.ordem_estudo}
                  onPress={() =>
                    router.push(
                      `/estudar/${encodeURIComponent(content.id)}` as Href,
                    )
                  }
                />
              ))
            ) : (
              <EmptyState
                icon="search-outline"
                title="Vamos tentar outra busca?"
                description="Nenhum conteúdo corresponde a esses filtros."
              >
                <Pressable
                  accessibilityRole="button"
                  onPress={clearFilters}
                  style={[ui.button, { backgroundColor: colors.primaryLight }]}
                >
                  <Text style={[ui.buttonText, { color: colors.primary }]}>
                    Limpar filtros
                  </Text>
                </Pressable>
              </EmptyState>
            )}
          </View>
        </View>
        <Pressable cssInterop={false}
          accessibilityRole="button"
          accessibilityLabel="Explorar simulações PhET"
          onPress={() => router.push("/estudar/phet")}
          style={({ pressed }) => [
            ui.card,
            ui.row,
            { backgroundColor: pressed ? colors.primaryLight : colors.blue },
          ]}
        >
          <IconTile
            icon="flask-outline"
            background="#FFFFFFA0"
            color="#4F749D"
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily,
                fontWeight: "700",
                fontSize: 15,
                color: colors.text,
              }}
            >
              Simulações de física
            </Text>
            <Text style={[ui.body, { fontSize: 14, marginTop: 4 }]}>
              Abra um experimento do PhET.
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.primary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}
