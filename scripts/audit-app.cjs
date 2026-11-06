// Diagnóstico reproduzível. Executa o código real com armazenamento e relógio isolados.
// Não lê credenciais, não chama a IA e não altera o progresso do aplicativo.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const renderer = require('react-test-renderer');
const { act } = renderer;
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname, '..');
const readData = name => JSON.parse(fs.readFileSync(path.join(root, 'data', `${name}.json`), 'utf8'));
const results = { date: new Date().toISOString(), scope: 'independente', checks: [], coverage: {} };

function environment() {
  const data = new Map();
  const historyKey = '@fisicai-independente:progresso-jogos';
  let failWrites = false;
  let appState = 'active';
  let focused = true;
  const listeners = new Set();
  const focusListeners = new Set();
  const timers = new Set();
  const cache = new Map();
  const storage = {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => { if (failWrites) throw new Error('Falha de gravação simulada'); data.set(key, value); },
    removeItem: async key => { if (failWrites) throw new Error('Falha de gravação simulada'); data.delete(key); },
    getAllKeys: async () => [...data.keys()],
  };
  class AuditDate extends Date { static now() { return 1700000000000; } }
  function load(relative) {
    let file = path.resolve(root, relative);
    if (!path.extname(file)) file += '.ts';
    if (cache.has(file)) return cache.get(file).exports;
    if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
    const mod = { exports: {} };
    cache.set(file, mod);
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    const customRequire = name => {
      if (name === '@react-native-async-storage/async-storage') return storage;
      if (name === '@/context/PerfilContext') return { usePerfil: () => ({ perfil: { id: 'principal', nome: 'Perfil principal' } }) };
      if (name === 'react-native') return { AppState: { get currentState() { return appState; }, addEventListener: (_event, fn) => { listeners.add(fn); return { remove: () => listeners.delete(fn) }; } } };
      if (name === '@react-navigation/native') return { useIsFocused: () => React.useSyncExternalStore(fn => { focusListeners.add(fn); return () => focusListeners.delete(fn); }, () => focused) };
      return name.startsWith('@/') ? load(name.slice(2)) : require(name);
    };
    vm.runInNewContext(compiled, { module: mod, exports: mod.exports, require: customRequire, console, Date: AuditDate, URL, process: { env: {} }, AbortController, setTimeout, clearTimeout, setInterval: fn => { timers.add(fn); return fn; }, clearInterval: fn => timers.delete(fn) }, { filename: file });
    return mod.exports;
  }
  return { load, timers, data, get stored() { return data.get(historyKey) ?? null; }, set stored(value) { if (value === null) data.delete(historyKey); else data.set(historyKey, value); },
    set failWrites(value) { failWrites = value; },
    appState(value) { appState = value; listeners.forEach(fn => fn(value)); },
    focus(value) { focused = value; focusListeners.forEach(fn => fn()); }
  };
}

async function mountHook(env, file, exportName, args) {
  let value;
  const hook = env.load(file)[exportName];
  function Probe() { value = hook(...args); return null; }
  let component;
  await act(async () => { component = renderer.create(React.createElement(Probe)); });
  return { get value() { return value; }, close: async () => act(async () => component.unmount()) };
}

function check(id, observation, defect) { results.checks.push({ id, defectObserved: defect, observation }); }
const session = (module = 'magnetismo', extra = {}) => ({ tipo: 'quiz', modulo: module, dificuldade: 'facil', acertos: 1, erros: 0, totalItens: 1, tempoGastoSegundos: 5, ...extra });

