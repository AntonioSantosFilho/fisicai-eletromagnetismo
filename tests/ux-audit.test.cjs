const { test } = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const renderer = require("react-test-renderer");
const { act } = renderer;
const { environment, mountHook } = require("../scripts/audit-app.cjs");

test("retomada reconhece os cinco modos pela versão real, sem listar sessões vazias ou concluídas", async () => {
  for (const [tipo, file, hook, interact] of [
    [
      "quiz",
      "useQuizSession",
      "useQuizSession",
      (s) => s.answerQuestion(s.currentQuestion.resposta_correta),
    ],
    [
      "desafio",
      "useQuizSession",
      "useQuizSession",
      (s) => s.answerQuestion(s.currentQuestion.resposta_correta),
    ],
    [
      "flashcards",
      "useFlashcardSession",
      "useFlashcardSession",
      (s) => s.setIsFlipped(true),
    ],
    [
      "lacunas",
      "useLacunasSession",
      "useLacunasSession",
      (s) => s.setRespostaDigitada("campo"),
    ],
    [
      "memoria",
      "useMemoriaGame",
      "useMemoriaGame",
      (s) => s.selectCard(s.visibleCards[0].id),
    ],
  ]) {
    const env = environment();
    const service = env.load("services/sessoesService.ts").sessoesService;
    const { encontrarRetomada } = env.load("utils/retomada.ts");
    const probe = await mountHook(
      env,
      `hooks/${file}.ts`,
      hook,
      tipo === "desafio"
        ? ["magnetismo", "todas", "desafio"]
        : ["magnetismo", "todas"],
    );
    try {
      let drafts = await service.listar("principal");
      assert.equal(
        encontrarRetomada(drafts, "principal"),
        null,
        tipo + " vazio",
      );
      await act(async () => interact(probe.value));
      await service.salvar(drafts[0].chave, "principal", probe.value.state);
      drafts = await service.listar("principal");
      const resume = encontrarRetomada(drafts, "principal");
      assert.equal(resume.tipo, tipo);
      assert.equal(
        resume.total,
        tipo === "memoria" ? probe.value.pares.length : probe.value.total,
      );
      assert.equal(
        resume.completed,
        ["quiz", "desafio"].includes(tipo) ? 1 : 0,
      );
      const state = drafts[0].estado;
      const completed =
        tipo === "memoria"
          ? {
              ...state,
              acertos: resume.total,
              matchedPairIds: [
                ...new Set(probe.value.cards.map((c) => c.pairId)),
              ],
            }
          : { ...state, acertos: resume.total, erros: 0 };
      assert.equal(
        encontrarRetomada([{ ...drafts[0], estado: completed }], "principal"),
        null,
        tipo + " concluído",
      );
      assert.equal(
        encontrarRetomada(
          [{ ...drafts[0], chave: drafts[0].chave + "-versao-antiga" }],
          "principal",
        ),
        null,
      );
      assert.equal(
        encontrarRetomada(
          [{ ...drafts[0], estado: { ...state, order: ["id-inexistente"] } }],
          "principal",
        ),
        null,
      );
    } finally {
      await probe.close();
    }
  }
});

test("retomada escolhe a atividade recente válida, isola perfis e preserva dados inválidos", async () => {
  const env = environment();
  const service = env.load("services/sessoesService.ts").sessoesService;
  const { encontrarRetomada } = env.load("utils/retomada.ts");
  const probe = await mountHook(
    env,
    "hooks/useQuizSession.ts",
    "useQuizSession",
    ["magnetismo", "todas"],
  );
  try {
    const [row] = await service.listar("principal");
    const valid = {
      ...row,
      estado: { ...probe.value.state, elapsedSeconds: 8 },
    };
    const moreRecentInvalid = {
      ...valid,
      atualizadoEm: "2026-10-21T00:00:00Z",
      estado: { ...valid.estado, acertos: -1 },
    };
    assert.equal(
      encontrarRetomada([valid, moreRecentInvalid], "principal").tipo,
      "quiz",
    );
    assert.equal(encontrarRetomada([valid], "outro-perfil"), null);
    const key = "@fisicai-independente:sessoes:principal";
    env.data.set(key, "{invalido");
    await assert.rejects(service.listar("principal"));
    assert.equal(env.data.get(key), "{invalido");
  } finally {
    await probe.close();
  }
});

