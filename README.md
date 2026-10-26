# AI 简历优化器

基于大模型的简历与岗位匹配度分析工具。上传 PDF/Word 简历，粘贴岗位 JD，自动生成匹配评分、优势、缺失技能和修改建议。

## ✨ 功能

- 简历上传（PDF / DOCX / TXT）与文本提取
- 岗位 JD 输入
- AI 匹配度评分（0-100）
- 优势 / 缺失技能 / 修改建议 / 优化后的简历片段
- 结构化 JSON 输出，便于前端渲染

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Python 3.14、FastAPI、Pydantic |
| 文件解析 | pdfplumber、python-docx |
| 前端 | Next.js、React、TypeScript、Tailwind CSS |
| AI | DeepSeek API（兼容 OpenAI SDK） |
| 数据库 | 规划中（PostgreSQL） |

## 📁 项目结构
resume-optimizer/
├── backend/
│   ├── main.py          # FastAPI 入口与接口
│   ├── parser.py        # PDF/DOCX/TXT 解析
│   ├── ai_service.py    # 大模型调用与结构化输出
│   └── requirements.txt
└── frontend/
    └── app/
        └── page.tsx     # 上传 + JD + 分析结果页面

        

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/apigzhu/ai-resume-optimizer.git
cd ai-resume-optimizer

### 2.启动后端
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

### 3.创建backend/.venv
DEEPSEEK_API_KEY=your_api_key_here
启动：uvicorn main:app --reload --port 8000
接口文档：http://127.0.0.1:8000/docs

### 4.启动前端
cd frontend
npm install
npm run dev
访问：http://localhost:3000
