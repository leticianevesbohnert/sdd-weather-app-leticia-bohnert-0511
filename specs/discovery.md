# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa precisa de uma aplicação de previsão do tempo para que usuários consultem as condições meteorológicas de cidades. O produto deve funcionar em dispositivos móveis e permitir a troca entre Celsius e Fahrenheit.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário busque cidades brasileiras por nome. Se houver cidades com o mesmo nome, solicitar que escolha o estado.
- **RF-02 — Ver clima atual:** apresentar a temperatura e as condições atuais da cidade selecionada, incluindo condição, vento e precipitação.
- **RF-03 — Ver previsão de 5 dias:** apresentar, a partir do próximo dia, a temperatura mínima e máxima, condição, vento e precipitação para cada dia da previsão.
- **RF-04 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit e atualizar as temperaturas exibidas.
- **RF-05 — Histórico de buscas:** manter um histórico das cidades buscadas.

## Requisitos Não-Funcionais

- **RNF-01 — Compatibilidade móvel:** a aplicação deve ser utilizável em dispositivos móveis.
- **RNF-02 — Responsividade:** a interface deve adaptar a busca, o clima atual e a previsão a telas menores, sem perda de conteúdo ou funcionalidade.
- **RNF-03 — Usabilidade:** busca, seleção de cidade e alternância de unidade devem ser compreensíveis e operáveis em telas sensíveis ao toque.
- **RNF-04 — Acessibilidade (a validar):** controles e informações meteorológicas devem ser acessíveis por tecnologias assistivas e navegação por teclado.
- **RNF-05 — Compatibilidade com navegadores:** a aplicação deve funcionar nos navegadores. As versões e o significado de “todos os navegadores” precisam ser definidos.
- **RNF-06 — Idioma:** a interface deve estar disponível em português.
- **RNF-07 — Disponibilidade dos dados (a validar):** a aplicação deve comunicar indisponibilidade da fonte de dados de forma compreensível.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação sugerida |
| --- | --- | --- | --- |
| Busca retorna cidades homônimas ou resultados imprecisos | Média | Alto | Apresentar informações de desambiguação, como estado e país, antes da seleção. |
| Fonte meteorológica indisponível ou com dados atrasados | Média | Alto | Definir uma fonte adequada, indicar falhas ao usuário e oferecer nova tentativa. |
| Conversão ou rotulagem incorreta entre Celsius e Fahrenheit | Baixa | Alto | Definir regras de conversão e validar valores e rótulos exibidos. |
| Layout ou controles não funcionam bem em telas móveis | Média | Alto | Validar em diferentes larguras e testar busca e alternância em dispositivos móveis. |
| O usuário não entende o estado da consulta quando há demora, erro ou nenhum resultado | Média | Médio | Especificar estados de carregamento, erro e resultado vazio, incluindo ações disponíveis. |
| Histórico pode expor buscas ou não atender à expectativa de persistência | Média | Médio | Definir onde e por quanto tempo o histórico será armazenado e como poderá ser limpo. |

## Decisões Confirmadas

- **Fonte de dados:** usar uma API; o provedor ainda será escolhido.
- **Dados exibidos:** clima atual e previsão incluem condição, vento e precipitação; a previsão inclui temperaturas mínima e máxima.
- **Período da previsão:** os cinco dias começam no próximo dia.
- **Cobertura e desambiguação:** somente cidades do Brasil; quando houver nomes iguais, o usuário escolhe o estado.
- **Unidade padrão:** Celsius; também será possível alternar para Fahrenheit.
- **Idioma:** português.
- **Navegadores:** a expectativa é funcionar em todos os navegadores, mas o conjunto de versões suportadas precisa ser delimitado.
- **Desempenho:** não há metas definidas.
- **Uso sem conexão:** não haverá suporte offline.
- **Histórico:** as cidades buscadas devem ser mantidas; forma e duração do armazenamento ainda serão definidas.

## Perguntas em Aberto

1. Qual API/provedor será usado? Há requisitos de custo, licença, chave ou limites de uso?
2. Quais versões de navegadores estão incluídas em “todos os navegadores”?
3. O histórico será armazenado localmente ou em servidor? Por quanto tempo e o usuário poderá apagá-lo?
4. Qual formato de data deve ser usado na previsão?
5. O que deve acontecer quando a API falhar ou não houver conexão, considerando que não haverá modo offline?
6. A aplicação deve detectar a localização do usuário ou oferecer favoritos além do histórico de buscas?

## Suposições para validação

- O usuário escolhe uma cidade por nome, sem depender de geolocalização automática.
- A aplicação apresenta dados de uma fonte externa de meteorologia.
- Não haverá suporte offline.
- Não foram definidos requisitos de autenticação ou favoritos.
- Os critérios de desempenho e as versões de navegadores suportadas ainda serão definidos.
