# Diagramação automatizada de miolo (KDP + UICLAP)

Pipeline de linha de comando que transforma um manuscrito (`.md` ou `.docx`)
em um **PDF de miolo pronto para impressão** e um **EPUB**, aplicando
automaticamente as regras de diagramação (margens, sangria, letra capitular,
caixas de destaque) para os formatos mais usados na Amazon KDP e na UICLAP.

Criado para não-ficção com tabelas/dados (negócios, psicologia, finanças,
investimentos) e ficção — cobrindo o que mais consome tempo manual em
ferramentas como Reedsy/Gamma/Vellum: ajustar margem, capitular, quebra de
capítulo e caixas de destaque livro a livro.

## O que ele resolve

| Dor manual | O que o pipeline faz |
|---|---|
| Calcular margem/gutter certo pra cada tamanho e nº de páginas | `scripts/margens.py` calcula automaticamente (tabela KDP + faixa UICLAP) |
| Letra capitular no início de cada capítulo | Aplicada automaticamente via `filters/capitulares.lua` (lettrine) |
| Caixas de destaque (dica/atenção/nota/citação) para não-ficção | Blocos `::: dica ... :::` no Markdown viram caixas estilizadas |
| Tabelas de dados bem formatadas | booktabs + longtable, com fonte de legenda menor |
| Gerar PDF de impressão E EPUB do mesmo manuscrito | Um comando gera os dois |
| Cabeçalho com título do livro / título do capítulo | Configurado automaticamente por página par/ímpar |

## Requisitos de sistema

```
sudo apt-get install pandoc texlive-latex-extra texlive-fonts-recommended \
    texlive-xetex texlive-lang-portuguese poppler-utils python3-yaml python3-jinja2
```

(`poppler-utils` fornece o `pdfinfo` usado para conferir a contagem de
páginas e o tamanho final do PDF. `python3-jinja2` não é usado atualmente
pelo script mas fica disponível para customizações futuras do template.)

## Uso

```bash
python3 scripts/diagramar.py \
  --livro meu-livro/livro.yaml \
  --manuscrito meu-livro/manuscrito.md \
  --saida meu-livro/saida/
```

Gera `saida/miolo.pdf` (impressão) e `saida/livro.epub` (ebook). Aceita
`.md` ou `.docx` como manuscrito — detectado pela extensão do arquivo.

### Interface web (sem linha de comando)

Se preferir testar por um formulário no navegador em vez de linha de
comando:

```bash
pip install -r interface/requirements.txt
streamlit run interface/app.py
```

Abre automaticamente em `http://localhost:8501`. A página deixa você:

1. Enviar o manuscrito (`.md` ou `.docx`) por upload
2. Preencher título, autor, subtítulo, dedicatória etc.
3. Escolher o tamanho do miolo num menu (com a descrição de uso de cada um)
4. Marcar sangria / letra capitular
5. Clicar em "Gerar miolo e EPUB" e baixar o PDF e o EPUB direto da página,
   com uma prévia do PDF renderizada ali mesmo

É o mesmo pipeline de `scripts/diagramar.py` por baixo — só troca a linha
de comando por um formulário. Cada geração roda numa pasta temporária,
então rodar de novo não acumula lixo no disco.

### `livro.yaml`

```yaml
titulo: "O Método da Clareza"
subtitulo: "Como organizar decisões financeiras sem complicação"
autor: "Matheus Izidro"
ano: 2026
editora: "Edição Independente"
isbn: ""                          # opcional
dedicatoria: "Para quem decidiu parar de adiar."   # opcional
trim: uiclap_15.5x23               # ver trims.yaml para as opções
paginas_estimadas: 180             # chute inicial; o script recalcula sozinho
sangria: false                     # true só se tiver imagem/cor sangrando até a borda
capitulares: true                  # false desativa a letra capitular
fonte_principal: "Latin Modern Roman"   # opcional, troque se tiver outra fonte instalada
```

Veja um exemplo completo funcional em `exemplos/livro-exemplo/`.

### Caixas de destaque no manuscrito

```markdown
::: dica
Antes de decidir, pergunte: "se eu errar, quanto custa voltar atrás?"
:::

::: atencao
Decisões de baixa reversibilidade merecem mais tempo de análise.
:::

::: nota
Contexto adicional que não interrompe o fluxo do texto principal.
:::

::: citacao
"Uma frase de destaque, citação ou epígrafe."
:::
```

## Tamanhos de miolo disponíveis (`trims.yaml`)

