const { runWebHandler, tutor } = require("@/server/web-api.cjs");
export function POST(request: Request) {
  return runWebHandler(request, tutor);
}
export function OPTIONS(request: Request) {
  return runWebHandler(request, tutor);
}
