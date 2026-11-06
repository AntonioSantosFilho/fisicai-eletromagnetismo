# FisicAI — Eletromagnetismo no ensino médio

Aplicativo educacional com conteúdo teórico, atividades de prática, simulações PhET e um tutor de IA experimental. Desenvolvido com React Native, Expo e TypeScript.

**Disponível em versão beta no Google Play:** [baixar o FisicAI para Android](https://play.google.com/store/apps/details?id=com.fisicai.independente).

O **FisicAI é uma nova versão consolidada**, surgida a partir das duas implementações desenvolvidas com IA no TCC de Engenharia da Computação da UNIVASF: uma no **Cursor** e outra no **ChatGPT**. A proposta foi reunir as melhores soluções de cada versão em um aplicativo independente e, a partir dessa combinação, aprimorar a interface, o conteúdo e o funcionamento.

A consolidação também incorporou sugestões da banca, do professor e dos avaliadores. O trabalho na pasta independente começou em **18 de outubro de 2026**, utilizando inicialmente uma cópia técnica da versão Cursor. Esse ponto de partida não limita a proposta da nova versão, que considera as contribuições das duas implementações. As versões experimentais originais não fazem parte deste repositório.

## O que o aplicativo oferece

- Estudo de eletrostática, eletrodinâmica, magnetismo e ondas eletromagnéticas.
- Quiz, desafio, flashcards, memória e preenchimento de lacunas.
- Explicação das respostas, níveis de dificuldade, retomada de atividades e progresso local.
- Equações renderizadas e esquemas didáticos interativos.
- Acesso a simulações externas do PhET.
- Tutor restrito a eletromagnetismo, com integração por servidor e aviso antes do envio de mensagens.

O banco atual contém **32 textos teóricos, 60 questões de quiz, 24 questões de desafio, 40 flashcards, 32 pares de memória e 40 lacunas**. São bancos finitos; o rodízio reduz a repetição antes de completar um ciclo e não implementa revisão espaçada por tempo.

## Executar localmente

Requisitos: **Node.js 24**, npm e Git. Android Studio/JDK/Android SDK são necessários apenas para compilar o aplicativo Android localmente.

```sh
git clone https://github.com/AntonioSantosFilho/fisicai-eletromagnetismo.git
cd fisicai-eletromagnetismo
npm ci
npm run preview
```

Abra http://127.0.0.1:8083/preview.html para a moldura de celular, ou use `npm run web` para a prévia web comum. `npm start` inicia o Expo para desenvolvimento. Os ícones e as expressões matemáticas são preparados pelos scripts de início; não há chave de API necessária para estudar e praticar.

O Expo Go e o navegador ajudam durante o desenvolvimento, mas não reproduzem todos os comportamentos de uma instalação final. Ícone, splash, áreas seguras e interações nativas precisam ser conferidos no aplicativo compilado.

### Configurar o tutor

Copie `.env.example` para `.env.local` e preencha, no ambiente privado do servidor, `GEMINI_API_KEY` e `GEMINI_MODEL`. O modelo deve estar disponível na conta utilizada. Não publique o arquivo preenchido.

```powershell
Copy-Item .env.example .env.local
```

No desenvolvimento web, o Metro disponibiliza `/api/tutor` na mesma origem do aplicativo. Para executar o servidor separadamente:

```sh
npm run tutor:start
```

O servidor escuta em `127.0.0.1:8084` por padrão. Em uma distribuição Android, configure `EXPO_PUBLIC_TUTOR_URL` com a URL HTTPS do backend. Essa variável contém somente o endereço público; chaves nunca devem usar o prefixo `EXPO_PUBLIC_`.

O provedor registrado no beta é **Google Gemini**. Existe também um adaptador para OpenAI no servidor, mas a conversa sobre OpenRouter não resultou em sua implementação. O modelo do tutor é separado do modelo de IA utilizado como auxílio ao desenvolvimento.

Sem credencial válida, o tutor apresenta indisponibilidade e os conteúdos locais continuam utilizáveis. A última verificação registrada do servidor não confirmou geração de respostas. Consulte as condições do provedor e revise a adequação ao público adolescente antes de habilitar o serviço em sala.

## Metodologia de desenvolvimento e avaliação

A evolução independente foi conduzida por ciclos de **análise das duas versões, seleção e integração de soluções, levantamento de problemas, implementação e verificação**. A avaliação combinou inspeção do código, revisão editorial assistida por IA, avaliação heurística e testes automatizados. Não foi realizado um experimento de eficácia pedagógica com estudantes nesta etapa.

### Origem, seleção e consolidação

A nova versão toma as implementações Cursor e ChatGPT como referências para selecionar e combinar suas melhores partes. A seleção considera clareza da navegação, organização e variedade do conteúdo, funcionamento das atividades, consistência visual e facilidade de manutenção. A consolidação inclui a adaptação das soluções escolhidas e a correção de problemas encontrados; não se resume à junção automática das duas árvores de arquivos.

Para iniciar o trabalho sem alterar as versões experimentais, foi criada uma cópia técnica da versão Cursor em uma pasta separada. Os seis arquivos em [PROMPT'S](./PROMPT'S/) documentam a sequência de geração herdada: fundação técnica, identidade visual, conteúdo e PhET, flashcards e memória, demais atividades e progresso/tutor.

A versão consolidada é um terceiro produto, com intervenções posteriores às duas implementações originais. Seus resultados não devem ser usados como se fossem a saída original de uma das ferramentas comparadas. Os prompts herdados também não constituem o registro integral das conversas de revisão posteriores. A origem de cada trecho não está integralmente mapeada por arquivo; este texto descreve a estratégia de consolidação, sem atribuir autoria de código que não tenha registro verificável.

### Levantamento das necessidades

As mudanças foram orientadas pelas observações do responsável pelo projeto e pelo feedback da banca, do professor e dos avaliadores. Entre os requisitos incorporados estão:

- Verificar controles que não respondiam ou ficavam invisíveis.
- Usar “equação de definição”, “lei física”, “relação constitutiva” e “expressão matemática derivada” conforme o contexto.
- Substituir “variáveis da fórmula” por “grandezas e constantes físicas envolvidas”.
- Exibir a matemática renderizada e identificar referências de apoio em formato ABNT, com link e data de acesso quando disponíveis.
- Reduzir a poluição do menu, organizar as atividades e oferecer maior variedade de questões.

O feedback recebido orienta requisitos; não significa que todo o conteúdo alterado já tenha sido aprovado pelos avaliadores.

### Auditoria técnica e priorização

A inspeção inicial registrou **41 achados**, distinguindo falhas reproduzidas, riscos, decisões de produto e necessidades de revisão pedagógica. Cada item recebeu evidência, impacto e ação proposta. A síntese histórica registra 33 itens corrigidos e oito parciais ou pendentes; consulte o estado individual em [AUDITORIA.md](./AUDITORIA.md).

Foram tratados, entre outros, resposta duplicada por toque repetido, tempo contabilizado após o término, concorrência nas gravações, recuperação de dados, retomada de sessão, diversidade dos bancos e exposição de credenciais no cliente.

### Revisão científica e didática

O material foi revisado por tema e por atividade, conferindo hipóteses, unidades, gabaritos, pré-requisitos e distinções como campo/força, tensão/corrente e energia/potência. Quiz e desafio passaram a ter bancos próprios. Foram acrescentados fundamentos, objetivos de aprendizagem, reflexões, diagramas e roteiros de previsão, observação e explicação no PhET.

A [revisão pedagógica](./REVISAO_PEDAGOGICA.md) e o [mapa de conteúdo](./auditoria/mapa-conteudo.csv) registram os itens. Referências de apoio não foram apresentadas como origem comprovada dos enunciados: a autoria exata de 17 exemplos herdados permanece sem confirmação. O material requer validação docente integral; os testes de gabarito não constituem validação científica ou psicométrica.

### Avaliação da interface

A auditoria utilizou a skill **Laws of UX**, um conjunto de instruções e referências que orienta a análise da interface. Foram aplicadas sete lentes: **Fitts, Hick, Zeigarnik, Jakob, gradiente de meta, Von Restorff e Miller**, além de princípios de agrupamento e carga cognitiva. Essas lentes ajudaram a examinar áreas de toque, escolhas, retomada, navegação, progresso e destaque das ações.

A revisão de 20/10 identificou seis melhorias importantes e cinco complementares. As verificações web utilizaram larguras de 360 e 390 px. Consulte o [registro da auditoria heurística](./auditoria/ux-2026-10-20/resultado-inicial.json) e a [revisão de aplicação](./auditoria/ux-2026-10-20/resultado.json).

A skill **Design Taste Frontend** também foi consultada na análise posterior dos problemas de apresentação no Android. As skills são instruções de trabalho para a IA, não bibliotecas incluídas no aplicativo nem certificações de usabilidade.

### Desenvolvimento assistido por IA

ChatGPT/Codex auxiliou na análise, programação, documentação, investigação de fontes e elaboração de testes. A skill **Computer Use** apoiou a inspeção da interface e o fluxo de publicação. As mudanças foram acompanhadas por verificações no código e pelos testes disponíveis.

O registro desta evolução não preserva de forma completa o modelo e a configuração de cada interação com a IA. Por isso, este README não atribui toda a revisão a um único modelo específico. Uma reprodução exata exigiria guardar também versão do modelo, parâmetros, prompts, respostas e alterações manuais de cada ciclo.

### Verificação e retorno do uso real

Os testes isolam armazenamento, relógio e respostas do provedor para verificar conteúdo, sessões, persistência, feedback e integração do tutor sem consumir a API. A tipagem e as exportações web/Android complementam a análise.

Em 28/10, prints de uma instalação Android revelaram uma falha que a prévia web não havia identificado: a interop do NativeWind descartava estilos definidos por função em componentes `Pressable`. A correção protegeu 24 controles em 21 arquivos e acrescentou seis testes de regressão com o runtime nativo instalado. O caso está documentado no [diagnóstico Android](./publicacao/2026-10-28/diagnostico-ui-android.md).

A última execução registrada antes da preparação deste repositório passou em **59 testes**. O APK beta.2 foi compilado, teve sua assinatura verificada e foi instalado em emulador; a instalação não comprovou equivalência visual completa. O responsável informou aprovação da beta.1 e envio manual da beta.2 ao Google Play. A aprovação posterior da beta.2 não foi confirmada nesta preparação.

### Limites e próximos passos de avaliação

Permanecem necessárias a revisão docente completa, a conferência visual em aparelhos reais, testes com fontes ampliadas e leitores de tela, avaliação do tutor com o provedor real e estudos com adolescentes. Uma eventual coleta para pesquisa deve ter protocolo próprio e os consentimentos e procedimentos institucionais aplicáveis. Esta etapa não demonstra ganho de aprendizagem, motivação ou superioridade de uma ferramenta de IA.

## Verificações reproduzíveis

```sh
npm run typecheck
npm test
npm run audit:app
npm run audit:report
```

Na preparação do repositório em **06/11/2026**, a tipagem, os testes e a exportação web/Android foram conferidos novamente. A suíte passou em **63 testes**, incluindo as proteções da exportação do repositório. `npm run verify` reúne essas etapas e atualiza as evidências locais. Exportar o bundle não equivale a executar um APK em aparelho. Os relatórios de dependências são snapshots datados; rode `npm audit` para conhecer a árvore instalada no momento da análise. A presença de um workflow no repositório não comprova sua execução remota.

```sh
npm run repo:check
```

O último comando confere os arquivos candidatos à publicação, as exclusões e padrões de credenciais, sem exibir valores secretos. O diretório `.github/workflows/` contém a verificação automática preparada para este repositório independente.

## Estrutura

```text
app/             Rotas, telas e endpoints do Expo Router
components/      Interface, equações, diagramas e feedback
hooks/           Sessões dos jogos e lógica de apresentação
context/         Perfil local
services/        Persistência e cliente do tutor
server/          Tutor, políticas, provedores e relatos voluntários
data/            Teoria, bancos, bibliografia e matemática renderizada
assets/          Logos, ícones e splash
public/          Prévia web, manifest e páginas legais
constants/       Paleta institucional e configurações compartilhadas
utils/           Seleção, validação e progresso
tests/           Testes de regressão
scripts/         Preparação de assets, verificações e compilação
publicacao/      Configuração da versão e fontes dos documentos legais
auditoria/       Registros técnicos e pedagógicos selecionados
PROMPT'S/        Prompts herdados que documentam a origem
```

O projeto utiliza Expo SDK 54, React Native 0.81.5, React 19.1, Expo Router 6, NativeWind 4, AsyncStorage e SVG. As versões exatas de instalação estão fixadas em `package-lock.json`.

## Identidade, dados e publicação

A logo foi preservada. A paleta usa azul UNIVASF `#0289E0`, amarelo `#F9AC03` e azul de controle `#0066A6` para contraste. O uso da identidade e das referências à UNIVASF e ao PhET não representa endosso institucional ou responsabilidade dessas instituições pela publicação.

O progresso fica no aparelho, com reset explícito e sem sincronização entre dispositivos. O chat exige ciência do envio de mensagens, processa trechos da conversa no servidor/provedor e permite relatar respostas. A conversa não é persistida pelo cliente, mas isso não determina a retenção do provedor. Limites em memória no backend valem por instância; não são um teto financeiro global.

A versão registrada em `publicacao/release.json` é a beta.2. O projeto não tem OTA habilitado. A compilação Android utilizada foi local; a hospedagem Expo foi usada para servidor e páginas legais.

Credenciais, chaves de assinatura, dependências, builds, logs e capturas particulares ficam fora do Git. Os arquivos locais foram preservados. A chave original de upload deve continuar armazenada privadamente para manter o processo de atualização do app existente. Não gere outra chave para atualizar essa publicação.

Os campos de projeto EAS, pacote e URLs identificam a distribuição original. Quem fizer um fork para publicar outro aplicativo precisa configurar seus próprios identificadores, backend, responsável e documentos legais.

## Autoria e uso

Projeto acadêmico de Antonio Santos Filho, com desenvolvimento assistido por IA. A publicação registrada no aplicativo é de HexFlow Tecnologia e Inovação. Contato de suporte: hexflow.ti@gmail.com.

A publicação do código em repositório público não atribui uma licença de software específica. Este repositório ainda não contém uma licença de uso definida pelo titular. Logos, marcas, conteúdos e materiais de terceiros mantêm seus próprios direitos e condições de uso.
