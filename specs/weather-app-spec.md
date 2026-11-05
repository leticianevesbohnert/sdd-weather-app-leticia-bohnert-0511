# Weather App — Especificação do Produto

## Overview

Aplicação web de previsão do tempo para buscar cidades brasileiras e consultar
o clima atual e a previsão dos próximos cinco dias. A interface será em
português, mobile-first, responsiva e usará tema dark glassmorphism.

O frontend consumirá a API pública Open-Meteo para geocoding e previsão, sem
API key e sem backend próprio. A unidade inicial será Celsius, com opção para
alternar para Fahrenheit. O produto manterá um histórico de cidades buscadas.

**Stack:** React, TypeScript (strict), Vite e Tailwind CSS. **Testes:** Vitest
para testes unitários e Playwright para testes end-to-end.

## Functional Requirements

- **RF-01 — Buscar cidades:** permitir buscar cidades do Brasil por nome e apresentar até três resultados para seleção. Se houver cidades homônimas, permitir distingui-las pelo estado.
- **RF-02 — Consultar clima atual:** para a cidade selecionada, apresentar temperatura atual, condição meteorológica, vento e precipitação.
- **RF-03 — Consultar previsão:** apresentar a previsão dos cinco dias seguintes, a partir do próximo dia, incluindo temperaturas mínima e máxima, condição meteorológica, vento e precipitação por dia.
- **RF-04 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit e atualizar os valores de temperatura exibidos.
- **RF-05 — Manter histórico:** registrar as cidades buscadas e permitir consultar o histórico.
- **RF-06 — Informar estados da consulta:** apresentar estados de carregamento, erro e resultado vazio. Em caso de erro recuperável, oferecer nova tentativa.

## User Stories

- Como pessoa que consulta o tempo no Brasil, quero buscar uma cidade pelo nome para ver suas condições meteorológicas.
- Como pessoa que encontra cidades com o mesmo nome, quero identificar o estado de cada resultado para selecionar a cidade correta.
- Como pessoa que planeja os próximos dias, quero consultar as condições atuais e a previsão diária dos próximos cinco dias.
- Como pessoa que prefere outra unidade, quero alternar entre Celsius e Fahrenheit para ler as temperaturas na unidade desejada.
- Como pessoa que consulta várias cidades, quero acessar um histórico das cidades buscadas para encontrá-las novamente.

## Acceptance Criteria

- A busca consulta cidades brasileiras e apresenta no máximo três resultados selecionáveis.
- Quando houver mais de uma cidade com o mesmo nome, os resultados identificam o estado e a pessoa consegue selecionar a opção correta.
- A busca sem correspondências apresenta um estado vazio compreensível; uma consulta em andamento apresenta estado de carregamento.
- Após selecionar uma cidade, a tela identifica a cidade e apresenta temperatura atual, condição, vento e precipitação.
- A previsão apresenta cinco dias completos começando no dia seguinte à data atual, com mínimas, máximas, condição, vento e precipitação por dia.
- Celsius é a unidade inicial. Alternar para Fahrenheit atualiza todas as temperaturas da tela; voltar para Celsius restaura a apresentação nessa unidade.
- As cidades buscadas aparecem no histórico. O meio de armazenamento e o período de retenção estão pendentes de definição.
- Uma falha da API ou de conexão apresenta uma mensagem de erro e permite tentar novamente; a aplicação não apresenta dados inventados como se fossem atuais.
- A busca, a consulta e a alternância de unidade continuam utilizáveis em telas móveis e desktop, sem perda ou sobreposição de conteúdo.
- A interface e as mensagens ao usuário são apresentadas em português.

## Non-Functional Requirements

- **RNF-01 — Responsividade:** experiência mobile-first e utilizável em dispositivos móveis e telas maiores.
- **RNF-02 — Identidade visual:** aplicar o tema dark glassmorphism.
- **RNF-03 — Acessibilidade:** controles identificados semanticamente, operáveis por teclado e utilizáveis por tecnologias assistivas.
- **RNF-04 — Compatibilidade:** buscar compatibilidade com navegadores; versões e matriz de suporte precisam ser definidas.
- **RNF-05 — Idioma:** interface em português.
- **RNF-06 — Dependência de rede:** a consulta meteorológica requer conexão; não haverá suporte offline.
- **RNF-07 — Fonte de dados:** usar Open-Meteo sem API key. Isolar o acesso externo em um service para evitar dependência da API na interface.
- **RNF-08 — Testabilidade:** usar Vitest para testes unitários e Playwright para testes end-to-end.
- **RNF-09 — Desempenho:** não há metas quantitativas definidas neste momento.

