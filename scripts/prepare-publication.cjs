// Gera documentos públicos a partir da mesma fonte usada no aplicativo.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const publication = require("../publicacao/release.json");
const documents = require("../publicacao/legal.json");
const draft = process.argv.includes("--draft");
if (
  !draft &&
  (!publication.developerName ||
    !publication.supportEmail ||
    !publication.aiProviderApproved)
)
  throw new Error(
    "Confirme responsável, contato e configuração do beta antes de gerar documentos públicos.",
  );
const destination = draft
  ? path.join(root, "publicacao/2026-10-22/minutas")
  : path.join(root, "public/legal");
fs.mkdirSync(destination, { recursive: true });
const values = {
  ...publication,
  developerName: publication.developerName || "RESPONSÁVEL A CONFIRMAR",
  supportEmail: publication.supportEmail || "CONTATO A CONFIRMAR",
};
const replace = (text) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const shell = (title, body) =>
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title><style>body{font:17px/1.65 Arial,sans-serif;color:#202C38;background:white;max-width:850px;margin:auto;padding:24px}header{padding:12px 0;border-bottom:2px solid #0066A6}h1{font-size:28px;line-height:1.3}h2{font-size:21px;margin-top:32px}a{color:#0066A6;overflow-wrap:anywhere}nav{display:flex;gap:20px;flex-wrap:wrap}footer{margin-top:36px;padding-top:16px;border-top:1px solid #D8E1E9}.meta{font-size:15px;color:#526475}.draft{font-weight:bold;color:#805500}li{margin-bottom:10px}</style></head><body><header><strong>FisicAI</strong><nav><a href="./index.html">Documentos e suporte</a><a href="./privacidade.html">Privacidade</a><a href="./termos.html">Termos de uso</a></nav></header>${draft ? '<p class="draft">MINUTA PARA REVISÃO — NÃO PUBLICADA</p>' : ""}<main>${body}</main><footer><p>${esc(values.developerName)}</p><p>${publication.supportEmail ? `<a href="mailto:${esc(publication.supportEmail)}">${esc(publication.supportEmail)}</a>` : esc(values.supportEmail)}</p><p class="meta">Projeto acadêmico independente · Atualização ${esc(publication.legalDate)}</p></footer></body></html>`;
for (const [key, filename] of [
  ["privacy", "privacidade.html"],
  ["terms", "termos.html"],
]) {
  const doc = documents[key];
  const body = `<h1>${esc(doc.title)}</h1><p>${esc(replace(doc.summary))}</p>${doc.sections.map((section) => `<section><h2>${esc(section.title)}</h2>${section.paragraphs.map((text) => `<p>${esc(replace(text))}</p>`).join("")}${(section.links || []).map((link) => `<p><a href="${esc(link.url)}" rel="noopener noreferrer">${esc(link.label)}</a></p>`).join("")}</section>`).join("")}`;
  fs.writeFileSync(path.join(destination, filename), shell(doc.title, body));
}
fs.writeFileSync(
  path.join(destination, "index.html"),
  shell(
    "FisicAI — documentos e suporte",
    `<h1>Documentos e suporte do FisicAI Beta</h1><p>Versão experimental de apoio ao estudo de eletromagnetismo no ensino médio. O assistente de IA utiliza o provedor configurado no servidor e requer internet. Leia o aviso de privacidade antes de enviar mensagens.</p><ul><li><a href="./privacidade.html">Política de privacidade</a></li><li><a href="./termos.html">Termos de uso</a></li></ul><p>Para relatar um problema, informe a versão, o tema, a atividade e o que aconteceu. Respostas do assistente podem ser denunciadas no próprio aplicativo. Evite dados pessoais de estudantes.</p>`,
  ),
);
const listing = {
  name: publication.publicName,
  language: "pt-BR",
  category: "Educação",
  price: "Gratuito",
  package: publication.androidPackage,
  shortDescription:
    "Estude eletromagnetismo com conteúdos, atividades e simulações.",
  fullDescription:
    "O FisicAI reúne conteúdos de eletromagnetismo para apoiar o estudo no ensino médio.\n\n• Conceitos, leis físicas, expressões matemáticas e exemplos resolvidos.\n• Quiz, desafio, flashcards, memória e lacunas.\n• Explicações das respostas e referências de apoio.\n• Andamento e progresso salvos no aparelho, com opção de reset.\n• Acesso a simulações externas do PhET, que precisam de internet.\n• Assistente de IA para dúvidas de eletromagnetismo, com Google Gemini, filtros de segurança e denúncia de respostas dentro do app. O chat exige internet, configuração do servidor e leitura do aviso de privacidade.\n\nOs conteúdos e as atividades locais podem ser usados sem conexão após a instalação. Não há anúncios nem compras. O assistente pode cometer erros; confira as explicações com o professor e não envie dados pessoais.\n\nEsta é uma versão experimental para avaliação de funcionamento e conteúdo. O material continua sujeito à revisão docente. O uso do aplicativo não substitui a orientação do professor e não implica consentimento para participar de pesquisa.\n\nProjeto acadêmico independente; as instituições e marcas citadas não são apresentadas como responsáveis pela publicação.",
  supportEmail: publication.supportEmail,
  privacyUrl: publication.legalBaseUrl
    ? `${publication.legalBaseUrl.replace(/\/$/, "")}/legal/privacidade.html`
    : null,
  releaseNotes:
    "Primeiro beta escolar: conteúdos de eletromagnetismo, cinco atividades de prática, retomada de sessões, progresso local, simulações PhET e assistente de IA com aviso de privacidade, moderação e denúncia de respostas.",
  draft,
};
if (!publication.backendVerified) {
  listing.fullDescription += "\n\nNesta versão beta, o tutor de IA aguarda uma credencial válida no servidor. Os conteúdos, as atividades de prática e o progresso local permanecem disponíveis.";
}
if (
  listing.name.length > 30 ||
  listing.shortDescription.length > 80 ||
  listing.fullDescription.length > 4000
)
  throw new Error("Texto excede os limites da ficha.");
fs.mkdirSync(path.join(root, "publicacao/2026-10-22"), { recursive: true });
fs.writeFileSync(
  path.join(root, "publicacao/2026-10-22/ficha-loja.json"),
  JSON.stringify(listing, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    documents: destination,
    draft,
    listing: "publicacao/2026-10-22/ficha-loja.json",
  }),
);
