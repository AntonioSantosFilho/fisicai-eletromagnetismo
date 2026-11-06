const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const http = require("node:http");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");

test("canal escolar define beta e remove permissões sem alterar a configuração da prévia", () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(root, "app.json"), "utf8"),
  ).expo;
  const original = JSON.stringify(config);
  function resolve(channel) {
    const mod = { exports: {} };
    vm.runInNewContext(
      fs.readFileSync(path.join(root, "app.config.js"), "utf8"),
      {
        module: mod,
        require: () => require("../publicacao/release.json"),
        process: { env: { EXPO_PUBLIC_RELEASE_CHANNEL: channel } },
      },
    );
    return mod.exports({ config });
  }
  const school = resolve("school-beta");
  assert.equal(school.android.package, config.android.package);
  assert.equal(school.version, require("../publicacao/release.json").version);
  assert.equal(school.android.allowBackup, false);
  for (const permission of [
    "CAMERA",
    "RECORD_AUDIO",
    "ACCESS_FINE_LOCATION",
    "SYSTEM_ALERT_WINDOW",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE",
  ])
    assert.ok(
      school.android.blockedPermissions.includes(
        `android.permission.${permission}`,
      ),
    );
  const local = resolve(undefined);
  assert.equal(local.version, config.version);
  assert.equal(local.name, config.name);
  assert.equal(local.android.allowBackup, config.android.allowBackup);
  assert.equal(JSON.stringify(config), original);
});

test("cliente Android de produção exige servidor HTTPS antes de qualquer chamada", async () => {
  for (const configured of [undefined, "http://servidor.example"]) {
    let calls = 0;
    const mod = { exports: {} };
    const code = ts.transpileModule(
      fs.readFileSync(path.join(root, "services/iaService.ts"), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          esModuleInterop: true,
        },
      },
    ).outputText;
    vm.runInNewContext(code, {
      module: mod,
      exports: mod.exports,
      require: (name) =>
        name === "@/constants/distribuicao"
          ? { SCHOOL_BETA: true }
          : name === "react-native"
            ? { Platform: { OS: "android" } }
            : {},
      process: { env: { EXPO_PUBLIC_TUTOR_URL: configured } },
      __DEV__: false,
      AbortController,
      URL,
      setTimeout,
      clearTimeout,
      fetch: async () => {
        calls++;
        throw new Error("A rede não deveria ser utilizada");
      },
    });
    await assert.rejects(
      mod.exports.gerarRespostaTutor([
        { papel: "usuario", conteudo: "Como funciona um ímã?" },
      ]),
      /indisponível/,
    );
    assert.equal(calls, 0);
  }
});

test("servidor exige aviso de privacidade com qualquer provedor configurado", async () => {
  const {
    createTutorHandler,
    optionsFromEnvironment,
  } = require("../server/tutor.cjs");
  for (const provider of ["gemini", "openai"]) {
    let upstream = 0;
    const options = optionsFromEnvironment({
      EXPO_PUBLIC_RELEASE_CHANNEL: "school-beta",
      TUTOR_PROVIDER: provider,
      GEMINI_API_KEY: "fixture",
      GEMINI_MODEL: "fixture",
      OPENAI_API_KEY: "fixture",
      OPENAI_MODEL: "fixture",
    });
    const server = http.createServer(
      createTutorHandler({
        ...options,
        fetchImpl: async () => {
          upstream++;
          throw new Error("Não deveria conectar ao provedor");
        },
      }),
    );
    try {
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const response = await fetch(
        `http://127.0.0.1:${server.address().port}/api/tutor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ papel: "usuario", conteudo: "Um texto de teste" }],
          }),
        },
      );
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /aviso de privacidade/);
      assert.equal(upstream, 0);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  }
});

test("documentos públicos não são gerados com responsável ou configuração pendentes", () => {
  for (const publication of [
    { developerName: null, supportEmail: null, aiProviderApproved: true },
    {
      developerName: "Contato de teste",
      supportEmail: "teste@example.com",
      aiProviderApproved: false,
    },
  ]) {
    const code = fs.readFileSync(
      path.join(root, "scripts/prepare-publication.cjs"),
      "utf8",
    );
    let writes = 0;
    assert.throws(
      () =>
        vm.runInNewContext(code, {
          __dirname: path.join(root, "scripts"),
          process: { argv: [] },
          console,
          require: (name) =>
            name === "../publicacao/release.json"
              ? publication
              : name === "../publicacao/legal.json"
                ? require("../publicacao/legal.json")
                : name === "node:path"
                  ? path
                  : {
                      mkdirSync: () => {
                        writes++;
                      },
                      writeFileSync: () => {
                        writes++;
                      },
                    },
        }),
      /Confirme responsável/,
    );
    assert.equal(writes, 0);
  }
});
