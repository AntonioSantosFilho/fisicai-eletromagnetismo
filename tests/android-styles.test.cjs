// Executa o runtime nativo real do NativeWind instalado, com a ponte Android
// isolada. Não substitui um teste visual em emulador/aparelho.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const React = require("react");
const renderer = require("react-test-renderer");
const babel = require("@babel/core");
const ts = require("typescript");
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname, "..");

function nativeEnvironment() {
  const cache = new Map();
  let pressed = false;
  const subscription = () => ({ remove() {} });
  const host = (name) =>
    React.forwardRef((props, ref) =>
      React.createElement(name, { ...props, ref }, props.children),
    );
  const native = {
    Platform: {
      OS: "android",
      select: (values) => values.android ?? values.default,
    },
    Appearance: {
      getColorScheme: () => "light",
      addChangeListener: subscription,
    },
    AppState: { currentState: "active", addEventListener: subscription },
    AccessibilityInfo: {
      isReduceMotionEnabled: () => Promise.resolve(false),
      addEventListener: subscription,
    },
    Dimensions: {
      get: () => ({ width: 360, height: 800 }),
      addEventListener: subscription,
    },
    StyleSheet: { create: (styles) => styles, hairlineWidth: 1 },
    PixelRatio: {
      get: () => 1,
      getFontScale: () => 1,
      roundToNearestPixel: Math.round,
    },
    Easing: { cubic: (value) => value, inOut: (fn) => fn },
  };
  for (const name of [
    "View",
    "Text",
    "Image",
    "ImageBackground",
    "ScrollView",
    "TextInput",
    "Switch",
    "StatusBar",
    "ActivityIndicator",
    "TouchableHighlight",
    "TouchableOpacity",
    "TouchableWithoutFeedback",
    "FlatList",
    "VirtualizedList",
    "KeyboardAvoidingView",
  ])
    native[name] = host(name);
  native.Animated = {
    View: host("AnimatedView"),
    Value: class {
      interpolate() {
        return 0;
      }
    },
    timing: () => ({ start() {}, stop() {} }),
  };
  native.Pressable = React.forwardRef(({ style, children, ...props }, ref) =>
    React.createElement(
      "NativePressable",
      {
        ...props,
        ref,
        resolvedStyle: typeof style === "function" ? style({ pressed }) : style,
      },
      typeof children === "function" ? children({ pressed }) : children,
    ),
  );
  const sandbox = {
    console,
    process: { env: { NODE_ENV: "production" } },
    __DEV__: false,
    setTimeout,
    clearTimeout,
  };
  sandbox.global = sandbox;
  const context = vm.createContext(sandbox);
  function resolveFile(candidate) {
    const options = path.extname(candidate)
      ? [candidate.replace(/\.js$/, ".native.js"), candidate]
      : [
          candidate + ".native.js",
          candidate + ".js",
          candidate + ".ts",
          candidate + ".tsx",
          path.join(candidate, "index.ts"),
          path.join(candidate, "index.js"),
        ];
    const file = options.find(
      (value) => fs.existsSync(value) && fs.statSync(value).isFile(),
    );
    if (!file) throw new Error("Módulo de teste não encontrado: " + candidate);
    return file;
  }
  function load(candidate) {
    const file = resolveFile(candidate);
    if (cache.has(file)) return cache.get(file).exports;
    if (file.endsWith(".json"))
      return JSON.parse(fs.readFileSync(file, "utf8"));
    const mod = { exports: {} };
    cache.set(file, mod);
    let code = fs.readFileSync(file, "utf8");
    if (file.endsWith(".tsx")) {
      // A mesma configuração Babel de produção usada pelo Metro/Android.
      code = babel.transformSync(code, {
        filename: file,
        cwd: root,
        envName: "production",
        caller: {
          name: "metro",
          platform: "android",
          supportsStaticESM: false,
          isServer: false,
        },
      }).code;
    }
    if (/\.tsx?$/.test(file))
      code = ts.transpileModule(code, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          esModuleInterop: true,
        },
      }).outputText;
    const relativeRequire = createRequire(file);
    function scopedRequire(name) {
      if (name === "react-native") return native;
      if (name.startsWith("@expo/vector-icons/")) return host("Icon");
      if (name === "expo-router")
        return { router: { push() {}, back() {}, canGoBack: () => true } };
      if (
        name === "@/components/Header" ||
        name === "@/components/ResumeActivity"
      )
        return { __esModule: true, default: host(name) };
      if (name === "react-native-safe-area-context")
        throw new Error("Not needed by this test");
      if (name.endsWith(".png")) return 1;
      if (name.startsWith("@/")) return load(path.join(root, name.slice(2)));
      if (name.startsWith("."))
        return load(path.resolve(path.dirname(file), name));
      const resolved = relativeRequire.resolve(name);
      if (
        resolved.includes("react-native-css-interop") ||
        resolved.includes("nativewind")
      )
        return load(resolved);
      return relativeRequire(name);
    }
    const wrapper = vm.runInContext(
      `(function(require,module,exports,__filename,__dirname){${code}\n})`,
      context,
      { filename: file },
    );
    wrapper(scopedRequire, mod, mod.exports, file, path.dirname(file));
    return mod.exports;
  }
  const runtime = load(
    path.join(
      root,
      "node_modules/react-native-css-interop/dist/runtime/jsx-runtime.js",
    ),
  );
  return {
    native,
    runtime,
    load: (file) => load(path.join(root, file)),
    set pressed(value) {
      pressed = value;
    },
  };
}

