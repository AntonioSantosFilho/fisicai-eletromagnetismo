# Checklist Final FisicAI

> Registro histórico herdado da base Cursor. As marcações abaixo não representam uma validação atual da versão independente. Consulte [a auditoria de 18/10/2026](./AUDITORIA.md), que inclui problemas não cobertos por este checklist.

## Requisitos Funcionais

| Requisito | Status | Origem | Arquivos principais |
| --- | --- | --- | --- |
| RF01 - Acesso a conteúdos, flashcards, quiz, desafio, lacunas, memória e simulações | Implementado | Prompts 1, 3, 4 e 5 | `app/(tabs)/index.tsx`, `app/(tabs)/estudar/index.tsx`, `app/jogos/flashcards/[modulo].tsx`, `app/jogos/memoria/[modulo].tsx`, `app/jogos/quiz/[modulo].tsx`, `app/jogos/desafio/[modulo].tsx`, `app/jogos/lacunas/[modulo].tsx` |
| RF02 - Sequência de temas definida pelo sistema | Implementado | Prompts 4 e 5 | `hooks/useFlashcardSession.ts`, `hooks/useMemoriaGame.ts`, `hooks/useQuizSession.ts`, `hooks/useLacunasSession.ts` |
| RF03 - Perguntas de conceitos, fórmulas/cálculos e aplicações | Implementado | Prompt 5 | `data/questoes.json`, `hooks/useQuizSession.ts`, `components/EnunciadoCard.tsx` |
| RF04 - Entre 3 e 5 temas distintos | Implementado conforme dados disponíveis | Prompt 5 | `data/questoes.json`, `data/lacunas.json`, `hooks/useQuizSession.ts`, `hooks/useLacunasSession.ts` |
| RF05 - Feedback imediato com explicação | Implementado | Prompts 4 e 5 | `components/FeedbackModal.tsx`, `hooks/useFlashcardSession.ts`, `hooks/useMemoriaGame.ts`, `hooks/useQuizSession.ts`, `hooks/useLacunasSession.ts` |
| RF06 - Registro de acertos e tempo gasto | Implementado | Prompts 4, 5 e 6 | `services/progressoService.ts`, `app/(tabs)/progresso/index.tsx` |
| RF07 - Conteúdo agrupado por dificuldade | Implementado | Prompts 3, 4 e 5 | `app/(tabs)/estudar/index.tsx`, `app/jogos/flashcards/index.tsx`, `app/jogos/memoria/index.tsx`, `app/jogos/quiz/index.tsx` |
| RF08 - Suporte a fórmulas no conteúdo teórico | Implementado | Prompt 3 | `components/FormulaBox.tsx`, `app/estudar/[modulo].tsx` |
| RF09 - Lista de progresso local via AsyncStorage | Implementado | Prompt 6 | `services/progressoService.ts`, `app/(tabs)/progresso/index.tsx`, `components/ProgressoCard.tsx`, `components/GraficoAcertos.tsx` |
| RF10 - Conteúdo teórico e fórmulas básicas | Implementado | Prompt 3 | `app/(tabs)/estudar/index.tsx`, `app/estudar/[modulo].tsx`, `components/ConteudoCard.tsx`, `components/FormulaBox.tsx` |
| RF11 - Simulador PhET via WebView | Implementado | Prompt 3 | `app/estudar/phet/index.tsx`, `app/estudar/phet/[id].tsx`, `app/estudar/phet/simulacao.tsx`, `hooks/useSimulacoes.ts` |
| RF12 - IA conversacional | Implementado | Prompt 6 | `app/(tabs)/ia/index.tsx`, `components/BubbleChat.tsx`, `hooks/useChat.ts`, `services/iaService.ts` |

## Requisitos Não Funcionais

| Requisito | Status | Origem | Arquivos principais |
| --- | --- | --- | --- |
| RNF01 - Home com grid completo de acesso rápido | Implementado | Prompts 1, 2 e 6 | `app/(tabs)/index.tsx`, `components/ModuloCard.tsx` |
| RNF02 - Botão de reiniciar nos jogos | Implementado | Prompts 4, 5 e auditoria Prompt 6 | `components/BotaoReiniciar.tsx`, `app/jogos/flashcards/[modulo].tsx`, `app/jogos/memoria/[modulo].tsx`, `app/jogos/quiz/[modulo].tsx`, `app/jogos/desafio/[modulo].tsx`, `app/jogos/lacunas/[modulo].tsx` |
| RNF03 - Botão de ajuda reutilizável | Implementado | Prompts 1 e 6 | `components/HelpButton.tsx`, `app/jogos/flashcards/index.tsx`, `app/jogos/flashcards/[modulo].tsx`, `app/jogos/memoria/index.tsx`, `app/jogos/memoria/[modulo].tsx`, `app/jogos/quiz/index.tsx`, `app/jogos/quiz/[modulo].tsx`, `app/jogos/desafio/[modulo].tsx`, `app/jogos/lacunas/[modulo].tsx` |
| RNF04 - Dicas/explicações extras para erros | Implementado | Prompts 4 e 5 | `components/FeedbackModal.tsx`, `hooks/useMemoriaGame.ts`, `hooks/useQuizSession.ts`, `hooks/useLacunasSession.ts` |

## Validação de Navegação

- A barra inferior registra somente `Home`, `Estudar`, `Progresso` e `Ajuda IA` em `app/(tabs)/_layout.tsx`.
- Rotas internas de conteúdo, jogos, detalhes e simulações ficam fora do grupo de abas.
- Não há telas internas registradas no `Tabs` com `href: null`.

## Observações Finais

- `services/progressoService.ts` consolida a chave `@fisicai:progresso-jogos` para todos os modos com AsyncStorage.
- `services/iaService.ts` usa `EXPO_PUBLIC_GEMINI_API_KEY` e `EXPO_PUBLIC_GEMINI_MODEL`, com fallback para `gemini-2.0-flash-lite`.
- A Home final inclui acesso direto a teoria, flashcards, quiz, desafio, lacunas, memória, simulações, progresso e IA.
