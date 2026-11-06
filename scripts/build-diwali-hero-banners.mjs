/**
 * Builds the Diwali homepage hero banner from the supplied artwork
 * (scripts/assets/diwali-hero-mpf-source.png, 2172x724, 3:1).
 *
 * The source is first upscaled 4x with Real-ESRGAN (scripts/upscale-esrgan.py)
 * to scripts/assets/diwali-hero-mpf-4x.webp so every output is a DOWN-scale and
 * stays sharp on retina / 3x screens. No grading, shadows or overlays are
 * added — the artwork is used as-is, only cropped per breakpoint. The live
 * fireworks are drawn on top at runtime by festive/DiwaliHeroEffects.jsx.
 *
 *   Desktop ≥992px   full art         3:1   3840 x 1280
 *   Tablet 768–991   logo → towers    2:1   2400 x 1200
 *   Mobile <768      title → towers   1.6:1 1600 x 1000
 *
 * The hero box height follows these ratios (see festive/diwali.css), so the
 * crops are shown whole — nothing gets cut off by object-fit: cover.
 *
 * Run: node scripts/build-diwali-hero-banners.mjs
 */
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MASTER = path.join(ROOT, "scripts/assets/diwali-hero-mpf-4x.webp");
const OUT_DIR = path.join(ROOT, "public/static/banners");
const WEBP = { quality: 90, effort: 6, smartSubsample: true };
const S = 4; // master scale vs the 2172x724 source

/* Crops in source (2172x724) pixels. */
const OUTPUTS = [
  { file: "diwali-mpf-hero-desktop.webp", crop: [0, 0, 2172, 724], width: 3840, height: 1280 },
  { file: "diwali-mpf-hero-tablet.webp", crop: [0, 0, 1448, 724], width: 2400, height: 1200 },
  // the tail of the "My Property Fact" logo text (x 430–482, y 100–160) overlaps
  // this crop; it's covered with the median sky colour sampled around it,
  // with feathered edges so no seam shows.
  {
    file: "diwali-mpf-hero-mobile.webp",
    crop: [430, 0, 1158, 724],
    width: 1600,
    height: 1000,
    patch: { area: [426, 100, 58, 62], sample: [400, 96, 120, 70] },
  },
];

async function master(patch) {
  if (!patch) return MASTER;
  const [sx, sy, sw, sh] = patch.sample.map((v) => v * S);
  // median colour of the sample: ignores fairy-light bulbs and text glow
  const raw = await sharp(MASTER).extract({ left: sx, top: sy, width: sw, height: sh }).removeAlpha().raw().toBuffer();
  const [r, g, b] = [0, 1, 2].map((c) => {
    const v = [];
    for (let i = c; i < raw.length; i += 3) v.push(raw[i]);
    return v.sort((p, q) => p - q)[v.length >> 1];
  });
  const [x, y, w, h] = patch.area.map((v) => v * S);
  const feather = 10 * S;
  const fill = Buffer.from(`<svg width="${w + feather * 2}" height="${h + feather * 2}" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="b"><feGaussianBlur stdDeviation="${feather / 2.5}"/></filter></defs>
    <rect x="${feather}" y="${feather}" width="${w}" height="${h}" fill="rgb(${r},${g},${b})" filter="url(#b)"/></svg>`);
  return sharp(MASTER)
    .composite([{ input: fill, left: x - feather, top: y - feather }])
    .png()
    .toBuffer();
}

for (const { file, crop, width, height, patch } of OUTPUTS) {
  const [left, top, w, h] = crop.map((v) => v * S);
  const info = await sharp(await master(patch))
    .extract({ left, top, width: w, height: h })
    .resize(width, height, { fit: "fill", kernel: "lanczos3" })
    .webp(WEBP)
    .toFile(path.join(OUT_DIR, file));
  console.log(file, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
}
