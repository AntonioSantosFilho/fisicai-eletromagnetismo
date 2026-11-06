import BotaoSecundario from "@/components/BotaoSecundario";
import { useFeedbackPresentation } from "@/hooks/useFeedbackPresentation";
import { activityHelp } from "@/constants/activityHelp";
import { useDelayedFeedback } from "@/hooks/useDelayedFeedback";
import { SectionHeading } from "@/components/StudyUI";
import ActivitySummary from "@/components/ActivitySummary";
import QuestionEvidence from "@/components/QuestionEvidence";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import AlternativaButton, {
  type AlternativaEstado,
} from "@/components/AlternativaButton";
import BotaoReiniciar from "@/components/BotaoReiniciar";
import EnunciadoCard from "@/components/EnunciadoCard";
import FeedbackModal from "@/components/FeedbackModal";
import Header from "@/components/Header";
import SessionStatus from "@/components/SessionStatus";
import ResultadoSessao from "@/components/ResultadoSessao";
import type { DificuldadeJogo } from "@/hooks/useFlashcardSession";
import { type DificuldadeFiltro, useQuizSession } from "@/hooks/useQuizSession";

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

function getAlternativaEstado(
  letra: string,
  selectedAnswer: string | null,
  respostaCorreta?: string,
): AlternativaEstado {
  if (!selectedAnswer || !respostaCorreta) {
    return "neutro";
  }

  if (letra === respostaCorreta) {
    return "correto";
  }

  if (letra === selectedAnswer) {
    return "incorreto";
  }

  return "neutro";
}

export default function QuizSessionScreen() {
  const { modulo, dificuldade } = useLocalSearchParams<{
    modulo?: string;
    dificuldade?: string;
  }>();
  const moduloId = modulo ?? "magnetismo";
  const selectedDifficulty = normalizeDificuldade(dificuldade);
  const session = useQuizSession(moduloId, selectedDifficulty, "quiz");
  const feedbackPanel = useFeedbackPresentation(
    session.feedback && session.state.answeredItemId
      ? `${session.state.id}:${session.state.answeredItemId}`
      : null,
    true,
  );

  return (
    <View className="flex-1 bg-background">
      <Header
        showBackButton
        title="Quiz"
        helpTitle="Como praticar"
        helpInstructions={activityHelp.quiz.join("\n\n")}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 16 }}
      >
        <SessionStatus session={session} />
        {session.ready && (
          <>
            {(!session.isComplete || !!session.feedback) && (
              <ActivitySummary
                moduleName={session.modulo?.titulo ?? moduloId}
                position={session.currentIndex + 1}
                total={session.total}
                unit="Questão"
                seconds={session.elapsedSeconds}
                detail={`${session.acertos} acertos · ${session.erros} erros`}
                completed={session.acertos + session.erros}
              />
            )}

            {session.isComplete && !session.feedback ? (
              <ResultadoSessao
                acertos={session.acertos}
                erros={session.erros}
                continuarLabel="Escolher outro quiz"
                onContinuar={() => router.push("/jogos/quiz" as Href)}
                onReiniciar={session.resetSession}
                tempoGastoSegundos={session.elapsedSeconds}
                titulo="Quiz concluído"
                total={session.total}
              />
            ) : session.currentQuestion ? (
              <>
                <EnunciadoCard
                  dificuldade={
                    session.currentQuestion.dificuldade as DificuldadeJogo
                  }
                  enunciado={session.currentQuestion.enunciado}

                  tipo={
                    session.currentQuestion.tipo === "calculo"
                      ? "Cálculo"
                      : undefined
                  }
                  titulo="Questão"
                />

                <QuestionEvidence question={session.currentQuestion} />
                <View>
                  <SectionHeading title="Alternativas" />
                  <View style={{ gap: 8 }}>
                    {session.currentQuestion.alternativas.map((alternativa) => (
                      <AlternativaButton
                        key={alternativa.letra}
                        disabled={Boolean(session.selectedAnswer)}
                        estado={getAlternativaEstado(
                          alternativa.letra,
                          session.selectedAnswer,
                          session.currentQuestion?.resposta_correta,
                        )}
                        letra={alternativa.letra}
                        onPress={() =>
                          session.answerQuestion(alternativa.letra)
                        }
                        texto={alternativa.texto}
                      />
                    ))}
                  </View>
                </View>

                <BotaoReiniciar compact onPress={session.resetSession} />
              </>
            ) : (
              <View className="rounded-3xl border border-border bg-card p-lg">
                <Text className="font-arial text-xl font-bold text-primary">
                  Nenhuma questão encontrada
                </Text>
                <Text className="mt-sm font-arial text-md leading-6 text-text-muted">
                  Volte e escolha outra dificuldade.
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
        rotulo="Resultado da questão"
        onExit={() => router.dismissTo("/praticar")}
        referencias={session.feedback?.referencias}
        actionLabel={session.isComplete ? "Ver resultado" : "Próxima questão"}
        explanation={session.feedback?.explanation ?? ""}
        message={session.feedback?.message ?? ""}
        onClose={session.nextQuestion}
        title={session.feedback?.title ?? ""}
        type={session.feedback?.type ?? "success"}
        onDismiss={feedbackPanel.dismiss}
        visible={feedbackPanel.visible}
      />
    </View>
  );
}
