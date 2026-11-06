import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import ProfileControls from "@/components/ProfileControls";
import GraficoAcertos from "@/components/GraficoAcertos";
import Header from "@/components/Header";
import ProgressoCard from "@/components/ProgressoCard";
import {
  EmptyState,
  IconTile,
  SectionHeading,
  fontFamily,
  ui,
  type StudyIcon,
} from "@/components/StudyUI";
import { colors } from "@/constants";
import { useProgressSummary } from "@/hooks/useProgressSummary";

const activityNames: Record<string, string> = {
  flashcards: "Flashcards",
  memoria: "Memória",
  quiz: "Quiz",
  desafio: "Desafio",
  lacunas: "Lacunas",
};
const activityIcons: Record<string, StudyIcon> = {
  flashcards: "albums-outline",
  memoria: "extension-puzzle-outline",
  quiz: "help-circle-outline",
  desafio: "flash-outline",
  lacunas: "create-outline",
};
const moduleNames: Record<string, string> = {
  magnetismo: "Magnetismo",
  eletrodinamica: "Eletrodinâmica",
  eletrostatica: "Eletrostática",
  "ondas-eletromagneticas": "Ondas eletromagnéticas",
};
function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export default function ProgressScreen() {
  const { summary, loading, error, reload } = useProgressSummary();
  const hasProgress = !!summary?.totalSessoes;
  return (
    <View style={ui.screen}>
      <Header title="Progresso" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ui.content}
      >
        {loading ? (
          <ActivityIndicator
            accessibilityLabel="Carregando progresso"
            color={colors.primary}
            style={{ padding: 40 }}
          />
        ) : error ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Não conseguimos abrir seu progresso"
            description={error}
          >
            <Pressable
              accessibilityRole="button"
              onPress={reload}
              style={[ui.button, { backgroundColor: colors.primary }]}
            >
              <Text style={[ui.buttonText, { color: "#FFF" }]}>
                Tentar novamente
              </Text>
            </Pressable>
          </EmptyState>
        ) : (
          <>
            {hasProgress && (
              <>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    padding: 23,
                    borderRadius: 10,
                    gap: 19,
                  }}
                >
                  <View style={[ui.row, { justifyContent: "space-between" }]}>
                    <Text
                      style={[
                        ui.eyebrow,
                        { color: colors.accent, letterSpacing: 1.4 },
                      ]}
                    >
                      RESUMO DAS ATIVIDADES
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily,
                      fontWeight: "600",
                      fontSize: hasProgress ? 42 : 25,
                      lineHeight: hasProgress ? 48 : 32,
                      color: "#FFF",
                      letterSpacing: -0.7,
                    }}
                  >
                    {(summary?.totalTentativas ?? 0) > 0
                      ? `${summary?.mediaAcertosPercentual}%`
                      : hasProgress
                        ? "Revisão registrada"
                        : "Nenhuma atividade\nconcluída ainda."}
                  </Text>
                  <Text
                    style={{
                      fontFamily,
                      fontSize: 14,
                      color: "#E6F2FA",
                      lineHeight: 21,
                    }}
                  >
                    {hasProgress
                      ? "Acertos ÷ tentativas nas atividades. Flashcards são uma autoavaliação separada."
                      : "Conclua um jogo para registrar seu resultado."}
                  </Text>
                </View>
                <View
                  style={[
                    ui.card,
                    {
                      flexDirection: "row",
                      paddingHorizontal: 10,
                      paddingVertical: 20,
                    },
                  ]}
                >
                  {[
                    {
                      value: String(summary?.totalSessoes ?? 0),
                      label: "Sessões",
                      icon: "checkmark-circle-outline" as const,
                    },
                    {
                      value: String(summary?.totalAcertos ?? 0),
                      label: "Acertos",
                      icon: "flag-outline" as const,
                    },
                    {
                      value: formatTime(summary?.tempoTotalSegundos ?? 0),
                      label: "De estudo",
                      icon: "time-outline" as const,
                    },
                  ].map((stat, index) => (
                    <View
                      key={stat.label}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        gap: 7,
                        borderLeftWidth: index ? 1 : 0,
                        borderLeftColor: colors.border,
                      }}
                    >
                      <Ionicons
                        name={stat.icon}
                        size={19}
                        color={colors.primary}
                      />
                      <Text
                        style={{
                          fontFamily,
                          fontWeight: "700",
                          fontSize: 21,
                          color: colors.text,
                        }}
                      >
                        {stat.value}
                      </Text>
                      <Text
                        style={{
                          fontFamily,
                          fontSize: 14,
                          color: colors.textMuted,
                        }}
                      >
                        {stat.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            {!!(
              (summary?.cartoesLembrados ?? 0) + (summary?.cartoesRevisar ?? 0)
            ) && (
              <Text style={ui.body}>
                Flashcards: {summary?.cartoesLembrados} lembrados ·{" "}
                {summary?.cartoesRevisar} para revisar.
              </Text>
            )}
            {hasProgress ? (
              <>
                <GraficoAcertos
                  data={summary!.porModulo.map((module) => ({
                    label: moduleNames[module.modulo] ?? module.modulo,
                    valor: module.mediaAcertosPercentual,
                  }))}
                />
                <View>
                  <SectionHeading title="Por área de conhecimento" />
                  <View style={{ gap: 12 }}>
                    {summary!.porModulo.map((module) => (
                      <ProgressoCard
                        key={module.modulo}
                        modulo={moduleNames[module.modulo] ?? module.modulo}
                        mediaAcertosPercentual={module.mediaAcertosPercentual}
                        tempoTotal={formatTime(module.tempoTotalSegundos)}
                        totalSessoes={module.totalSessoes}
                      />
                    ))}
                  </View>
                </View>
                <View>
                  <SectionHeading title="Últimas atividades" />
                  <View style={[ui.card, { padding: 16, gap: 19 }]}>
                    {summary!.ultimasSessoes.map((session) => (
                      <View key={session.id} style={ui.row}>
                        <IconTile
                          icon={activityIcons[session.tipo] ?? "book-outline"}
                          size={40}
                        />
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text
                            style={{
                              fontFamily,
                              fontSize: 14,
                              fontWeight: "600",
                              color: colors.text,
                            }}
                          >
                            {activityNames[session.tipo] ?? session.tipo}
                          </Text>
                          <Text
                            style={{
                              fontFamily,
                              fontSize: 14,
                              color: colors.textMuted,
                            }}
                          >
                            {moduleNames[session.modulo] ?? session.modulo} ·{" "}
                            {formatDate(session.criadoEm)}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontFamily,
                            fontSize: 14,
                            fontWeight: "600",
                            color: colors.primary,
                          }}
                        >
                          {session.acertos}/{session.totalItens}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <EmptyState
                icon="list-outline"
                title="Comece com uma atividade"
                description="Ao concluir um jogo, seus acertos e seu tempo de estudo aparecem aqui."
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Começar um quiz"
                  onPress={() => router.push("/jogos/quiz")}
                  style={[
                    ui.button,
                    { backgroundColor: colors.primary, marginTop: 5 },
                  ]}
                >
                  <Text style={[ui.buttonText, { color: "#FFF" }]}>
                    Começar um quiz
                  </Text>
                  <Ionicons name="arrow-forward" size={17} color="#FFF" />
                </Pressable>
              </EmptyState>
            )}
          </>
        )}
        <ProfileControls onChange={reload} />
      </ScrollView>
    </View>
  );
}
