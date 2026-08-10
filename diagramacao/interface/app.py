"""Interface web local para testar o pipeline de diagramação sem linha de
comando. Faz upload do manuscrito, preenche os dados do livro num
formulário, roda scripts/diagramar.py e devolve o PDF/EPUB para download
(com preview do PDF na própria página).

Uso:
    pip install streamlit
    streamlit run interface/app.py
"""

from __future__ import annotations

import base64
import contextlib
import io
import pathlib
import shutil
import sys
import tempfile

import streamlit as st
import yaml

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts"))
from diagramar import diagramar  # noqa: E402

st.set_page_config(page_title="Diagramação de Livros", layout="wide")
st.title("Diagramação de Livros — KDP / UICLAP")
st.caption(
    "Envie o manuscrito, preencha os dados do livro e gere o PDF de miolo "
    "e o EPUB. Roda o mesmo pipeline de scripts/diagramar.py."
)


@st.cache_data
def carregar_presets() -> dict:
    with open(RAIZ / "trims.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)["presets"]


presets = carregar_presets()

with st.form("form-livro"):
    col_arquivo, col_trim = st.columns([2, 1])

    with col_arquivo:
        manuscrito_upload = st.file_uploader(
            "Manuscrito (.md ou .docx)", type=["md", "markdown", "docx"]
        )

    with col_trim:
        opcoes_trim = list(presets.keys())
        trim_escolhido = st.selectbox(
            "Tamanho do miolo",
            opcoes_trim,
            format_func=lambda chave: presets[chave]["nome"],
        )
        st.caption(presets[trim_escolhido].get("uso_recomendado", ""))

    col1, col2 = st.columns(2)
    with col1:
        titulo = st.text_input("Título *")
        subtitulo = st.text_input("Subtítulo")
        autor = st.text_input("Autor *", value="Matheus Izidro")
        ano = st.number_input("Ano", min_value=2000, max_value=2100, value=2026, step=1)
    with col2:
        editora = st.text_input("Editora", value="Edição Independente")
        isbn = st.text_input("ISBN (opcional)")
        dedicatoria = st.text_area("Dedicatória (opcional)", height=80)
        fonte_principal = st.text_input("Fonte principal", value="Latin Modern Roman")

    col3, col4, col5 = st.columns(3)
    with col3:
        paginas_estimadas = st.number_input(
            "Estimativa de páginas", min_value=1, max_value=2000, value=180, step=10,
            help="Só um chute inicial — o pipeline recalcula a margem pela contagem real."
        )
    with col4:
        sangria = st.checkbox(
            "Sangria", value=False,
            help="Ative só se houver imagem/cor até a borda da página."
        )
    with col5:
        capitulares = st.checkbox("Letra capitular nos capítulos", value=True)

    enviado = st.form_submit_button("Gerar miolo e EPUB", type="primary")


if enviado:
    erros = []
    if manuscrito_upload is None:
        erros.append("Envie um manuscrito (.md ou .docx).")
    if not titulo.strip():
        erros.append("Preencha o título.")
    if not autor.strip():
        erros.append("Preencha o autor.")

    if erros:
        for erro in erros:
            st.error(erro)
    else:
        with st.spinner("Gerando PDF de miolo e EPUB — pode levar um minuto..."):
            tmp_dir = pathlib.Path(tempfile.mkdtemp(prefix="diagramacao-"))
            try:
                extensao = pathlib.Path(manuscrito_upload.name).suffix or ".md"
                manuscrito_path = tmp_dir / f"manuscrito{extensao}"
                manuscrito_path.write_bytes(manuscrito_upload.getvalue())

                livro = {
                    "titulo": titulo.strip(),
                    "subtitulo": subtitulo.strip(),
                    "autor": autor.strip(),
                    "ano": int(ano),
                    "editora": editora.strip(),
                    "isbn": isbn.strip(),
                    "dedicatoria": dedicatoria.strip(),
                    "trim": trim_escolhido,
                    "paginas_estimadas": int(paginas_estimadas),
                    "sangria": bool(sangria),
                    "capitulares": bool(capitulares),
                    "fonte_principal": fonte_principal.strip() or "Latin Modern Roman",
                }
                livro_yaml_path = tmp_dir / "livro.yaml"
                with open(livro_yaml_path, "w", encoding="utf-8") as f:
                    yaml.safe_dump(livro, f, allow_unicode=True)

                saida_dir = tmp_dir / "saida"
                log = io.StringIO()
                erro_execucao = None
                with contextlib.redirect_stdout(log):
                    try:
                        diagramar(livro_yaml_path, manuscrito_path, saida_dir)
                    except Exception as exc:  # noqa: BLE001
                        erro_execucao = exc

                st.subheader("Log")
                st.code(log.getvalue() or "(sem saída)", language=None)

                if erro_execucao is not None:
                    st.error(f"Falha ao gerar o livro: {erro_execucao}")
                else:
                    pdf_path = saida_dir / "miolo.pdf"
                    epub_path = saida_dir / "livro.epub"

                    col_pdf, col_epub = st.columns(2)
                    with col_pdf:
                        st.download_button(
                            "Baixar PDF do miolo",
                            data=pdf_path.read_bytes(),
                            file_name=f"{titulo.strip() or 'miolo'}.pdf",
                            mime="application/pdf",
                        )
                    with col_epub:
                        st.download_button(
                            "Baixar EPUB",
                            data=epub_path.read_bytes(),
                            file_name=f"{titulo.strip() or 'livro'}.epub",
                            mime="application/epub+zip",
                        )

                    st.subheader("Prévia do PDF")
                    pdf_base64 = base64.b64encode(pdf_path.read_bytes()).decode("ascii")
                    st.markdown(
                        f'<iframe src="data:application/pdf;base64,{pdf_base64}" '
                        f'width="100%" height="800" style="border: 1px solid #ccc;">'
                        f"</iframe>",
                        unsafe_allow_html=True,
                    )
            finally:
                shutil.rmtree(tmp_dir, ignore_errors=True)
