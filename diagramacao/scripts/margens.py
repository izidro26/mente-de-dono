"""Cálculo de margens de miolo a partir do trim size e da contagem de páginas.

Regras baseadas em:
- KDP: a margem interna (lombada/gutter) cresce com o número de páginas porque
  livros mais grossos curvam mais na encadernação. Tabela oficial (em polegadas,
  convertida aqui para cm): 24-150p -> 0.375"; 151-300p -> 0.5"; 301-500p -> 0.625";
  501-700p -> 0.75"; 701-828p -> 0.875". Margens externas/topo/rodapé: mínimo 0.25",
  recomendado 0.5"-0.75".
- UICLAP: margens externas entre 1.5 e 2 cm; margem interna (lombada) entre 2 e
  2.5 cm para livros com mais de 60 páginas (livros mais finos podem usar o piso
  da faixa).

Sangria (bleed): KDP usa 0.125" (0.3175cm); UICLAP usa 3.2mm (0.32cm) — aplicada
apenas nas bordas que não são a lombada, e só quando há imagem/cor sangrando até
a borda da página.
"""

from __future__ import annotations

from dataclasses import dataclass

POL_PARA_CM = 2.54


@dataclass
class Margens:
    lombada_cm: float   # margem interna, junto à encadernação
    externa_cm: float   # margem externa (lateral oposta à lombada)
    topo_cm: float
    rodape_cm: float
    sangria_cm: float   # 0.0 se o livro não usa sangria


def _interpola(valor: float, x0: float, y0: float, x1: float, y1: float) -> float:
    if valor <= x0:
        return y0
    if valor >= x1:
        return y1
    fator = (valor - x0) / (x1 - x0)
    return y0 + fator * (y1 - y0)


def _gutter_kdp_cm(paginas: int) -> float:
    tabela_polegadas = [
        (150, 0.375),
        (300, 0.5),
        (500, 0.625),
        (700, 0.75),
        (828, 0.875),
    ]
    for limite_paginas, gutter_pol in tabela_polegadas:
        if paginas <= limite_paginas:
            return round(gutter_pol * POL_PARA_CM, 3)
    return round(tabela_polegadas[-1][1] * POL_PARA_CM, 3)


def _gutter_uiclap_cm(paginas: int) -> float:
    # 2.0cm até 60 páginas, interpola até 2.5cm em livros com 400+ páginas.
    return round(_interpola(paginas, 60, 2.0, 400, 2.5), 3)


def calcular_margens(familia_margem: str, paginas: int, sangria_padrao_cm: float,
                      usar_sangria: bool) -> Margens:
    if paginas < 1:
        raise ValueError("contagem de páginas deve ser >= 1")

    if familia_margem == "kdp":
        lombada = _gutter_kdp_cm(paginas)
        externa = round(0.5 * POL_PARA_CM, 3)
        topo = rodape = round(0.625 * POL_PARA_CM, 3)
    elif familia_margem == "uiclap":
        lombada = _gutter_uiclap_cm(paginas)
        externa = 1.7
        topo = 1.7
        rodape = 2.0
    else:
        raise ValueError(f"familia_margem desconhecida: {familia_margem!r}")

    return Margens(
        lombada_cm=lombada,
        externa_cm=externa,
        topo_cm=topo,
        rodape_cm=rodape,
        sangria_cm=sangria_padrao_cm if usar_sangria else 0.0,
    )


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Calcula margens de miolo")
    ap.add_argument("familia", choices=["kdp", "uiclap"])
    ap.add_argument("paginas", type=int)
    ap.add_argument("--sangria", action="store_true")
    args = ap.parse_args()

    m = calcular_margens(args.familia, args.paginas, 0.32, args.sangria)
    print(f"lombada={m.lombada_cm}cm externa={m.externa_cm}cm "
          f"topo={m.topo_cm}cm rodape={m.rodape_cm}cm sangria={m.sangria_cm}cm")
