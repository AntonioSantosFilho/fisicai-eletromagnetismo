# Revisão pedagógica e científica do FisicAI

Revisão de 18/10/2026 da versão independente. Foram relidos os vinte textos e seus exemplos, vinte questões, vinte flashcards, vinte pares e quarenta lacunas disponíveis no início desta etapa. Os acréscimos também passaram por conferência editorial e verificações técnicas. A revisão é assistida por IA e não equivale a aprovação por professor, validação psicométrica ou teste com adolescentes.

## Diagnóstico que orientou a mudança

O material começava por relações matemáticas avançadas de magnetismo, enquanto faltavam fundamentos de carga, corrente, tensão, resistência, associações e consumo. Isso exigia do estudante conhecimentos que o próprio app não ensinava. A quantidade de equações não correspondia a uma progressão de aprendizagem.

Quiz e desafio consultavam o mesmo JSON e percorriam a mesma ordem. Com apenas cinco questões por tema, o aluno podia decorar a pergunta e sua posição. Vários cálculos repetiam números dos exemplos resolvidos. Flashcards e memória também reproduziam imprecisões entre modalidades, mesmo quando uma delas já havia sido corrigida.

Uma ideia reaparecer é útil quando o estudante precisa recordá-la, explicá-la, distingui-la de outra ou aplicá-la em uma situação diferente. Trocar apenas os números ou a posição da alternativa não garante essa variedade. Por isso a revisão combinou novos contextos, demandas cognitivas e representações.

## O que foi alterado

| Material | Antes desta etapa | Agora |
| --- | ---: | ---: |
| Textos teóricos | 20 | 32 |
| Questões de quiz | 20 | 60 |
| Questões próprias de desafio | 0; reutilizava quiz | 24 |
| Flashcards | 20 | 40 |
| Pares de memória | 20 | 32 |
| Lacunas | 40 | 40, todas revistas |

Os 228 registros atuais estão no [mapa completo por item](./auditoria/mapa-conteudo.csv) e na [versão estruturada](./auditoria/revisao-conteudo.json). Não há enunciados duplicados exatos normalizados entre quiz e desafio; isso não elimina a sobreposição conceitual, que é parcialmente intencional.

## Correções científicas e de linguagem

| Problema identificado | Tratamento aplicado |
| --- | --- |
| Histerese apresentada como simples magnetismo residual | Remanência passou a designar a resposta residual; histerese, a dependência da história de magnetização. A correção percorreu teoria, flashcards, memória e questões. |
| Tensão induzida tratada como garantia de corrente | Diferenciada força eletromotriz e corrente sustentada, considerando caminho condutor fechado e transitórios. |
| Transformador descrito como exigindo exclusivamente corrente alternada senoidal | Esclarecida a necessidade de fluxo variável e a distinção entre regime contínuo constante e variação/transitórios. |
| Campo elétrico chamado de força ou região vaga de influência | Campo e força foram diferenciados; a força depende da carga de prova e de seu sinal. |
| B e H tratados como equivalentes | Distinguidas grandezas e unidades: T e A/m. A relação constitutiva B = μH exige hipóteses sobre o meio. |
| Ampere-espira tratado como unidade SI independente | Explicitado que espiras são adimensionais e a unidade SI da força magnetomotriz é A; a nomenclatura não significa força em N. |
| Linhas e fluxo apresentados como entidades materiais | Explicadas as representações e a dependência do fluxo da superfície orientada. |
| Fórmulas aplicadas sem condições | Incluídos campo uniforme, geometria, regime não relativístico, núcleo linear, temperatura e limites das aproximações conforme o tópico. |
| Indutância descrita como medida mecânica ou “teimosia” | Substituída por relação entre corrente e fluxo concatenado e por autoindução ligada à variação da corrente. |
| Resistência constante generalizada para qualquer componente | Lei de Ohm apresentada como relação constitutiva de comportamento ôhmico sob condições definidas. |
| Corrente apresentada como consumo de elétrons | Conservação da carga separada da transformação de energia. |
| Potência confundida com energia | Diferenciadas W, J e kWh; considerado o tempo de uso; evitada a escrita kW/h para energia. |
| Toda onda eletromagnética descrita como propagando-se a c em qualquer meio | c restrito ao vácuo; em materiais são consideradas velocidade e frequência adequadas. |
| Espectro descrito como fenômenos “idênticos” que diferem somente em frequência | Incluídas amplitude, polarização e interações distintas com materiais. |
| Refração definida só por desvio de direção | Esclarecido que pode haver mudança de velocidade sem desvio na incidência normal; frequência permanece na interface estacionária. |
| Expressões de módulo sem valor absoluto da carga ou com sinal ambíguo | Revisados módulo, sentido, amplitudes e hipóteses; o período usa |q| para resultar positivo. |

A bibliografia continua em formato ABNT, com links e data de acesso. As fontes indicadas nas novas atividades são apoio conceitual, não atribuição de enunciados a provas ou livros. Persistem 17 exemplos herdados cuja origem exata não foi confirmada. Os exemplos novos ou substituídos identificam elaboração do projeto com assistência de IA.

