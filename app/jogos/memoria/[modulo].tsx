import SessionProgress from "@/components/SessionProgress";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import BotaoPrimario from "@/components/BotaoPrimario";
import BotaoSecundario from "@/components/BotaoSecundario";
import CartaMemoria from "@/components/CartaMemoria";
import ConfirmDialog from "@/components/ConfirmDialog";
import FeedbackModal from "@/components/FeedbackModal";
import Header from "@/components/Header";
import SessionStatus from "@/components/SessionStatus";
import { fontFamily, ui } from "@/components/StudyUI";
import { colors } from "@/constants";
import type { DificuldadeJogo } from "@/hooks/useFlashcardSession";
import { useMemoriaGame } from "@/hooks/useMemoriaGame";

function normalizeDificuldade(value?: string): DificuldadeJogo | "todas" {
  return value === "facil" || value === "medio" || value === "dificil"
    ? value
    : "todas";
}
function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export default function MemoryGameScreen() {
  const { modulo, dificuldade } = useLocalSearchParams<{
    modulo?: string;
    dificuldade?: string;
  }>();
  const game = useMemoriaGame(
    modulo ?? "Magnetismo",
    normalizeDificuldade(dificuldade),
  );
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [cardHeight, setCardHeight] = useState(220);
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    setCardHeight(220);
  }, [game.roundIndex, game.state.id]);
  useEffect(() => {
    if (game.isComplete) scroll.current?.scrollTo({ y: 0, animated: true });
  }, [game.isComplete]);
  const measureCard = useCallback(
    (height: number) => setCardHeight((current) => Math.max(current, height)),
    [],
  );
  const lastRound = game.acertos === game.pares.length;
  const instruction = game.isComplete
    ? "Atividade concluída."
    : game.roundComplete
      ? "Rodada concluída! Confira a explicação ou continue."
      : game.feedback
        ? "Confira o par ou toque em outra carta para continuar."
        : game.selectedIds.length
          ? "Escolha a segunda carta."
          : "Toque em duas cartas para formar um par.";
  return (
    <View style={ui.screen}>
      <Header
        showBackButton
        title="Memória"
        helpTitle="Como jogar"
        helpInstructions="Abra duas cartas e compare os significados. Cores e ícones indicam o resultado. Use Conferir par se quiser ler a explicação. Para continuar sem conferir, toque em outra carta: os pares corretos permanecem abertos e os incorretos se fecham. Cada rodada tem até três pares. No fim da rodada, toque em Próxima rodada ou Ver resultado."
      />
      <ScrollView
        ref={scroll}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <SessionStatus session={game} />
        {game.ready && (
          <>
            {!game.isComplete && (
              <View style={{ gap: 8 }}>
                <View style={[ui.row, { justifyContent: "space-between" }]}>
                  <Text
                    style={{
                      fontFamily,
                      fontSize: 16,
                      fontWeight: "700",
                      color: colors.text,
                      flex: 1,
                    }}
                  >
                    {game.moduloNome}
                  </Text>
                  <Text
                    accessibilityLabel={`Tempo ${formatTime(game.elapsedSeconds)}`}
                    style={{
                      fontFamily,
                      fontSize: 14,
                      color: colors.textMuted,
                    }}
                  >
                    {formatTime(game.elapsedSeconds)}
                  </Text>
                </View>
                <View style={[ui.row, { flexWrap: "wrap", gap: 8 }]}>
                  <Text
                    style={{ fontFamily, fontSize: 14, color: colors.primary }}
                  >
                    Rodada {game.roundIndex + 1}/{game.roundCount}
                  </Text>
                  <Text
                    style={{ fontFamily, fontSize: 14, color: colors.success }}
                  >
                    Pares: {game.acertos}/{game.pares.length}
                  </Text>
                  <Text
                    style={{
                      fontFamily,
                      fontSize: 14,
                      color: colors.textMuted,
                    }}
                  >
                    Erros: {game.erros}
                  </Text>
                </View>
                <SessionProgress
                  completed={game.acertos}
                  total={game.pares.length}
                  label="Pares encontrados"
                />
              </View>
            )}
            {game.isComplete ? (
              <View style={[ui.card, { gap: 12 }]}>
                <Text style={ui.title}>Jogo concluído</Text>
                <Text style={ui.body}>
                  Você encontrou {game.acertos} pares em{" "}
                  {formatTime(game.elapsedSeconds)}. {game.erros} tentativas sem
                  formar par.
                </Text>
                <BotaoSecundario
                  label="Jogar novamente"
                  onPress={() => setRestartOpen(true)}
                />
              </View>
            ) : game.visibleCards.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {game.visibleCards.map((card) => (
                  <CartaMemoria
                    key={`${game.state.id}:${game.roundIndex}:${card.id}`}
                    number={
                      game.cards.findIndex((item) => item.id === card.id) + 1
                    }
                    height={cardHeight}
                    onMeasure={measureCard}
                    disabled={feedbackOpen}
                    conteudo={card.conteudo}
                    tipoConteudo={card.tipo_conteudo}
                    isMatched={game.matchedPairIds.includes(card.pairId)}
                    isMismatch={game.pendingMismatchIds.includes(card.id)}
                    isRevealed={
                      game.selectedIds.includes(card.id) ||
                      game.matchedPairIds.includes(card.pairId)
                    }
                    onPress={() => game.selectCard(card.id)}
                  />
                ))}
              </View>
            ) : (
              <Text style={ui.body}>
                Nenhum par encontrado. Volte e escolha outra dificuldade.
              </Text>
            )}
          </>
        )}
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Text
          accessibilityLiveRegion="polite"
          style={{
            fontFamily,
            fontSize: 14,
            lineHeight: 19,
            minHeight: 38,
            color: colors.textMuted,
          }}
        >
          {instruction}
        </Text>
        {game.isComplete ? (
          <BotaoSecundario
            label="Voltar à seleção"
            onPress={() => router.dismissTo("/jogos/memoria")}
          />
        ) : (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {game.roundComplete ? (
              <View style={{ flex: 1 }}>
                <BotaoPrimario
                  label={lastRound ? "Ver resultado" : "Próxima rodada"}
                  onPress={game.closeFeedback}
                />
              </View>
            ) : (
              <Pressable cssInterop={false}
                accessibilityRole="button"
                accessibilityLabel="Reiniciar atividade"
                onPress={() => setRestartOpen(true)}
                style={({ pressed }) => ({
                  width: 50,
                  minHeight: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  backgroundColor: pressed
                    ? colors.primaryDisabled
                    : colors.primaryLight,
                })}
              >
                <Ionicons
                  name="refresh-outline"
                  size={22}
                  color={colors.primary}
                />
              </Pressable>
            )}
            <View style={{ flex: 1 }}>
              <BotaoSecundario
                label="Conferir par"
                disabled={!game.feedback}
                onPress={() => setFeedbackOpen(true)}
              />
            </View>
          </View>
        )}
      </View>
      <ConfirmDialog
        visible={restartOpen}
        title="Recomeçar esta atividade?"
        message="O andamento atual será descartado. Os resultados já salvos serão mantidos."
        confirmLabel="Recomeçar atividade"
        onCancel={() => setRestartOpen(false)}
        onConfirm={() => {
          setRestartOpen(false);
          setFeedbackOpen(false);
          game.resetGame();
        }}
      />
      <FeedbackModal
        referencias={game.feedback?.referencias}
        actionLabel={
          lastRound
            ? "Ver resultado"
            : game.roundComplete
              ? "Próxima rodada"
              : "Continuar jogando"
        }
        explanation={game.feedback?.explanation ?? ""}
        message={game.feedback?.message ?? ""}
        comparison={game.reviewCards.map((card) => card.conteudo)}
        onExit={() => router.dismissTo("/praticar")}
        onDismiss={() => setFeedbackOpen(false)}
        onClose={() => {
          setFeedbackOpen(false);
          game.closeFeedback();
        }}
        title={game.feedback?.title ?? ""}
        type={game.feedback?.type ?? "success"}
        visible={Boolean(game.feedback) && feedbackOpen}
      />
    </View>
  );
}
