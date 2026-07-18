// One-time data-prep script: sources exercise metadata + media from
// https://github.com/hasaneyldrm/exercises-dataset (MIT code/license, media (c) gymvisual.com)
// and produces:
//   - src/data/generated/datasetExercises.ts  (long-tail library entries, English-only)
//   - src/data/curatedGifs.ts                 (curated exercise id -> gif URL)
//   - public/gifs/<slug>.gif                  (vendored gifs for the curated set only)
//   - public/img/*.jpg                        (curated static images replaced in place)
//
// If tmp/exercises-dataset (a local clone of the dataset repo) exists, media is read
// from disk instead of the network — much faster for repeat runs.
//
// Not run in CI. Re-run manually if the upstream dataset changes.
// Usage:
//   node scripts/prep-exercises.mjs report   -- fetch/parse + print match report only, writes nothing
//   node scripts/prep-exercises.mjs build    -- full run: writes generated files + downloads curated media

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.cache');
const DATASET_JSON = path.join(CACHE_DIR, 'exercises.json');
const OVERRIDES_PATH = path.join(__dirname, 'curated-overrides.json');
const RAW_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main';
const LOCAL_CLONE_DIR = path.join(ROOT, 'tmp/exercises-dataset');
const useLocalClone = fs.existsSync(LOCAL_CLONE_DIR);

const mode = process.argv[2] || 'report';

async function ensureDataset() {
  if (useLocalClone) {
    const localJson = path.join(LOCAL_CLONE_DIR, 'data/exercises.json');
    if (fs.existsSync(localJson)) return JSON.parse(fs.readFileSync(localJson, 'utf8'));
  }
  if (fs.existsSync(DATASET_JSON)) return JSON.parse(fs.readFileSync(DATASET_JSON, 'utf8'));
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log('Downloading dataset JSON (~17MB)...');
  const res = await fetch(`${RAW_BASE}/data/exercises.json`);
  if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(DATASET_JSON, text);
  return JSON.parse(text);
}

// relPath e.g. "images/0001-2gPfomN.jpg" or "videos/0001-2gPfomN.gif"
async function fetchMedia(relPath) {
  if (useLocalClone) {
    const localPath = path.join(LOCAL_CLONE_DIR, relPath);
    if (fs.existsSync(localPath)) return fs.readFileSync(localPath);
  }
  const res = await fetch(`${RAW_BASE}/${relPath}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${relPath}`);
  return Buffer.from(await res.arrayBuffer());
}

// target -> { group, type } — see plan for rationale on each bucket
const TARGET_MAP = {
  pectorals: { group: 'Chest', type: 'push' },
  'serratus anterior': { group: 'Chest', type: 'push' },
  delts: { group: 'Shoulders', type: 'push' },
  triceps: { group: 'Triceps', type: 'push' },
  'cardiovascular system': { group: 'Cardio', type: 'push' },
  lats: { group: 'Back', type: 'pull' },
  'upper back': { group: 'Back', type: 'pull' },
  spine: { group: 'Back', type: 'pull' },
  traps: { group: 'Traps', type: 'pull' },
  'levator scapulae': { group: 'Traps', type: 'pull' },
  biceps: { group: 'Biceps', type: 'pull' },
  forearms: { group: 'Forearms', type: 'pull' },
  quads: { group: 'Quads', type: 'legs' },
  hamstrings: { group: 'Hamstrings', type: 'legs' },
  glutes: { group: 'Glutes', type: 'legs' },
  adductors: { group: 'Glutes', type: 'legs' },
  abductors: { group: 'Glutes', type: 'legs' },
  calves: { group: 'Calves', type: 'legs' },
  abs: { group: 'Core', type: 'legs' },
};

function titleCase(s) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/\bdb\b/g, 'dumbbell')
    .replace(/\bbb\b/g, 'barbell')
    .replace(/[()]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(s) {
  return new Set(normalize(s).split(' ').filter(Boolean));
}

function jaccard(a, b) {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function extractCuratedNames() {
  const text = fs.readFileSync(path.join(ROOT, 'src/data/exercises.ts'), 'utf8');
  const re = /name: '([^']+)'/g;
  const names = [];
  let m;
  while ((m = re.exec(text))) names.push(m[1]);
  return [...new Set(names)];
}

