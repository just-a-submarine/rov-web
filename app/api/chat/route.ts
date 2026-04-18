import { NextRequest, NextResponse } from "next/server";

// 不使用 edge runtime：確保 process.env 在所有環境中穩定讀取
// export const runtime = "edge";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
}

interface RequestBody {
  messages: ChatMessage[];
  docContext: string;
  docTitle: string;
}

// 允許的來源（防止跨站濫用）
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://just-a-submarine.vercel.app",
];


function isTrustedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin") ?? "";
  const referer = req.headers.get("referer") ?? "";
  return (
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ||
    ALLOWED_ORIGINS.some((o) => referer.startsWith(o)) ||
    // 開發環境放行 localhost
    origin.startsWith("http://localhost") ||
    referer.startsWith("http://localhost")
  );
}

export async function POST(req: NextRequest) {
  // ── 來源驗證 ──────────────────────────────────────────────────────
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── API Key 檢查 ──────────────────────────────────────────────────
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "伺服器未設定 OPENROUTER_API_KEY" },
      { status: 500 }
    );
  }

  // ── 解析請求 ──────────────────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });
  }

  const { messages, docContext, docTitle } = body;

  // ── 基本格式驗證 ─────────────────────────────────────────────────
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "缺少 messages 欄位" }, { status: 400 });
  }

  // ── 建構 System Prompt ────────────────────────────────────────────
  const systemPrompt = `你是一位技術文件助手，專門協助使用者理解「只是一台潛水艇」ROV 專案的文件。

使用者目前正在閱讀的文件：**${docTitle ?? "未知文件"}**

以下是該文件的完整內容：
---
${docContext ?? "（無文件內容）"}
---

請依據上述文件內容回答使用者的問題。
- 若問題在文件中有明確答案，直接引用相關段落作答
- 若問題超出文件範圍，誠實告知並提供你已知的相關背景知識
- 回答使用繁體中文，技術術語可保留英文
- 回答要簡潔清晰，適時使用條列式`;

  const openRouterMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  // ── 呼叫 OpenRouter ───────────────────────────────────────────────
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://just-a-submarine.vercel.app",
          "X-Title": "Just a Submarine ROV",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: openRouterMessages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "(無法讀取錯誤訊息)");
      console.error("[chat/route] OpenRouter error:", response.status, errText);
      return NextResponse.json(
        { error: `AI 服務錯誤（${response.status}），請稍後再試` },
        { status: 502 }
      );
    }

    if (!response.body) {
      return NextResponse.json({ error: "AI 服務無回應" }, { status: 502 });
    }

    // Pipe SSE 串流到客戶端
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[chat/route] fetch error:", err);
    return NextResponse.json(
      { error: `網路錯誤：${err instanceof Error ? err.message : "未知"}` },
      { status: 503 }
    );
  }
}
