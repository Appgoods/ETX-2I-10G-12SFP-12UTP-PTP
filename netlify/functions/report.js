exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const body = JSON.parse(event.body || "{}");

  await fetch(`${SUPABASE_URL}/rest/v1/production_log`, {
    method: "POST",
    headers: {
      "apikey": KEY,
      "Authorization": `Bearer ${KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([{
      product_id: body.productId,
      worker_name: body.workerName,
      done_qty: Number(body.doneQty),
      date_key: body.date
    }])
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
};
