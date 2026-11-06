const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const dir = path.resolve(__dirname, "..");
const root = path.resolve(dir, "../..");
const initial = JSON.parse(
  fs.readFileSync(path.join(dir, "resultado-inicial.json"), "utf8"),
);
const ui = JSON.parse(
  fs.readFileSync(path.join(__dirname, "interface.json"), "utf8"),
);
const technical = JSON.parse(
  fs.readFileSync(
    path.join(root, "auditoria/verificacao-tecnica.json"),
    "utf8",
  ),
);
assert(
  technical.checks.length === 5 &&
    technical.checks.every((check) => check.passed),
);
const tap = fs.readFileSync(path.join(root, "auditoria/testes.tap"), "utf8");
const testCount = Number(tap.match(/# tests (\d+)/)?.[1]);
assert(testCount && tap.includes("# fail 0"));
const evidence = (file, marker) => {
  const lines = fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes(marker));
  assert(index >= 0, `Evidência ausente: ${file}: ${marker}`);
  return { file, line: index + 1, excerpt: lines[index].trim() };
};
const updates = {
  UX01: {
    change:
      "Um atalho de retomada no Início e em Praticar informa modalidade, tema, nível e andamento real. Considera os cinco modos, o perfil atual e a versão do banco; ignora sessões vazias, inválidas, antigas e concluídas.",
    files: [
      evidence("components/ResumeActivity.tsx", "Continuar de onde parou"),
      evidence("utils/retomada.ts", "export function encontrarRetomada"),
    ],
    proof:
      "Retomada de Lacunas e Memória observada na interface; testes dos cinco modos, isolamento, versão e dados inválidos.",
    image: "inicio-retomada-390.png",
  },
  UX02: {
    change:
      "Enviar pergunta e Limpar busca agora têm alvos explícitos de 48 × 48 px.",
    files: [
      evidence("app/(tabs)/ia/index.tsx", "width: 48"),
      evidence("app/(tabs)/estudar/index.tsx", "width: 48"),
    ],
    proof:
      "Dimensões medidas no DOM com envio habilitado; limpeza de busca executada. Nenhuma pergunta foi enviada à IA.",
  },
  UX03: {
    change:
      "Fechar explicação e Voltar/Escape apenas recolhem o painel. Ver explicação reabre a mesma correção; o avanço depende da ação explícita. Aplicado a quiz, desafio, lacunas e flashcards; memória mantém sua conferência opcional.",
    files: [
      evidence("components/FeedbackModal.tsx", "onRequestClose={onDismiss}"),
      evidence("hooks/useFeedbackPresentation.ts", "dismiss:"),
    ],
    proof:
      "Fechamento e reabertura observados nos cinco modos; Escape conferido no quiz e desafio após a entrada do modal. Teste de controle verifica índice, bloqueio de resposta duplicada e nova espera.",
    image: "quiz-feedback-360.png",
  },
  UX04: {
    change:
      "O resultado identifica o cálculo como “% de acertos”. Ações nomeiam o destino: Escolher outro quiz, Escolher outro desafio e Voltar aos conteúdos. Pontuação e registros mantêm os cálculos anteriores.",
    files: [
      evidence("components/ResultadoSessao.tsx", "% de acertos"),
      evidence("app/jogos/quiz/[modulo].tsx", "continuarLabel="),
      evidence("app/jogos/desafio/[modulo].tsx", "continuarLabel="),
      evidence("app/jogos/lacunas/[modulo].tsx", "continuarLabel="),
    ],
    proof:
      "Quiz, desafio e lacunas percorridos até o resultado; os três rótulos e seus destinos foram conferidos na interface.",
    image: "quiz-resultado-360.png",
  },
  UX05: {
    change:
      "O componente conserva o último conteúdo apresentado durante o fechamento: título, tipo, explicação, referências, comparação e rótulo de ação. Quiz e desafio não usam mais um título de sucesso como fallback para feedback ausente.",
    files: [
      evidence(
        "hooks/useFeedbackPresentation.ts",
        "export function usePresentedFeedback",
      ),
      evidence(
        "components/FeedbackModal.tsx",
        "usePresentedFeedback(visible, props)",
      ),
    ],
    proof:
      "Teste de regressão simula fechamento após erro e abertura seguinte com acerto; percursos reais de correção e avanço no quiz e desafio. Anúncios de leitores de tela nativos ainda não foram medidos.",
  },
  UX06: {
    change:
      "O diálogo de reset usa uma variante destrutiva vermelha (#B53434). Reinícios comuns continuam azuis. Aviso de irreversibilidade e Cancelar permanecem disponíveis.",
    files: [
      evidence("components/ConfirmDialog.tsx", "destructive ? colors.error"),
      evidence("components/ProfileControls.tsx", "destructive"),
    ],
    proof:
      "Cor final medida no DOM e cancelamento conferido. Nenhum reset foi confirmado.",
    image: "reset-confirmacao-360.png",
  },
  UX07: {
    change:
      "Barras discretas representam questões respondidas, cartões autoavaliados e pares encontrados. Questão 1 de 5 começa em 0%. Valores e descrições são expostos à acessibilidade nativa e web.",
    files: [
      evidence("components/SessionProgress.tsx", "aria-valuenow="),
      evidence("utils/progressoVisual.ts", "export function completedProgress"),
    ],
    proof:
      "Quiz iniciou em zero; memória avançou de 3 para 4 de 8 pares. Teste cobre zero, conclusão, limites e dados numéricos inválidos.",
  },
  UX08: {
    change:
      "O filtro Tema é um seletor explícito. Sua janela lista todos os temas, identifica o selecionado e permite escolher ou fechar, sem depender de descobrir uma rolagem horizontal.",
    files: [
      evidence("components/ThemeSelector.tsx", "Escolha um tema"),
      evidence("app/(tabs)/estudar/index.tsx", "<ThemeSelector"),
    ],
    proof:
      "Seletor aberto em 360 px, seleção de Ondas Eletromagnéticas e filtro de conteúdos conferidos.",
    image: "seletor-tema-360.png",
  },
  UX09: {
    change:
      "Ampliar simulação abre uma área com saída visível; na web solicita tela cheia e oferece alternativa quando indisponível. No nativo, a rota pede paisagem apenas no modo ampliado; as demais telas mantêm retrato pelo Stack. A opção Abrir no navegador continua disponível.",
    files: [
      evidence("app/estudar/phet/simulacao.tsx", "orientation: expanded ?"),
      evidence("app/_layout.tsx", 'orientation: "portrait"'),
      evidence("app.json", '"orientation": "default"'),
    ],
    proof:
      "Gerador carregou e ampliou na web. Ao sair, o experimento permaneceu pausado, sem recarga. Configuração de orientação passa por tipagem e exportação; instalação e rotação nativas pendentes de aparelho e novo build.",
    nativePending: true,
    image: "simulacao-ampliada.png",
  },
  UX10: {
    change:
      "O encerramento do quiz, desafio e lacunas reúne percentual, acertos/total e tempo em um resumo, com próximo destino e reinício. Cabeçalhos de andamento deixam de se repetir no resultado, inclusive em flashcards e memória.",
    files: [
      evidence("components/ResultadoSessao.tsx", "respostas corretas"),
      evidence(
        "app/jogos/quiz/[modulo].tsx",
        "!session.isComplete || !!session.feedback",
      ),
    ],
    proof:
      "Quiz e flashcards percorridos até a conclusão. A memória conserva o tamanho das cartas e informa pares, tempo e tentativas sem par no encerramento.",
  },
  UX11: {
    change:
      "O botão de ajuda durante cada atividade recebe orientações sobre responder, conferir, fechar, reabrir e avançar. Flashcards explicam a autoavaliação e desafio explicita a meta da sessão.",
    files: [
      evidence("constants/activityHelp.ts", "export const activityHelp"),
      evidence(
        "app/jogos/lacunas/[modulo].tsx",
        "helpInstructions={activityHelp.lacunas",
      ),
    ],
    proof:
      "Ajuda específica de lacunas aberta na interface; as quatro telas sequenciais usam as instruções centralizadas. Memória preserva suas instruções próprias.",
  },
};
const before = JSON.parse(
  fs.readFileSync(path.join(dir, "preservacao-antes.json"), "utf8"),
);
const preservation = Object.entries(before).map(([file, sha256]) => ({
  file,
  sha256,
  unchanged:
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(root, file)))
      .digest("hex") === sha256,
}));
assert(
  preservation.every((row) => row.unchanged),
  "Marca ou banco de conteúdo alterado",
);
const palette = JSON.parse(
  fs.readFileSync(path.join(root, "constants/palette.json"), "utf8"),
);
assert.equal(palette.brandBlue, "#0289E0");
assert.equal(palette.brandYellow, "#F9AC03");
assert.equal(palette.primary, "#0066A6");
assert.equal(palette.secondary, "#F9AC03");
const findings = initial.findings.map((f) => ({
  ...f,
  originalStatus: f.status,
  status: updates[f.id].nativePending
    ? "Implementado; validação nativa pendente"
    : "Implementado e verificado conforme evidências",
  implementation: updates[f.id],
}));
const data = {
  date: "2026-10-20",
  scope: initial.scope,
  skill: { ...initial.skill, automaticAvailability: "Disponível e aplicada nesta implementação" },
  appInterfaceChanged: true,
  initialAudit: "resultado-inicial.json",
  summary: {
    importantImplemented: 6,
    optionalImplemented: 5,
    automatedTests: testCount,
    uiChecks: ui.checks.length,
    nativeValidationPending: true,
  },
  findings,
  technical,
  preservation,
  palette,
  interfaceEvidence: "aplicacao/interface.json",
  limits: [
    "Percursos na prévia web em 360 e 390 px; não houve validação em aparelho físico.",
    "A orientação nativa requer novo build. Testar rotação, retorno a retrato, áreas seguras, botão Voltar, fontes ampliadas e leitores de tela nos aparelhos usados pelo público.",
    "O preenchimento do assistente foi testado sem enviar pergunta à IA. A confirmação de reset foi cancelada.",
    "O histórico de teste usa localhost; os dados da prévia do usuário em 127.0.0.1 não foram apagados.",
    "Efeitos sobre aprendizagem, motivação e compreensão precisam ser avaliados com os estudantes. A auditoria é heurística.",
  ],
};
fs.writeFileSync(
  path.join(dir, "resultado.json"),
  JSON.stringify(data, null, 2) + "\n",
);
fs.writeFileSync(
  path.join(__dirname, "status.json"),
  JSON.stringify(data, null, 2) + "\n",
);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const ordered = [
  ...findings.filter((f) => f.severity === "important"),
  ...findings.filter((f) => f.severity !== "important"),
];
const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Melhorias da auditoria — FisicAI</title>
<style>body{font:16px/1.55 Arial,sans-serif;color:#202c38;background:#fff;max-width:1100px;margin:auto;padding:28px}h1{font-size:28px}h2{font-size:22px;margin-top:36px;padding-bottom:8px;border-bottom:1px solid #bbb}h3{font-size:19px}a{color:#0066a6}p{max-width:95ch}table{width:100%;border-collapse:collapse;font-size:14px;margin:20px 0}th,td{padding:12px;text-align:left;vertical-align:top;border-bottom:1px solid #ddd}th{background:#eee}code{font-size:13px;overflow-wrap:anywhere}article{padding:12px 0;border-bottom:1px solid #ccc}img{display:block;width:100%;max-width:900px;border:1px solid #ddd}figcaption,.meta{font-size:14px;color:#526475}figure{margin:18px 0}.table{overflow:auto}@media(max-width:600px){body{padding:16px}.table table{min-width:650px}}</style>
<h1>Melhorias da auditoria de UX do FisicAI</h1><p class="meta">Aplicativo independente · 20/10/2026 · Lei de Fitts, Hick, Zeigarnik, Jakob, gradiente de meta, Von Restorff e Miller</p>
<p><strong>Os seis pontos importantes e os cinco refinamentos foram implementados.</strong> Logo original e paleta da UNIVASF preservadas, assim como os bancos de conteúdo, o tamanho das cartas e a espera de um segundo no quiz e desafio.</p>
<p><strong>Verificação:</strong> ${testCount} testes automatizados aprovados, TypeScript aprovado e exportações web/Android aprovadas. Foram registrados ${ui.checks.length} estados e interações na revisão web. A rotação e a usabilidade nativas ainda dependem de aparelho físico; a mudança de orientação exige novo build.</p>
<p><a href="relatorio-inicial.html">Consultar auditoria inicial</a> · <a href="resultado.json">Status e evidências em JSON</a> · <a href="aplicacao/interface.json">Inspeção após as mudanças</a> · <a href="../verificacao-tecnica.json">Verificação técnica</a></p>
<h2>Aplicação por prioridade</h2><div class="table"><table><thead><tr><th>Item</th><th>Prioridade</th><th>Melhoria aplicada</th><th>Estado</th></tr></thead><tbody>${ordered.map((f) => `<tr><td><a href="#${f.id}">${f.id}</a></td><td>${f.severity === "important" ? "Importante" : "Refinamento"}</td><td>${esc(f.implementation.change)}</td><td>${f.implementation.nativePending ? "Implementado; conferir em aparelho" : "Implementado"}</td></tr>`).join("")}</tbody></table></div>
<h2>Detalhes e evidências</h2>${ordered.map((f) => `<article id="${f.id}"><h3>${f.id} — ${esc(f.title)}</h3><p><strong>Achado inicial:</strong> ${esc(f.observed)}</p><p><strong>Alteração:</strong> ${esc(f.implementation.change)}</p><p><strong>Verificação:</strong> ${esc(f.implementation.proof)}</p><p class="meta">${esc(f.status)}. Código atual: ${f.implementation.files.map((e) => `<code>${esc(e.file)}:${e.line}</code>`).join("; ")}.</p>${f.implementation.image ? `<figure><a href="aplicacao/${esc(f.implementation.image)}"><img src="aplicacao/${esc(f.implementation.image)}" alt="Captura da interface após ${f.id}"></a><figcaption>Aplicativo real após a implementação; clique para abrir a captura completa.</figcaption></figure>` : ""}</article>`).join("")}
<h2>Preservação e limites</h2><p>Verificação SHA-256 confirmou que a logo e os arquivos de conteúdo registrados antes da mudança permaneceram idênticos. A interface mantém azul institucional #0289E0, amarelo #F9AC03 e o azul de controles #0066A6.</p><ul>${data.limits.map((l) => `<li>${esc(l)}</li>`).join("")}</ul><p>Orientação por tela: <a href="https://docs.expo.dev/versions/latest/sdk/screen-orientation/">documentação oficial do Expo</a>; compatibilidade de tipos conferida no Expo Router e react-native-screens instalados neste projeto.</p></html>`;
fs.writeFileSync(path.join(dir, "relatorio.html"), html);
console.log(
  JSON.stringify({ report: path.join(dir, "relatorio.html"), ...data.summary }),
);
