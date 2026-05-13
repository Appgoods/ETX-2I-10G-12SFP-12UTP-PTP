let reports = [];

exports.handler = async (event) => {
  const { productId, date } = event.queryStringParameters || {};

  // סינון לפי מוצר ותאריך
  const filtered = reports.filter(r => 
    r.productId === productId && r.date === date
  );

  // סיכום כולל
  let doneTotal = filtered.reduce((sum, r) => sum + r.doneQty, 0);

  // קיבוץ לפי עובד
  let workerMap = {};
  filtered.forEach(r => {
    if (!workerMap[r.workerName]) {
      workerMap[r.workerName] = 0;
    }
    workerMap[r.workerName] += r.doneQty;
  });

  const byWorker = Object.entries(workerMap).map(([workerName, doneQty]) => ({
    workerName,
    doneQty
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({
      targetQty: 30,
      doneTotal,
      byWorker
    })
  };
};