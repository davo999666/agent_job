import json
from pathlib import Path
from typing import Any

import fitz


ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"

CV_FILE = ROOT_DIR / "CV.pdf"
CV_CACHE_FILE = DATA_DIR / "cv_cache.json"


def find_cv() -> Path:
    if CV_FILE.is_file():
        return CV_FILE

    raise FileNotFoundError(
        "Add CV.pdf to the project root."
    )

def load_cached_cv() -> dict[str, Any] | None:
    try:
        data = json.loads(
            CV_CACHE_FILE.read_text(
                encoding="utf-8",
            )
        )

        if not isinstance(data, dict):
            return None

        return data

    except (
        FileNotFoundError,
        json.JSONDecodeError,
        OSError,
    ):
        return None

def cache_is_valid(cv_file: Path) -> bool:
    if not CV_CACHE_FILE.is_file():
        return False

    return (
        CV_CACHE_FILE.stat().st_mtime
        >= cv_file.stat().st_mtime
    )

def save_cv_cache(cv_data: dict[str, Any],) -> None:

    DATA_DIR.mkdir( parents=True, exist_ok=True )

    CV_CACHE_FILE.write_text(
        json.dumps(cv_data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )




def pdf_to_json(cv_file: Path) -> dict[str, Any]:
    document = fitz.open(cv_file)
    content: list[str] = []

    try:
        for page in document:
            text = page.get_text("text")

            lines = [
                line.strip()
                for line in text.splitlines()
                if line.strip()
            ]

            content.extend(lines)

    finally:
        document.close()

    if not content:
        raise ValueError(
            "No readable text was found in the PDF."
        )

    return {
        "content": content,
    }


def convert_cv_to_json(cv_file: Path,) -> dict[str, Any]:
    if cv_file.suffix.lower() != ".pdf":
        raise ValueError(
            "Only PDF files are currently supported."
        )

    return pdf_to_json(cv_file)








