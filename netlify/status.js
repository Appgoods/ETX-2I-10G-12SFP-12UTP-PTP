exports.handler = async (event) => {

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const { productId, date } = event.queryStringParameters;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/production_log?product_id=eq.${productId}&date_key=eq.${date}`,
    {
      headers: {
        "apikey": KEY,
        "Authorization": `Bearer ${KEY}`
      }
    }
  );

  const data = await res.json();

  let total = 0;
  let workers = {};

  data.forEach(r => {
    total += r.done_qty;
    workers[r.worker_name] = (workers[r.worker_name] || 0) + r.done_qty;
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      doneTotal: total,
      byWorker: Object.entries(workers).map(([name, qty]) => ({
        workerName: name,
        doneQty: qty
      })),
      targetQty: 30
    })
  };
};
``