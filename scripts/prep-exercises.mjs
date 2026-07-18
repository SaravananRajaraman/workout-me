// One-time data-prep script: sources exercise metadata + media from
// https://github.com/hasaneyldrm/exercises-dataset (MIT code/license, media (c) gymvisual.com)
// and produces:
//   - src/data/generated/datasetExercises.ts  (long-tail library entries, English-only)
//   - src/data/curatedGifs.ts                 (curated exercise id -> gif URL)
//   - public/gifs/<slug>.gif                  (vendored gifs for the curated set only)
//
// Not run in CI. Re-run manually if the upstream dataset changes.
// Usage:
//   node scripts/prep-exercises.mjs report   -- fetch/parse + print match report only, writes nothing
//   node scripts/prep-exercises.mjs build    -- full run: writes generated files + downloads curated gifs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.cache');
const DATASET_JSON = path.join(CACHE_DIR, 'exercises.json');
const OVERRIDES_PATH = path.join(__dirname, 'curated-overrides.json');
const RAW_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main';

const mode = process.argv[2] || 'report';

async function ensureDataset() {
  if (fs.existsSync(DATASET_JSON)) return JSON.parse(fs.readFileSync(DATASET_JSON, 'utf8'));
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log('Downloading dataset JSON (~17MB)...');
  const res = await fetch(`${RAW_BASE}/data/exercises.json`);
  if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(DATASET_JSON, text);
  return JSON.parse(text);
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
    if (!fs.existsSync(destPath)) {
      const url = `${RAW_BASE}/${rec.gif_url}`;
      process.stdout.write(`Downloading gif for "${name}"... `);
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`FAILED (${res.status})`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(destPath, buf);
      console.log(`${(buf.length / 1024).toFixed(0)}KB`);
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