test("fechar e reabrir explicação não avança nem responde de novo; avanço explícito limpa a apresentação", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const env = environment();
  const { useQuizSession } = env.load("hooks/useQuizSession.ts");
  const { useFeedbackPresentation } = env.load(
    "hooks/useFeedbackPresentation.ts",
  );
  let session, panel, component;
  function Probe() {
    session = useQuizSession("magnetismo", "todas");
    panel = useFeedbackPresentation(
      session.feedback
        ? `${session.state.id}:${session.state.answeredItemId}`
        : null,
      true,
    );
    return null;
  }
  await act(async () => {
    component = renderer.create(React.createElement(Probe));
  });
  try {
    const wrong = session.currentQuestion.alternativas.find(
      (a) => a.letra !== session.currentQuestion.resposta_correta,
    ).letra;
    await act(async () => session.answerQuestion(wrong));
    await act(async () => t.mock.timers.tick(999));
    assert.equal(panel.visible, false);
    await act(async () => t.mock.timers.tick(1));
    assert.equal(panel.visible, true);
    await act(async () => panel.dismiss());
    assert.equal(panel.visible, false);
    assert.equal(session.currentIndex, 0);
    assert.equal(session.feedback.type, "error");
    await act(async () => t.mock.timers.tick(5000));
    assert.equal(panel.visible, false, "não reabre sozinho após fechar");
    await act(async () => panel.reopen());
    assert.equal(panel.visible, true);
    await act(async () =>
      session.answerQuestion(session.currentQuestion.resposta_correta),
    );
    assert.equal(session.erros, 1);
    assert.equal(session.acertos, 0);
    await act(async () => session.nextQuestion());
    assert.equal(session.currentIndex, 1);
    assert.equal(panel.visible, false);
    await act(async () =>
      session.answerQuestion(session.currentQuestion.resposta_correta),
    );
    assert.equal(
      panel.visible,
      false,
      "a nova questão também espera um segundo",
    );
    await act(async () => t.mock.timers.tick(1000));
    assert.equal(panel.visible, true);
  } finally {
    await act(async () => component.unmount());
    t.mock.timers.reset();
  }
});

test("texto apresentado permanece estável durante o fechamento e muda só na próxima abertura", async () => {
  const env = environment();
  const { usePresentedFeedback } = env.load("hooks/useFeedbackPresentation.ts");
  let shown, update, component;
  function Probe() {
    const [props, setProps] = React.useState({
      visible: true,
      payload: {
        type: "error",
        title: "Resposta incorreta",
        explanation: "Raciocínio anterior",
        actionLabel: "Próxima questão",
      },
    });
    update = setProps;
    shown = usePresentedFeedback(props.visible, props.payload);
    return null;
  }
  await act(async () => {
    component = renderer.create(React.createElement(Probe));
  });
  try {
    await act(async () =>
      update({
        visible: false,
        payload: {
          type: "success",
          title: "",
          explanation: "",
          actionLabel: "Ver resultado",
        },
      }),
    );
    assert.equal(shown.type, "error");
    assert.equal(shown.title, "Resposta incorreta");
    assert.equal(shown.explanation, "Raciocínio anterior");
    assert.equal(shown.actionLabel, "Próxima questão");
    await act(async () =>
      update({
        visible: true,
        payload: { type: "success", title: "Resposta correta!" },
      }),
    );
    assert.equal(shown.title, "Resposta correta!");
  } finally {
    await act(async () => component.unmount());
  }
});

test("progresso conta conclusão, não posição exibida, e limita dados inválidos", () => {
  const { completedProgress } = environment().load("utils/progressoVisual.ts");
  assert.equal(completedProgress(0, 5).percent, 0);
  assert.equal(completedProgress(1, 5).percent, 20);
  assert.equal(completedProgress(3, 8).percent, 37.5);
  assert.equal(completedProgress(5, 5).percent, 100);
  assert.equal(completedProgress(-1, 5).percent, 0);
  assert.equal(completedProgress(10, 5).percent, 100);
  assert.equal(completedProgress(0, 0).percent, 0);
  assert.equal(completedProgress(NaN, Infinity).percent, 0);
});