// Curated exercises reference hand-chosen image filenames (e.g. '/img/bench.jpg'),
// NOT slug(name) — so replacing images in place requires this exact mapping.
function extractCuratedImagePaths() {
  const text = fs.readFileSync(path.join(ROOT, 'src/data/exercises.ts'), 'utf8');
  const re = /name: '([^']+)'[^{}]*?img: '([^']+)'/g;
  const byName = {};
  let m;
  while ((m = re.exec(text))) byName[m[1]] = m[2];
  return byName;
}

function cleanTip(en) {
  if (!en) return 'Focus on slow, controlled reps and full range of motion.';
  const flat = en.replace(/\s+/g, ' ').trim();
  if (flat.length <= 155) return flat;
  const cut = flat.slice(0, 155);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace)}…`;
}

async function main() {
  const dataset = await ensureDataset();
  console.log(`Loaded ${dataset.length} dataset records.`);

  const overrides = fs.existsSync(OVERRIDES_PATH) ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')) : {};
  const curatedNames = extractCuratedNames();

  const datasetTokens = dataset.map((d) => ({ d, tokens: tokenSet(d.name) }));

  const matches = {}; // curatedName -> dataset record (or null if explicitly no-match)
  const reportLines = [];

  for (const name of curatedNames) {
    if (Object.prototype.hasOwnProperty.call(overrides, name)) {
      const ov = overrides[name];
      if (ov === null) {
        matches[name] = null;
        reportLines.push(`OVERRIDE (no match): ${name}`);
        continue;
      }
      const rec = dataset.find((d) => d.id === ov);
      if (!rec) {
        reportLines.push(`OVERRIDE ERROR: ${name} -> id "${ov}" not found in dataset`);
        matches[name] = null;
        continue;
      }
      matches[name] = rec;
      reportLines.push(`OVERRIDE: ${name} -> [${rec.id}] ${rec.name}`);
      continue;
    }

    const curTokens = tokenSet(name);
    let best = null;
    let bestScore = 0;
    const top3 = [];
    for (const { d, tokens } of datasetTokens) {
      const score = jaccard(curTokens, tokens);
      top3.push([score, d]);
    }
    top3.sort((a, b) => b[0] - a[0]);
    best = top3[0]?.[1];
    bestScore = top3[0]?.[0] ?? 0;

    if (normalize(name) === normalize(best?.name ?? '')) {
      matches[name] = best;
      reportLines.push(`EXACT: ${name} -> [${best.id}] ${best.name}`);
    } else if (bestScore >= 0.6) {
      matches[name] = best;
      reportLines.push(`FUZZY(${bestScore.toFixed(2)}): ${name} -> [${best.id}] ${best.name}`);
    } else {
      matches[name] = null;
      const candidates = top3
        .slice(0, 3)
        .map(([s, d]) => `[${d.id}] ${d.name} (${s.toFixed(2)})`)
        .join(' | ');
      reportLines.push(`UNMATCHED: ${name}  candidates: ${candidates}`);
    }
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(CACHE_DIR, 'match-report.txt'), reportLines.join('\n') + '\n');
  console.log(reportLines.join('\n'));

  const unmatchedCount = Object.values(matches).filter((v) => v === null).length;
  console.log(`\n${curatedNames.length - unmatchedCount}/${curatedNames.length} curated exercises matched. Report written to scripts/.cache/match-report.txt`);
  if (unmatchedCount > 0) {
    console.log('Add entries to scripts/curated-overrides.json for unmatched names (dataset id, or null to skip).');
  }

  if (mode === 'report') return;

  // ---- build mode: write generated files + download curated gifs ----

  const usedDatasetIds = new Set(Object.values(matches).filter(Boolean).map((r) => r.id));

  console.log(useLocalClone ? '\nUsing local clone at tmp/exercises-dataset for media.\n' : '\nNo local clone found — downloading media over the network.\n');

  // curatedGifs.ts + gif downloads
  const gifsDir = path.join(ROOT, 'public/gifs');
  fs.mkdirSync(gifsDir, { recursive: true });
  const curatedGifs = {};
  let totalGifBytes = 0;
  for (const [name, rec] of Object.entries(matches)) {
    if (!rec || !rec.gif_url) continue;
    const id = slug(name);
    const destName = `${id}.gif`;
    const destPath = path.join(gifsDir, destName);
    process.stdout.write(`Gif for "${name}"... `);
    try {
      const buf = await fetchMedia(rec.gif_url);
      fs.writeFileSync(destPath, buf);
      console.log(`${(buf.length / 1024).toFixed(0)}KB`);
    } catch (err) {
      console.log(`FAILED (${err.message})`);
      continue;
    }
    const size = fs.statSync(destPath).size;
    totalGifBytes += size;
    curatedGifs[id] = `/gifs/${destName}`;
  }
  console.log(`\nTotal vendored curated gif size: ${(totalGifBytes / 1024 / 1024).toFixed(1)}MB across ${Object.keys(curatedGifs).length} files.`);

  fs.writeFileSync(
    path.join(ROOT, 'src/data/curatedGifs.ts'),
    `// Generated by scripts/prep-exercises.mjs — do not hand-edit.\n` +
      `// Maps curated exercise id -> vendored gif path (public/gifs/*.gif).\n` +
      `export const curatedGifs: Record<string, string> = ${JSON.stringify(curatedGifs, null, 2)};\n`,
  );

  // Replace curated static images with the matched dataset thumbnail — overwrites
  // the exact existing filename each exercise's `img` field already points at
  // (e.g. '/img/bench.jpg'), so no changes to exercises.ts are needed.
  const curatedImagePaths = extractCuratedImagePaths();
  let totalImgBytes = 0;
  let imgReplacedCount = 0;
  for (const [name, rec] of Object.entries(matches)) {
    if (!rec || !rec.image) continue;
    const relImgPath = curatedImagePaths[name];
    if (!relImgPath) {
      console.log(`Image for "${name}"... SKIPPED (no img path found in exercises.ts)`);
      continue;
    }
    const destPath = path.join(ROOT, 'public', relImgPath.replace(/^\//, ''));
    process.stdout.write(`Image for "${name}" (${relImgPath})... `);
    try {
      const buf = await fetchMedia(rec.image);
      fs.writeFileSync(destPath, buf);
      console.log(`${(buf.length / 1024).toFixed(0)}KB`);
    } catch (err) {
      console.log(`FAILED (${err.message})`);
      continue;
    }
    totalImgBytes += fs.statSync(destPath).size;
    imgReplacedCount++;
  }
  console.log(`\nReplaced ${imgReplacedCount} curated images (${(totalImgBytes / 1024 / 1024).toFixed(1)}MB total).`);

  // long-tail dataset entries
  const genDir = path.join(ROOT, 'src/data/generated');
  fs.mkdirSync(genDir, { recursive: true });
  const longTail = [];
  let skippedNoTarget = 0;
  for (const rec of dataset) {
    if (usedDatasetIds.has(rec.id)) continue;
    const mapping = TARGET_MAP[rec.target];
    if (!mapping) {
      skippedNoTarget++;
      continue;
    }
    longTail.push({
      id: `ds-${rec.id}`,
      type: mapping.type,
      name: titleCase(rec.name),
      muscle: titleCase(rec.target),
      group: mapping.group,
      img: `${RAW_BASE}/${rec.image}`,
      gifUrl: rec.gif_url ? `${RAW_BASE}/${rec.gif_url}` : undefined,
      tip: cleanTip(rec.instructions?.en),
      sets: 3,
      reps: 12,
      last: 0,
      time: false,
      dur: 0,
    });
  }

  fs.writeFileSync(
    path.join(genDir, 'datasetExercises.ts'),
    `// Generated by scripts/prep-exercises.mjs — do not hand-edit.\n` +
      `// Long-tail exercises from https://github.com/hasaneyldrm/exercises-dataset,\n` +
      `// excluding the ~55 curated exercises already hand-authored in exercises.ts.\n` +
      `// Media (c) gymvisual.com, served from the dataset's GitHub repo and cached at runtime.\n` +
      `import type { LibraryExercise } from '../types';\n\n` +
      `export const datasetExercises: LibraryExercise[] = ${JSON.stringify(longTail, null, 2)};\n`,
  );

  console.log(`\nWrote ${longTail.length} long-tail exercises to src/data/generated/datasetExercises.ts`);
  console.log(`Skipped ${skippedNoTarget} dataset records with unmapped target values.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
