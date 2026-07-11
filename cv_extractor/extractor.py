import json
from pathlib import Path
from typing import Any

from docx import Document
from pypdf import PdfReader

from LangChain.chain import cv_extract_chain


ROOT = Path(__file__).resolve().parent.parent
CACHE_FILE = ROOT / "cv_cache.json"


def find_cv() -> Path:
    for extension in ("pdf", "docx", "txt"):
        cv_file = ROOT / f"CV.{extension}"

        if cv_file.exists():
            return cv_file

    raise FileNotFoundError(
        "Add CV.pdf, CV.docx, or CV.txt to the project root."
    )


def read_cv(cv_file: Path) -> str:
    extension = cv_file.suffix.lower()

    if extension == ".pdf":
        text = "\n".join(
            page.extract_text() or ""
            for page in PdfReader(cv_file).pages
        )

    elif extension == ".docx":
        text = "\n".join(
            paragraph.text
            for paragraph in Document(cv_file).paragraphs
            if paragraph.text.strip()
        )

    else:
        text = cv_file.read_text(encoding="utf-8")

    text = text.strip()

    if not text:
        raise ValueError("The CV contains no readable text.")

    return text


def cache_is_valid(cv_file: Path) -> bool:
    return (
        CACHE_FILE.exists()
        and CACHE_FILE.stat().st_mtime >= cv_file.stat().st_mtime
    )


def load_cv_data() -> dict[str, Any]:
    cv_file = find_cv()

    if cache_is_valid(cv_file):
        return json.loads(CACHE_FILE.read_text(encoding="utf-8"))

    cv_text = read_cv(cv_file)
    cv_data = cv_extract_chain.invoke({"cv_text": cv_text})

    CACHE_FILE.write_text(
        json.dumps(cv_data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    return cv_data


CV_DATA = load_cv_data()