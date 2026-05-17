exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method not allowed" };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Missing env vars",
          hasUrl: !!SUPABASE_URL,
          hasKey: !!KEY,
        }),
      };
    }

    const body = JSON.parse(event.body || "{}");

    const payload = {
      product_id: body.productId,
      worker_name: body.workerName,
      done_qty: Number(body.doneQty),
      date_key: body.date,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/production_log`, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (!res.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Supabase insert failed",
          status: res.status,
          response: text,
        }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};