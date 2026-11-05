# Plano Técnico — Weather App

## Architecture (Overview)

Aplicação SPA sem backend próprio. O React apresenta a interface; um hook de domínio coordena a busca e o estado assíncrono; services isolam chamadas à Open-Meteo e persistência do histórico; funções puras fazem conversão e formatação.

Direção de dependências: `components → hooks → services → types`. A camada `lib` contém funções puras usadas pela UI e pelos hooks. A UI não chama `fetch` diretamente. A unidade canônica de temperatura no domínio será Celsius; a conversão para Fahrenheit ocorre na apresentação, sem nova chamada à API.

A aplicação exige conexão para dados meteorológicos. Não haverá autenticação, geolocalização automática ou modo offline.

## Tech Stack

- **Runtime e gerenciador:** Node.js 22+ e pnpm.
- **Aplicação:** React 19, TypeScript strict e Vite.
- **Estilização:** Tailwind CSS 3, com layout mobile-first e tema dark glassmorphism.
- **Dados meteorológicos:** Open-Meteo Geocoding API e Forecast API, sem API key.
- **Testes:** Vitest + Testing Library para testes unitários; Playwright para testes end-to-end (E2E).
- **Lint e formatação:** Biome.
- **Persistência do histórico:** recomendação de `localStorage`, sem backend; confirmar retenção e opção de limpeza antes da implementação.

## Project Structure

Manter a estrutura já adotada no repositório e adicionar somente o service necessário ao histórico:

```text
src/
├── components/
│   ├── states/             # loading, erro e vazio
│   ├── SearchBar.tsx       # busca e seleção de cidade
│   ├── CurrentWeather.tsx  # condições atuais
│   ├── ForecastList.tsx    # previsão diária
│   ├── ForecastCard.tsx    # resumo de um dia
│   ├── UnitToggle.tsx      # Celsius/Fahrenheit
│   └── SearchHistory.tsx   # cidades buscadas
├── hooks/
│   ├── useWeather.ts       # busca, seleção e estado da consulta
│   └── useSearchHistory.ts # leitura e atualização do histórico
├── services/
│   ├── weatherService.ts  # Open-Meteo, validação e mapeamento
│   └── searchHistory.ts   # persistência local do histórico
├── lib/
│   ├── temperature.ts     # conversão C/F
│   ├── format.ts          # datas e unidades
│   └── weatherCodes.ts    # códigos WMO para condição/ícone
├── types/
│   └── weather.ts         # contratos compartilhados
├── styles/
│   └── index.css          # Tailwind e estilos globais
├── App.tsx
└── main.tsx
```

Os componentes recebem dados e callbacks por props, sem acesso direto a services. `App.tsx` compõe a tela; `main.tsx` inicializa React e estilos.

## Data Model

Contratos de domínio em `src/types/weather.ts`:

- **`City`:** `id`, `name`, `country`, `admin1` (estado, quando disponível), `latitude` e `longitude`. A busca é limitada a `country = BR`.
- **`CurrentWeather`:** `time`, `temperatureC`, `weatherCode`, `humidity`, `windSpeedKmh`, `pressureHpa` e `precipitationMm`.
- **`ForecastDay`:** `date`, `minC`, `maxC`, `weatherCode`, `maxWindSpeedKmh` e `precipitationMm`.
- **`WeatherData`:** cidade selecionada, condições atuais e exatamente cinco dias futuros disponíveis.
- **`Unit`:** `'celsius' | 'fahrenheit'`; preferência de apresentação, não unidade de armazenamento.
- **`WeatherStatus`:** estado discriminado da tela (`idle`, `loading`, `success`, `empty` ou `error`), com mensagem e dados associados conforme o estado.
- **`SearchHistoryItem`:** cidade selecionada e instante da busca (`searchedAt`); armazenar pelo identificador estável da cidade para evitar duplicatas.

A resposta externa deve ser mapeada para esses tipos no service. Valores ausentes permanecem ausentes/indisponíveis; não substituir precipitação desconhecida por zero. O contrato de `ForecastDay` pode representar campos opcionais quando a API não fornecer um valor.

## Data Flow

1. O usuário informa uma cidade; a busca remove espaços excedentes e não consulta se o termo ficar vazio.
2. `useWeather` chama `searchCities` no service.
3. O service consulta geocoding com país `BR`, idioma português e limite de três resultados; converte a resposta para `City`.
4. A UI apresenta os resultados com cidade e estado. O usuário escolhe o resultado, especialmente quando há homônimos; não selecionar automaticamente o primeiro resultado ambíguo.
5. `useWeather` solicita clima atual e previsão para as coordenadas da cidade escolhida.
6. `weatherService` valida e mapeia o payload externo para `WeatherData`, normalizando temperaturas para Celsius e unidades meteorológicas definidas.
7. O hook publica o estado de sucesso; componentes formatam e exibem os dados. Alternar a unidade recalcula apenas os valores de temperatura na UI.
8. Após a seleção bem-sucedida, `useSearchHistory` registra/atualiza a cidade e disponibiliza o histórico.

Chamadas concorrentes devem ser canceladas com `AbortController` ou ignoradas por identificador de requisição, para uma resposta antiga não sobrescrever a cidade selecionada mais recentemente.

## External APIs

### Geocoding — Open-Meteo

