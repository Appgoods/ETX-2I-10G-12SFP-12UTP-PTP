// זיכרון זמני (יישמר רק בזמן שהשרת למעלה)
let reports = [];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const body = JSON.parse(event.body || "{}");

  const report = {
    productId: body.productId,
    workerName: body.workerName,
    doneQty: Number(body.doneQty),
    date: body.date
  };

  reports.push(report);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "saved ✅",
      totalReports: reports.length
    })
  };
};
``