import json
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
)

SYSTEM_PROMPT = """你是一位资深的 HR 和技术面试官，擅长评估简历与岗位的匹配度。
请严格输出 JSON，不要输出任何其他文字，格式如下：
{
  "match_score": 0到100的整数,
  "summary": "一句话总体评价",
  "strengths": ["优点1", "优点2", "优点3"],
  "missing_skills": ["缺失技能1", "缺失技能2"],
  "suggestions": ["修改建议1", "修改建议2", "修改建议3"],
  "optimized_snippet": "一段优化后的简历片段"
}
"""


def analyze_resume(resume_text: str, jd_text: str) -> dict:
    """分析简历与岗位的匹配度，返回结构化字典。"""
    if not resume_text.strip():
        raise ValueError("简历内容不能为空")
    if not jd_text.strip():
        raise ValueError("岗位 JD 不能为空")

    user_prompt = f"""请分析下面这份简历与岗位的匹配度。

【简历】
{resume_text}

【岗位 JD】
{jd_text}

请按要求输出 JSON。"""

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content or "{}"

    # 防止模型偶尔包一层 ```json
    content = content.strip()
    if content.startswith("```"):
        content = content.strip("`")
        if content.startswith("json"):
            content = content[4:]

    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(f"模型返回的不是合法 JSON: {content}") from exc


if __name__ == "__main__":
    sample_resume = """
张三
求职意向：Python 后端开发
技能：Python、FastAPI、MySQL、Linux、Git
项目经历：使用 FastAPI 开发任务管理系统，支持 JWT 登录和 CRUD。
"""

    sample_jd = """
招聘 Python 后端工程师：
1. 熟悉 Python、FastAPI；
2. 熟悉 MySQL / PostgreSQL；
3. 熟悉 Docker、Linux；
4. 有 AI 应用开发经验优先。
"""

    result = analyze_resume(sample_resume, sample_jd)
    print(json.dumps(result, ensure_ascii=False, indent=2))