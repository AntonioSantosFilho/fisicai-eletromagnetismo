const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { act } = require('react-test-renderer');
const { environment, mountHook, readData } = require('../scripts/audit-app.cjs');

test('conteúdo classifica as expressões, inclui fontes verificadas e renderiza toda a matemática', () => {
  const content = readData('teoria').conteudos;
  const references = readData('referencias').referencias;
  const assets = readData('math-rendered');
  const ids = new Set(references.map(item => item.id));
  const categories = new Set(['equacao-definicao', 'lei-fisica', 'relacao-constitutiva', 'expressao-derivada', 'conceitual']);
  for (const item of content) {
    assert.ok(categories.has(item.natureza_expressao), item.topico);
    assert.ok(item.contexto_expressao.length > 20);
    assert.ok(item.referencias.length > 0);
    for (const id of [...item.referencias, ...item.exercicio_resolvido.referencias_apoio]) assert.ok(ids.has(id));
    for (const tex of [item.formula_latex, item.exercicio_resolvido.resolucao_latex, item.relacao_complementar?.latex].filter(Boolean)) {
      assert.ok(assets[tex], `SVG ausente para ${item.topico}`);
      assert.ok(assets[tex].width > 0 && assets[tex].height > 0);
      assert.match(assets[tex].svg, /<path\b/);
      assert.doesNotMatch(assets[tex].svg, /data-mjx-error|<script|<foreignObject|href="https?:/i);
    }
  }
  assert.equal(content[0].natureza_expressao, 'equacao-definicao');
  assert.equal(content.find(item => item.topico.includes('Faraday')).natureza_expressao, 'lei-fisica');
  assert.equal(content.find(item => item.relacao_complementar).relacao_complementar.natureza, 'relacao-constitutiva');
  assert.equal(content.filter(item => item.diagrama).length, 5);
  assert.equal(new Set(content.filter(item => item.diagrama).map(item => item.diagrama)).size, 4);
  for (const module of readData('flashcards').modulos) for (const card of module.flashcards) if (card.formula_latex) assert.ok(assets[card.formula_latex]);
});

test('referência ABNT inclui autoria, publicação, URL e data de acesso sem inventar fonte de enunciado', () => {
  const { formatarReferenciaAbnt, referencias } = environment().load('utils/referencias.ts');
  for (const reference of referencias) {
    const formatted = formatarReferenciaAbnt(reference);
    assert.ok(reference.autores && reference.titulo && reference.local && reference.editora && reference.ano);
    assert.match(formatted, /Disponível em: https:\/\//);
    assert.match(formatted, /Acesso em: 18 out\. 2026\./);
    assert.doesNotMatch(formatted,/ed\.\./);
  }
  for (const content of readData('teoria').conteudos) assert.equal(content.exercicio_resolvido.fonte_exata_confirmada, false);
});

test('todos os gabaritos e níveis são válidos, inclusive a questão eld_q_005', () => {
  const questions = readData('questoes').modulos.flatMap(module => module.questoes);
  for (const question of questions) {
    assert.ok(['facil', 'medio', 'dificil'].includes(question.dificuldade));
    assert.equal(question.alternativas.filter(item => item.letra === question.resposta_correta).length, 1);
  }
  const quiz = environment().load('hooks/useQuizSession.ts');
  assert.ok(quiz.getQuestoesByModuleAndDifficulty('eletrodinamica', 'dificil').some(item=>item.id==='eld_q_005'));
  assert.equal(quiz.getQuestoesByModuleAndDifficulty('eletrodinamica', 'todas').length, 15);
});

test('o quiz aceita uma resposta e um avanço por item, mesmo com clique repetido', async () => {
  const probe = await mountHook(environment(), 'hooks/useQuizSession.ts', 'useQuizSession', ['magnetismo', 'facil']);
  try {
    await act(async () => { const answer = probe.value.currentQuestion.resposta_correta; probe.value.answerQuestion(answer); probe.value.answerQuestion(answer); });
    assert.equal(probe.value.acertos, 1);
    assert.equal(probe.value.isComplete, false);
    await act(async () => { probe.value.nextQuestion(); probe.value.nextQuestion(); });
    assert.equal(probe.value.currentIndex, 1);
    await act(async () => probe.value.resetSession());
    assert.equal(probe.value.currentIndex, 0);
    assert.equal(probe.value.acertos, 0);
    await act(async () => probe.value.answerQuestion(probe.value.currentQuestion.resposta_correta));
    assert.equal(probe.value.acertos, 1);
  } finally { await probe.close(); }
});

test('flashcards e lacunas não duplicam respostas enquanto o feedback está aberto', async () => {
  for (const type of ['flashcards', 'lacunas']) {
    const probe = await mountHook(environment(), type === 'flashcards' ? 'hooks/useFlashcardSession.ts' : 'hooks/useLacunasSession.ts', type === 'flashcards' ? 'useFlashcardSession' : 'useLacunasSession', ['magnetismo', 'facil']);
    try {
      if (type === 'lacunas') await act(async () => probe.value.setRespostaDigitada(probe.value.currentLacuna.resposta));
      if (type === 'flashcards') await act(async () => probe.value.setIsFlipped(true));
      const answer = () => type === 'flashcards' ? probe.value.answerCard(true) : probe.value.submitAnswer();
      await act(async () => { answer(); answer(); });
      await act(async () => answer());
      assert.equal(probe.value.acertos, 1);
      const next = () => type === 'flashcards' ? probe.value.nextCard() : probe.value.nextLacuna();
      await act(async () => { next(); next(); });
      assert.equal(probe.value.currentIndex, 1);
    } finally { await probe.close(); }
  }
});

test('os cinco modos concluem, registram uma sessão e congelam o cronômetro', async () => {
  for (const mode of ['quiz', 'desafio', 'flashcards', 'lacunas', 'memoria']) {
    const env = environment();
    const file = mode === 'flashcards' ? 'useFlashcardSession' : mode === 'lacunas' ? 'useLacunasSession' : mode === 'memoria' ? 'useMemoriaGame' : 'useQuizSession';
    const probe = await mountHook(env, `hooks/${file}.ts`, file, ['magnetismo', 'facil', ...(mode === 'quiz' || mode === 'desafio' ? [mode] : [])]);
    try {
      await act(async () => { for (const tick of env.timers) tick(); });
      let safety = 0;
      while (!probe.value.isComplete) {
        assert.ok(safety++ < 30);
        if (mode === 'memoria') {
          const card = probe.value.cards.find(item => !probe.value.matchedPairIds.includes(item.pairId));
          const partner = probe.value.cards.find(item => item.pairId === card.pairId && item.id !== card.id);
          await act(async () => probe.value.selectCard(card.id));
          await act(async () => probe.value.selectCard(partner.id));
          if (!probe.value.isComplete) await act(async () => probe.value.closeFeedback());
        } else if (mode === 'flashcards') {
          await act(async () => probe.value.setIsFlipped(true));
          await act(async () => probe.value.answerCard(true));
          if (!probe.value.isComplete) await act(async () => probe.value.nextCard());
        } else if (mode === 'lacunas') {
          await act(async () => probe.value.setRespostaDigitada(probe.value.currentLacuna.resposta));
          await act(async () => probe.value.submitAnswer());
          if (!probe.value.isComplete) await act(async () => probe.value.nextLacuna());
        } else {
          await act(async () => probe.value.answerQuestion(probe.value.currentQuestion.resposta_correta));
          if (!probe.value.isComplete) await act(async () => probe.value.nextQuestion());
        }
      }
      const seconds = probe.value.elapsedSeconds;
      await act(async () => { for (let i = 0; i < 10; i++) for (const tick of env.timers) tick(); });
      assert.equal(probe.value.elapsedSeconds, seconds, mode);
      const records = JSON.parse(env.stored);
      assert.equal(records.length, 1, mode);
      assert.equal(records[0].tempoGastoSegundos, seconds, mode);
      assert.equal(records[0].tipo, mode, mode);
    } finally { await probe.close(); }
  }
});

test('a simulação aceita o catálogo, rejeita URLs arbitrárias e mantém links antigos válidos', () => {
  const { urlPhetPermitida, obterSimulacaoPermitida } = environment().load('utils/simulacoes.ts');
  for (const simulation of readData('phet-simulacoes').simulacoes) {
    assert.ok(urlPhetPermitida(simulation.url));
    assert.equal(obterSimulacaoPermitida(simulation.id).url, simulation.url);
    assert.equal(obterSimulacaoPermitida(undefined, simulation.url).id, simulation.id);
  }
  assert.equal(obterSimulacaoPermitida('inexistente'), undefined);
  assert.equal(obterSimulacaoPermitida(undefined, 'https://example.com/'), undefined);
  for (const url of ['javascript:alert(1)', 'http://phet.colorado.edu/sims/html/test', 'https://phet.colorado.edu.evil.example/sims/html/test', 'https://user:pass@phet.colorado.edu/sims/html/test']) assert.equal(urlPhetPermitida(url), false);
});

test('o conteúdo visível não apresenta comandos de formatação LaTeX como instrução ao aluno', () => {
  function walk(directory) { return fs.readdirSync(directory, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(directory, item.name)) : [path.join(directory, item.name)]); }
  const root = path.resolve(__dirname, '..');
  for (const file of [...walk(path.join(root, 'app')), ...walk(path.join(root, 'components'))].filter(file => file.endsWith('.tsx'))) assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /LaTeX:|Fórmula em LaTeX/);
});
