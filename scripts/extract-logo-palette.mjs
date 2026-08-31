import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function colorDistance(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function isNearWhite({ r, g, b, a }, threshold = 245) {
  if (a < 200) return true; // treat transparent as background
  return r >= threshold && g >= threshold && b >= threshold;
}

function isNearBlack({ r, g, b, a }, threshold = 10) {
  if (a < 200) return false;
  return r <= threshold && g <= threshold && b <= threshold;
}

function quantize({ r, g, b }, step = 8) {
  const q = (v) => Math.round(v / step) * step;
  return { r: q(r), g: q(g), b: q(b) };
}

function pickTopColors(pixels, { step = 8, topN = 20 } = {}) {
  const counts = new Map();

  for (const p of pixels) {
    if (isNearWhite(p)) continue;
    if (isNearBlack(p)) continue;
    const q = quantize(p, step);
    const key = `${q.r},${q.g},${q.b}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      return { r, g, b, count };
    });

  return sorted;
}

function findDominantByHue(candidates, { kind }) {
  // kind: 'navy' or 'gold'
  // Heuristic: navy is dark/blue-ish; gold is warm high red+green.
  let best = null;
  for (const c of candidates) {
    const { r, g, b, count } = c;
    const brightness = (r + g + b) / 3;
    const blueBias = b - Math.max(r, g);
    const warm = (r + g) / 2 - b;

    const score =
      kind === 'navy'
        ? count * 1.0 + Math.max(0, blueBias) * 1.5 + Math.max(0, 140 - brightness) * 2.0
        : count * 1.0 + Math.max(0, warm) * 2.0 + Math.max(0, brightness - 120) * 1.0;

    if (!best || score > best.score) best = { ...c, brightness, score };
  }
  return best;
}

function pickGoldGradientStops(pixels, goldRef) {
  // Choose two gold-ish clusters around the reference to represent the arc gradient.
  const goldish = pixels
    .filter((p) => !isNearWhite(p))
    .filter((p) => p.a >= 200)
    .map((p) => ({ r: p.r, g: p.g, b: p.b }))
    .filter((p) => {
      const brightness = (p.r + p.g + p.b) / 3;
      const warm = (p.r + p.g) / 2 - p.b;
      return brightness > 90 && warm > 40;
    });

  const clusters = pickTopColors(goldish.map((p) => ({ ...p, a: 255 })), { step: 10, topN: 30 });
  const close = clusters
    .map((c) => ({ ...c, dist: colorDistance(c, goldRef) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 10);

  const darker = [...close].sort((a, b) => ((a.r + a.g + a.b) / 3) - ((b.r + b.g + b.b) / 3))[0];
  const lighter = [...close].sort((a, b) => ((b.r + b.g + b.b) / 3) - ((a.r + a.g + a.b) / 3))[0];

  return { darker, lighter };
}

function readPngPixels(filePath) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const pixels = [];
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];
      pixels.push({ r, g, b, a });
    }
  }
  return pixels;
}

const input =
  process.argv[2] ||
  path.resolve(process.cwd(), '.cursor/projects/Users-danielluque-Projects-sunday-proto/assets/LOGO_SUNDAY_PROPERTIES_BRANDBOOK-03-68348d46-fb23-485e-b78b-652621eadb12.png');

const pixels = readPngPixels(input);
const top = pickTopColors(pixels, { step: 8, topN: 40 });
const navy = findDominantByHue(top, { kind: 'navy' });
const gold = findDominantByHue(top, { kind: 'gold' });

const { darker: goldDark, lighter: goldLight } = pickGoldGradientStops(pixels, gold);

const result = {
  input,
  navy: { hex: rgbToHex(navy.r, navy.g, navy.b), rgb: { r: navy.r, g: navy.g, b: navy.b } },
  gold: { hex: rgbToHex(gold.r, gold.g, gold.b), rgb: { r: gold.r, g: gold.g, b: gold.b } },
  goldGradient: {
    darker: goldDark ? { hex: rgbToHex(goldDark.r, goldDark.g, goldDark.b), rgb: { r: goldDark.r, g: goldDark.g, b: goldDark.b } } : null,
    lighter: goldLight ? { hex: rgbToHex(goldLight.r, goldLight.g, goldLight.b), rgb: { r: goldLight.r, g: goldLight.g, b: goldLight.b } } : null,
  },
  topColors: top.slice(0, 12).map((c) => ({ hex: rgbToHex(c.r, c.g, c.b), count: c.count })),
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

