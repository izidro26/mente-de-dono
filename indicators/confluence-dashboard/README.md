# Confluence Dashboard — Multi-Timeframe BUY/SELL

Indicador em Pine Script v6 para TradingView. Combina tendência (EMA), momentum (RSI)
e viés de volatilidade (banda de ATR) em três timeframes ao mesmo tempo, e resume tudo
em sinais claros de **BUY**/**SELL** no gráfico, com alertas prontos.

Pensado para dois públicos:
- **Iniciantes**: modo simples, só o essencial — o label BUY/SELL aparece no candle certo,
  e o alerta avisa sem precisar ficar olhando o gráfico.
- **Profissionais**: modo avançado, com o painel de confluência por timeframe e as EMAs
  no gráfico, para quem quer entender a lógica e ajustar os parâmetros.

## Como funciona

Para cada timeframe (o timeframe do gráfico + 2 configuráveis), o indicador calcula:

1. **Tendência**: EMA rápida acima da EMA lenta = +1, abaixo = -1, igual = 0.
2. **Momentum**: RSI acima de 50 = +1, abaixo de 50 = -1.
3. **Viés de volatilidade**: preço acima da EMA lenta + ATR = +1 (rompimento de alta),
   abaixo da EMA lenta - ATR = -1 (rompimento de baixa).

A soma desses três componentes por timeframe dá uma pontuação de -3 a +3. As pontuações
das três timeframes são somadas (`total`, de -9 a +9). Quando `total` cruza o limiar
configurado (padrão: 5), dispara um sinal de **BUY**; quando cruza -limiar, dispara **SELL**.
O sinal só aparece na virada (não repete a cada barra).

## Inputs

| Input | Descrição |
|---|---|
| Modo de exibição | `Simples` (só sinais) ou `Avançado` (painel + EMAs) |
| Timeframe 2 / 3 | Timeframes adicionais usados na confluência (além do timeframe do gráfico) |
| EMA rápida / lenta | Períodos das médias móveis exponenciais usadas na tendência |
| Período RSI | Período do RSI usado no momentum |
| Período ATR | Período do ATR usado no viés de volatilidade |
| Limiar de confluência | Soma mínima (em módulo) das 3 timeframes para disparar um sinal |
| Aguardar fechamento do candle | Reduz repintura, exigindo que o candle feche antes de confirmar o sinal |
| Habilitar alertas de saída/neutralidade | Dispara um alerta separado quando o `total` cruza de volta a zona neutra (0), sinalizando que a confluência que gerou a entrada se desfez |
| Mínimo de barras entre sinais consecutivos | 0 desativa; um valor > 0 exige esse número de barras desde o último sinal antes de disparar outro — reduz whipsaw em timeframes baixos |

## Validação de timeframes

Timeframe 2 e Timeframe 3 precisam ser **maiores** que o timeframe do gráfico. Se um
deles for igual ou menor, `request.security()` passa a consultar a mesma barra (ou uma
menor) em formação, o que deixa o score instável e sujeito a repintura sem nenhum ganho
real de confluência multi-timeframe. Nesse caso o indicador não trava: ele tinta o fundo
do gráfico de laranja, mostra um aviso ("⚠ Ajuste Timeframe 2/3...") e **suspende os
sinais de BUY/SELL/saída** até a configuração ser corrigida.

## Saída / neutralidade

Além dos sinais de entrada, o indicador pode opcionalmente (input "Habilitar alertas de
saída/neutralidade") avisar quando o `total` cruza de volta a linha 0 — ou seja, quando a
confluência que sustentava a posição comprada/vendida se desfez. É um alerta separado dos
de BUY/SELL, pensado para quem quer ser avisado de sair antes que apareça um sinal
contrário completo.

## Limitações conhecidas (importante deixar claro para quem for comprar)

- **Repintura em timeframes maiores**: como o indicador usa `request.security()` para ler
  timeframes maiores dentro do timeframe do gráfico, o valor da barra em formação da
  timeframe maior pode mudar até ela fechar. Isso é uma limitação inerente do Pine Script,
  não um bug. A opção "Aguardar fechamento do candle" reduz o problema, exigindo confirmação
  antes de disparar o sinal. A validação de timeframes (acima) cobre o caso mais grave desse
  mesmo problema, quando tf2/tf3 estão configurados igual ou menor que o gráfico.
- Este é um indicador de **confluência de indicadores técnicos clássicos**, não uma previsão
  garantida — como qualquer ferramenta de análise técnica, gera falsos sinais, especialmente
  em mercados sem tendência definida (lateralizados).
- Não executa ordens sozinho: é uma ferramenta de apoio à decisão, não um robô de trading.
- **Whipsaw em timeframes muito baixos**: em testes no gráfico de 1 minuto (com Timeframe 2 = 60 e Timeframe 3 = 240), os sinais ficaram amontoados/ruidosos — timeframes curtos geram muito mais cruzamentos de EMA/RSI/ATR por natureza, então a confluência oscila rápido demais para ser acionável. **Recomendação: evitar usar em gráficos abaixo de 5-15 minutos**, ou usar o input "Mínimo de barras entre sinais consecutivos" (ex: 10-15) para filtrar sinais muito próximos nesses casos.

## Backtest (`confluence_dashboard_strategy.pine`)

Arquivo separado com a mesma lógica de score/sinal, mas em `strategy()` em vez de
`indicator()`, para rodar no Strategy Tester nativo da TradingView (taxa de acerto, profit
factor, drawdown máximo etc.) antes de publicar/vender o indicador. Diferenças em relação
ao indicador:

- Entra comprado no sinal de BUY e vendido no sinal de SELL (reversão automática).
- Fecha a posição quando o `total` volta à zona neutra (cruza 0) — input "Fechar posição
  quando o total voltar à zona neutra", ligado por padrão nessa versão, ao contrário do
  indicador onde o alerta equivalente vem desligado por padrão.
- Comissão (0.05%) e slippage (2 ticks) configurados no cabeçalho do `strategy()` como
  ponto de partida realista de exchange de cripto — **ajuste esses valores** para o
  ativo/corretora real antes de tirar conclusões do backtest (ações e forex têm estrutura
  de custo diferente).
- **Não é o script publicado/vendido** — é só a ferramenta de validação da estratégia.

## Como testar

1. Abrir o Pine Editor na TradingView.
2. Colar o conteúdo de `confluence_dashboard.pine`.
3. Clicar em "Add to Chart".
4. Testar em modo Simples e Avançado, em diferentes ativos/timeframes, e comparar
   os sinais BUY/SELL com o comportamento do preço.
5. Configurar um alerta (ícone de relógio) usando as condições "Sinal de COMPRA" /
   "Sinal de VENDA" para validar que o alerta dispara no candle certo. Testar também os
   alertas de saída/neutralidade com "Habilitar alertas de saída/neutralidade" ligado.
6. Configurar Timeframe 2 ou 3 igual/menor que o do gráfico e confirmar que o aviso laranja
   aparece e os sinais somem.
7. Colar `confluence_dashboard_strategy.pine` em outra aba do Pine Editor, aplicar ao
   gráfico e conferir os resultados na aba "Strategy Tester" (ajustando comissão/slippage
   para o ativo testado antes de confiar nos números).
8. Em timeframes baixos (ex: 1 minuto), testar o input "Mínimo de barras entre sinais
   consecutivos" com valores como 10-15 e comparar a quantidade de sinais antes/depois.

## Publicar e vender na TradingView (passo manual, fora do código)

1. Publicar o script como "Invite-only script" no perfil da TradingView.
2. Na página de publicação, ativar cobrança (TradingView cobra uma taxa sobre a receita
   de assinaturas de scripts invite-only — confira os termos atuais no próprio site).
3. Definir preço (mensal/anual) e período de teste grátis, se desejar.
4. Escrever a descrição pública do script (ver rascunho abaixo) com imagens do indicador
   aplicado a um gráfico real, mostrando o modo simples e o avançado.

### Rascunho de descrição para a listagem

**Título:** Confluence Dashboard — Sinais BUY/SELL Multi-Timeframe

**Descrição:**
> Pare de abrir vários gráficos para conferir se as timeframes estão alinhadas. O
> Confluence Dashboard combina tendência, momentum e volatilidade em até 3 timeframes
> simultâneas e te avisa com um sinal claro de BUY ou SELL no gráfico — mais alerta
> automático, direto no seu celular ou e-mail.
>
> - Modo simples: sinais prontos, sem curva de aprendizado.
> - Modo avançado: painel de confluência detalhado + EMAs, para quem quer customizar.
> - Alertas nativos da TradingView, configuração em 30 segundos.
>
> Ideal tanto para quem está começando quanto para traders experientes que querem
> automatizar a checagem de múltiplas timeframes.
>
> **Aviso de risco:** este script é uma ferramenta de análise técnica e não constitui
> recomendação de investimento nem promessa de resultado. Negociar envolve risco real de
> perda de capital, incluindo a totalidade do capital investido. Resultados passados,
> simulados ou de backtest não garantem resultados futuros. Use por sua conta e risco,
> com gestão de risco adequada, e não em timeframes abaixo de 5-15 minutos sem ajustar o
> filtro de sinais consecutivos (ver seção de limitações conhecidas).

**Tags sugeridas:** confluence, multi-timeframe, buy sell signals, trend, momentum, dashboard

Nota: a TradingView é uma plataforma internacional — para maximizar alcance na listagem,
vale traduzir a descrição (incluindo o aviso de risco) também para o inglês antes de publicar.
