# Correção da interface Android — FisicAI

Data: 28/10/2026. Versão relatada pelo usuário: beta aprovado no Google Play, 1.0.0-beta.1. Candidato à correção: 1.0.0-beta.2, código 2.

## Evidências e causa

Foram examinados os seis arquivos de `problemas loja ui/`. Os prints mostram:

- Início: ícones, textos e setas empilhados, sem o espaçamento das linhas.
- Estudar: cartões sem preenchimento, contorno e espaçamento; filtros sem a seleção preenchida.
- Conteúdo: passos de navegação com apresentação incompleta.
- Memória, seleção: temas sem alinhamento e botão de começar invisível.
- Memória, jogo: cartas reduzidas a linhas verticais estreitas, sem largura para seu conteúdo.
- Dúvidas: botão “Habilitar chat” invisível mesmo após marcar o aviso.

Todos esses elementos usam `Pressable` com `style={({ pressed }) => ...}`. A versão instalada de `react-native-css-interop` (0.2.7), usada pelo NativeWind, transforma a função antes que o componente nativo possa executá-la. Assim, todos os estilos retornados pela função são perdidos: não apenas a cor ao pressionar, mas dimensões, alinhamento, preenchimento e fundos. No jogo da memória, a perda de `width: "47%"` deixa as faces absolutas sem a largura esperada. No botão do chat, o texto branco perde seu fundo azul.

O teste `tests/android-styles.test.cjs` executa o runtime nativo real instalado, com a configuração Babel de produção e a ponte Android isolada. Primeiro reproduz a perda da função sem a correção. Depois verifica sua execução e os estilos com a correção. A causa tem registro no projeto upstream: https://github.com/nativewind/nativewind/issues/1105 e https://github.com/nativewind/nativewind/pull/1383.

## Correção

Foram protegidos 24 controles em 21 arquivos de telas/componentes com o mecanismo suportado `cssInterop={false}`. Esses controles já usam estilos nativos e não precisam de conversão CSS. As classes dos demais componentes continuam funcionando. O único controle que misturava classes e função, `ModuloCard`, teve apenas os estilos do contêiner externo convertidos para propriedades nativas equivalentes. Os elementos internos continuam usando suas classes.

Não houve troca de identidade visual. Logo, cores institucionais, conteúdo, progresso e regras dos jogos foram preservados. A falha anterior não foi descoberta pela validação no navegador; essa validação não comprovava a renderização nativa Android.

## Leitura de usabilidade dos problemas observados

| Grupo | Lei ou princípio | Gravidade | Problema e correção concreta |
| --- | --- | --- | --- |
| Decisões e escolhas | Lei de Hick | Importante | Níveis sem estado selecionado claro dificultavam a escolha. Restaurar fundo, borda e dimensões dos filtros. |
| Alvos e interação | Lei de Fitts | Crítica | Cartas estreitas e botões invisíveis impediam a interação. Restaurar largura das cartas, botões com pelo menos 44–50 unidades de altura e preenchimento. |
| Atenção e ênfase | Efeito Von Restorff | Crítica | O botão principal branco sobre branco desaparecia. Restaurar fundo institucional e contraste do texto. |
| Agrupamento e layout | Leis da Proximidade e Região Comum | Importante | Linhas e cartões perderam seu agrupamento e espaçamento. Restaurar alinhamento horizontal, contornos, preenchimento e intervalos. |
| Memória e cognição | Lei de Jakob e carga cognitiva | Importante | A organização diferia da prévia e das convenções de seleção de temas. Recuperar a apresentação já definida, sem impor um redesenho ao aluno. |
| Motivação e conclusão | Gradiente de meta | Importante | O jogo não podia ser iniciado/usado adequadamente. Restaurar os controles para permitir concluir rodadas e acompanhar o progresso existente. |

## Verificação

- 59 testes passaram, incluindo seis testes novos da regressão nativa.
- TypeScript passou sem erros.
- Cenários cobertos: reprodução do defeito, estado pressionado, botão habilitado/desabilitado, seleção de dificuldade, largura das cartas e duas faces do flip, e três destinos da página inicial.
- Verificação adicional impede novos `Pressable` com função de estilo sem proteção, ou com classes que seriam descartadas pela proteção.
- Os testes isolam a ponte nativa; não medem pixels nem substituem uma conferência visual em celular/emulador. Os prints fornecidos pelo usuário são a evidência do defeito na versão anterior.
- Compilação local concluída em 4 min 2 s; APK e AAB gerados. Assinatura APK v2 validada, pacote `com.fisicai.independente`, versão `1.0.0-beta.2`, código 2, Android mínimo 24, alvo 36. A busca pelas credenciais locais no conteúdo descompactado dos dois arquivos encontrou zero ocorrências.
- O APK foi instalado com sucesso no emulador Pixel 8a / Android API 37, com tradução arm64. O gerenciador de pacotes confirmou versão/código corretos. A captura da janela do emulador não forneceu a imagem do Android, por isso não foi registrada uma conferência visual como aprovada.
- O APK/AAB corrigido precisa ser conferido no Android antes de afirmar equivalência visual completa. A versão instalada pela Play Store só muda após envio e liberação de uma atualização.

## Compilação e histórico

A compilação continua local, com a mesma assinatura privada. A versão/código foram incrementados para preservar a possibilidade de atualização pelo Google Play. O script de compilação agora grava os registros na pasta da data atual, sem sobrescrever o manifesto da primeira publicação.

A aprovação da beta.1 foi informada pelo usuário em 28/10. Não foi feita nova consulta ao Play Console nesta investigação. O tutor continua dependente da configuração do servidor já documentada; esta correção não troca o provedor nem habilita uma credencial.

O acesso do navegador foi consultado, mas o host de acesso não estava disponível. Foi solicitada a reconexão da guia do Play Console. Não foi enviado pacote beta.2 ao Google nesta etapa.