- Endpoint: `https://geocoding-api.open-meteo.com/v1/search`.
- Parâmetros: `name`, `countryCode=BR`, `count=3`, `language=pt` e `format=json`.
- Usar `id`, `name`, `country`, `admin1`, `latitude` e `longitude` na seleção e desambiguação.
- Resposta sem resultados deve produzir estado vazio, não erro.

### Forecast — Open-Meteo

- Endpoint: `https://api.open-meteo.com/v1/forecast`.
- Enviar latitude/longitude, timezone `auto`, campos atuais e diários necessários e `forecast_days=6`.
- Para obter os cinco dias seguintes sem incluir hoje, usar a data local retornada pela API para descartar o dia atual e selecionar os cinco dias subsequentes.
- Campos atuais: temperatura a 2 m, código WMO, umidade relativa, velocidade do vento a 10 m, pressão à superfície e precipitação.
- Campos diários: data, código WMO, temperaturas mínima/máxima, velocidade máxima do vento e precipitação total.
- Não enviar API key. Isolar URLs, parâmetros e transformação no service; nenhuma outra camada deve conhecer o formato bruto da API.

## State Management

Usar `useWeather` como dono do estado assíncrono da consulta: resultados de geocoding, cidade selecionada, dados meteorológicos, termo, erro e status. Preferir uma união discriminada ou transições centralizadas para impedir combinações inválidas (por exemplo, `success` sem dados).

A unidade selecionada fica em estado local da aplicação; Celsius é o padrão. Não incluir unidade em requisições nem duplicar dados convertidos no estado.

`useSearchHistory` encapsula leitura, deduplicação por `City.id` e atualização do histórico por meio de `searchHistory` service. Componentes não acessam `localStorage` diretamente. Recomenda-se persistência local por ausência de backend, mas duração, limite de itens e ação de apagar permanecem decisões a confirmar.

## Error Handling

- Normalizar falhas do service em erro tipado: rede, timeout, resposta HTTP inválida e payload incompleto.
- Aplicar timeout às chamadas e permitir cancelamento ao trocar de cidade ou desmontar fluxo.
- Distinguir resultado vazio de falha de rede/API.
- Exibir mensagem em português, manter a busca disponível e oferecer retry para erros recuperáveis.
- Validar o formato e os campos necessários antes de mapear; não renderizar `NaN`, valores fora de formato ou dados inventados.
- Para campos opcionais ausentes, indicar que o dado está indisponível sem invalidar toda a previsão.
- Tratar falha de `localStorage` sem bloquear consulta meteorológica; manter histórico em memória durante a sessão e comunicar se a persistência não puder ser usada.

## Testing Strategy

- **Vitest — funções puras:** conversões C/F (incluindo valores negativos), formatação, datas/fuso horário, códigos WMO e deduplicação do histórico.
- **Vitest — services:** mock de `fetch`; verificar parâmetros de país/limite/idioma, mapeamento de resposta, previsão que exclui hoje, erros HTTP, timeout, payload incompleto e campos meteorológicos ausentes.
- **Vitest + Testing Library:** busca, desambiguação por estado, loading/empty/error/success, retry, alternância sem nova chamada de rede, histórico e acessibilidade básica por teclado/roles.
- **Playwright:** fluxos completos com respostas da API interceptadas para manter testes determinísticos; cobrir viewports móveis e desktop, seleção de cidades homônimas, consulta, troca de unidade, retry e histórico.
- Evitar depender da disponibilidade da Open-Meteo nos testes de CI; uma verificação manual/integrada real pode ser executada separadamente.
- Comandos do repositório: `pnpm test`, `pnpm test:e2e`, `pnpm lint` e `pnpm build`.

## Risks & Trade-offs

| Risco / trade-off | Consequência | Mitigação |
| --- | --- | --- |
| API pública indisponível, lenta ou com contrato alterado | Busca ou consulta pode falhar | Timeout, validação/mapeamento isolados, mensagens claras, retry e testes com payloads simulados. |
| Cobertura de geocoding ou desambiguação imprecisa | Usuário pode escolher cidade errada | Filtrar por Brasil e mostrar estado; validar casos de nomes duplicados. |
| Previsão de cinco dias exige descartar hoje | Erro de timezone pode exibir período incorreto | Usar timezone da resposta da Open-Meteo e testar mudança de data/fuso. |
| Histórico em `localStorage` é apenas deste navegador/dispositivo | Sem sincronização e sujeito a limpeza do navegador | Manter como recomendação explícita; confirmar retenção, limite e remoção com produto. |
| “Todos os navegadores” não define versões | Não há critério objetivo para validar compatibilidade | Definir matriz de browsers/versões antes da fase de testes. |
| API direta no browser reduz infraestrutura, mas depende de rede e disponibilidade externa | Sem funcionamento offline ou cache de servidor | Alinhar a expectativa do usuário; offline está fora do escopo. |
| Tema escuro glassmorphism pode prejudicar contraste ou leitura | Acessibilidade inferior | Verificar contraste, foco visível e legibilidade em fundos/transparências. |

## Plano de Implementação

1. Ajustar geocoding para filtrar Brasil e limitar a três resultados; tornar seleção explícita quando houver homônimos.
2. Atualizar tipos e service para os campos meteorológicos definidos e para cinco dias a partir de amanhã, validando dados externos.
3. Implementar histórico via service e hook; confirmar previamente persistência, retenção e remoção.
4. Integrar loading, empty, error/retry e sucesso na UI, incluindo conversão de unidade sem nova consulta.
5. Validar layout mobile-first, acessibilidade e cobertura com os comandos da estratégia de testes.
