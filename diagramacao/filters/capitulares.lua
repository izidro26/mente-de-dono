-- Envolve a primeira palavra do primeiro parágrafo de cada capítulo em
-- \lettrine{letra}{resto da palavra} para gerar uma letra capitular.
-- Desativado se o metadado usar_capitulares for false (ex.: livro infantil).
--
-- No AST do pandoc, cada palavra do parágrafo já chega como um Inline Str
-- separado (separado por Space) — não é preciso procurar espaços dentro do
-- texto, só dividir o primeiro Str em (primeira letra) + (resto da palavra).

local doing_dropcap = true

function Meta(meta)
  if meta["usar_capitulares"] ~= nil then
    doing_dropcap = meta["usar_capitulares"] ~= false
  end
end

local function primeira_letra_e_resto(palavra)
  if pandoc.text.len(palavra) < 2 then
    return nil
  end
  local letra = pandoc.text.sub(palavra, 1, 1)
  local resto = pandoc.text.sub(palavra, 2, pandoc.text.len(palavra))
  return letra, resto
end

function Pandoc(doc)
  if not doing_dropcap then
    return doc
  end

  local out = {}
  local waiting = false

  for _, block in ipairs(doc.blocks) do
    if block.t == "Header" and block.level == 1 then
      waiting = true
      table.insert(out, block)
    elseif waiting and block.t == "Para" then
      waiting = false
      if block.content[1] and block.content[1].t == "Str" then
        local letra, resto = primeira_letra_e_resto(block.content[1].text)
        if letra then
          local latex = string.format("\\lettrine{%s}{%s}", letra, resto)
          local novo_content = { pandoc.RawInline("latex", latex) }
          for i = 2, #block.content do
            table.insert(novo_content, block.content[i])
          end
          table.insert(out, pandoc.Para(novo_content))
        else
          table.insert(out, block)
        end
      else
        table.insert(out, block)
      end
    else
      table.insert(out, block)
    end
  end

  doc.blocks = out
  return doc
end
