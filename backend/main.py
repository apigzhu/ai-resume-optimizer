from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from ai_service import analyze_resume
from parser import extract_text

app = FastAPI(
    title="AI Resume Optimizer API",
    version="0.1.0",
    description="AI 简历优化器后端接口",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = (".pdf", ".docx", ".txt")


class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=1, description="简历文本")
    jd_text: str = Field(..., min_length=1, description="岗位 JD")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "resume-optimizer",
        "version": "0.1.0",
    }


@app.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or ""

    if not filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail="仅支持 PDF / DOCX / TXT 文件",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="文件不能超过 5MB",
        )

    try:
        text = extract_text(filename, file_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"解析失败: {exc}",
        ) from exc

    if not text:
        raise HTTPException(
            status_code=400,
            detail="未能从文件中提取到文本（可能是扫描版 PDF）",
        )

    return {
        "filename": filename,
        "size": len(file_bytes),
        "characters": len(text),
        "preview": text[:500],
        "text": text,
    }


@app.post("/resume/analyze")
def analyze(request: AnalyzeRequest):
    try:
        result = analyze_resume(request.resume_text, request.jd_text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="AI 分析失败，请稍后重试",
        ) from exc

    return result