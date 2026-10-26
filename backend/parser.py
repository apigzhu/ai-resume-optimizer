import io

import pdfplumber
from docx import Document


def extract_pdf_text(file_bytes: bytes) -> str:
    """从 PDF 字节中提取文本。"""
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text_parts.append(page_text)
    return "\n".join(text_parts).strip()


def extract_docx_text(file_bytes: bytes) -> str:
    """从 DOCX 字节中提取段落文本。"""
    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs).strip()


def extract_text(filename: str, file_bytes: bytes) -> str:
    """根据文件扩展名选择解析方式。"""
    lower = filename.lower()

    if lower.endswith(".pdf"):
        return extract_pdf_text(file_bytes)
    if lower.endswith(".docx"):
        return extract_docx_text(file_bytes)
    if lower.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore").strip()

    raise ValueError("仅支持 PDF / DOCX / TXT 文件")