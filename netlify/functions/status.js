// netlify/functions/status.js

export async function handler(event, context) {
  try {
    // 1) קריאת ENV
    const base = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // ✅ ENV DEBUG (לא מדפיס סודות)
    console.log("ENV DEBUG:");
    console.log("SUPABASE_URL:", base ? "OK" : "MISSING", "LEN:", base ? base.length : 0);
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY:",
      key ? "OK" : "MISSING",
      "LEN:",
      key ? key.length : 0
    );
    console.log(
      "ALL ENV KEYS:",
      Object.keys(process.env).filter((k) => k.includes("SUPABASE"))
    );

    // 2) בדיקות בסיס
    if (!base || typeof base !== "string") {
      throw new Error("SUPABASE_URL is missing");
    }
    if (!base.startsWith("http")) {
      throw new Error(
        `SUPABASE_URL is invalid (must start with http/https): ${JSON.stringify(base)}`
      );
    }
    if (!key || typeof key !== "string") {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
    }

    // 3) בנה URL תקין ל-Supabase REST
    // 🔥 שנה את שם הטבלה לשם האמיתי אצלך בסופאבייס
    const TABLE_NAME = "YOUR_TABLE_NAME"; // לדוגמה: "reports"

    // ✅ חשוב: & ולא &amp;
    const url = new URL(`/rest/v1/${TABLE_NAME}?select=*&limit=1`, base).toString();
    console.log("FETCH URL =", url);

    // 4) קריאת fetch
    const res = await fetch(url, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    });

    const text = await res.text();

    // 5) אם Supabase מחזיר שגיאה (401/403/404/...)
    if (!res.ok) {
      console.error("SUPABASE RESPONSE STATUS:", res.status);
      console.error("SUPABASE RESPONSE BODY:", text);

      return json(res.status, {
        ok: false,
        source: "supabase",
        status: res.status,
        body: safeJsonParse(text),
      });
    }

    // 6) הצלחה
    return json(200, {
      ok: true,
      status: res.status,
      data: safeJsonParse(text),
    });
  } catch (err) {
    console.error("STATUS FUNCTION ERROR:", err);
    console.error("CAUSE:", err?.cause);

    return json(500, {
      ok: false,
      message: err?.message,
      name: err?.name,
      cause: err?.cause
        ? {
            message: err.cause.message,
            code: err.cause.code,
            errno: err.cause.errno,
            syscall: err.cause.syscall,
            address: err.cause.address,
            port: err.cause.port,
          }
        : null,
    });
  }
}

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj),
  };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