async function run() {
  for (const [name, key] of [['flashcards', 'flashcards'], ['questoes', 'questoes'], ['memoria', 'pares']]) {
    results.coverage[name] = readData(name).modulos.map(module => ({ id: module.id, title: module.titulo, total: module[key].length, difficulties: Object.fromEntries(['facil', 'medio', 'dificil'].map(level => [level, module[key].filter(item => item.dificuldade === level).length])) }));
  }
  const gaps = readData('lacunas').lacunas;
  results.coverage.lacunas = [...new Set(gaps.map(item => item.modulo_id))].map(id => ({ id, total: gaps.filter(item => item.modulo_id === id).length, difficulties: Object.fromEntries(['facil', 'medio', 'dificil'].map(level => [level, gaps.filter(item => item.modulo_id === id && item.dificuldade === level).length])) }));
  const theoryHook = await mountHook(environment(), 'hooks/useConteudoTeorico.ts', 'useConteudoTeorico', []);
  const content = theoryHook.value.todosConteudos;
  results.coverage.theory = [...new Set(content.map(item => item.tema))].map(theme => ({ theme, total: content.filter(item => item.tema === theme).length, difficulties: Object.fromEntries(['facil', 'medio', 'dificil'].map(level => [level, content.filter(item => item.tema === theme && item.dificuldade === level).length])) }));
  await theoryHook.close();
  check('difficulty-by-position', results.coverage.theory, results.coverage.theory.find(item => item.theme === 'Eletrostática').difficulties.facil === 0);

  const questions = readData('questoes').modulos.flatMap(module => module.questoes);
  const invalidDifficulties = questions.filter(item => !['facil', 'medio', 'dificil'].includes(item.dificuldade)).map(item => ({ id: item.id, difficulty: item.dificuldade }));
  check('invalid-question-difficulty', invalidDifficulties, invalidDifficulties.length > 0);
  const badAlternatives = questions.filter(item => item.alternativas.filter(option => option.letra === item.resposta_correta).length !== 1).map(item => item.id);
  check('answer-key-integrity', { questions: questions.length, invalid: badAlternatives }, badAlternatives.length > 0);
  for (const [file, items] of [['questoes', questions], ['flashcards', readData('flashcards').modulos.flatMap(item => item.flashcards)], ['memoria', readData('memoria').modulos.flatMap(item => item.pares)], ['lacunas', gaps]]) {
    const duplicateIds = items.filter((item, i) => items.findIndex(other => other.id === item.id) !== i).map(item => item.id);
    check(`unique-ids-${file}`, { count: items.length, duplicates: duplicateIds }, duplicateIds.length > 0);
  }

  let env = environment();
  let service = env.load('services/progressoService.ts').progressoService;
  await Promise.all([service.salvarRegistro(session('a')), service.salvarRegistro(session('b'))]);
  check('concurrent-storage-writes', { requested: 2, saved: JSON.parse(env.stored).length }, JSON.parse(env.stored).length !== 2);
  env = environment(); service = env.load('services/progressoService.ts').progressoService;
  env.stored = '{}';
  try { await service.obterResumo(); check('invalid-storage-shape', 'accepted invalid object', true); } catch (error) { check('invalid-storage-shape', error.message, false); }
  env.stored = '{invalid';
  let refused = false;
  try { await service.salvarRegistro(session()); } catch { refused = true; }
  check('corrupt-storage-overwrite', { refused, originalPreserved: env.stored === '{invalid' }, !refused || env.stored !== '{invalid');
  env = environment(); service = env.load('services/progressoService.ts').progressoService;
  await service.salvarRegistro(session()); await service.salvarRegistro(session());
  const records = JSON.parse(env.stored);
  check('same-millisecond-ids', { records: records.length, uniqueIds: new Set(records.map(item => item.id)).size }, new Set(records.map(item => item.id)).size !== records.length);
  env = environment(); service = env.load('services/progressoService.ts').progressoService;
  await service.salvarRegistro(session('Magnetismo'));
  await service.salvarRegistro(session('magnetismo', { tipo: 'flashcards' }));
  check('module-id-normalization', { groupsForOneTheme: (await service.obterResumo()).porModulo.length }, (await service.obterResumo()).porModulo.length === 2);
  env = environment(); service = env.load('services/progressoService.ts').progressoService;
  await service.salvarRegistro(session('Magnetismo', { tipo: 'memoria', acertos: 2, erros: 7, totalItens: 2 }));
  const percent = (await service.obterResumo()).mediaAcertosPercentual;
  check('memory-accuracy-semantics', { correctPairs: 2, failedAttempts: 7, reportedPercent: percent }, percent !== 22);

  env = environment();
  let probe = await mountHook(env, 'hooks/useQuizSession.ts', 'useQuizSession', ['magnetismo', 'facil']);
  while (!probe.value.isComplete) {
    await act(async () => probe.value.answerQuestion(probe.value.currentQuestion.resposta_correta));
    if (!probe.value.isComplete) await act(async () => probe.value.nextQuestion());
  }
  const savedTime = JSON.parse(env.stored)[0].tempoGastoSegundos;
  await act(async () => { for (let n = 0; n < 10; n++) for (const tick of env.timers) tick(); });
  check('clock-after-completion', { savedSeconds: savedTime, displayedSeconds: probe.value.elapsedSeconds, complete: probe.value.isComplete }, probe.value.elapsedSeconds !== savedTime);
  await probe.close();

  env = environment();
  probe = await mountHook(env, 'hooks/useFlashcardSession.ts', 'useFlashcardSession', ['magnetismo', 'facil']);
  await act(async () => probe.value.setIsFlipped(true));
  await act(async () => probe.value.answerCard(true));
  await act(async () => probe.value.answerCard(true));
  check('flashcard-double-answer', { currentCard: probe.value.currentIndex, countedAnswers: probe.value.acertos, completeWithoutAdvancing: probe.value.isComplete }, probe.value.acertos > 1);
  await probe.close();
  env = environment();
  probe = await mountHook(env, 'hooks/useQuizSession.ts', 'useQuizSession', ['magnetismo', 'facil']);
  await act(async () => { const answer = probe.value.currentQuestion.resposta_correta; probe.value.answerQuestion(answer); probe.value.answerQuestion(answer); });
  check('quiz-same-batch-double-tap', { currentQuestion: probe.value.currentIndex, countedAnswers: probe.value.acertos, completed: probe.value.isComplete }, probe.value.acertos > 1);
  await probe.close();

  results.coverage.simulations = readData('phet-simulacoes').simulacoes.map(item => ({ id: item.id, name: item.nome, url: item.url }));
  results.summary = { diagnostics: results.checks.length, defectsObserved: results.checks.filter(item => item.defectObserved).length };
  const out = path.join(root, 'auditoria', 'resultados.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify({ ...results.summary, checks: results.checks, evidence: out }, null, 2));
}
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { environment, mountHook, readData };
