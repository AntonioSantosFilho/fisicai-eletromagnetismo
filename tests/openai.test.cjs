const { test } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const {
  requestOpenAITutor,
  UnsafeContent,
  ProviderUnavailable,
} = require("../server/openai-provider.cjs");
const { createTutorHandler } = require("../server/tutor.cjs");
const { createFeedbackHandler } = require("../server/feedback.cjs");
const { runWebHandler } = require("../server/web-api.cjs");
const messages = [
  { papel: "usuario", conteudo: "Como atua a força magnética?" },
];
const ok = (body) => ({ ok: true, json: async () => body });
const generated = {
  id: "resp_fixture",
  status: "completed",
  output: [
    { type: "reasoning", text: "interno" },
    {
      type: "message",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: "A direção depende da velocidade e do campo magnético.",
        },
      ],
    },
  ],
};
const base = {
  apiKey: "private-fixture",
  model: "test-model",
  messages,
  instructions: "eletromagnetismo",
  safetyId: "session_fixture",
};
test("OpenAI modera entrada e saída, desativa armazenamento e retorna somente texto final", async () => {
  const calls = [];
  const result = await requestOpenAITutor({
    ...base,
    fetchImpl: async (url, options) => {
      const data = JSON.parse(options.body);
      calls.push({ url, data });
      assert.equal(options.headers.Authorization, "Bearer private-fixture");
      assert.doesNotMatch(url, /private-fixture/);
      if (url.endsWith("/moderations"))
        return ok({ results: [{ flagged: false }] });
      return ok(generated);
    },
  });
  assert.deepEqual(
    calls.map((c) => c.url.split("/").at(-1)),
    ["moderations", "responses", "moderations"],
  );
  assert.equal(calls[1].data.store, false);
  assert.equal(calls[1].data.service_tier, "default");
  assert.equal(calls[1].data.max_output_tokens, 1600);
  assert.match(calls[1].data.safety_identifier, /^[a-f0-9]{64}$/);
  assert.equal(calls[0].data.input, messages[0].conteudo);
  assert.equal(result.responseId, "resp_fixture");
  assert.doesNotMatch(result.reply, /interno/);
});
test("moderação falha fechada e impede geração quando entrada é sinalizada", async () => {
  for (const moderation of [{ results: [{ flagged: true }] }, {}]) {
    let calls = 0;
    await assert.rejects(
      requestOpenAITutor({
        ...base,
        fetchImpl: async () => {
          calls++;
          return ok(moderation);
        },
      }),
      moderation.results ? UnsafeContent : ProviderUnavailable,
    );
    assert.equal(calls, 1);
  }
});
test("recusa do modelo e saída sinalizada não entregam conteúdo inadequado", async () => {
  for (const refusal of [false, true]) {
    let calls = 0;
    await assert.rejects(
      requestOpenAITutor({
        ...base,
        fetchImpl: async (url) => {
          calls++;
          if (url.endsWith("/responses"))
            return ok(
              refusal
                ? {
                    ...generated,
                    output: [
                      {
                        type: "message",
                        content: [{ type: "refusal", refusal: "recusado" }],
                      },
                    ],
                  }
                : generated,
            );
          return ok({ results: [{ flagged: calls === 3 }] });
        },
      }),
      UnsafeContent,
    );
    assert.equal(calls, refusal ? 2 : 3);
  }
});
async function withServer(handler, run) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
test("tutor rejeita dados pessoais antes da rede e oculta falhas do provedor", async () => {
  let upstream = 0;
  await withServer(
    createTutorHandler({
      provider: "openai",
      requirePrivacyAcknowledgement: true,
      apiKey: "private-fixture",
      model: "fixture",
      fetchImpl: async () => {
        upstream++;
        throw new Error("private-fixture");
      },
    }),
    async (baseUrl) => {
      const post = (content) =>
        fetch(`${baseUrl}/api/tutor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ papel: "usuario", conteudo: content }],
            privacyAcknowledged: true,
            sessionId: "fixture_session",
          }),
        });
      assert.equal((await post("meu email é aluno@example.com")).status, 400);
      assert.equal(upstream, 0);
      const response = await post(messages[0].conteudo);
      assert.equal(response.status, 502);
      assert.doesNotMatch(await response.text(), /private-fixture/);
    },
  );
});
const report = {
  confirmed: true,
  category: "erro_de_fisica",
  responseText: "Texto de teste sem dados pessoais.",
  responseId: "resp_fixture",
  details: "Relato de teste.",
};
test("denúncia só confirma recebimento após registro e não inclui conversas comuns", async () => {
  const records = [];
  const handler = createFeedbackHandler({
    enabled: true,
    logger: async (text) => records.push(JSON.parse(text)),
  });
  const response = await runWebHandler(
    new Request("https://app.example/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }),
    handler,
  );
  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(records[0].id, data.id);
  assert.equal(records[0].event, "fisicai_ai_report");
  assert.equal(records[0].responseText, report.responseText);
  assert.equal(records[0].messages, undefined);
  const failed = await runWebHandler(
    new Request("https://app.example/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    }),
    createFeedbackHandler({
      enabled: true,
      logger: async () => {
        throw new Error();
      },
    }),
  );
  assert.equal(failed.status, 503);
});
test("denúncia rejeita dados pessoais e requisições maiores que o limite", async () => {
  let writes = 0;
  const handler = createFeedbackHandler({
    enabled: true,
    logger: () => {
      writes++;
    },
  });
  const request = (body) =>
    new Request("https://app.example/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  assert.equal(
    (
      await runWebHandler(
        request({ ...report, details: "aluno@example.com" }),
        handler,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await runWebHandler(
        request({ ...report, responseText: "x".repeat(33000) }),
        handler,
      )
    ).status,
    413,
  );
  assert.equal(writes, 0);
});
test("ponte web preserva bloqueio de origem e preflight sem corpo em resposta 204", async () => {
  const handler = createTutorHandler({
    provider: "openai",
    apiKey: "fixture",
    model: "fixture",
  });
  const denied = await runWebHandler(
    new Request("https://app.example/api/tutor", {
      method: "OPTIONS",
      headers: { Origin: "https://outro.example" },
    }),
    handler,
  );
  assert.equal(denied.status, 403);
  const allowed = await runWebHandler(
    new Request("https://app.example/api/tutor", {
      method: "OPTIONS",
      headers: { Origin: "https://app.example" },
    }),
    handler,
  );
  assert.equal(allowed.status, 204);
  assert.equal(await allowed.text(), "");
});
test("alias público do EAS é aceito com barra final sem liberar outra origem", async () => {
  for (const [route, handler] of [
    ["tutor", createTutorHandler({ allowedOrigins: ["https://app.example"] })],
    [
      "feedback",
      createFeedbackHandler({ allowedOrigins: ["https://app.example"] }),
    ],
  ]) {
    const response = await runWebHandler(
      new Request(`https://deployment.example/api/${route}`, {
        method: "OPTIONS",
        headers: { Origin: "https://app.example/" },
      }),
      handler,
    );
    assert.equal(response.status, 204);
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      "https://app.example",
    );
    const denied = await runWebHandler(
      new Request(`https://deployment.example/api/${route}`, {
        method: "OPTIONS",
        headers: { Origin: "https://evil.example" },
      }),
      handler,
    );
    assert.equal(denied.status, 403);
  }
});
