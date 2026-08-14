# Confluence Dashboard — Multi-Timeframe BUY/SELL

Indicador em Pine Script v5 para TradingView. Combina tendência (EMA), momentum (RSI)
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

## Limitações conhecidas (importante deixar claro para quem for comprar)

- **Repintura em timeframes maiores**: como o indicador usa `request.security()` para ler
  timeframes maiores dentro do timeframe do gráfico, o valor da barra em formação da
  timeframe maior pode mudar até ela fechar. Isso é uma limitação inerente do Pine Script,
  não um bug. A opção "Aguardar fechamento do candle" reduz o problema, exigindo confirmação
  antes de disparar o sinal.
- Este é um indicador de **confluência de indicadores técnicos clássicos**, não uma previsão
  garantida — como qualquer ferramenta de análise técnica, gera falsos sinais, especialmente
  em mercados sem tendência definida (lateralizados).
- Não executa ordens sozinho: é uma ferramenta de apoio à decisão, não um robô de trading.

## Como testar

1. Abrir o Pine Editor na TradingView.
2. Colar o conteúdo de `confluence_dashboard.pine`.
3. Clicar em "Add to Chart".
4. Testar em modo Simples e Avançado, em diferentes ativos/timeframes, e comparar
   os sinais BUY/SELL com o comportamento do preço.
5. Configurar um alerta (ícone de relógio) usando as condições "Sinal de COMPRA" /
   "Sinal de VENDA" para validar que o alerta dispara no candle certo.

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

**Tags sugeridas:** confluence, multi-timeframe, buy sell signals, trend, momentum, dashboard
