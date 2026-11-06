# Auditoria do FisicAI Independente

Revisão de 18 de outubro de 2026. A primeira auditoria mapeou 41 achados; a segunda implementou correções e repetiu as verificações. A constatação inicial é mantida como histórico, seguida da situação atual e de evidências no código.

**33 itens corrigidos; 8 itens parciais ou pendentes.** A execução atual passou em **63 testes automatizados**. Os **16 diagnósticos** não reproduziram os defeitos que verificam. Isso não certifica ausência de outros problemas nem substitui avaliação pedagógica.

## Correções verificadas

- Gravações serializadas e idempotentes, validação dos registros, preservação de dados corrompidos, recuperação e tentativa de salvar novamente.
- Uso individual com reset de progresso e atividades em andamento, com confirmação. Cadastro de perfis e exportação foram retirados a pedido do usuário.
- Retomada de atividade, reinício com confirmação e tempo pausado fora da atividade, em segundo plano e durante feedback.
- Precisão calculada por tentativas; autoavaliação de flashcards separada.
- Dificuldade explícita na teoria e quarenta lacunas, dez por tema. Seleções mostram quantidades e evitam iniciar níveis vazios.
- Tutor intermediado pelo servidor, sem credencial pública, com entrada, contexto, saída, tempo e uso limitados. O beta atual mantém Gemini, aviso de privacidade, filtros de segurança solicitados na API e denúncia de respostas dentro do app. Erros ficam separados das respostas.
- Desafio em sequência de níveis com meta de 80%; quiz mantém treino por nível.
- Equações renderizadas, terminologia, referências de apoio e esquemas interativos mantidos. Exemplos e conceitos problemáticos receberam correções documentadas abaixo.
- Paleta compartilhada com Tailwind, componentes formatados e workflow de CI criado.

## O que permanece aberto

- **A10 — A árvore instalada contém alertas de segurança a triar:** Atualizadas dependências compatíveis com o SDK 54. A auditoria atual contém 48 alertas (27 altos, 21 moderados), sem críticos. Os dois críticos da árvore inicial foram eliminados. Permanecem avisos em ferramentas como braces, postcss e node-forge e em cadeias do Expo/React Native. Algumas correções propostas exigem mudança maior de SDK ou não têm versão compatível disponível; não foi usado audit fix --force. Esta triagem não declara o build ou runtime livres de riscos.
- **A19 — A teoria se concentra em poucos assuntos:** A teoria foi revisada e ampliada de 20 para 32 textos, com 12 fundamentos novos, percurso ordenado, pré-requisitos navegáveis e separação entre essencial e aprofundamento. Cada texto inclui objetivo, equívoco corrigido e pergunta de reflexão. Três roteiros do PhET pedem prever, observar e explicar. O equilíbrio curricular e a adequação à turma ainda precisam de validação docente.
- **A20 — Os exemplos precisam de revisão científica e didática:** Todos os bancos passaram por revisão editorial e científica assistida por IA: teoria, exemplos, quiz, desafio, flashcards, memória e lacunas. Corrigidas distinções entre campo e força, B e H, remanência e histerese, tensão e corrente induzidas, energia e potência e hipóteses de modelos. As contas dos vinte exemplos originais/substituídos e de novos exercícios têm regressões. Isto não representa aprovação por professor: a revisão docente e a avaliação com adolescentes continuam pendentes.
- **A22 — As referências não permitem verificar facilmente o material:** Bibliografia em formato ABNT, links e acesso em 18 out. 2026. Adicionada a obra College physics, de Urone e Hinrichs (2. ed., 2022), com metadados conferidos no site oficial. Novas atividades identificam elaboração do projeto e apoio conceitual, sem atribuir enunciados a provas ou livros. Persistem 17 exemplos herdados com origem exata não confirmada; a revisão não inventou páginas ou autoria.
- **A25 — A recuperação de falha da simulação é limitada:** Incluídos recarregar, abertura externa, timeout de carregamento e tratamento de erro HTTP na implementação nativa. O cabeçalho passou a usar a área segura compartilhada. Recarga e abertura do experimento foram verificadas na web; falta validar falhas de rede e layout em aparelhos Android/iOS.
- **A28 — O tutor não está vinculado ao conteúdo revisado:** O tutor recebe trechos do material e restringe as respostas a eletromagnetismo. O backend permite escolher o provedor pela configuracao. A versao beta atual mantem Gemini, aviso de privacidade, filtros de seguranca solicitados na API, limites de uso, bloqueio de padroes de dados pessoais e denuncia dentro do aplicativo. Os controles passaram em testes simulados; a chave local foi recusada pelo Google por exposicao e a geracao real permanece pendente. A adequacao contratual do uso escolar esta registrada nos termos e depende do responsavel.
- **A30 — Há controles sem todos os estados de acessibilidade:** Mantidos rótulos e estados de expansão, equações e esquemas com descrição e face única no flashcard. Modais agora anunciam conteúdo modal e permitem rolagem longa com ação acessível. A validação completa de foco e leitores TalkBack/VoiceOver continua dependente de aparelhos. Memória e flashcards compartilham giro em 3D com suporte a movimento reduzido e face oculta fora da leitura acessível. As duas cartas ficam abertas sem limite de tempo antes do feedback manual.
- **A31 — Alguns textos continuam pequenos:** Textos pequenos de 10–13 px das telas e controles foram ampliados para pelo menos 14 px, com ajustes de entrelinha; rótulos de esquemas matemáticos mantêm tratamento próprio. Ainda é necessário validar ampliação de fonte do sistema e telas pequenas em aparelhos reais.

