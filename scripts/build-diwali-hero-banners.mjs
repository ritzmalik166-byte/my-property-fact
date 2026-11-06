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
 *   Tablet 768–991   title → towers   2.4:1 2400 x 998
 *   Mobile <768      greeting stacked over towers ≈0.93:1 1400 x ~1500
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
  // tablet: greeting → towers at the right edge (logo is already in the header)
  {
    file: "diwali-mpf-hero-tablet-v2.webp",
    crop: [430, 0, 1742, 724],
    width: 2400,
    height: 998,

  },
];

/* Mobile is recomposed (a phone is too narrow for greeting + towers side by
   side): the greeting block on top, the towers stacked underneath, blended
   with a soft fade. Regions in source pixels. */
const MOBILE = {
  file: "diwali-mpf-hero-mobile-v3.webp",
  greeting: [378, 0, 790, 560], // "शुभ दीपावली" → message, centred on the text (x≈773)
  towers: [1194, 300, 978, 424], // skyline + towers + clubhouse
  overlap: 40, // fade height where the two meet
  width: 1400, // output width; height follows (≈0.93:1)
};

/* The tail of the "My Property Fact" logo text (x 430–482, y 100–160) pokes
   into the tablet / mobile crops; it's covered with the median sky colour
   sampled around it, with feathered edges so no seam shows. */
const LOGO_PATCH = { area: [426, 100, 58, 62], sample: [400, 96, 120, 70] };
OUTPUTS[1].patch = LOGO_PATCH;

/* Mobile only: a candle flame from the diyas pokes in at the greeting's
   bottom-left edge (x 436–480, y 505–565); covered the same way. */
const FLAME_PATCH = { area: [366, 492, 118, 76], sample: [380, 452, 100, 32] };
/* mobile crop starts further left, so the logo-text patch is wider there */
const MOBILE_LOGO_PATCH = { area: [366, 96, 118, 70], sample: [360, 168, 130, 32] };

/** Master with one or more sky-colour patches applied. */
async function master(patches) {
  if (!patches) return MASTER;
  let buf = MASTER;
  for (const patch of [].concat(patches)) buf = await applyPatch(buf, patch);
  return buf;
}

async function applyPatch(input, patch) {
  const [sx, sy, sw, sh] = patch.sample.map((v) => v * S);
  const MASTER_IN = input;
  // median colour of the sample: ignores fairy-light bulbs and text glow
  const raw = await sharp(MASTER_IN).extract({ left: sx, top: sy, width: sw, height: sh }).removeAlpha().raw().toBuffer();
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
  return sharp(MASTER_IN)
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

/* ---- mobile: greeting stacked over towers ---- */
{
  const src = await master([MOBILE_LOGO_PATCH, FLAME_PATCH]);
  const [gx, gy, gw, gh] = MOBILE.greeting.map((v) => v * S);
  const [tx, ty, tw, th] = MOBILE.towers.map((v) => v * S);
  const W = gw; // canvas width = greeting width (master px)
  const towerH = Math.round((th * W) / tw);
  const ov = MOBILE.overlap * S;
  const H = gh + towerH - ov;

  const greeting = await sharp(src).extract({ left: gx, top: gy, width: gw, height: gh }).png().toBuffer();
  const towers = await sharp(src)
    .extract({ left: tx, top: ty, width: tw, height: th })
    .resize(W, towerH, { kernel: "lanczos3" })
    .ensureAlpha()
    .png()
    .toBuffer();
  // fade the top of the towers strip into the greeting
  const fade = Buffer.from(`<svg width="${W}" height="${towerH}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="${(ov / towerH).toFixed(3)}" stop-color="#fff" stop-opacity="1"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#f)"/></svg>`);
  const towersFaded = await sharp(towers).composite([{ input: fade, blend: "dest-in" }]).png().toBuffer();

  const height = Math.round((MOBILE.width * H) / W);
  const info = await sharp({ create: { width: W, height: H, channels: 3, background: "#0d2a22" } })
    .composite([
      { input: greeting, left: 0, top: 0 },
      { input: towersFaded, left: 0, top: gh - ov },
    ])
    .png()
    .toBuffer()
    .then((buf) =>
      sharp(buf)
        .resize(MOBILE.width, height, { kernel: "lanczos3" })
        .webp(WEBP)
        .toFile(path.join(OUT_DIR, MOBILE.file)),
    );
  console.log(MOBILE.file, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
}
