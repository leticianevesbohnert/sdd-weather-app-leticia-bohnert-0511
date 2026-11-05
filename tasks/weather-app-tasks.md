# Backlog de Implementação — Weather App

As tarefas abaixo derivam da [especificação](../specs/weather-app-spec.md) e do
[plano técnico](../plans/weather-app-plan.md). IDs indicam ordem sugerida, e as
dependências precisam ser concluídas antes do início da tarefa dependente.

## Preparação

### T-01 — Definir política de persistência do histórico

- **Descrição:** decidir e registrar onde o histórico será armazenado, por quanto tempo, se haverá limite e como o usuário poderá apagá-lo.
- **Critérios de aceite:**
  - As decisões de armazenamento, retenção, limite e remoção estão documentadas na spec ou no plano.
  - A decisão é compatível com a ausência de backend e com os requisitos de privacidade.
- **Dependências:** Nenhuma.
- **Arquivos:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Tipo:** Infra.

## Contratos e Dados

### T-02 — Alinhar tipos de domínio aos dados meteorológicos

- **Descrição:** atualizar contratos de cidade, clima atual, previsão, unidade, estado da tela e item do histórico para os campos e estados definidos no plano.
- **Critérios de aceite:**
  - Os tipos representam os dados atuais e diários necessários, com unidades explicitadas nos nomes ou documentação do campo.
  - Campos que podem faltar na API são opcionais ou anuláveis, sem converter ausência em zero.
  - O histórico possui identificador estável da cidade e instante da busca.
  - `pnpm build` completa sem erros de tipos.
- **Dependências:** Nenhuma.
- **Arquivos:** `src/types/weather.ts`.
- **Tipo:** Data.

### T-03 — Restringir geocoding a cidades brasileiras

- **Descrição:** ajustar a busca Open-Meteo para retornar até três resultados brasileiros em português e mapear estado e coordenadas.
- **Critérios de aceite:**
  - A requisição envia `countryCode=BR`, `count=3` e `language=pt`.
  - Resultados são mapeados para `City`, incluindo estado quando disponível.
  - Resposta sem resultados retorna lista vazia; falha HTTP ou de rede produz erro tipado.
- **Dependências:** T-02.
- **Arquivos:** `src/services/weatherService.ts`.
- **Tipo:** Data.

### T-04 — Mapear clima atual e cinco dias futuros

- **Descrição:** obter e mapear os campos atuais e diários necessários, excluindo o dia atual e selecionando os cinco dias seguintes no fuso retornado pela API.
- **Critérios de aceite:**
  - A requisição inclui os campos de temperatura, condição WMO, vento e precipitação definidos no plano.
  - A previsão contém os cinco dias após a data local atual da resposta, sem incluir hoje.
  - Os valores são normalizados para as unidades internas definidas nos tipos.
  - Resposta incompleta ou inválida falha de forma tipada; campos opcionais ausentes continuam indisponíveis, não são inventados.
- **Dependências:** T-02.
- **Arquivos:** `src/services/weatherService.ts`, `src/types/weather.ts`.
- **Tipo:** Data.

### T-05 — Testar contratos e falhas dos services meteorológicos

- **Descrição:** cobrir geocoding e previsão com `fetch` simulado, sem depender da disponibilidade da API externa.
- **Critérios de aceite:**
  - Testes verificam parâmetros do geocoding, filtro por Brasil, limite de resultados e mapeamento de cidade.
  - Testes verificam seleção dos cinco dias futuros, campos meteorológicos e ausência de valores fabricados.
  - Testes cobrem resposta vazia, HTTP inválido, timeout/rede e payload incompleto.
  - `pnpm test -- tests/unit/weatherService.test.ts` passa.
- **Dependências:** T-03, T-04.
- **Arquivos:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

## Orquestração e Experiência de Busca

### T-06 — Coordenar seleção de cidade e estados da consulta

