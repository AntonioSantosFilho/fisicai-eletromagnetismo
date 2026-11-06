// Mesmo handler do desenvolvimento. Credenciais configuradas apenas no servidor.
const handler = require('../server/tutor.cjs').fromEnvironment();
module.exports = (req, res) => { req.url = '/api/tutor'; return handler(req, res); };
