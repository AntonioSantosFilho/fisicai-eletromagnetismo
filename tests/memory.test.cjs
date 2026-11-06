const { test } = require("node:test");
const assert = require("node:assert/strict");
const { act } = require("react-test-renderer");
const { environment, mountHook } = require("../scripts/audit-app.cjs");
test("duas cartas ficam abertas até conferir ou tocar em outra carta, que inicia a próxima tentativa", async () => {
  const env = environment(),
    probe = await mountHook(env, "hooks/useMemoriaGame.ts", "useMemoriaGame", [
      "magnetismo",
      "facil",
    ]);
  try {
    const a = probe.value.cards[0],
      b = probe.value.cards.find((c) => c.pairId !== a.pairId),
      third = probe.value.cards.find((c) => c.id !== a.id && c.id !== b.id);
    await act(async () => {
      probe.value.selectCard(a.id);
      probe.value.selectCard(b.id);
    });
    assert.equal(probe.value.erros, 1);
    assert.equal(probe.value.selectedIds.join(","), [a.id, b.id].join(","));
    assert.equal(probe.value.reviewCards.length, 2);
    assert.ok(probe.value.feedback.explanation.includes(a.explicacao));
    assert.ok(probe.value.feedback.explanation.includes(b.explicacao));
    await act(async () => {
      for (let i = 0; i < 30; i++) for (const tick of env.timers) tick();
    });
    assert.deepEqual(Array.from(probe.value.selectedIds), [a.id, b.id]);
    await act(async () => probe.value.selectCard(a.id));
    assert.equal(probe.value.erros, 1);
    await act(async () => probe.value.selectCard(third.id));
    assert.deepEqual(Array.from(probe.value.selectedIds), [third.id]);
    assert.equal(probe.value.erros, 1);
    assert.equal(probe.value.feedback, null);
    assert.deepEqual(Array.from(probe.value.pendingMismatchIds), []);
    const partner = probe.value.cards.find(
      (c) => c.pairId === third.pairId && c.id !== third.id,
    );
    await act(async () => probe.value.selectCard(partner.id));
    assert.equal(probe.value.acertos, 1);
    await act(async () => probe.value.closeFeedback());
    assert.equal(probe.value.selectedIds.length, 0);
    assert.equal(probe.value.pendingMismatchIds.length, 0);
    assert.equal(probe.value.feedback, null);
  } finally {
    await probe.close();
  }
});
test("o último par só conclui e salva o jogo depois que o aluno confirma a leitura", async () => {
  const env = environment(),
    probe = await mountHook(env, "hooks/useMemoriaGame.ts", "useMemoriaGame", [
      "magnetismo",
      "facil",
    ]);
  try {
    while (probe.value.matchedPairIds.length < probe.value.pares.length) {
      const a = probe.value.cards.find(
          (c) => !probe.value.matchedPairIds.includes(c.pairId),
        ),
        b = probe.value.cards.find(
          (c) => c.pairId === a.pairId && c.id !== a.id,
        );
      await act(async () => {
        probe.value.selectCard(a.id);
        probe.value.selectCard(b.id);
      });
      if (probe.value.matchedPairIds.length < probe.value.pares.length)
        await act(async () => probe.value.closeFeedback());
    }
    assert.equal(probe.value.isComplete, false);
    assert.equal(env.stored, null);
    assert.equal(probe.value.reviewCards.length, 2);
    await act(async () => probe.value.closeFeedback());
    assert.equal(probe.value.isComplete, true);
    assert.equal(JSON.parse(env.stored).length, 1);
    await act(async () => probe.value.closeFeedback());
    assert.equal(JSON.parse(env.stored).length, 1);
  } finally {
    await probe.close();
  }
});
test("sair logo após virar a primeira carta preserva sua posição e permite retomar", async () => {
  const env = environment();
  let probe = await mountHook(
    env,
    "hooks/useMemoriaGame.ts",
    "useMemoriaGame",
    ["magnetismo", "facil"],
  );
  const id = probe.value.cards[0].id;
  const order = probe.value.cards.map((c) => c.id).join(",");
  await act(async () => probe.value.selectCard(id));
  await probe.close();
  probe = await mountHook(env, "hooks/useMemoriaGame.ts", "useMemoriaGame", [
    "magnetismo",
    "facil",
  ]);
  try {
    assert.equal(probe.value.elapsedSeconds, 0);
    assert.equal(probe.value.resumed, true);
    assert.equal(probe.value.selectedIds[0], id);
    assert.equal(probe.value.cards.map((c) => c.id).join(","), order);
  } finally {
    await probe.close();
  }
});

test("rodadas preservam todos os pares, cabem em seis cartas e só avançam ao continuar", async () => {
  const env = environment(),
    probe = await mountHook(env, "hooks/useMemoriaGame.ts", "useMemoriaGame", [
      "magnetismo",
      "todas",
    ]);
  try {
    const seen = new Set();
    assert.equal(probe.value.roundCount, 3);
    while (!probe.value.isComplete) {
      const round = probe.value.roundIndex,
        visible = probe.value.visibleCards;
      assert.ok(visible.length <= 6);
      for (const c of visible) {
        assert.equal(visible.filter((x) => x.pairId === c.pairId).length, 2);
        seen.add(c.id);
      }
      while (!probe.value.roundComplete) {
        const a = probe.value.visibleCards.find(
          (c) => !probe.value.matchedPairIds.includes(c.pairId),
        );
        const b = probe.value.visibleCards.find(
          (c) => c.pairId === a.pairId && c.id !== a.id,
        );
        await act(async () => {
          probe.value.selectCard(a.id);
          probe.value.selectCard(b.id);
        });
        assert.equal(probe.value.roundIndex, round);
      }
      assert.ok(probe.value.feedback);
      await act(async () => probe.value.closeFeedback());
    }
    assert.equal(seen.size, probe.value.cards.length);
    assert.equal(probe.value.acertos, 8);
    assert.equal(probe.value.erros, 0);
    assert.equal(JSON.parse(env.stored).length, 1);
  } finally {
    await probe.close();
  }
});

test("retomar depois de dispensar a explicação preserva pares corretos e a nova carta", async () => {
  const env = environment();
  let probe = await mountHook(
    env,
    "hooks/useMemoriaGame.ts",
    "useMemoriaGame",
    ["magnetismo", "todas"],
  );
  const a = probe.value.visibleCards[0],
    b = probe.value.visibleCards.find(
      (c) => c.pairId === a.pairId && c.id !== a.id,
    ),
    next = probe.value.visibleCards.find((c) => c.pairId !== a.pairId);
  await act(async () => {
    probe.value.selectCard(a.id);
    probe.value.selectCard(b.id);
    probe.value.selectCard(next.id);
  });
  assert.equal(probe.value.feedback, null);
  await probe.close();
  probe = await mountHook(env, "hooks/useMemoriaGame.ts", "useMemoriaGame", [
    "magnetismo",
    "todas",
  ]);
  try {
    assert.equal(probe.value.resumed, true);
    assert.equal(probe.value.acertos, 1);
    assert.ok(probe.value.matchedPairIds.includes(a.pairId));
    assert.deepEqual(Array.from(probe.value.selectedIds), [next.id]);
    assert.equal(probe.value.roundIndex, 0);
  } finally {
    await probe.close();
  }
});
