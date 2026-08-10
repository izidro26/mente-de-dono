#!/usr/bin/env python3
"""Gera o miolo (PDF de impressão) e o EPUB de um livro a partir de um
manuscrito em Markdown ou .docx, aplicando as regras de diagramação de
trims.yaml e scripts/margens.py.

Uso:
    python3 diagramar.py --livro caminho/livro.yaml --manuscrito caminho/manuscrito.md --saida saida/

Requer no sistema: pandoc, xelatex (texlive-xetex), memoir/lettrine/tcolorbox
(texlive-latex-extra), pdfinfo (poppler-utils). Ver README.md.
"""

from __future__ import annotations

import argparse
import pathlib
import re
import subprocess
import sys

import yaml

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))
from margens import calcular_margens  # noqa: E402

POL_PARA_CM = 2.54


def carregar_trims() -> dict:
    with open(RAIZ / "trims.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)["presets"]


def contar_paginas_pdf(caminho_pdf: pathlib.Path) -> int:
    saida = subprocess.run(
        ["pdfinfo", str(caminho_pdf)], capture_output=True, text=True, check=True
    ).stdout
    m = re.search(r"^Pages:\s+(\d+)", saida, re.MULTILINE)
    if not m:
        raise RuntimeError("não foi possível ler a contagem de páginas do PDF gerado")
    return int(m.group(1))


def tamanho_pagina_pdf(caminho_pdf: pathlib.Path) -> str:
    saida = subprocess.run(
        ["pdfinfo", str(caminho_pdf)], capture_output=True, text=True, check=True
    ).stdout
    m = re.search(r"^Page size:\s+(.+)$", saida, re.MULTILINE)
    return m.group(1).strip() if m else "desconhecido"


def montar_pandoc_variaveis(livro: dict, preset: dict, margens) -> list[str]:
    largura_efetiva = preset["largura_cm"] + margens.sangria_cm
    altura_efetiva = preset["altura_cm"] + (2 * margens.sangria_cm)

    variaveis = {
        "titulo": livro["titulo"],
        "subtitulo": livro.get("subtitulo", ""),
        "autor": livro["autor"],
        "ano": str(livro.get("ano", "")),
        "editora": livro.get("editora", ""),
        "isbn": livro.get("isbn", ""),
        "dedicatoria": livro.get("dedicatoria", ""),
        "largura_efetiva_cm": f"{largura_efetiva:.3f}",
        "altura_efetiva_cm": f"{altura_efetiva:.3f}",
        "lombada_cm": f"{margens.lombada_cm:.3f}",
        "externa_cm": f"{margens.externa_cm:.3f}",
        "topo_cm": f"{margens.topo_cm:.3f}",
        "rodape_cm": f"{margens.rodape_cm:.3f}",
        "fonte_pt": str(preset.get("fonte_base_pt", 11)),
        "fonte_principal": livro.get("fonte_principal", "Latin Modern Roman"),
    }
    args = []
    for chave, valor in variaveis.items():
        args += ["-V", f"{chave}={valor}"]
    usar_capitulares = preset.get("estilo") != "infantil" and livro.get("capitulares", True)
    args += ["-M", f"usar_capitulares={'true' if usar_capitulares else 'false'}"]
    if usar_capitulares:
        args += ["-V", "usar_capitulares=true"]
    return args


def rodar_pandoc_pdf(manuscrito: pathlib.Path, saida_pdf: pathlib.Path,
                      variaveis: list[str], media_dir: pathlib.Path) -> None:
    formato_entrada = "docx" if manuscrito.suffix.lower() == ".docx" else "markdown"
    cmd = [
        "pandoc", str(manuscrito),
        "-f", formato_entrada,
        "--top-level-division=chapter",
        "--template", str(RAIZ / "templates" / "miolo.latex"),
        "--lua-filter", str(RAIZ / "filters" / "capitulares.lua"),
        "--lua-filter", str(RAIZ / "filters" / "caixas.lua"),
        "--pdf-engine", "xelatex",
        "--extract-media", str(media_dir),
        "-o", str(saida_pdf),
        *variaveis,
    ]
    resultado = subprocess.run(cmd, capture_output=True, text=True)
    if resultado.returncode != 0:
        print(resultado.stdout)
        print(resultado.stderr, file=sys.stderr)
        raise RuntimeError("pandoc/xelatex falhou ao gerar o PDF do miolo")


def rodar_pandoc_epub(manuscrito: pathlib.Path, saida_epub: pathlib.Path,
                       livro: dict, media_dir: pathlib.Path) -> None:
    formato_entrada = "docx" if manuscrito.suffix.lower() == ".docx" else "markdown"
    cmd = [
        "pandoc", str(manuscrito),
        "-f", formato_entrada,
        "-t", "epub3",
        "--css", str(RAIZ / "templates" / "epub.css"),
        "--lua-filter", str(RAIZ / "filters" / "caixas.lua"),
        "--extract-media", str(media_dir),
        "--metadata", f"title={livro['titulo']}",
        "--metadata", f"author={livro['autor']}",
        "-o", str(saida_epub),
    ]
    if livro.get("subtitulo"):
        cmd += ["--metadata", f"subtitle={livro['subtitulo']}"]
    resultado = subprocess.run(cmd, capture_output=True, text=True)
    if resultado.returncode != 0:
        print(resultado.stdout)
        print(resultado.stderr, file=sys.stderr)
        raise RuntimeError("pandoc falhou ao gerar o EPUB")


def diagramar(livro_yaml: pathlib.Path, manuscrito: pathlib.Path, saida_dir: pathlib.Path) -> None:
    with open(livro_yaml, encoding="utf-8") as f:
        livro = yaml.safe_load(f)

    presets = carregar_trims()
    preset_key = livro["trim"]
    if preset_key not in presets:
        raise SystemExit(f"trim '{preset_key}' não existe em trims.yaml. "
                          f"Opções: {', '.join(presets)}")
    preset = presets[preset_key]

    saida_dir.mkdir(parents=True, exist_ok=True)
    media_dir = saida_dir / "midia"
    saida_pdf = saida_dir / "miolo.pdf"
    saida_epub = saida_dir / "livro.epub"

    usar_sangria = bool(livro.get("sangria", False))
    paginas = int(livro.get("paginas_estimadas", 200))

    print(f"[1/3] Gerando miolo PDF ({preset['nome']}) — estimativa inicial: {paginas} páginas")
    for tentativa in range(2):
        margens = calcular_margens(preset["familia_margem"], paginas,
                                    preset["sangria_padrao_cm"], usar_sangria)
        variaveis = montar_pandoc_variaveis(livro, preset, margens)
        rodar_pandoc_pdf(manuscrito, saida_pdf, variaveis, media_dir)
        paginas_reais = contar_paginas_pdf(saida_pdf)
        print(f"    tentativa {tentativa + 1}: {paginas_reais} páginas reais "
              f"(lombada calculada para {paginas} páginas: {margens.lombada_cm}cm)")
        if paginas_reais == paginas:
            break
        paginas = paginas_reais
    else:
        print("    aviso: contagem de páginas não convergiu após 2 tentativas; "
              "margens usadas são uma boa aproximação, mas confira o PDF final.")

    print(f"[2/3] Gerando EPUB")
    rodar_pandoc_epub(manuscrito, saida_epub, livro, media_dir)

    tamanho_final = tamanho_pagina_pdf(saida_pdf)
    print(f"[3/3] Concluído.")
    print(f"    PDF:  {saida_pdf}  ({paginas_reais} páginas, tamanho de página: {tamanho_final})")
    print(f"    EPUB: {saida_epub}")
    print(f"    Margens finais — lombada: {margens.lombada_cm}cm | externa: {margens.externa_cm}cm | "
          f"topo: {margens.topo_cm}cm | rodapé: {margens.rodape_cm}cm | sangria: {margens.sangria_cm}cm")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--livro", required=True, type=pathlib.Path, help="caminho para livro.yaml")
    ap.add_argument("--manuscrito", required=True, type=pathlib.Path, help="caminho para .md ou .docx")
    ap.add_argument("--saida", required=True, type=pathlib.Path, help="diretório de saída")
    args = ap.parse_args()
    diagramar(args.livro, args.manuscrito, args.saida)


if __name__ == "__main__":
    main()
