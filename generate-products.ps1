$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function UrlEncodePath([string]$p) {
  # מקודד כל "חלק" בנתיב (כדי לתמוך ברווחים), אבל משאיר / כמפריד
  $parts = $p -split '/'
  $enc = $parts | ForEach-Object { [System.Uri]::EscapeDataString($_) }
  return ($enc -join '/')
}

function ListFiles([string]$dir, [string[]]$exts) {
  if (!(Test-Path $dir)) { return @() }
  Get-ChildItem -Path $dir -File |
    Where-Object { $exts -contains $_.Extension.ToLower() } |
    Sort-Object Name |
    ForEach-Object { $_.Name }
}

# ==== שם מוצר אוטומטי לפי שם תיקיית הפרויקט ====
$productFolderName = Split-Path $root -Leaf

# ==== מיקומים סטנדרטיים “נעולים” (ללא חישוב נתיב Windows) ====
# אנחנו בודקים קיום מקומי (ב-Windows) אבל כותבים ל-JSON נתיב WEB יחסי בלבד.
$drawingAbs = Join-Path $root "assets\docs\drawing.pdf"
$wiringAbs  = Join-Path $root "assets\docs\wiring\wiring.pdf"

# ==== סריקת תמונות ====
$imgDir   = Join-Path $root "assets\images"
$imgNames = ListFiles $imgDir @(".jpg",".jpeg",".png",".webp")
$images   = @()
foreach ($n in $imgNames) {
  $images += UrlEncodePath("assets/images/$n")
}

# ==== סריקת וידאו ====
$vidDir   = Join-Path $root "assets\videos"
$vidNames = ListFiles $vidDir @(".mp4",".webm")
$videos   = @()
foreach ($n in $vidNames) {
  $videos += UrlEncodePath("assets/videos/$n")
}

# ==== אובייקט מוצר ====
$product = @{
  name        = $productFolderName
  description = "Product folder $productFolderName"
  images      = $images
  videos      = $videos
}

# ==== PDF רק אם קיים – וכאן התיקון המרכזי ====
# כותבים ל-JSON נתיב יחסי בלבד (assets/...) ולא C:\...
if (Test-Path $drawingAbs) {
  $product["drawingPdf"] = "assets/docs/drawing.pdf"
}

if (Test-Path $wiringAbs) {
  $product["wiringPdf"] = "assets/docs/wiring/wiring.pdf"
}

$out = @{ product = $product }

# ==== כתיבה ל-products.json ====
$outPath = Join-Path $root "products.json"
$json = $out | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($outPath, $json, [System.Text.Encoding]::UTF8)

# ==== פלט בדיקה ====
Write-Host "OK: products.json updated"
Write-Host "Project root: $root"
Write-Host ("Found images: {0}" -f $imgNames.Count)
if ($imgNames.Count -gt 0) { $imgNames | ForEach-Object { Write-Host "  - $_" } }
Write-Host ("Found videos: {0}" -f $vidNames.Count)
Write-Host $outPath
Write-Host ("Images: {0} | Videos: {1}" -f $images.Count, $videos.Count)
