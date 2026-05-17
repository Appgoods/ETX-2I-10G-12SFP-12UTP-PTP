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

// ===== Lightbox helpers =====
function setupLightboxForGallery() {
  const gallery = $("images");
  const lb = $("lightbox");
  const lbImg = $("lightboxImg");
  const lbCap = $("lightboxCaption");
  if (!gallery || !lb || !lbImg || !lbCap) return;

  const btnClose = lb.querySelector(".lightbox__close");
  const btnPrev = lb.querySelector(".lightbox__prev");
  const btnNext = lb.querySelector(".lightbox__next");
  const backdrop = lb.querySelector(".lightbox__backdrop");

  let items = [];
  let index = 0;
  let lastFocus = null;

  function collectItems() {
    const imgs = Array.from(gallery.querySelectorAll("img"));
    items = imgs.map((img) => ({
      src: img.getAttribute("data-full") || img.src,
      caption: img.alt || img.getAttribute("data-caption") || ""
    }));
  }

  function render() {
    if (!items.length) return;
    const item = items[index];
    lbImg.src = item.src;
    lbImg.alt = item.caption || "תמונה";
    lbCap.textContent = item.caption || "";
    if (btnPrev) btnPrev.disabled = (index <= 0);
    if (btnNext) btnNext.disabled = (index >= items.length - 1);
  }

  function openAt(i) {
    collectItems();
    if (!items.length) return;

    index = Math.max(0, Math.min(i, items.length - 1));
    lastFocus = document.activeElement;

    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    render();

    if (btnClose) btnClose.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.src = "";
    lbCap.textContent = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function prev() {
    if (index > 0) { index--; render(); }
  }

  function next() {
    if (index < items.length - 1) { index++; render(); }
  }

  gallery.addEventListener("click", (e) => {
    const img = e.target.closest("img");
    if (!img) return;
    e.preventDefault();
    const imgs = Array.from(gallery.querySelectorAll("img"));
    openAt(imgs.indexOf(img));
  });

  if (btnClose) btnClose.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
  if (btnPrev) btnPrev.addEventListener("click", prev);
  if (btnNext) btnNext.addEventListener("click", next);

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") return close();
    // RTL: שמאל=הבא, ימין=הקודם
    if (e.key === "ArrowLeft") return next();
    if (e.key === "ArrowRight") return prev();
  });
}

// ----- Images (UPDATED: Lightbox, no new tab) -----
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
    const wrapper = document.createElement("div");
    wrapper.className = "thumb";
    wrapper.style.cursor = "pointer";

    const img = document.createElement("img");
    img.src = src;
    img.alt = "תמונה";
    img.loading = "lazy";

    wrapper.appendChild(img);
    container.appendChild(wrapper);
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

    const productId = (queryId && data[queryId]) ? queryId : keys[0];
    const product = data[productId];

    $("productName").textContent = product.name || productId;
    $("productDescription").textContent = product.description || "";

    setupDocButtons(product);
    renderVideos(product.videos || []);
    renderImages(product.images || []);

    setupLightboxForGallery();
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