function flatten(style) {
  return Array.isArray(style)
    ? Object.assign({}, ...style.map(flatten))
    : (style ?? {});
}
async function renderNative(env, component, props = {}) {
  let tree;
  await renderer.act(async () => {
    tree = renderer.create(env.runtime.jsx(component, props));
  });
  return {
    tree,
    control: () => tree.root.findByType("NativePressable"),
    close: () => renderer.act(async () => tree.unmount()),
  };
}

test("reproduz descarte de callback no runtime Android e preserva estilo ao desativar interop", async () => {
  const env = nativeEnvironment();
  let calls = 0;
  const style = ({ pressed }) => {
    calls++;
    return { minHeight: 50, backgroundColor: pressed ? "navy" : "blue" };
  };
  const broken = await renderNative(env, env.native.Pressable, { style });
  assert.equal(
    calls,
    0,
    "a versão instalada descarta o callback sem a correção",
  );
  assert.equal(
    flatten(broken.control().props.resolvedStyle).minHeight,
    undefined,
  );
  await broken.close();
  for (const pressed of [false, true]) {
    env.pressed = pressed;
    const fixed = await renderNative(env, env.native.Pressable, {
      style,
      cssInterop: false,
    });
    const actual = flatten(fixed.control().props.resolvedStyle);
    assert.equal(actual.minHeight, 50);
    assert.equal(actual.backgroundColor, pressed ? "navy" : "blue");
    await fixed.close();
  }
});

test("botão de habilitar chat mantém fundo, área de toque e estado desabilitado no Android", async () => {
  const env = nativeEnvironment();
  const Button = env.load("components/BotaoPrimario.tsx").default;
  const colors = env.load("constants/colors.ts").colors;
  for (const disabled of [false, true]) {
    const view = await renderNative(env, Button, {
      label: "Habilitar chat",
      onPress() {},
      disabled,
    });
    const style = flatten(view.control().props.resolvedStyle);
    assert.equal(style.minHeight, 50);
    assert.equal(
      style.backgroundColor,
      disabled ? colors.primaryDisabled : colors.primary,
    );
    assert.equal(view.control().props.disabled, disabled);
    await view.close();
  }
});

test("filtro de dificuldade mantém seleção visível no runtime nativo", async () => {
  const env = nativeEnvironment();
  const { Pill } = env.load("components/StudyUI.tsx");
  const colors = env.load("constants/colors.ts").colors;
  for (const selected of [false, true]) {
    const view = await renderNative(env, Pill, {
      label: "Todas",
      selected,
      onPress() {},
    });
    const style = flatten(view.control().props.resolvedStyle);
    assert.equal(style.minHeight, 44);
    assert.equal(
      style.backgroundColor,
      selected ? colors.primary : colors.surface,
    );
    assert.equal(view.control().props.accessibilityState.selected, selected);
    await view.close();
  }
});

test("cartas mantêm largura de duas colunas e flip no Android", async () => {
  const env = nativeEnvironment();
  const Card = env.load("components/CartaMemoria.tsx").default;
  for (const isRevealed of [false, true]) {
    const view = await renderNative(env, Card, {
      conteudo: "Campo magnético",
      tipoConteudo: "conceito",
      isRevealed,
      isMatched: false,
      isMismatch: false,
      number: 1,
      height: 220,
      onMeasure() {},
      onPress() {},
    });
    const style = flatten(view.control().props.resolvedStyle);
    assert.equal(style.width, "47%");
    assert.equal(style.flexGrow, 1);
    assert.equal(view.tree.root.findAllByType("AnimatedView").length, 2);
    assert.equal(view.control().props.accessibilityState.expanded, isRevealed);
    await view.close();
  }
});

test("destinos da tela inicial mantêm alinhamento horizontal e área de toque", async () => {
  const env = nativeEnvironment();
  const Home = env.load("app/(tabs)/index.tsx").default;
  const view = await renderNative(env, Home);
  const controls = view.tree.root.findAllByType("NativePressable");
  assert.deepEqual(
    controls.map((control) => control.props.accessibilityLabel),
    ["Estudar", "Praticar", "Simulações"],
  );
  for (const control of controls) {
    const style = flatten(control.props.resolvedStyle);
    assert.equal(style.flexDirection, "row");
    assert.equal(style.minHeight, 102);
    assert.equal(style.paddingHorizontal, 18);
  }
  await view.close();
});

test("nenhum botão com callback de estilo fica exposto à regressão da interop nativa", () => {
  const failures = [];
  function directory(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) {
        directory(file);
        continue;
      }
      if (!file.endsWith(".tsx")) continue;
      const ast = ts.createSourceFile(
        file,
        fs.readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      function visit(node) {
        if (
          (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
          node.tagName.getText(ast) === "Pressable"
        ) {
          const attrs = node.attributes.properties.filter(ts.isJsxAttribute);
          const style = attrs.find(
            (attr) => attr.name.getText(ast) === "style",
          );
          if (
            style?.initializer &&
            ts.isJsxExpression(style.initializer) &&
            style.initializer.expression &&
            ts.isArrowFunction(style.initializer.expression)
          ) {
            const optOut = attrs.find(
              (attr) => attr.name.getText(ast) === "cssInterop",
            );
            if (
              optOut?.initializer?.getText(ast) !== "{false}" ||
              attrs.some((attr) => attr.name.getText(ast) === "className")
            )
              failures.push(path.relative(root, file));
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
  }
  directory(path.join(root, "app"));
  directory(path.join(root, "components"));
  assert.deepEqual(failures, []);
});