## Como a teoria foi enriquecida

Cada um dos 32 textos apresenta objetivo observável, pré-requisitos, distinção entre essencial e aprofundamento, uma confusão comum acompanhada da correção e uma pergunta de reflexão com resposta inicialmente oculta. Os conceitos novos precedem os conteúdos que dependem deles. Tópicos qualitativos não recebem equações artificiais apenas para preencher a tela.

Foram acrescentados carga e conservação, eletrização e polarização, potencial e energia, condutores em equilíbrio, corrente e sentido convencional, resistência/Ohm, associações de resistores, potência/consumo, campo e bússola, materiais e histerese, espectro/interações e mudança de meio.

Três atividades do PhET receberam propostas de prever, observar e explicar: polarização com balões, proporcionalidade entre tensão e corrente e indução de Faraday. São roteiros próprios, orientados por objetivos de investigação, sem copiar uma atividade pronta do PhET. O [documento de objetivos do PhET](https://phet.colorado.edu/assets/virtual-workshop/PhETs_Goals_for_Students_and_Teachers.pdf) recomenda previsões, teste de ideias, uso de evidências e articulação de representações.

## Função de cada prática

- **Flashcards:** tentar recordar e explicar antes de revelar o verso. A expressão de apoio da seção de resposta não aparece antes da virada; a autoavaliação só é liberada depois de conferir. “Lembrei” não é tratado como nota objetiva.
- **Memória:** associar significados, grandezas, condições e aplicações, com textos mais curtos e pares sem duplicação literal dentro do tema.
- **Lacunas:** completar uma relação conceitual com termos adequados. A atividade não substitui explicações nem avaliação de raciocínio.
- **Quiz:** 60 questões de treino, distribuídas em interpretação, aplicação, análise de erros e cálculos. Há gráfico e tabela de U × I, além de situações que evitam copiar os números da teoria.
- **Desafio:** 24 situações próprias, com dados, planejamento de observações, comparação de modelos e aplicações. Uma sessão tem cinco questões em progressão de nível e meta de quatro acertos, sem reutilizar os enunciados do quiz.

Quiz, flashcards e lacunas usam um rodízio por perfil e banco/nível, com sequências curtas. O banco é percorrido antes da abertura de outro ciclo; não há duplicação de um item dentro da mesma sessão. Ao atravessar o limite entre ciclos, a seleção evita repetir o mesmo item naquela sessão. O banco é finito: novas sessões podem reapresentar itens após o ciclo. Uma retomada mantém questões e alternativas da sessão; reiniciar inicia nova seleção. A memória varia a disposição das cartas.

Misturar conceitos e recuperar informações da memória é uma decisão informada por pesquisa, não uma alegação de resultado já demonstrado neste app. O [estudo de Sana e Yan (2022)](https://journals.sagepub.com/doi/10.1177/09567976211057507), com estudantes do equivalente ao ensino médio em aulas de ciências, encontrou benefícios em recuperação intercalada. O rodízio implementado não é um agendador de revisão espaçada por tempo nem um tutor adaptativo.

## O que eu priorizaria na continuação

1. Oferecer pequenos apoios de unidades SI, prefixos, notação científica, proporções e leitura de vetores antes de exigir cálculos. Ampliar gradualmente a diversidade de representações: mais diagramas de circuitos e vetores, gráficos com escalas diferentes e interpretação de medidas com incerteza. Hoje há um gráfico novo e três questões com tabelas; não é um banco completo de leitura de gráficos.
2. Acrescentar respostas abertas curtas com critérios para o professor: previsão, justificativa, uso de evidência e coerência das unidades. Não atribuir automaticamente uma nota a texto livre sem avaliação da rubrica.
3. Desenvolver revisão por objetivo: registrar quais conceitos precisam ser revisitados e agendar retornos em outros dias, com transparência para o estudante. O rodízio atual não faz esse diagnóstico.
4. Criar sequências guiadas que alternem exemplo resolvido, problema com apoio parcial e problema independente, retirando a ajuda gradualmente. Preservar uma explicação de por que a estratégia funciona.
5. Incluir contextos locais e ambientais, como geração e consumo de energia, sempre com dados e hipóteses declarados. Comparações de consumo podem dialogar com EM13CNT106; espectro e aplicações, com EM13CNT103, sem declarar cumprimento automático da [BNCC](https://www.gov.br/mec/pt-br/cne/bncc_ensino_medio.pdf).
6. Fazer uma rodada com o professor e estudantes: pedir que expliquem alternativas, observem uma simulação e resolvam uma situação nova. Registrar dificuldades de leitura e justificativas, além de acertos. Só então ajustar dificuldade e equilíbrio curricular.

## Trilha e rastreabilidade dos textos

| Ordem | Tópico | Percurso | Pré-requisitos |
| ---: | --- | --- | --- |
| 1 | Carga elétrica e conservação | essencial | Entrada da trilha |
| 2 | Eletrização e polarização | essencial | Carga elétrica e conservação |
| 3 | Força Elétrica (Lei de Coulomb) | essencial | Carga elétrica e conservação |
| 4 | Intensidade do Campo Elétrico | essencial | Força Elétrica (Lei de Coulomb) |
| 5 | Diferença de potencial e energia elétrica | essencial | Intensidade do Campo Elétrico |
| 6 | Condutores em equilíbrio eletrostático | essencial | Intensidade do Campo Elétrico |
| 7 | Corrente elétrica e sentido convencional | essencial | Carga elétrica e conservação |
| 8 | Resistência e lei de Ohm | essencial | Corrente elétrica e sentido convencional; Diferença de potencial e energia elétrica |
| 9 | Resistores em série e em paralelo | essencial | Resistência e lei de Ohm |
| 10 | Potência e consumo de energia elétrica | essencial | Resistência e lei de Ohm |
| 11 | Campo magnético, polos e bússola | essencial | Carga elétrica e conservação |
| 12 | Materiais magnéticos, remanência e histerese | essencial | Campo magnético, polos e bússola |
| 13 | Força Magnética sobre uma Carga em Movimento | essencial | Campo magnético, polos e bússola; Intensidade do Campo Elétrico |
| 14 | Campo Magnético de Fio Retilíneo (Lei de Ampère) | essencial | Corrente elétrica e sentido convencional; Campo magnético, polos e bússola |
| 15 | Força Magnética sobre Fio Retilíneo | essencial | Corrente elétrica e sentido convencional; Força Magnética sobre uma Carga em Movimento |
| 16 | Campo Magnético no Interior de um Solenoide | essencial | Campo Magnético de Fio Retilíneo (Lei de Ampère) |
| 17 | Fluxo Magnético | essencial | Campo magnético, polos e bússola |
| 18 | Lei da Indução de Faraday | essencial | Fluxo Magnético; Corrente elétrica e sentido convencional |
| 19 | Tensão Induzida em Condutor Móvel | essencial | Força Magnética sobre uma Carga em Movimento; Diferença de potencial e energia elétrica |
| 20 | Equação Fundamental da Onda | essencial | Campo magnético, polos e bússola; Intensidade do Campo Elétrico |
| 21 | Espectro eletromagnético e interações | essencial | Equação Fundamental da Onda |
| 22 | Luz ao mudar de meio | essencial | Equação Fundamental da Onda |
| 23 | Raio da Trajetória Circular de uma Carga | aprofundamento | Força Magnética sobre uma Carga em Movimento |
| 24 | Período do Movimento de uma Carga no Campo Magnético | aprofundamento | Raio da Trajetória Circular de uma Carga |
| 25 | Força Magnética entre Fios Paralelos | aprofundamento | Força Magnética sobre Fio Retilíneo; Campo Magnético de Fio Retilíneo (Lei de Ampère) |
| 26 | Campo Magnético no Núcleo de um Toróide | aprofundamento | Campo Magnético no Interior de um Solenoide |
| 27 | Torque de Giro numa Espira | aprofundamento | Força Magnética sobre Fio Retilíneo |
| 28 | Força Magneto-Motriz (FMM) | aprofundamento | Campo Magnético no Interior de um Solenoide |
| 29 | Relutância e Lei de Hopkinson | aprofundamento | Força Magneto-Motriz (FMM); Fluxo Magnético |
| 30 | Indutância de um Solenoide | aprofundamento | Campo Magnético no Interior de um Solenoide; Lei da Indução de Faraday |
| 31 | Indutância Mútua e Acoplamento Magnético | aprofundamento | Indutância de um Solenoide |
| 32 | Relação entre Campos na Onda Eletromagnética | aprofundamento | Equação Fundamental da Onda |

## Referências de orientação

URONE, Paul Peter; HINRICHS, Roger. College physics. 2. ed. Houston: OpenStax, 2022. Disponível em: https://openstax.org/books/college-physics-2e/pages/preface. Acesso em: 18 out. 2026. Apoio científico e exemplo de organização por objetivos, alertas conceituais e problemas de naturezas diferentes; não foram transcritos exercícios ou ilustrações.

SANA, Faria; YAN, Veronica X. Interleaving retrieval practice promotes science learning. Psychological Science, v. 33, n. 5, p. 782–788, 2022. DOI: 10.1177/09567976211057507. Disponível em: https://journals.sagepub.com/doi/10.1177/09567976211057507. Acesso em: 18 out. 2026.

PHET INTERACTIVE SIMULATIONS. PhET’s goals for students and teachers. Boulder: University of Colorado Boulder, [s. d.]. Disponível em: https://phet.colorado.edu/assets/virtual-workshop/PhETs_Goals_for_Students_and_Teachers.pdf. Acesso em: 18 out. 2026.

BRASIL. Ministério da Educação. Base Nacional Comum Curricular: ensino médio. Brasília, DF: MEC, 2018. Disponível em: https://www.gov.br/mec/pt-br/cne/bncc_ensino_medio.pdf. Acesso em: 18 out. 2026. Usada como referência de planejamento; a adequação curricular do conjunto ainda depende de validação docente.
