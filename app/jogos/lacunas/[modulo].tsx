import BotaoSecundario from "@/components/BotaoSecundario";
import { useFeedbackPresentation } from "@/hooks/useFeedbackPresentation";
import { activityHelp } from "@/constants/activityHelp";
import ActivitySummary from "@/components/ActivitySummary";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { ScrollView, Text, TextInput, View } from "react-native";

import BotaoPrimario from "@/components/BotaoPrimario";
import BotaoReiniciar from "@/components/BotaoReiniciar";
import EnunciadoCard from "@/components/EnunciadoCard";
import FeedbackModal from "@/components/FeedbackModal";
import Header from "@/components/Header";
import SessionStatus from "@/components/SessionStatus";
import ResultadoSessao from "@/components/ResultadoSessao";
import { colors } from "@/constants";
import type { DificuldadeJogo } from "@/hooks/useFlashcardSession";
import { type DificuldadeFiltro } from "@/hooks/useQuizSession";
import {
  getLacunasModules,
  useLacunasSession,
} from "@/hooks/useLacunasSession";

function normalizeDificuldade(value?: string): DificuldadeFiltro {
  if (
    value === "facil" ||
    value === "medio" ||
    value === "dificil" ||
    value === "todas"
  ) {
    return value;
  }

  return "todas";
}

export default function LacunasSessionScreen() {
  const { modulo, dificuldade } = useLocalSearchParams<{
    modulo?: string;
    dificuldade?: string;
  }>();
  const moduloId = modulo ?? "magnetismo";
  const selectedDifficulty = normalizeDificuldade(dificuldade);
  const session = useLacunasSession(moduloId, selectedDifficulty);
  const feedbackPanel = useFeedbackPresentation(
    session.feedback && session.state.answeredItemId
      ? `${session.state.id}:${session.state.answeredItemId}`
      : null,
  );
  const moduloInfo = getLacunasModules().find((item) => item.id === moduloId);

  return (
    <View className="flex-1 bg-background">
      <Header
        showBackButton
        title="Lacunas"
        helpTitle="Como praticar"
        helpInstructions={activityHelp.lacunas.join("\n\n")}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 16 }}
      >
        <SessionStatus session={session} />
        {session.ready && (
          <>
            {(!session.isComplete || !!session.feedback) && (
              <ActivitySummary
                moduleName={moduloInfo?.titulo ?? moduloId}
                position={session.currentIndex + 1}
                total={session.total}
                unit="Item"
                seconds={session.elapsedSeconds}
                detail={`${session.acertos} acertos · ${session.erros} erros`}
                completed={session.acertos + session.erros}
              />
            )}

            {session.isComplete && !session.feedback ? (
              <ResultadoSessao
                acertos={session.acertos}
                erros={session.erros}
                continuarLabel="Voltar aos conteúdos"
                onContinuar={() => router.push("/(tabs)/estudar" as Href)}
                onReiniciar={session.resetSession}
                tempoGastoSegundos={session.elapsedSeconds}
                titulo="Lacunas concluídas"
                total={session.total}
              />
            ) : session.currentLacuna ? (
              <>
                <EnunciadoCard
                  dificuldade={
                    session.currentLacuna.dificuldade as DificuldadeJogo
                  }
                  enunciado={session.currentLacuna.frase}

                  tipo="Completar lacuna"
                  titulo="Frase"
                />

                <View className="rounded-3xl border border-border bg-card p-lg">
                  <Text className="font-arial text-sm font-bold text-primary">
                    Sua resposta
                  </Text>
                  <TextInput
                    accessibilityLabel="Sua resposta para a lacuna"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!session.feedback}
                    className="mt-sm min-h-12 rounded-2xl border border-border bg-surface px-md font-arial text-md text-text"
                    onChangeText={session.setRespostaDigitada}
                    placeholder="Digite o termo que completa a frase"
                    placeholderTextColor={colors.textMuted}
                    value={session.respostaDigitada}
                  />
                </View>

                <View className="gap-md">
                  <BotaoPrimario
                    disabled={
                      !!session.feedback || !session.respostaDigitada.trim()
                    }
                    label="Validar resposta"
                    onPress={session.submitAnswer}
                  />
                  <BotaoReiniciar compact onPress={session.resetSession} />
                </View>
              </>
            ) : (
              <View className="rounded-3xl border border-border bg-card p-lg">
                <Text className="font-arial text-xl font-bold text-primary">
                  Nenhuma lacuna encontrada
                </Text>
                <Text className="mt-sm font-arial text-md leading-6 text-text-muted">
                  Use outro módulo ou dificuldade para continuar.
                </Text>
              </View>
            )}
          </>
        )}
        {session.feedback && (
          <BotaoSecundario
            label="Ver explicação"
            onPress={feedbackPanel.reopen}
          />
        )}
      </ScrollView>

      <FeedbackModal
        onExit={() => router.dismissTo("/praticar")}
        referencias={session.feedback?.referencias}
        actionLabel={session.isComplete ? "Ver resultado" : "Próxima lacuna"}
        explanation={session.feedback?.explanation ?? ""}
        message={session.feedback?.message ?? ""}
        onClose={session.nextLacuna}
        title={session.feedback?.title ?? ""}
        type={session.feedback?.type ?? "success"}
        onDismiss={feedbackPanel.dismiss}
        visible={feedbackPanel.visible}
      />
    </View>
  );
}
