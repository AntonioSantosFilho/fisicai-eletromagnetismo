# Matriz de verificação — 18/10/2026

Esta matriz substitui as marcações de validação do checklist herdado. Implementação, teste automatizado e validação com pessoas são evidências diferentes.

| Requisito | Evidência atual | Limite da verificação |
| --- | --- | --- |
| Navegação e cinco atividades | Prévia web; `tests/learning.test.cjs` conclui os cinco modos | Executar também em aparelhos físicos |
| Respostas e feedback | Testes de clique repetido e avanço único | Conferência científica docente ainda necessária |
| Histórico e tempo | `tests/persistence.test.cjs`: concorrência, idempotência, pausa e retomada | Fila protege um processo do app; não sincroniza abas ou aparelhos |
| Dados inválidos e falha ao salvar | Testes preservam dados corrompidos, restauram cópia e repetem gravação | Falhas reais de hardware não foram simuladas |
| Reset | Apenas reset manual com confirmação; IDs antigos preservados internamente | Uso individual; sem autenticação e sem exportação |
| Teoria e níveis | Nível explícito no JSON; 32 textos e 60 expressões renderizadas | Recorte curricular e exemplos precisam de aprovação docente |
| Lacunas | 40 itens: dez por tema; todos os níveis; pontuação tolerada | Novos itens elaborados com assistência de IA, sem aprovação docente |
| Esquemas e referências | Quatro esquemas interativos; bibliografia com link e acesso | Origem exata de 17 exemplos herdados ainda não confirmada |
| PhET | Gerador aberto e controles verificados na web; URLs validadas em teste | Demais experimentos e WebView exigem execução em aparelho |
| Tutor | Servidor intermediário, limites, erros e contexto testados com provedor simulado | Sem consulta real ao Google nesta revisão; chave e modelo precisam ser configurados |
| Acessibilidade | Rótulos e estados, texto maior, modais roláveis | TalkBack, VoiceOver e ampliação do sistema pendentes |
| Compilação | `npm run typecheck`; exportação web/Android registrada na auditoria | Exportar bundle não equivale a testar APK/iOS instalado |
| Integração contínua | `.github/workflows/verificar.yml` prepara testes e exportações no repositório independente | Uma configuração de CI não comprova sua execução remota |
| Dependências | `auditoria/dependencias-atual.json` | Alertas remanescentes exigem atualização maior ou correção upstream |

O [relatório de auditoria](./AUDITORIA.md) mantém o estado individual de cada achado e suas pendências.

A [revisão pedagógica](./REVISAO_PEDAGOGICA.md) e o [mapa por item](./auditoria/mapa-conteudo.csv) registram objetivos, origem e limites da revisão. Os testes de conteúdo também verificam bancos distintos, gabaritos, pré-requisitos e rodízio.

Revisão de simplificação: Todos como seleção inicial nos cinco modos; cores por dificuldade com rótulos; bordas laterais retiradas da teoria; aviso do assistente na ajuda; prompt restrito a eletromagnetismo e recusa fixa testada com provedor simulado.

Memória: explicação opcional, terceira carta inicia nova tentativa e rodadas de até seis cartas; retomada da primeira carta e confirmação do último par cobertas em tests/memory.test.cjs. Cartas e flashcards usam uma superfície de giro compartilhada. Navegação interna inclui voltar e início, e os feedbacks permitem sair da atividade. A inspeção visual é web; movimento e leitores em aparelhos reais continuam pendentes.

Revisão de organização em 19/10/2026: removidos o ícone decorativo e os títulos duplicados da preparação dos jogos; instruções concentradas na ajuda. Separação de seções por títulos acessíveis e linhas horizontais. Cabeçalhos de andamento compactados nos quatro modos sequenciais; cartas de memória restauradas a 220 px. A preparação cabe na moldura de 360/390 px; perguntas longas, gráficos e cartões grandes preservam rolagem.

Feedback de quiz/desafio: atraso de 1 segundo na apresentação, sem adiar correção ou contagem. Regressões com relógio controlado verificam o limite de 999/1000 ms, cancelamento, troca de questão/sessão e foco, além do texto de erro e bloqueio de resposta duplicada.

Área segura: proteção inferior centralizada no layout raiz, com inset inferior zerado apenas no navegador de abas interno para evitar contagem dupla. Rodapés de preparação/memória deixam de reaplicar o mesmo inset. Modais têm SafeAreaView próprio; web utiliza viewport-fit=cover e 100dvh quando suportado. Verificação em aparelhos físicos (Android com três botões/gestos e iOS) pendente.

Atualização de 28/10/2026: a beta.2 foi instalada com sucesso em emulador Android API 37, com versão e código confirmados. A captura não permitiu validar sua aparência. A falha de estilos encontrada nos prints do usuário foi reproduzida e corrigida em testes do runtime nativo; veja o [diagnóstico](./publicacao/2026-10-28/diagnostico-ui-android.md). A instalação não encerra as pendências de conferência visual e acessibilidade em aparelhos reais.
