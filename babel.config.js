module.exports = function (api) {
  // NativeWind continua nas telas com className. Pressable com style por
  // função usa cssInterop={false}: a interop nativa 0.2.7 descarta callbacks.
  // Cobertura de regressão: tests/android-styles.test.cjs.
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
