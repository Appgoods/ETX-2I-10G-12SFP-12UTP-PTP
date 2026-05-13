// ===== app.js (FULL) =====
const $ = (id) => document.getElementById(id);

// מנקה תווים בעייתיים שנדבקים מהעתקה (למשל ` -> %60%60)
function cleanPath(p) {
  return (p || "")
    .trim()
    .replace(/%60/g, "")
    .replace(/[`]/g, "");
}

function getQueryProductId() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get("p");
  return p ? p.trim() : "";
}

// ----- PDF buttons -----
function setupDocButtons(product) {
  const wrap = $("docsBtnsWrap");
  const drawingBtn = $("drawingBtn");
  const wiringBtn = $("wiringBtn");

  if (!wrap || !drawingBtn || !wiringBtn) return;

  let anyVisible = false;

  if (product.drawingPdf) {
    drawingBtn.href = encodeURI(cleanPath(product.drawingPdf));
    drawingBtn.style.display = "inline-flex";
    anyVisible = true;
  } else {
    drawingBtn.style.display = "none";
  }

  if (product.wiringPdf) {
    wiringBtn.href = encodeURI(cleanPath(product.wiringPdf));
    wiringBtn.style.display = "inline-flex";
    anyVisible = true;
  } else {
    wiringBtn.style.display = "none";
  }

  wrap.style.display = anyVisible ? "flex" : "none";
}

// ----- Videos -----
function renderVideos(videoUrls = []) {
  const container = $("videos");
  if (!container) return;

  container.innerHTML = "";

  if (!videoUrls.length) {
    container.innerHTML = `<div class="card"><p style="margin:0;color:#a8b3cf">אין סרטונים להצגה</p></div>`;
    return;
  }

  videoUrls.forEach((src, i) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.style.color = "#a8b3cf";
    title.style.fontSize = "13px";
    title.style.marginBottom = "8px";
    title.textContent = `Video ${i + 1}`;

    const video = document.createElement("video");
    video.src = cleanPath(src);
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.controlsList = "nodownload";
    video.disablePictureInPicture = true;

    card.appendChild(title);
    card.appendChild(video);
    container.appendChild(card);
  });
}

// ----- Images (NEW behavior) -----
// תמונות מוצגות "נורמלי" (CSS), ולחיצה פותחת את הקובץ בטאב חדש
function renderImages(imageUrls = []) {
  const container = $("images");
  if (!container) return;

  container.innerHTML = "";

  const images = (imageUrls || []).map(cleanPath);

  if (!images.length) {
    container.innerHTML = `<div class="card"><p style="margin:0;color:#a8b3cf">אין תמונות להצגה</p></div>`;
    return;
  }

  images.forEach((src) => {
    const a = document.createElement("a");
    a.className = "thumb";
    a.href = src;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    const img = document.createElement("img");
    img.src = src;
    img.alt = "תמונה";
    img.loading = "lazy";

    a.appendChild(img);
    container.appendChild(a);
  });
}

// ----- MAIN -----
async function main() {
  const queryId = getQueryProductId();

  try {
    const res = await fetch("products.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`products.json HTTP ${res.status}`);

    const data = await res.json();
    const keys = Object.keys(data || {});
    if (!keys.length) throw new Error("products.json is empty");

    // אם יש ?p= והוא קיים – נשתמש בו, אחרת נשתמש במוצר הראשון בקובץ
    const productId = (queryId && data[queryId]) ? queryId : keys[0];
    const product = data[productId];

    $("productName").textContent = product.name || productId;
    $("productDescription").textContent = product.description || "";

    setupDocButtons(product);
    renderVideos(product.videos || []);
    renderImages(product.images || []);
  } catch (err) {
    console.error(err);
    $("productName").textContent = "❌ שגיאה";
    $("productDescription").textContent = "בעיה בטעינת נתונים. פתח Console (F12) לפרטים.";
    const wrap = $("docsBtnsWrap");
    if (wrap) wrap.style.display = "none";
    renderVideos([]);
    renderImages([]);
  }
}

main();
