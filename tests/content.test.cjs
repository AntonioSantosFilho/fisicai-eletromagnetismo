const {test}=require('node:test');const assert=require('node:assert/strict');const {act}=require('react-test-renderer');
const {environment,mountHook,readData}=require('../scripts/audit-app.cjs');
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
test('memória aceita Todas com os três níveis, preservando todos os pares',async()=>{
 const env=environment(),probe=await mountHook(env,'hooks/useMemoriaGame.ts','useMemoriaGame',['magnetismo','todas']);
 try{
  assert.equal(probe.value.pares.length,8);assert.equal(probe.value.cards.length,16);
  assert.equal(new Set(probe.value.pares.map(p=>p.dificuldade)).size,3);
  while(!probe.value.isComplete){const a=probe.value.cards.find(c=>!probe.value.matchedPairIds.includes(c.pairId)),b=probe.value.cards.find(c=>c.pairId===a.pairId&&c.id!==a.id);await act(async()=>{probe.value.selectCard(a.id);probe.value.selectCard(b.id);});if(!probe.value.isComplete)await act(async()=>probe.value.closeFeedback());}
  assert.equal(JSON.parse(env.stored)[0].totalItens,8);assert.equal(JSON.parse(env.stored)[0].dificuldade,'todas');
 }finally{await probe.close();}
});
test('quiz e desafio têm bancos próprios, gabaritos íntegros e variedade de habilidades',()=>{
 const quiz=readData('questoes').modulos,challenge=readData('desafios').modulos;
 const stems=new Set(),ids=new Set();const refs=new Set(readData('referencias').referencias.map(r=>r.id));
 for(const [bank,count]of [[quiz,15],[challenge,6]])for(const module of bank){
  assert.equal(module.questoes.length,count);
  assert.ok(new Set(module.questoes.map(q=>q.habilidade)).size>=3);
  for(const level of ['facil','medio','dificil'])assert.ok(module.questoes.some(q=>q.dificuldade===level));
  for(const q of module.questoes){
   assert.equal(ids.has(q.id),false,q.id);ids.add(q.id);
   assert.equal(stems.has(normalize(q.enunciado)),false,q.id);stems.add(normalize(q.enunciado));
   assert.equal(q.alternativas.length,4);assert.equal(new Set(q.alternativas.map(a=>a.texto.trim().toLowerCase())).size,4,q.id);
   assert.equal(q.alternativas.filter(a=>a.letra===q.resposta_correta).length,1);
   assert.ok(q.explicacao.trim());assert.ok(q.referencias_apoio.every(id=>refs.has(id)));
   if(q.dados_tabela){assert.ok(q.dados_tabela.colunas.length>0);assert.ok(q.dados_tabela.linhas.every(row=>row.length===q.dados_tabela.colunas.length));}
   if(q.grafico){assert.ok(q.grafico.max_x>0&&q.grafico.max_y>0);assert.ok(q.grafico.pontos.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=q.grafico.max_x&&y>=0&&y<=q.grafico.max_y));}
  }
 }
 assert.equal(stems.size,84);
});
test('trilha tem pré-requisitos válidos, sem ciclos, fundamentos e reflexão em todos os textos',()=>{
 const lessons=readData('teoria').conteudos,map=new Map(lessons.map(c=>[c.id,c]));
 assert.equal(lessons.length,32);assert.equal(map.size,lessons.length);
 assert.equal(new Set(lessons.map(c=>c.ordem_estudo)).size,lessons.length);
 function visit(id,path=[]){assert.equal(path.includes(id),false,'Ciclo: '+[...path,id].join(' > '));const c=map.get(id);assert.ok(c,id);for(const p of c.pre_requisitos){assert.ok(map.get(p).ordem_estudo<c.ordem_estudo,`${p} precisa vir antes de ${id}`);visit(p,[...path,id]);}}
 for(const c of lessons){visit(c.id);assert.ok(c.objetivos.length);assert.ok(c.erro_comum.afirmacao&&c.erro_comum.correcao);assert.ok(c.pergunta_reflexao.pergunta&&c.pergunta_reflexao.resposta);assert.equal(c.revisao_editorial.aprovacao_docente,false);if(c.natureza_expressao==='conceitual')assert.equal(c.formula_latex,'');}
 for(const id of ['carga-e-conservacao','corrente-eletrica','resistencia-e-lei-de-ohm','resistores-serie-paralelo','potencia-e-consumo'])assert.equal(map.get(id).etapa,'essencial');
 const simulationIds=new Set(readData('phet-simulacoes').simulacoes.map(s=>s.id));for(const c of lessons.filter(c=>c.investigacao))assert.ok(simulationIds.has(c.investigacao.simulacao_id));
});
test('rodízio esgota o banco antes de reiniciar ciclo e não duplica itens dentro da sessão',async()=>{
 const env=environment(),service=env.load('services/selecaoService.ts').selecaoService;
 const ids=Array.from({length:15},(_,i)=>'q'+i),first=[];
 for(let i=0;i<3;i++)first.push(...await service.selecionar('principal','quiz',ids,5));
 assert.equal(new Set(first).size,15);
 const next=await service.selecionar('principal','quiz',ids,5);assert.equal(new Set(next).size,5);
 const small=['a','b','c','d','e'];for(let i=0;i<10;i++){const rows=await service.selecionar('principal','small',small,3);assert.equal(new Set(rows).size,3);}
 const other=await service.selecionar('aluno-2','quiz',ids,5);assert.equal(other.length,5);
});
test('retomar preserva seleção e alternativas; reiniciar obtém outra parte do banco',async()=>{
 const env=environment();let probe=await mountHook(env,'hooks/useQuizSession.ts','useQuizSession',['magnetismo','todas']);
 let rows=probe.value.questoes.map(q=>({id:q.id,alternativas:q.alternativas,resposta:q.resposta_correta}));
 await probe.close();probe=await mountHook(env,'hooks/useQuizSession.ts','useQuizSession',['magnetismo','todas']);
 try{assert.equal(probe.value.resumed,true);assert.equal(JSON.stringify(probe.value.questoes.map(q=>({id:q.id,alternativas:q.alternativas,resposta:q.resposta_correta}))),JSON.stringify(rows));await act(async()=>probe.value.resetSession());const next=probe.value.questoes.map(q=>q.id);assert.equal(next.some(id=>rows.some(q=>q.id===id)),false);}finally{await probe.close();}
});
test('embaralhar alternativas preserva o texto correto e mantém disposição estável ao retomar',()=>{
 const {variarAlternativas}=environment().load('utils/alternativas.ts');
 for(const bank of ['questoes','desafios'])for(const module of readData(bank).modulos)for(const q of module.questoes){
  const correct=q.alternativas.find(a=>a.letra===q.resposta_correta).texto;
  const result=variarAlternativas(q,'sessao-fixa');assert.equal(result.alternativas.find(a=>a.letra===result.resposta_correta).texto,correct);assert.deepEqual(result,variarAlternativas(q,'sessao-fixa'));
 }
});
test('flashcard exige conferir o verso antes da autoavaliação',async()=>{
 const probe=await mountHook(environment(),'hooks/useFlashcardSession.ts','useFlashcardSession',['magnetismo','facil']);
 try{await act(async()=>probe.value.answerCard(true));assert.equal(probe.value.acertos,0);await act(async()=>probe.value.setIsFlipped(true));await act(async()=>probe.value.answerCard(true));assert.equal(probe.value.acertos,1);assert.match(probe.value.feedback.message,/autoavaliação/);}finally{await probe.close();}
});
test('novos exemplos e questões numéricas conferem unidades, sinais e fatores de escala',()=>{
 // Oráculos numéricos independentes dos textos editoriais.
 assert.ok(Math.abs(5e12*1.6e-19-8e-7)<1e-20);
 assert.ok(Math.abs(2e-6*(40-10)-6e-5)<1e-15);
 assert.equal(12/3,4);assert.equal(12/6,2);assert.equal(1/(1/6+1/6),3);
 assert.ok(Math.abs(0.2*3-0.6)<1e-12);assert.equal(3e8/1.5,2e8);
 const all=[...readData('questoes').modulos,...readData('desafios').modulos].flatMap(m=>m.questoes),correct=id=>{const q=all.find(q=>q.id===id);return q.alternativas.find(a=>a.letra===q.resposta_correta).texto;};
 assert.match(correct('ele_q_005'),/0,60 N/);assert.equal(9e9*2e-6*3e-6/0.3**2,0.6);
 assert.match(correct('ond_q_004'),/4,0 m/);assert.equal(3e8/75e6,4);
 assert.match(correct('ond_q_005'),/150 V\/m/);assert.equal(3e8*0.5e-6,150);
 assert.match(correct('des_eletrodinamica_5'),/24 W/);assert.equal(6*(18/(3+6))**2,24);
 assert.match(correct('des_eletrostatica_5'),/4,0 N/);assert.equal(8*2/2**2,4);
});
test('as contas dos vinte exemplos herdados ou substituídos mantêm resultados e unidades coerentes',()=>{
 const rows=readData('teoria').conteudos.slice(0,20);
 const cases=[
  [2e-6*3e4*0.15*0.5,0.0045,/4,5·10⁻³ N/],
  [1.67e-27*2e6/(1.6e-19*0.2),0.104375,/0,104 m/],
  [2*3*4e-6/(2e-6*3),4,/4 s/],
  [3*5*0.2*0.5,1.5,/1,5 N/],
  [2e-7*5*8/0.05,0.00016,/1,6·10⁻⁴ N/],
  [2e-7*10/0.2,0.00001,/10 μT/],
  [4*3.14e-7*1000*2/0.5,0.005024,/5,024·10⁻³ T/],
  [500*3/(2*3*0.1),2500,/2500 A\/m/],
  [50*2*0.01*0.5,0.5,/0,5 N·m/],
  [120*0.5,60,/60 A/],
  [500/100000,0.005,/0,005 Wb/],
  [0.2*0.05*0.5,0.005,/0,005 Wb/],
  [100*0.002/0.1,2,/2 V/],
  [0.5*0.4*3,0.6,/0,60 V/],
  [12e-7*100**2*0.002/0.1,0.00024,/240 μH/],
  [0.8*Math.sqrt(0.004*0.009),0.0048,/4,8 mH/],
  [9e9*4e-6*5e-6/0.2**2,4.5,/4,5 N/],
  [0.2/5e-6,40000,/40.000 N\/C/],
  [3e8/1e8,3,/3 metros/],
  [3e8*2e-6,600,/600 V\/m/]
 ];
 assert.equal(rows.length,cases.length);
 cases.forEach(([calculated,expected,pattern],i)=>{assert.ok(Math.abs(calculated-expected)<=Math.max(1,Math.abs(expected))*1e-12,rows[i].topico);assert.match(rows[i].exercicio_resolvido.resposta_final,pattern);});
});
