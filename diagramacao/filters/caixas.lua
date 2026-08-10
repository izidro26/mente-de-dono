-- Converte blocos Div do Markdown (::: dica ... :::) em caixas de destaque
-- tcolorbox definidas em templates/miolo.latex. Classes suportadas:
--   dica, atencao, nota, citacao

local classes_suportadas = {
  dica = "caixadica",
  atencao = "caixaatencao",
  nota = "caixanota",
  citacao = "caixacitacao",
}

function Div(el)
  for classe, ambiente in pairs(classes_suportadas) do
    if el.classes:includes(classe) then
      local latex_interno = pandoc.write(pandoc.Pandoc(el.content), "latex")
      local latex = string.format("\\begin{%s}\n%s\n\\end{%s}", ambiente, latex_interno, ambiente)
      return pandoc.RawBlock("latex", latex)
    end
  end
  return el
end
