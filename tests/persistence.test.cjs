const {test}=require('node:test');
const assert=require('node:assert/strict');
const {act}=require('react-test-renderer');
const {environment,mountHook,readData}=require('../scripts/audit-app.cjs');
const payload=(extra={})=>({tipo:'quiz',modulo:'Magnetismo',dificuldade:'facil',acertos:1,erros:0,totalItens:1,tempoGastoSegundos:4,...extra});
test('gravações concorrentes não perdem registros e repetição da mesma sessão é idempotente',async()=>{
 const env=environment(),s=env.load('services/progressoService.ts').progressoService;
 await Promise.all(Array.from({length:20},()=>s.salvarRegistro(payload())));
 const rows=JSON.parse(env.stored);assert.equal(rows.length,20);assert.equal(new Set(rows.map(r=>r.id)).size,20);
 await Promise.all(Array.from({length:5},()=>s.salvarRegistro(payload(),{sessionId:'mesma-sessao'})));
 assert.equal(JSON.parse(env.stored).length,21);
});
test('formato inválido e JSON corrompido são preservados; restauração arquiva o original',async()=>{
 const env=environment(),s=env.load('services/progressoService.ts').progressoService;
 await s.salvarRegistro(payload());await s.salvarRegistro(payload());
 for(const raw of ['{}','{broken','[null]','[{"id":"x"}]']){
  env.stored=raw;await assert.rejects(s.obterResumo());await assert.rejects(s.salvarRegistro(payload()));assert.equal(env.stored,raw);
 }
 await s.restaurarBackup();assert.equal(JSON.parse(env.stored).length,1);
 assert.ok([...env.data].some(([key,value])=>key.includes(':danificado:')&&value==='[{"id":"x"}]'));
});
test('precisão usa tentativas, une grafias antigas e exclui autoavaliação dos flashcards',async()=>{
 const s=environment().load('services/progressoService.ts').progressoService;
 await s.salvarRegistro(payload({tipo:'memoria',acertos:2,erros:7,totalItens:2}));
 await s.salvarRegistro(payload({modulo:'magnetismo',tipo:'flashcards',acertos:9,erros:1,totalItens:10}));
 const summary=await s.obterResumo();assert.equal(summary.porModulo.length,1);assert.equal(summary.mediaAcertosPercentual,22);assert.equal(summary.cartoesLembrados,9);assert.equal(summary.cartoesRevisar,1);
});
test('perfis isolam histórico e limpeza preserva os outros alunos',async()=>{
 const env=environment(),p=env.load('services/perfisService.ts').perfisService,s=env.load('services/progressoService.ts').progressoService;
 await s.salvarRegistro(payload());const other=await p.criar();await s.salvarRegistro(payload());
 assert.equal((await s.listarRegistros()).length,1);await s.limparRegistros();assert.equal((await s.listarRegistros()).length,0);
 await p.selecionar('principal');assert.equal((await s.listarRegistros()).length,1);assert.notEqual(other.id,'principal');
});
test('atividade retoma resposta, feedback e tempo; relógio pausa no fundo e sem foco',async()=>{
 const env=environment();let probe=await mountHook(env,'hooks/useQuizSession.ts','useQuizSession',['magnetismo','facil']);
 try {
  await act(async()=>{for(const tick of env.timers)tick();});assert.equal(probe.value.elapsedSeconds,1);
  await act(async()=>env.appState('background'));assert.equal(env.timers.size,0);
  await act(async()=>env.appState('active'));await act(async()=>env.focus(false));assert.equal(env.timers.size,0);
  await act(async()=>env.focus(true));await act(async()=>probe.value.answerQuestion(probe.value.currentQuestion.resposta_correta));assert.equal(env.timers.size,0);
  await probe.close();probe=await mountHook(env,'hooks/useQuizSession.ts','useQuizSession',['magnetismo','facil']);
  assert.equal(probe.value.resumed,true);assert.equal(probe.value.acertos,1);assert.equal(probe.value.elapsedSeconds,1);assert.ok(probe.value.feedback);
  await act(async()=>probe.value.resetSession());assert.equal(probe.value.acertos,0);assert.equal(probe.value.resumed,false);
 }finally{await probe.close();}
});
test('falha de armazenamento é mostrada e nova tentativa salva exatamente uma vez',async()=>{
 const env=environment(),probe=await mountHook(env,'hooks/useQuizSession.ts','useQuizSession',['magnetismo','facil']);
 try {
  env.failWrites=true;
  while(!probe.value.isComplete){await act(async()=>probe.value.answerQuestion(probe.value.currentQuestion.resposta_correta));if(!probe.value.isComplete)await act(async()=>probe.value.nextQuestion());}
  assert.equal(probe.value.saveStatus,'error');assert.equal(env.stored,null);
  env.failWrites=false;await act(async()=>probe.value.retrySave());assert.equal(probe.value.saveStatus,'saved');assert.equal(JSON.parse(env.stored).length,1);
  await act(async()=>probe.value.retrySave());assert.equal(JSON.parse(env.stored).length,1);
 }finally{env.failWrites=false;await probe.close();}
});
test('lacunas cobrem todos os temas e níveis, e toleram pontuação sem apagar sinais físicos',()=>{
 const gaps=readData('lacunas').lacunas;
 for(const module of ['magnetismo','eletrodinamica','eletrostatica','ondas-eletromagneticas']){
  assert.equal(gaps.filter(g=>g.modulo_id===module).length,10);
  for(const level of ['facil','medio','dificil'])assert.ok(gaps.some(g=>g.modulo_id===module&&g.dificuldade===level));
 }
 const {compararResposta}=environment().load('utils/normalizarResposta.ts');
 assert.equal(compararResposta('  “Atração.” ',['atracao']),true);assert.equal(compararResposta('-2',['2']),false);
 const theory=readData('teoria').conteudos;assert.ok(theory.every(c=>['facil','medio','dificil'].includes(c.dificuldade)));
 assert.equal(2e-6*3e4*0.15*0.5,0.0045);assert.ok(Math.abs(1.67e-27*2e6/(1.6e-19*0.2)-0.104375)<1e-10);
});
