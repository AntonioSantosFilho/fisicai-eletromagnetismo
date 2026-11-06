const { test } = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const renderer = require("react-test-renderer");
const { act } = renderer;
const { environment, mountHook } = require("../scripts/audit-app.cjs");

test("popup espera 1 segundo e cancela apresentações antigas ao trocar questão, reiniciar, sair ou perder foco", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const env = environment();
  const { useDelayedFeedback, FEEDBACK_DELAY_MS } = env.load(
    "hooks/useDelayedFeedback.ts",
  );
  let visible, setKey, component;
  function Probe() {
    const [key, updateKey] = React.useState("sessao:questao-1");
    setKey = updateKey;
    visible = useDelayedFeedback(key);
    return null;
  }
  await act(async () => {
    component = renderer.create(React.createElement(Probe));
  });
  try {
    assert.equal(FEEDBACK_DELAY_MS, 1000);
    assert.equal(visible, false);
    await act(async () => t.mock.timers.tick(999));
    assert.equal(visible, false);
    await act(async () => t.mock.timers.tick(1));
    assert.equal(visible, true);
    await act(async () => setKey("sessao:questao-2"));
    assert.equal(visible, false);
    await act(async () => t.mock.timers.tick(500));
    await act(async () => setKey("nova-sessao:questao-1"));
    await act(async () => t.mock.timers.tick(500));
    assert.equal(visible, false);
    await act(async () => env.focus(false));
    await act(async () => t.mock.timers.tick(5000));
    assert.equal(visible, false);
    await act(async () => env.focus(true));
    await act(async () => t.mock.timers.tick(999));
    assert.equal(visible, false);
    await act(async () => t.mock.timers.tick(1));
    assert.equal(visible, true);
    await act(async () => setKey(null));
    await act(async () => t.mock.timers.tick(5000));
    assert.equal(visible, false);
    await act(async () => setKey("sessao:questao-3"));
  } finally {
    await act(async () => component.unmount());
    await act(async () => t.mock.timers.tick(5000));
    t.mock.timers.reset();
  }
});

test("quiz informa erro, escolha do aluno e gabarito; cliques durante a espera não alteram o resultado", async () => {
  const probe = await mountHook(
    environment(),
    "hooks/useQuizSession.ts",
    "useQuizSession",
    ["magnetismo", "facil"],
  );
  try {
    const correct = probe.value.currentQuestion.resposta_correta;
    const wrong = probe.value.currentQuestion.alternativas.find(
      (a) => a.letra !== correct,
    ).letra;
    await act(async () => {
      probe.value.answerQuestion(wrong);
      probe.value.answerQuestion(correct);
    });
    assert.equal(probe.value.feedback.type, "error");
    assert.equal(probe.value.feedback.title, "Resposta incorreta");
    assert.ok(probe.value.feedback.message.includes(`alternativa ${wrong}`));
    assert.ok(probe.value.feedback.message.includes(`correta é ${correct}`));
    assert.equal(probe.value.selectedAnswer, wrong);
    assert.equal(probe.value.erros, 1);
    assert.equal(probe.value.acertos, 0);
    await act(async () => probe.value.nextQuestion());
    await act(async () =>
      probe.value.answerQuestion(probe.value.currentQuestion.resposta_correta),
    );
    assert.equal(probe.value.feedback.type, "success");
    assert.equal(probe.value.feedback.title, "Resposta correta!");
  } finally {
    await probe.close();
  }
});