- **Descrição:** ajustar `useWeather` para controlar resultados, seleção explícita, loading, sucesso, vazio, erro, retry e respostas concorrentes.
- **Critérios de aceite:**
  - Uma busca válida apresenta resultados para escolha e não seleciona automaticamente uma cidade homônima.
  - Consultas vazias não fazem requisição.
  - Uma resposta antiga não sobrescreve os dados da cidade escolhida mais recentemente.
  - Erros recuperáveis ficam disponíveis para retry e resultado vazio não é tratado como erro.
- **Dependências:** T-03, T-04.
- **Arquivos:** `src/hooks/useWeather.ts`, `src/types/weather.ts`.
- **Tipo:** Data.

### T-07 — Implementar busca e seleção desambiguada

- **Descrição:** apresentar entrada de cidade e resultados selecionáveis, identificando cidade e estado.
- **Critérios de aceite:**
  - O usuário consegue enviar busca por teclado e toque.
  - Até três resultados podem ser selecionados; cidade e estado ficam visíveis quando disponíveis.
  - Selecionar um resultado carrega o clima dessa cidade.
  - Busca sem correspondência exibe estado vazio apropriado.
- **Dependências:** T-03, T-06.
- **Arquivos:** `src/components/SearchBar.tsx`, `src/App.tsx`.
- **Tipo:** UI.

### T-08 — Exibir clima atual da cidade selecionada

- **Descrição:** mostrar nome da cidade e os campos de clima atual em componentes de apresentação.
- **Critérios de aceite:**
  - A tela mostra temperatura atual, condição, vento e precipitação.
  - Cidade e unidades dos valores ficam identificadas.
  - Campo indisponível não é apresentado como zero ou como dado conhecido.
- **Dependências:** T-04, T-06.
- **Arquivos:** `src/components/CurrentWeather.tsx`, `src/App.tsx`, `src/lib/weatherCodes.ts`, `src/lib/format.ts`.
- **Tipo:** UI.

### T-09 — Exibir previsão diária dos próximos cinco dias

- **Descrição:** apresentar um resumo por dia com mínimas, máximas, condição, vento e precipitação.
- **Critérios de aceite:**
  - São apresentados os cinco dias seguintes, sem incluir hoje.
  - Cada dia apresenta data, mínimas, máximas, condição, vento e precipitação disponíveis.
  - Dados ausentes são identificados como indisponíveis, sem estimativa.
- **Dependências:** T-04, T-06.
- **Arquivos:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`, `src/lib/format.ts`, `src/App.tsx`.
- **Tipo:** UI.

## Unidades e Histórico

### T-10 — Implementar e testar conversão Celsius/Fahrenheit

- **Descrição:** garantir conversão pura a partir dos valores internos em Celsius, incluindo formatação e unidade exibida.
- **Critérios de aceite:**
  - Conversões de Celsius para Fahrenheit e de volta produzem resultados corretos, inclusive para temperaturas negativas.
  - A função não altera os dados meteorológicos de origem.
  - Testes unitários da conversão passam.
- **Dependências:** T-02.
- **Arquivos:** `src/lib/temperature.ts`, `tests/unit/temperature.test.ts`.
- **Tipo:** Data.

### T-11 — Integrar controle de unidade à tela

- **Descrição:** conectar o toggle C/F aos valores atuais e à previsão, mantendo Celsius como unidade inicial.
- **Critérios de aceite:**
  - Celsius é selecionado na inicialização.
  - Alternar para Fahrenheit atualiza todos os valores de temperatura e seus rótulos; alternar de volta restaura Celsius.
  - A troca de unidade não dispara nova chamada à API.
- **Dependências:** T-08, T-09, T-10.
- **Arquivos:** `src/components/UnitToggle.tsx`, `src/App.tsx`, `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** UI.

### T-12 — Persistir histórico de buscas

- **Descrição:** implementar operações de leitura e atualização do histórico de acordo com a política definida em T-01.
- **Critérios de aceite:**
  - Cidades são armazenadas após consulta bem-sucedida e podem ser carregadas novamente.
  - Repetir uma cidade não cria duplicatas; ela passa à posição mais recente.
  - Política de limite, retenção e remoção definida em T-01 é respeitada.
  - Falha de armazenamento não impede consultas meteorológicas.
