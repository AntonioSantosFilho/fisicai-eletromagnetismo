const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
// Mantém a compilação viável em máquinas com pouca memória disponível.
config.maxWorkers = 2;

const original = config.server?.enhanceMiddleware;
const tutor = require('./server/tutor.cjs').fromEnvironment();
const feedback = require('./server/feedback.cjs').createFeedbackHandler({ enabled: process.env.TUTOR_FEEDBACK_LOGGING === 'enabled' });
config.server = { ...config.server, enhanceMiddleware: (middleware, server) => {
  const base = original ? original(middleware, server) : middleware;
  return (req, res, next) => tutor(req, res, () => feedback(req, res, () => base(req, res, next)));
} };
module.exports = withNativeWind(config, { input: "./global.css" });