| Chave | Tamanho | Uso recomendado |
|---|---|---|
| `kdp_5.5x8.5` | 13,97×21,59 cm | Ficção/romance padrão KDP |
| `kdp_6x9` | 15,24×22,86 cm | Não-ficção padrão KDP |
| `uiclap_14x21` | 14×21 cm | Equivalente nacional ao 5.5x8.5" |
| `uiclap_15.5x23` | 15,5×23 cm | Formato mais comum na UICLAP |
| `uiclap_16x23` | 16×23 cm | Não-ficção densa (mais espaço p/ tabelas) |
| `uiclap_20x20_infantil` | 20×20 cm | Infantil ilustrado, fonte maior |
| `pocket_11x18` | 11×18 cm | Edição de bolso (**aproximado** — confirme com a gráfica/plataforma) |

Adicionar um tamanho novo é só acrescentar uma entrada em `trims.yaml`.

## As regras de diagramação por trás do cálculo

Pesquisa feita para calibrar `scripts/margens.py` (ver comentários no
arquivo para a lógica completa):

- **KDP**: a margem interna (lombada) cresce com a contagem de páginas —
  0,375" até 150 páginas, subindo em degraus até 0,875" em livros de 700+
  páginas — porque livros mais grossos curvam mais na encadernação e
  perdem legibilidade perto da lombada. Margens externas/topo/rodapé:
  mínimo 0,25", recomendado 0,5"–0,75". Sangria padrão: 0,125" (0,32cm).
  ([KDP Builder – Bleed and Margins](https://kdpbuilder.com/guides/kdp-bleed-and-margins),
  [KDP Interior Formatting Guide](https://kdpbuilder.com/blog/kdp-interior-formatting-guide))
- **UICLAP**: margens externas entre 1,5–2cm; margem interna (lombada)
  entre 2–2,5cm para livros com mais de 60 páginas; sangria obrigatória só
  quando há imagem/cor até a borda da página; imagens precisam de no
  mínimo 300 DPI.
  ([Margens e Sangrias – Suporte UICLAP](https://suporte.uiclap.com/support/solutions/articles/67000747527-margens-sangrias-e-o-caminho-para-uma-impress%C3%A3o-perfeita),
  [Miolo – Suporte UICLAP](https://suporte.uiclap.com/support/solutions/articles/67000449671-miolo-tamanho-quantidade-de-p%C3%A1ginas-tipo-de-arquivo-e-papel))
- **Tipografia**: letra capitular via `lettrine` (padrão tipográfico
  francês para capitulares), estilo de capítulo custom no `memoir`
  (mais flexível que a classe `book` padrão para paginação de livro).

### Como o pipeline se compara ao que você já usa

| Ferramenta | Automação | Trim size em cm | Tabelas/caixas de não-ficção | Capitular automática |
|---|---|---|---|---|
| Vellum | Nenhuma (100% manual, Mac-only) | Não (polegadas) | Básico | Sim, manual |
| Atticus | Nenhuma (multiplataforma) | Não (polegadas) | Callout boxes manuais | Sim, manual |
| Reedsy | Nenhuma (editor web) | Não | Limitado | Não |
| **Este pipeline** | Total (1 comando) | Sim, nativo | Sim, automático via Markdown | Sim, automático |

O que se perde: ajuste fino visual arrasta-e-solta (aqui é tudo via
template/config). O que se ganha: repetível, versionado em git, calibrado
uma vez e reaproveitado em todos os próximos livros.

## Limitações conhecidas

- **Capitular** só é aplicada quando o primeiro parágrafo do capítulo
  começa com um `Str` simples (palavra comum). Parágrafos que começam com
  travessão de diálogo, aspas ou itálico não recebem capitular automática
  — adicione manualmente com `\lettrine{}{}`" nesses casos raros.
- **Sangria** é tratada de forma simplificada (soma nas bordas não-lombada)
  — suficiente para o caso comum (texto preto em página branca, sem
  sangria) mas livros de arte com imagem sangrando em toda página merecem
  revisão manual antes de enviar para impressão.
- **Pocket 11x18cm** é uma aproximação — confirme a medida exata aceita
  pela gráfica/plataforma de destino antes de fechar o arquivo final.
- O contador de páginas faz até 2 tentativas para convergir a margem de
  lombada com a contagem real de páginas; livros que mudam de faixa (ex.:
  150→151 páginas) na segunda tentativa podem precisar rodar o comando
  mais uma vez.

## Estrutura

```
diagramacao/
  trims.yaml              # presets de tamanho de miolo
  templates/
    miolo.latex            # template pandoc (memoir) para o PDF de impressão
    epub.css                # estilo do EPUB
  filters/
    capitulares.lua         # letra capitular automática
    caixas.lua               # caixas de destaque (dica/atenção/nota/citação)
  scripts/
    margens.py               # cálculo de margens/gutter
    diagramar.py              # orquestrador (CLI)
  interface/
    app.py                    # formulário web (Streamlit) sobre o mesmo pipeline
    requirements.txt
  exemplos/
    livro-exemplo/             # manuscrito de não-ficção de exemplo, pronto pra rodar
```