- **Dependências:** T-01, T-02.
- **Arquivos:** `src/services/searchHistory.ts`, `src/types/weather.ts`, `tests/unit/searchHistory.test.ts`.
- **Tipo:** Data.

### T-13 — Apresentar e integrar histórico na interface

- **Descrição:** conectar o histórico à busca e permitir reabrir uma cidade consultada anteriormente.
- **Critérios de aceite:**
  - Histórico carregado aparece na interface em ordem da consulta mais recente.
  - Selecionar um item carrega novamente o clima da cidade.
  - O estado vazio do histórico é claro e não interfere na busca.
- **Dependências:** T-06, T-12.
- **Arquivos:** `src/hooks/useSearchHistory.ts`, `src/components/SearchHistory.tsx`, `src/App.tsx`.
- **Tipo:** UI.

## Estados, Acessibilidade e Validação

### T-14 — Integrar estados de loading, erro e retry

- **Descrição:** apresentar estados assíncronos e erros de rede/API de forma compreensível e recuperável.
- **Critérios de aceite:**
  - Loading é apresentado durante busca e carregamento meteorológico.
  - Falha apresenta mensagem em português e ação de tentar novamente.
  - Retry repete a última busca/consulta apropriada.
  - Resultado vazio é distinto de erro.
- **Dependências:** T-06.
- **Arquivos:** `src/components/states/LoadingState.tsx`, `src/components/states/ErrorState.tsx`, `src/components/states/EmptyState.tsx`, `src/App.tsx`.
- **Tipo:** UI.

### T-15 — Aplicar responsividade e acessibilidade à tela

- **Descrição:** validar a experiência mobile-first e aplicar semântica, teclado, foco e contraste ao tema dark glassmorphism.
- **Critérios de aceite:**
  - Busca, seleção, histórico, dados atuais, previsão e toggle são utilizáveis em viewports móveis e desktop sem sobreposição ou perda de conteúdo.
  - Controles têm nomes acessíveis, ordem de foco lógica e operação por teclado.
  - Texto, foco e controles mantêm contraste legível no tema visual.
- **Dependências:** T-07, T-08, T-09, T-11, T-13, T-14.
- **Arquivos:** `src/components/`, `src/styles/index.css`.
- **Tipo:** UI.

### T-16 — Cobrir interações de componentes e hook

- **Descrição:** testar os fluxos de UI com Vitest e Testing Library.
- **Critérios de aceite:**
  - Testes cobrem seleção de cidade homônima, loading, vazio, erro/retry e consulta bem-sucedida.
  - Testes cobrem alternância C/F sem chamada extra à API e interação com histórico.
  - Interações essenciais podem ser realizadas por teclado e controles têm roles/nomes acessíveis.
  - `pnpm test` passa.
- **Dependências:** T-07, T-08, T-09, T-11, T-13, T-14, T-15.
- **Arquivos:** `tests/unit/App.test.tsx`, `tests/unit/SearchBar.test.tsx`, `tests/unit/UnitToggle.test.tsx`, novos testes de componentes/hooks conforme necessário.
- **Tipo:** Test.

### T-17 — Validar fluxos ponta a ponta com Playwright

- **Descrição:** cobrir os fluxos principais em navegador com respostas da Open-Meteo interceptadas.
- **Critérios de aceite:**
  - Fluxo E2E cobre busca, seleção, clima atual, previsão, troca de unidade e histórico.
  - Fluxo de erro permite retry e busca sem resultado é apresentada corretamente.
  - Testes verificam viewport móvel e desktop sem depender da API externa real.
  - `pnpm test:e2e` passa.
- **Dependências:** T-16.
- **Arquivos:** `tests/e2e/weather.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

### T-18 — Executar gates de qualidade do projeto

- **Descrição:** executar lint, build e suítes de teste antes de considerar a implementação pronta.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` terminam sem erros.
  - Falhas encontradas são corrigidas nas tarefas responsáveis antes da conclusão.
- **Dependências:** T-05, T-16, T-17.
- **Arquivos:** `src/`, `tests/`.
- **Tipo:** Infra.