Os testes automatizados do tutor usam provedor simulado, sem gastar créditos. Após a preparação de uma migração para OpenAI em 22 de outubro, o responsável pediu para manter a integração atual em 23 de outubro. A chave Gemini local foi recusada pelo Google como exposta; a geração real permanece pendente. O pacote beta preserva a tela e a conexão com o servidor. As cotas em memória valem por instância e não constituem um teto financeiro global.

## Evidências e limites

A [matriz de verificação](./VERIFICACAO.md) distingue implementação, plataforma e evidência. Veja os [resultados do diagnóstico](./auditoria/resultados.json), os [testes executáveis](./tests/), a [auditoria de dependências registrada](./auditoria/dependencias-atual.json) e a [verificação da interface](./auditoria/verificacao-interface.json). A saída bruta dos testes é gerada localmente em auditoria/testes.tap e não integra o código versionado.

A árvore inicial apresentava 56 avisos no recorte omit=dev. A atualização atual da árvore completa apresenta **48 alertas: 0 críticos, 27 altos e 21 moderados**. Os recortes são distintos; as contagens não equivalem a falhas exploráveis no aplicativo final. Os críticos iniciais de shell-quote e tar foram eliminados, mas a atualização não encerra A10. Não foi usado audit fix --force. A atualização de SDK seguirá a [orientação do Expo](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) com testes de compatibilidade, em vez de declarar solucionadas dependências sem correção adequada nesta árvore.

