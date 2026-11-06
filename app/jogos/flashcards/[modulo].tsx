import { useFeedbackPresentation } from "@/hooks/useFeedbackPresentation";
import { activityHelp } from "@/constants/activityHelp";
import ActivitySummary from "@/components/ActivitySummary";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import BotaoPrimario from "@/components/BotaoPrimario";
import BotaoReiniciar from "@/components/BotaoReiniciar";
import BotaoSecundario from "@/components/BotaoSecundario";
import FeedbackModal from "@/components/FeedbackModal";
import FlashCard from "@/components/FlashCard";
import MathExpression from "@/components/MathExpression";
import Header from "@/components/Header";
import SessionStatus from "@/components/SessionStatus";
import { colors } from "@/constants";
import {
  type DificuldadeFlashcards,
  useFlashcardSession,
} from "@/hooks/useFlashcardSession";

function normalizeDificuldade(value?: string): DificuldadeFlashcards {
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

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function FlashcardSessionScreen() {
  const { modulo, dificuldade } = useLocalSearchParams<{
    modulo?: string;
    dificuldade?: string;
  }>();
  const moduleName = modulo ?? "Magnetismo";
  const selectedDifficulty = normalizeDificuldade(dificuldade);
  const session = useFlashcardSession(moduleName, selectedDifficulty);
  const feedbackPanel = useFeedbackPresentation(
    session.feedback && session.state.answeredItemId
      ? `${session.state.id}:${session.state.answeredItemId}`
      : null,
  );

  return (
    <View className="flex-1 bg-background">
      <Header
        showBackButton
        title="Flashcards"
        helpTitle="Como praticar"
        helpInstructions={activityHelp.flashcards.join("\n\n")}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 16 }}
      >
        <SessionStatus session={session} />
        {session.ready && (
          <>
            {(!session.isComplete || !!session.feedback) && (
              <ActivitySummary
                moduleName={session.moduloNome}
                position={session.currentIndex + 1}
                total={session.total}
                unit="Cartão"
                seconds={session.elapsedSeconds}
                detail={`${session.acertos} lembrados · ${session.erros} para revisar`}
                completed={session.acertos + session.erros}
              />
            )}

            {session.isComplete && !session.feedback ? (
              <View className="gap-md rounded-3xl border border-border bg-card p-lg">
                <Text className="font-arial text-2xl font-bold text-primary">
                  Sessão concluída
                </Text>
                <Text className="font-arial text-md leading-6 text-text">
                  Você concluiu a revisão com {session.acertos} cartões
                  lembrados em {formatTime(session.elapsedSeconds)}.
                </Text>
                <BotaoReiniciar compact onPress={session.resetSession} />
                <BotaoSecundario
                  label="Escolher outros flashcards"
                  onPress={() => router.dismissTo("/jogos/flashcards")}
                />
              </View>
            ) : session.currentFlashcard ? (
              <>
                <FlashCard
                  frente={session.currentFlashcard.frente}
                  isFlipped={session.isFlipped}
                  onFlip={() => session.setIsFlipped(!session.isFlipped)}
                  tipo={session.currentFlashcard.tipo}
                  verso={session.currentFlashcard.verso}
                />

                {session.isFlipped && session.currentFlashcard.formula_latex ? (
                  <View className="rounded-2xl border border-border bg-card p-md">
                    <Text className="font-arial text-sm font-bold text-primary">
                      Expressão matemática
                    </Text>
                    <MathExpression
                      latex={session.currentFlashcard.formula_latex}
                      readable={session.currentFlashcard.verso}
                    />
                  </View>
                ) : null}

                <View className="gap-md">
                  {session.isFlipped ? (
                    <>
                      <BotaoPrimario
                        disabled={!!session.feedback}
                        label="Lembrei corretamente"
                        onPress={() => session.answerCard(true)}
                      />
                      <BotaoSecundario
                        disabled={!!session.feedback}
                        label="Preciso revisar"
                        onPress={() => session.answerCard(false)}
                      />
                    </>
                  ) : (
                    <>
                      <Text className="font-arial text-md leading-6 text-text">
                        Tente responder antes de virar o cartão.
                      </Text>
                      <BotaoPrimario
                        label="Virar cartão e conferir"
                        onPress={() => session.setIsFlipped(true)}
                      />
                    </>
                  )}
                  <BotaoReiniciar compact onPress={session.resetSession} />
                </View>
              </>
            ) : (
              <View className="rounded-3xl border border-border bg-card p-lg">
                <Text className="font-arial text-xl font-bold text-primary">
                  Nenhum flashcard encontrado
                </Text>
                <Text className="mt-sm font-arial text-md leading-6 text-text-muted">
                  Escolha outra dificuldade para continuar.
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
        rotulo="Autoavaliação"
        referencias={session.feedback?.referencias}
        actionLabel={session.isComplete ? "Ver resultado" : "Próximo cartão"}
        explanation={session.feedback?.explanation ?? ""}
        message={session.feedback?.message ?? ""}
        onClose={session.nextCard}
        title={session.feedback?.title ?? ""}
        type={session.feedback?.type ?? "success"}
        onDismiss={feedbackPanel.dismiss}
        visible={feedbackPanel.visible}
      />
    </View>
  );
}
