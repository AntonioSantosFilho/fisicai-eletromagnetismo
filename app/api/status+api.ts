export function GET() {
  const openai = process.env.TUTOR_PROVIDER === "openai";
  const model = openai ? process.env.OPENAI_MODEL : process.env.GEMINI_MODEL;
  const ready = Boolean(
    (openai ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY) && model,
  );
  return Response.json(
    {
      ready,
      provider: openai ? "OpenAI" : "Google Gemini",
      model: ready ? model : null,
      moderation: true,
      privacyAcknowledgementRequired: true,
      reports: process.env.TUTOR_FEEDBACK_LOGGING === "enabled",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