O beta atual mantém a [Gemini API](https://ai.google.dev/api/generate-content), com filtros de segurança solicitados para entrada e saída. A retenção de dados e as condições de uso seguem os termos do serviço e a configuração da conta. A adequação contratual para o público escolar está pendente e foi informada ao responsável. Receber trechos do material não garante a correção de uma resposta; fontes de apoio não são atribuídas automaticamente como origem de uma afirmação.

## Identidade visual preservada

A logo e os ícones originais permanecem preservados. A paleta segue o [manual da UNIVASF](https://portais.univasf.edu.br/comunicacao/ManualdeIdentidadeVisualUniversidadeFederaldoValedoSoFranciscoUnivasf.pdf): azul #0289E0 e amarelo #F9AC03. Controles usam azul derivado #0066A6, com contraste 6,08:1 sobre branco; a marca original mantém seus pixels. Isso não representa aprovação institucional.

O início permanece com Estudar, Praticar e Simulações. A preferência por evitar aparência genérica de IA é traduzida em rótulos diretos, poucas decisões por tela, tipografia legível e elementos visuais que explicam física. A direção é informada pela [pesquisa com adolescentes da NN/G](https://www.nngroup.com/articles/usability-of-websites-for-teenagers/) e pela [avaliação de protótipos gerados por IA](https://www.nngroup.com/articles/ai-prototyping/). A validação com o público brasileiro do TCC continua necessária.

## Cobertura atual

| Tema | Teoria | Quiz | Desafio | Flashcards | Pares | Lacunas |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Magnetismo | 10 | 15 | 6 | 10 | 8 | 10 |
| Eletrodinâmica | 12 | 15 | 6 | 10 | 8 | 10 |
| Eletrostática | 6 | 15 | 6 | 10 | 8 | 10 |
| Ondas eletromagnéticas | 4 | 15 | 6 | 10 | 8 | 10 |
| Total | 32 | 60 | 24 | 40 | 32 | 40 |

O catálogo tem 16 simulações externas. Os endereços responderam à conferência anterior, e Gerador foi verificado na web. Não foram testados todos os controles de todos os experimentos. Há quatro tipos de esquemas em cinco conteúdos e 60 expressões matemáticas pré-renderizadas. Quinze exemplos têm origem editorial identificada; a origem exata dos dezessete exemplos herdados restantes continua em conferência. A revisão completa está em [REVISAO_PEDAGOGICA.md](./REVISAO_PEDAGOGICA.md).

## Mapa de achados

### Segurança e IA

#### A01 A chave da IA é distribuída no cliente

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Quando configurada em EXPO_PUBLIC_GEMINI_API_KEY, a credencial entra no aplicativo distribuído e a requisição sai diretamente para o Google. Isso permite extrair e reutilizar a chave. A cópia não recebeu a chave local da versão original.

**Situação atual:** A credencial foi retirada do cliente. A integração passa pelo servidor /api/tutor, com chave em cabeçalho privado, limites e validação de entrada. Middleware local, servidor separado e função Vercel foram incluídos; nenhuma publicação foi executada. O teste verifica que a chave não aparece na URL nem nos erros. Produção com múltiplas instâncias ainda precisa de cotas compartilhadas.

**Evidência atual:** [services/iaService.ts:5](services/iaService.ts#L5), [server/tutor.cjs:19](server/tutor.cjs#L19), [tests/tutor.test.cjs:9](tests/tutor.test.cjs#L9).

#### A26 Mensagens de falha entram no histórico como respostas da IA

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Erro de rede, limite ou configuração retorna uma string. O hook a grava como mensagem enviada pelo assistente e a inclui no contexto das próximas perguntas. A interface também fala em arquivo .env para o estudante.

**Situação atual:** O serviço lança erros separados e o chat os mostra em aviso fora das mensagens do assistente. Falhas não são reenviadas como explicações da IA. Configuração interna e chave não aparecem para o aluno.

**Evidência atual:** [services/iaService.ts:56](services/iaService.ts#L56), [hooks/useChat.ts:27](hooks/useChat.ts#L27), [tests/tutor.test.cjs:21](tests/tutor.test.cjs#L21).

#### A27 Não há limite de tamanho da conversa nem do envio

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** O histórico completo é enviado a cada pergunta, sem limite de caracteres ou janela de contexto. Não há backend para limitar uso ou custo, e isTyping depende de atualização assíncrona de estado.

**Situação atual:** Entrada limitada a 2.000 caracteres, janela de contexto limitada, corpo até 32 KiB e saída limitada. Há bloqueio imediato por AbortController, cancelamento, limpeza na troca de perfil e limites de uso no servidor. O orçamento em memória vale por instância e exige solução compartilhada em produção distribuída.

**Evidência atual:** [hooks/useChat.ts:36](hooks/useChat.ts#L36), [server/tutor.cjs:26](server/tutor.cjs#L26), [tests/tutor.test.cjs:9](tests/tutor.test.cjs#L9).

#### A28 O tutor não está vinculado ao conteúdo revisado

**P2 · Parcial**. Origem: Base Cursor.

**Constatação inicial:** A instrução pede uma explicação de física, mas não fornece o material do app, critérios de fontes ou uma sequência didática. Respostas externas podem contradizer o conteúdo. Não foi feita avaliação com API real nem com alunos.

**Situação atual:** O tutor recebe trechos do material e restringe as respostas a eletromagnetismo. O backend permite escolher o provedor pela configuracao. A versao beta atual mantem Gemini, aviso de privacidade, filtros de seguranca solicitados na API, limites de uso, bloqueio de padroes de dados pessoais e denuncia dentro do aplicativo. Os controles passaram em testes simulados; a chave local foi recusada pelo Google por exposicao e a geracao real permanece pendente. A adequacao contratual do uso escolar esta registrada nos termos e depende do responsavel.

**Evidência atual:** [server/politica-tutor.cjs:7](server/politica-tutor.cjs#L7), [constants/assistente.ts:1](constants/assistente.ts#L1), [tests/tutor.test.cjs:25](tests/tutor.test.cjs#L25).

### Dados e conteúdo

#### A02 Uma dificuldade inválida esconde uma questão e quebra o selo de nível

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** A questão eld_q_005 usa difícil com acento. O filtro por dificil não a encontra; ao alcançá-la em Todas, o selo recebe um valor sem configuração e tenta acessar backgroundColor de undefined.

**Situação atual:** Padronizado o nível da questão eld_q_005 para dificil. O selo tem fallback para valores inesperados. A suíte verifica os 20 níveis e a seleção de Eletrodinâmica em Difícil e Todas.

**Evidência atual:** [data/questoes.json:681](data/questoes.json#L681), [components/BadgeDificuldade.tsx:37](components/BadgeDificuldade.tsx#L37), [tests/learning.test.cjs:46](tests/learning.test.cjs#L46).

#### A11 A dificuldade da teoria depende da ordem dos arquivos

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** O algoritmo distribui os 20 textos em três blocos pela posição. Assim, Eletrostática e Ondas ficam inteiramente em Difícil. Reordenar o JSON muda o nível sem alterar o conteúdo.

**Situação atual:** Os 32 textos possuem dificuldade explícita, objetivos, percurso essencial/aprofundamento e ordem de estudo. A classificação não depende da posição no JSON; os pré-requisitos são conferidos contra ciclos e ordem inválida. A calibração final ainda depende do professor.

**Evidência atual:** [data/teoria.json:54](data/teoria.json#L54), [hooks/useConteudoTeorico.ts:86](hooks/useConteudoTeorico.ts#L86), [tests/persistence.test.cjs:64](tests/persistence.test.cjs#L64).

#### A17 A cobertura de lacunas é desigual

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Há 10 frases de Magnetismo, 9 de Eletrodinâmica, 1 de Ondas e nenhuma de Eletrostática. Em Ondas, os níveis Fácil e Médio ficam vazios; o aluno consegue selecioná-los, mas não começar.

**Situação atual:** O banco de lacunas passou a quarenta itens: dez em cada um dos quatro temas, com os três níveis presentes. A seleção exibe quantidades e desabilita níveis sem itens. Os novos itens têm elaboração assistida por IA identificada e referência de apoio, sem atribuir uma origem externa inventada.

**Evidência atual:** [data/lacunas.json:360](data/lacunas.json#L360), [components/GameSetup.tsx:195](components/GameSetup.tsx#L195), [tests/persistence.test.cjs:56](tests/persistence.test.cjs#L56).

#### A18 A validação de lacunas rejeita pontuação simples

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** A normalização trata maiúsculas, acentos e espaços, mas monopolo. não corresponde a monopolo. Respostas semanticamente equivalentes dependem de uma lista fechada de variantes.

**Situação atual:** A normalização tolera pontuação terminal, aspas, espaços, acentos e maiúsculas. Não remove sinais matemáticos: -2 continua diferente de 2. Respostas vazias não são contabilizadas.

**Evidência atual:** [utils/normalizarResposta.ts:1](utils/normalizarResposta.ts#L1), [tests/persistence.test.cjs:56](tests/persistence.test.cjs#L56).

#### A19 A teoria se concentra em poucos assuntos

**P2 · Parcial**. Origem: Base Cursor.

**Constatação inicial:** Dos 20 textos, 8 são de Magnetismo, 8 de Eletrodinâmica, 2 de Eletrostática e 2 de Ondas. A organização reúne relutância e indutância mútua sem uma trilha explícita de pré-requisitos.

**Situação atual:** A teoria foi revisada e ampliada de 20 para 32 textos, com 12 fundamentos novos, percurso ordenado, pré-requisitos navegáveis e separação entre essencial e aprofundamento. Cada texto inclui objetivo, equívoco corrigido e pergunta de reflexão. Três roteiros do PhET pedem prever, observar e explicar. O equilíbrio curricular e a adequação à turma ainda precisam de validação docente.

**Evidência atual:** [REVISAO_PEDAGOGICA.md:49](REVISAO_PEDAGOGICA.md#L49), [tests/content.test.cjs:32](tests/content.test.cjs#L32).

#### A20 Os exemplos precisam de revisão científica e didática

**P2 · Parcial**. Origem: Base Cursor.

**Constatação inicial:** Um exemplo chama de íon um objeto de 0,001 kg e 2 C. O conteúdo de toroide apresenta B, mas resolve um exemplo em H. Isso exige explicitar hipóteses, unidades e a diferença entre as grandezas. São pontos para revisão docente; a auditoria não certifica a validade científica de todos os textos.

**Situação atual:** Todos os bancos passaram por revisão editorial e científica assistida por IA: teoria, exemplos, quiz, desafio, flashcards, memória e lacunas. Corrigidas distinções entre campo e força, B e H, remanência e histerese, tensão e corrente induzidas, energia e potência e hipóteses de modelos. As contas dos vinte exemplos originais/substituídos e de novos exercícios têm regressões. Isto não representa aprovação por professor: a revisão docente e a avaliação com adolescentes continuam pendentes.

**Evidência atual:** [REVISAO_PEDAGOGICA.md:26](REVISAO_PEDAGOGICA.md#L26), [tests/content.test.cjs:80](tests/content.test.cjs#L80), [auditoria/revisao-conteudo.json:3](auditoria/revisao-conteudo.json#L3).

#### A22 As referências não permitem verificar facilmente o material

**P2 · Parcial**. Origem: Base Cursor.

**Constatação inicial:** Muitas fontes são descrições abreviadas, como instituição, parte e problema, sem link, edição ou referência bibliográfica completa. A interface exibe a string sem navegação para o material.

**Situação atual:** Bibliografia em formato ABNT, links e acesso em 18 out. 2026. Adicionada a obra College physics, de Urone e Hinrichs (2. ed., 2022), com metadados conferidos no site oficial. Novas atividades identificam elaboração do projeto e apoio conceitual, sem atribuir enunciados a provas ou livros. Persistem 17 exemplos herdados com origem exata não confirmada; a revisão não inventou páginas ou autoria.

**Evidência atual:** [data/referencias.json:40](data/referencias.json#L40), [components/References.tsx:8](components/References.tsx#L8), [REVISAO_PEDAGOGICA.md:47](REVISAO_PEDAGOGICA.md#L47).

#### A37 Imagens didáticas não estão integradas aos conteúdos

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** O requisito original menciona imagens e fórmulas, mas o esquema e a tela de teoria contemplam texto e fórmulas, sem campo ou componente para imagens didáticas. As imagens de marca do app não atendem a essa necessidade do conteúdo.

**Situação atual:** O esquema de conteúdo passou a aceitar um diagrama didático. Há quatro esquemas vetoriais interativos em cinco conteúdos: força magnética, Coulomb, Faraday/Lenz e ondas. Todos possuem legenda e descrição textual e são identificados como esquemas sem escala.

**Evidência atual:** [hooks/useConteudoTeorico.ts:60](hooks/useConteudoTeorico.ts#L60), [components/PhysicsDiagram.tsx:388](components/PhysicsDiagram.tsx#L388), [data/teoria.json:53](data/teoria.json#L53).

### Simulações

#### A03 A simulação não tem implementação web

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** A rota usa react-native-webview em todas as plataformas. Ao abrir Gerador pela interface da prévia, a tela mostrou React Native WebView does not support this platform, confirmando a falta de implementação web. A listagem e os detalhes funcionaram, mas o experimento não abriu.

**Situação atual:** Separada a implementação web com iframe da implementação nativa com WebView. O Gerador carregou dentro da prévia; pausa e recarga responderam na verificação de interface. A implementação nativa ainda precisa de teste em aparelho.

**Evidência atual:** [components/SimulationViewer.web.tsx:10](components/SimulationViewer.web.tsx#L10), [components/SimulationViewer.tsx:16](components/SimulationViewer.tsx#L16), [app/estudar/phet/simulacao.tsx:15](app/estudar/phet/simulacao.tsx#L15).

#### A24 A rota aceita um endereço de WebView arbitrário

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** O endereço vem do parâmetro url. Não há validação explícita de HTTPS e do domínio PhET nem controle de navegações posteriores. A existência do parâmetro é confirmada; exploração maliciosa não foi executada.

**Situação atual:** A abertura usa um ID do catálogo e valida protocolo HTTPS, domínio e caminho do PhET. Links antigos só são aceitos se corresponderem ao catálogo. Os testes rejeitam domínios falsos, credenciais na URL e protocolos não permitidos.

**Evidência atual:** [utils/simulacoes.ts:3](utils/simulacoes.ts#L3), [tests/learning.test.cjs:130](tests/learning.test.cjs#L130).

#### A25 A recuperação de falha da simulação é limitada

**P2 · Parcial**. Origem: Base Cursor.

**Constatação inicial:** A tela só trata onError, apresenta uma mensagem e não oferece recarregar. Não trata explicitamente erro HTTP. O cabeçalho absoluto usa deslocamento fixo, sem considerar a área segura do aparelho.

**Situação atual:** Incluídos recarregar, abertura externa, timeout de carregamento e tratamento de erro HTTP na implementação nativa. O cabeçalho passou a usar a área segura compartilhada. Recarga e abertura do experimento foram verificadas na web; falta validar falhas de rede e layout em aparelhos Android/iOS.

**Evidência atual:** [app/estudar/phet/simulacao.tsx:233](app/estudar/phet/simulacao.tsx#L233), [components/SimulationViewer.tsx:22](components/SimulationViewer.tsx#L22).

### Jogos e progresso

#### A04 O relógio continua depois de concluir a atividade

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** O intervalo só termina na desmontagem. O teste concluiu o quiz com 0 segundos, avançou o relógio virtual e encontrou 10 segundos na tela, enquanto o histórico continuou com 0. O tempo apresentado no resultado pode divergir do registrado.

**Situação atual:** O controlador compartilhado interrompe o relógio na conclusão. Os cinco modos persistem o mesmo tempo exibido no resultado e o teste avança o relógio após concluir.

**Evidência atual:** [hooks/useLearningSession.ts:148](hooks/useLearningSession.ts#L148), [tests/learning.test.cjs:90](tests/learning.test.cjs#L90).

#### A05 Uma mesma pergunta pode ser contabilizada duas vezes

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** No hook de flashcards, duas chamadas contam duas respostas sem avançar o cartão, mesmo com feedback aberto. No quiz, duas chamadas no mesmo lote de atualização encerram uma sessão de duas questões ainda na primeira. Os casos foram reproduzidos em teste de hook; a incidência de toque duplo em aparelhos ainda precisa de medição.

**Situação atual:** Respostas e avanços são verificados em atualizações funcionais atômicas por item. Cliques repetidos no mesmo lote não duplicam a pontuação. A memória também calcula o par no estado mais recente.

**Evidência atual:** [hooks/useQuizSession.ts:157](hooks/useQuizSession.ts#L157), [hooks/useMemoriaGame.ts:181](hooks/useMemoriaGame.ts#L181), [tests/learning.test.cjs:57](tests/learning.test.cjs#L57).

#### A09 A tela afirma que salvou antes de confirmar a gravação

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Os quatro hooks disparam a gravação sem aguardar nem apresentar falha. savedRef é marcado antes do término. Se o armazenamento recusar a escrita, não há nova tentativa e a interface pode continuar afirmando que o resultado foi salvo.

**Situação atual:** Os cinco modos mostram salvando, salvo ou erro conforme o término real da escrita. Há nova tentativa idempotente. O teste simula falha, verifica que nada foi anunciado como salvo e repete a gravação sem duplicar registros.

**Evidência atual:** [components/SessionStatus.tsx:53](components/SessionStatus.tsx#L53), [hooks/useLearningSession.ts:67](hooks/useLearningSession.ts#L67), [tests/persistence.test.cjs:46](tests/persistence.test.cjs#L46).

#### A14 A porcentagem mistura conclusão com precisão

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** No jogo da memória, dois pares encontrados após sete tentativas erradas produzem 100% de acertos, porque o denominador é o número de pares. Quiz e autoavaliação de flashcards medem coisas diferentes, mas entram na mesma média.

**Situação atual:** Precisão agora significa acertos divididos por tentativas. Dois pares após sete erros resultam em 22%, sem misturar autoavaliação de flashcards. Cartões lembrados e a revisar aparecem separadamente. A definição é comunicada na tela.

**Evidência atual:** [services/progressoService.ts:117](services/progressoService.ts#L117), [tests/persistence.test.cjs:22](tests/persistence.test.cjs#L22), [app/(tabs)/progresso/index.tsx:139](app/%28tabs%29/progresso/index.tsx#L139).

#### A15 Uma atividade interrompida não pode ser retomada

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Só o resultado final é persistido. Sair da rota ou reiniciar o app descarta a sessão em andamento; reiniciar o jogo também limpa o estado imediatamente.

**Situação atual:** O estado em andamento é salvo por perfil e versão de conteúdo, incluindo ordem da memória, resposta, feedback e tempo. Há retomada automática e confirmação antes de reiniciar. O teste desmonta e reabre uma atividade. A saída das atividades agora tem acesso explícito ao início; virar uma primeira carta e sair antes de um segundo também preserva a seleção, conforme nova regressão.

**Evidência atual:** [services/sessoesService.ts:46](services/sessoesService.ts#L46), [hooks/useLearningSession.ts:91](hooks/useLearningSession.ts#L91), [components/BotaoReiniciar.tsx:6](components/BotaoReiniciar.tsx#L6), [tests/persistence.test.cjs:34](tests/persistence.test.cjs#L34).

#### A16 O tempo não distingue atividade de espera

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Não existe integração com foco de navegação ou AppState para a contagem. Enquanto a tela permanecer montada, feedbacks e períodos sem interação são tratados como estudo. O comportamento em segundo plano depende do sistema operacional.

**Situação atual:** O relógio considera foco da rota, AppState e feedback. Pausa em segundo plano e fora da atividade, e o andamento é gravado ao perder foco. O teste verifica fundo, retorno, perda de foco e feedback.

**Evidência atual:** [hooks/useAtividadeVisivel.ts:5](hooks/useAtividadeVisivel.ts#L5), [hooks/useLearningSession.ts:54](hooks/useLearningSession.ts#L54), [tests/persistence.test.cjs:34](tests/persistence.test.cjs#L34).

#### A35 Desafio e quiz têm praticamente a mesma dinâmica

**P3 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** As duas telas usam a mesma sequência, perguntas e cálculo de pontuação. O parâmetro modo diferencia o tipo salvo, sem uma regra adicional de desafio.

**Situação atual:** Quiz e desafio agora têm bancos separados: 60 itens de treino e 24 situações próprias de aplicação. O desafio seleciona cinco questões em progressão de nível e exige quatro acertos para a meta de 80%. Sessões usam rodízio e preservam a seleção e as alternativas quando retomadas.

**Evidência atual:** [data/desafios.json:9](data/desafios.json#L9), [hooks/useQuizSession.ts:225](hooks/useQuizSession.ts#L225), [tests/content.test.cjs:50](tests/content.test.cjs#L50).

### Armazenamento

#### A06 Gravações simultâneas perdem registros

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Duas operações leem o mesmo histórico, adicionam um resultado e sobrescrevem o arquivo lógico uma da outra. No teste, foram solicitadas duas gravações e apenas uma permaneceu.

**Situação atual:** As gravações são serializadas por chave e uma falha não bloqueia as seguintes. O teste grava vinte sessões simultâneas e preserva as vinte. A proteção vale dentro do processo do app, sem sincronização entre abas ou aparelhos.

**Evidência atual:** [services/storage.ts:5](services/storage.ts#L5), [tests/persistence.test.cjs:6](tests/persistence.test.cjs#L6).

#### A07 JSON válido com formato errado interrompe o histórico

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** A conversão de tipo não valida o conteúdo em execução. Armazenar {} faz obterResumo lançar registros is not iterable. Também faltam verificações de campos, números e datas.

**Situação atual:** Validação em execução confere estrutura, tipos, números, datas, atividade e nível antes de ler ou gravar. Dados inválidos são recusados e preservados.

**Evidência atual:** [services/progressoService.ts:55](services/progressoService.ts#L55), [tests/persistence.test.cjs:13](tests/persistence.test.cjs#L13).

#### A08 Histórico corrompido é tratado como vazio e sobrescrito

**P1 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Quando o JSON não pode ser lido, o serviço devolve uma lista vazia. A gravação seguinte substitui o valor corrompido sem oferecer recuperação ou informar o ocorrido.

**Situação atual:** Dados inválidos não são tratados como histórico vazio e não são sobrescritos silenciosamente. O serviço preserva cópias anteriores e permite recuperação técnica, coberta por testes. A interface foi simplificada por solicitação do usuário e oferece somente reset com confirmação, sem exportação nem restauração pelo aluno.

**Evidência atual:** [services/progressoService.ts:215](services/progressoService.ts#L215), [components/ProfileControls.tsx:60](components/ProfileControls.tsx#L60), [tests/persistence.test.cjs:13](tests/persistence.test.cjs#L13).

#### A12 O mesmo tema vira grupos diferentes no progresso

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Quiz salva Magnetismo; lacunas e as novas seleções de flashcards podem salvar magnetismo. O teste criou dois grupos para o mesmo assunto, dividindo o gráfico e a agregação.

**Situação atual:** Módulos são normalizados para identificadores sem acentos durante leitura e gravação. Registros antigos com título e slug são agrupados no mesmo tema.

**Evidência atual:** [utils/identificadores.ts:8](utils/identificadores.ts#L8), [tests/persistence.test.cjs:22](tests/persistence.test.cjs#L22).

#### A13 IDs de resultados colidem no mesmo milissegundo

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** O ID depende apenas de tipo, módulo e Date.now. Com relógio fixado no mesmo milissegundo, duas gravações seriais resultaram em dois registros com um único ID, prejudicando chaves de listas e futuras operações por registro.

**Situação atual:** Cada sessão recebe ID com contador e sufixo aleatório, além do tempo. O mesmo ID é reutilizado em tentativas de gravação. O teste fixa o relógio e confirma IDs diferentes para sessões distintas e uma gravação para a mesma sessão.

**Evidência atual:** [utils/identificadores.ts:3](utils/identificadores.ts#L3), [services/progressoService.ts:183](services/progressoService.ts#L183), [tests/persistence.test.cjs:6](tests/persistence.test.cjs#L6).

#### A29 O histórico não distingue alunos em um aparelho compartilhado

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** Todos os resultados usam uma única chave local. Não existe identificação de sessão de aluno, exportação ou ação de limpeza na tela de progresso. Em um dispositivo escolar compartilhado, os resultados podem ser misturados.

**Situação atual:** O usuário definiu uso individual com reset manual. Foram removidas da interface a criação/troca de perfis e a exportação de progresso. Progresso oferece somente Resetar meus dados, com confirmação e tratamento de falha. Identificadores internos existentes são preservados para não perder o histórico; esta alteração não apagou dados. Em aparelho compartilhado, a separação de alunos depende do reset manual.

**Evidência atual:** [components/ProfileControls.tsx:72](components/ProfileControls.tsx#L72), [context/PerfilContext.tsx:27](context/PerfilContext.tsx#L27), [services/progressoService.ts:228](services/progressoService.ts#L228).

### Dependências e validação

#### A10 A árvore instalada contém alertas de segurança a triar

**P1 · Parcial**. Origem: Base Cursor.

**Constatação inicial:** npm audit --omit=dev sinalizou 56 pacotes: 2 críticos, 36 altos, 17 moderados e 1 baixo. Os críticos incluem shell-quote e tar. A árvore inclui ferramentas de compilação, mesmo com omit=dev; a contagem não representa 56 falhas exploráveis no aplicativo final.

**Situação atual:** Atualizadas dependências compatíveis com o SDK 54. A auditoria atual contém 48 alertas (27 altos, 21 moderados), sem críticos. Os dois críticos da árvore inicial foram eliminados. Permanecem avisos em ferramentas como braces, postcss e node-forge e em cadeias do Expo/React Native. Algumas correções propostas exigem mudança maior de SDK ou não têm versão compatível disponível; não foi usado audit fix --force. Esta triagem não declara o build ou runtime livres de riscos.

**Evidência atual:** [auditoria/dependencias-atual.json:3](auditoria/dependencias-atual.json#L3), [package-lock.json:8234](package-lock.json#L8234).

#### A32 Quatro pacotes estão fora da faixa recomendada pelo Expo

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** expo install --check pediu expo ~54.0.37, expo-constants ~18.0.14, expo-font ~14.0.12 e expo-router ~6.0.24. A instalação atual é 54.0.34, 18.0.13, 14.0.11 e 6.0.23, respectivamente.

**Situação atual:** Pacotes alinhados às recomendações do SDK 54 e dependências Babel usadas no projeto declaradas explicitamente. expo install --check retornou que as dependências estão atualizadas. Compilação e exportações foram repetidas; isto não elimina os alertas de segurança registrados em A10.

**Evidência atual:** [package-lock.json:14](package-lock.json#L14), [package.json:58](package.json#L58).

#### A33 A base não possuía testes funcionais executáveis

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** O teste herdado é um snapshot do texto padrão do scaffold, sem comando test ou configuração de execução no pacote. TypeScript e exportação web não verificam pontuação, gravação, dados e recuperação. O diagnóstico criado nesta auditoria reproduz falhas, mas ainda não é uma suíte de regressão das correções.

**Situação atual:** A suíte atual inclui 35 testes de conteúdo, jogos, armazenamento, retomada, perfis e servidor. Verifica bancos separados, gabaritos, pré-requisitos, rodízio, ordem persistida, alternativas estáveis e autoavaliação após virar o flashcard. O workflow executa testes e exportações; nenhuma execução remota foi presumida. A memória em Todas percorre os três níveis e a resposta fixa de recusa do tutor também possuem regressões. Novas regressões verificam leitura das duas cartas, continuação pela terceira carta, preservação e retomada dos pares corretos, cobertura de todos os pares em rodadas e conclusão somente depois da confirmação do último par.

**Evidência atual:** [tests/content.test.cjs:13](tests/content.test.cjs#L13), [tests/persistence.test.cjs:6](tests/persistence.test.cjs#L6), [.github/workflows/verificar.yml:24](.github/workflows/verificar.yml#L24).

#### A34 O checklist herdado declara validações que não estão comprovadas

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** O checklist marca requisitos como implementados e contém modelo Gemini, chave de armazenamento e navegação desatualizados. A implementação web de PhET é um exemplo de lacuna que a marcação não revela.

**Situação atual:** O checklist herdado continua identificado como histórico. Criada matriz atual com requisito, evidência e limite da verificação para web, bundle nativo, IA, armazenamento, acessibilidade e validação pedagógica.

**Evidência atual:** [VERIFICACAO.md:1](VERIFICACAO.md#L1), [CHECKLIST_FINAL.md:3](CHECKLIST_FINAL.md#L3).

### Leitura e acessibilidade

#### A21 Fórmulas aparecem como código LaTeX cru

**P2 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** A interface mostra comandos de formatação em vez de equações renderizadas. Isso adiciona leitura técnica desnecessária e pode dificultar a compreensão de frações e expoentes.

**Situação atual:** As 60 expressões distintas de teoria, resoluções e flashcards são pré-renderizadas em SVG local. Tópicos conceituais podem não ter equação; não há preenchimento artificial desse campo. A expressão da seção de resposta no flashcard só aparece após virar o cartão; o enunciado pode fornecer uma relação para o aluno interpretar.

**Evidência atual:** [components/MathExpression.tsx:2](components/MathExpression.tsx#L2), [scripts/render-math.cjs:23](scripts/render-math.cjs#L23), [app/jogos/flashcards/[modulo].tsx:107](app/jogos/flashcards/%5Bmodulo%5D.tsx#L107).

#### A23 Metadados editoriais aparecem para o aluno

**P3 · Corrigido nesta revisão**. Origem: Base Cursor.

**Constatação inicial:** O texto Fonte externa necessária: sim/não é um indicador interno de produção do conteúdo, sem explicar uma ação útil ao estudante.

**Situação atual:** O indicador interno Fonte externa necessária foi retirado da tela. O aluno vê referências úteis e a informação sobre a confirmação da origem do exercício.

**Evidência atual:** [components/References.tsx:35](components/References.tsx#L35), [app/estudar/[modulo].tsx:239](app/estudar/%5Bmodulo%5D.tsx#L239).

#### A30 Há controles sem todos os estados de acessibilidade

**P2 · Parcial**. Origem: Base Cursor.

**Constatação inicial:** O exercício expansível não anuncia expanded; o campo de lacunas não tem rótulo acessível explícito; a animação de flashcard não oculta semanticamente a face inativa. Acessibilidade visual da página não substitui teste com leitor de tela.

**Situação atual:** Mantidos rótulos e estados de expansão, equações e esquemas com descrição e face única no flashcard. Modais agora anunciam conteúdo modal e permitem rolagem longa com ação acessível. A validação completa de foco e leitores TalkBack/VoiceOver continua dependente de aparelhos. Memória e flashcards compartilham giro em 3D com suporte a movimento reduzido e face oculta fora da leitura acessível. As duas cartas ficam abertas sem limite de tempo antes do feedback manual.

**Evidência atual:** [components/FeedbackModal.tsx:54](components/FeedbackModal.tsx#L54), [components/ConfirmDialog.tsx:2](components/ConfirmDialog.tsx#L2), [components/FlashCard.tsx:93](components/FlashCard.tsx#L93).

#### A31 Alguns textos continuam pequenos

**P2 · Parcial**. Origem: Revisão visual anterior.

**Constatação inicial:** Selos e descrições de telas internas ainda usam 10 a 12 px, herdados da primeira revisão visual. O menu principal foi ampliado, mas não houve teste com ampliação de fonte e leitor de tela em todas as telas.

**Situação atual:** Textos pequenos de 10–13 px das telas e controles foram ampliados para pelo menos 14 px, com ajustes de entrelinha; rótulos de esquemas matemáticos mantêm tratamento próprio. Ainda é necessário validar ampliação de fonte do sistema e telas pequenas em aparelhos reais.

**Evidência atual:** [components/StudyUI.tsx:19](components/StudyUI.tsx#L19), [tailwind.config.js:8](tailwind.config.js#L8).

### Manutenção

#### A36 O tema e a composição visual estão duplicados

**P3 · Corrigido nesta revisão**. Origem: Base e revisões visuais.

**Constatação inicial:** Os tokens existem em TypeScript e no Tailwind, e telas usam vários valores locais. Há trechos TSX longos em uma linha. Isso dificulta revisar contraste e consistência em novas mudanças.

**Situação atual:** Paleta extraída para JSON compartilhado pelo código e Tailwind. Componentes, rotas e serviços foram formatados com Prettier, com comando reproduzível para novas edições. A logo original foi preservada.

**Evidência atual:** [constants/colors.ts:2](constants/colors.ts#L2), [tailwind.config.js:6](tailwind.config.js#L6), [package.json:27](package.json#L27).

### Visual corrigido

#### V01 Identidade institucional restaurada

**P2 · Corrigido nesta revisão**. Origem: Revisão visual anterior.

**Constatação inicial:** A primeira revisão introduziu uma paleta verde e um símbolo orbital no cabeçalho.

**Situação atual:** Restaurada a imagem original da UNIVASF, sem alterar seus pixels. Os ícones de instalação também foram preservados. Azul e amarelo voltaram ao tema.

**Evidência atual:** [app/(tabs)/index.tsx:10](app/%28tabs%29/index.tsx#L10).

#### V02 Menu inicial reduzido a três ações

**P2 · Corrigido nesta revisão**. Origem: Revisão visual anterior.

**Constatação inicial:** A tela anterior juntava destaque, seis atividades, quatro temas, progresso e tutor na mesma rolagem.

**Situação atual:** O início agora oferece Estudar, Praticar e Simulações. Os cinco jogos ficam na página Praticar; progresso e dúvidas permanecem na barra inferior.

**Evidência atual:** [app/(tabs)/index.tsx:10](app/%28tabs%29/index.tsx#L10).

#### V03 Linguagem promocional e decoração removidas

**P2 · Corrigido nesta revisão**. Origem: Revisão visual anterior.

**Constatação inicial:** Slogans, órbitas, brilhos e vários fundos pastel disputavam atenção com as ações.

**Situação atual:** A tela inicial e as aberturas das abas usam rótulos diretos. O assistente continua identificado como IA, sem dar a entender que a resposta foi validada por professor.

**Evidência atual:** [app/(tabs)/index.tsx:10](app/%28tabs%29/index.tsx#L10).

#### V04 Legibilidade das cores e instruções do menu ajustadas

**P2 · Corrigido nesta revisão**. Origem: Revisão visual anterior.

**Constatação inicial:** O azul oficial com texto branco pequeno não atinge 4,5:1; amarelo claro usado como texto também precisa de cuidado.

**Situação atual:** A marca mantém as cores oficiais. Controles usam azul derivado #0066A6 e fundos amarelos usam texto escuro; a ajuda foi atualizada para a nova navegação.

**Evidência atual:** [app/(tabs)/index.tsx:10](app/%28tabs%29/index.tsx#L10).

## Próximas validações

1. Orientador/professor: conferir todos os textos, enunciados, gabaritos e exemplos, registrando versão e aprovação. Confirmar o recorte e a origem bibliográfica por item.
2. Aparelhos Android/iOS: executar atividades, interrupção, teclado, rotação, PhET e leitores de tela. Bundle exportado e moldura web não equivalem a aplicativo instalado.
3. Tutor configurado: executar conjunto de perguntas revisado, conferir qualidade, moderação, falhas de rede e política do provedor antes do uso com estudantes.
4. Dependências: resolver alertas remanescentes por correção upstream ou migração compatível do SDK, mantendo as regressões.
5. Adolescentes: observar localização de conteúdo, início de atividade, compreensão do feedback e leitura do progresso.

## Reprodução

Na pasta independente, executar npm ci, npm run typecheck, npm test, npm run audit:app, npm run audit:report e npx expo install --check. Para conferir bundles, executar npx expo export --platform web --platform android. npm run preview abre a [prévia com moldura](http://127.0.0.1:8083/preview.html).

O diagnóstico usa armazenamento e relógio isolados. Não altera dados do aluno nem faz chamadas ao Gemini. O código original das pastas cursor e chatgpt não foi modificado nesta revisão. Os registros de validação local estão em auditoria; o workflow foi preparado, sem afirmar uma execução remota.
