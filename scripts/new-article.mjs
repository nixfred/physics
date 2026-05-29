#!/usr/bin/env node
/**
 * Scaffold a schema-valid article stub.
 *   bun run new:article "The Title Of The Piece" [order]
 * Creates src/content/articles/<order>-<slug>.mdx as a `planned` teaser.
 */
import { writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = 'src/content/articles';
const title = process.argv[2];
if (!title) {
  console.error('Usage: bun run new:article "Article Title" [order]');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60);

const existing = (await readdir(DIR)).filter((f) => /\.mdx?$/.test(f));
const order = process.argv[3] ? Number(process.argv[3]) : existing.length + 1;
const filename = `${String(order).padStart(2, '0')}-${slug}.mdx`;

const body = `---
title: ${title}
subtitle: One-line dramatic subtitle.
shortHook: One sentence that makes someone want to read this.
longHook: A two-sentence expansion of the hook for the article hero.
status: planned
order: ${order}
themeColor: '#4f9cff'
difficultyLevel: intermediate
meters:
  gravityWeirdness: 5
  matterWeirdness: 5
  timeWeirdness: 5
  observationalDifficulty: 5
  theoryStress: 5
  existentialDamage: 5
  confidentlyWrongChance: 5
theoryStressNote: 'A grounded, slightly funny line about how stressed the theory is.'
confidenceLevel: medium
tags: []
summary: A neutral, non-overclaiming summary used on the planned teaser page.
keyQuestions:
  - First open question.
  - Second open question.
relatedArticles: []
station:
  question: The one dramatic question for Observatory Mode.
  known: What we can actually measure or establish.
  unknown: What remains genuinely open.
  continueLabel: Descend deeper
# When you set status: published, add a citations: block. Every measured or
# inferred claim needs a source (enforced by scripts/check-citations.mjs).
---

Field report pending.
`;

await writeFile(join(DIR, filename), body, { flag: 'wx' }).catch((e) => {
  if (e.code === 'EEXIST') {
    console.error(`✘ ${filename} already exists.`);
    process.exit(1);
  }
  throw e;
});

console.log(`✓ Created ${DIR}/${filename}`);
console.log('  Edit it, drop a hero image in /public/assets, then set status: published when ready.');
