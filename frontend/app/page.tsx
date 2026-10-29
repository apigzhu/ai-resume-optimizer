"use client";

import { useState } from "react";

const API_BASE = "/api";

type AnalyzeResult = {
  match_score: number;
  summary: string;
  strengths: string[];
  missing_skills: string[];
  suggestions: string[];
  optimized_snippet: string;
};

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.detail || "请求失败";
  } catch {
    return `请求失败（${res.status}）`;
  }
}

async function uploadResume(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/resume/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(await readError(res));

  const data = await res.json();
  return data.text as string;
}

async function analyzeResume(
  resumeText: string,
  jdText: string,
): Promise<AnalyzeResult> {
  const res = await fetch(`${API_BASE}/resume/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_text: resumeText,
      jd_text: jdText,
    }),
  });

  if (!res.ok) throw new Error(await readError(res));

  return (await res.json()) as AnalyzeResult;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");
    setResult(null);

    if (!jdText.trim()) {
      setError("请先填写岗位 JD");
      return;
    }
    if (!file && !resumeText.trim()) {
      setError("请上传简历，或直接粘贴简历文本");
      return;
    }

    setLoading(true);
    try {
      const text = file ? await uploadResume(file) : resumeText;
      const data = await analyzeResume(text, jdText);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    result && result.match_score >= 80
      ? "text-green-600"
      : result && result.match_score >= 60
        ? "text-yellow-600"
        : "text-red-600";

      const barColor =
    result && result.match_score >= 80
      ? "bg-green-500"
      : result && result.match_score >= 60
        ? "bg-yellow-500"
        : "bg-red-500";      

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            AI 简历优化器
          </h1>
          <p className="mt-2 text-slate-500">
            上传简历，粘贴岗位 JD，获取匹配度分析和修改建议
          </p>
        </header>

        <section className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="font-semibold text-slate-800">1. 简历</h2>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-lg border border-slate-300 p-2 text-sm"
            />
            <p className="text-xs text-slate-400">
              支持 PDF / DOCX / TXT，最大 5MB；也可以直接在下面粘贴
            </p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="或者直接粘贴简历文本..."
              rows={8}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-slate-800">2. 岗位 JD</h2>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="粘贴目标岗位的职位描述..."
              rows={12}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </section>

        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "分析中..." : "开始分析"}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {result && (
          <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">分析结果</h2>
              <div className="text-right">
                <div className={`text-4xl font-bold ${scoreColor}`}>
                  {result.match_score}
                </div>
                <div className="text-xs text-slate-400">匹配度</div>
              </div>
            </div>

                  <div>
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>匹配度</span>
                <span>{result.match_score} / 100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{
                    width: `${Math.min(Math.max(result.match_score, 0), 100)}%`,
                  }}
                />
              </div>
            </div>  

            <p className="rounded-lg bg-slate-50 p-4 text-slate-700">
              {result.summary}
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold text-green-700">优势</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {result.strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-red-700">缺失技能</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills.map((item, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-blue-700">修改建议</h3>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
                {result.suggestions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-slate-800">
                优化后的简历片段
              </h3>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
                {result.optimized_snippet}
              </pre>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}