## Edge Cases

- Busca vazia ou composta somente por espaços: não executar a consulta e manter a interface em estado vazio/ocioso.
- Cidade não encontrada: informar que não há resultados e permitir nova busca.
- Cidades homônimas em estados diferentes: mostrar informação de estado para desambiguação.
- API indisponível, erro de rede ou resposta inválida: informar a falha e oferecer nova tentativa, sem apresentar valores inválidos como dados meteorológicos.
- Campo meteorológico ausente na resposta: não exibir valor incorreto; indicar indisponibilidade daquele dado.
- Mudança de unidade com dados carregados: converter as temperaturas já recebidas sem exigir nova consulta à API.
- Previsão incompleta ou sem dados para um dos dias: informar que os dados daquele dia não estão disponíveis, sem preencher valores por estimativa.

## Assumptions

- O público consulta cidades brasileiras e seleciona a cidade manualmente.
- A aplicação depende de internet para buscar dados da Open-Meteo.
- A interface será oferecida somente em português.
- O histórico de busca faz parte do produto, mas armazenamento, retenção e remoção ainda não foram definidos.
- Não há metas de desempenho definidas.
- A aplicação não exige login para as funcionalidades especificadas.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Open-Meteo indisponível ou com resposta inesperada | Média | Alto | Isolar o cliente da API, validar respostas e tratar erros com mensagem e nova tentativa. |
| Cidades homônimas causam seleção incorreta | Média | Alto | Exibir estado nos resultados e exigir desambiguação quando necessário. |
| Conversão ou rótulo de Celsius/Fahrenheit incorreto | Baixa | Alto | Testar conversão e consistência dos rótulos com Vitest. |
| Requisito de “todos os navegadores” não define versões | Média | Médio | Definir uma matriz de navegadores e versões antes dos testes de compatibilidade. |
| Histórico persiste dados além do esperado ou não corresponde à expectativa do usuário | Média | Médio | Definir armazenamento, retenção e opção de apagar o histórico. |
| Interface não funciona bem em algum tamanho de tela | Média | Médio | Testar fluxos essenciais em viewports móveis e desktop com Playwright. |

## Out of Scope

- Suporte offline ou consulta de dados sem conexão.
- Autenticação, contas de usuário ou sincronização entre dispositivos.
- Detecção automática de localização.
- Favoritos e dados meteorológicos históricos. O histórico de cidades buscadas permanece no escopo.
- Idiomas além do português.
- Metas de desempenho quantitativas, até que sejam definidas.

## Open Questions

1. Quais versões de navegadores compõem a matriz de compatibilidade esperada?
2. O histórico será armazenado localmente ou em servidor, por quanto tempo e haverá opção para apagá-lo?
3. Qual formato de data e fuso horário serão usados para os dias da previsão?
4. Quais detalhes a mensagem de erro deve apresentar além da ação de tentar novamente?

## Arquitetura de Referência

SPA em React + Vite e TypeScript strict, estilizada com Tailwind CSS. O frontend
consome Open-Meteo diretamente, sem backend próprio. A arquitetura separa
apresentação, orquestração, acesso a dados e funções puras.

```text
src/
├── components/      # busca, clima atual, previsão e estados da UI
├── hooks/           # orquestração e estado assíncrono
├── services/        # geocoding e previsão da Open-Meteo
├── lib/             # conversão de unidades e formatação
├── types/           # contratos compartilhados
├── styles/          # Tailwind e estilos globais
├── App.tsx          # composição da tela
└── main.tsx         # bootstrap React
```

A UI não acessa a API diretamente: as ações passam pelos hooks e services.
A conversão Celsius/Fahrenheit é derivada dos dados recebidos e não dispara
uma nova requisição.