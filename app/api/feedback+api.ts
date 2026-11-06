const { runWebHandler, feedback } = require("@/server/web-api.cjs");
export function POST(request: Request) {
  return runWebHandler(request, feedback);
}
export function OPTIONS(request: Request) {
  return runWebHandler(request, feedback);
}
