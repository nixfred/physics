#!/usr/bin/env node
/**
 * Build-time guard: every PUBLISHED article must carry real sources.
 * Enforces the site's credibility thesis mechanically instead of by vibes.
 *
 * Rules for status: published
 *   1. Must have a `citations:` block with at least one `- id:` entry.
 *   2. At least one citation must include a `url:`.
 * Planned/drafting articles are exempt (they show "field report pending").
 *
 * Runs before `astro build`. Exits non-zero on violation so CI fails loudly.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = 'src/content/articles';

function frontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : '';
}

const files = (await readdir(DIR)).filter((f) => /\.mdx?$/.test(f));
const errors = [];

for (const file of files) {
  const src = await readFile(join(DIR, file), 'utf8');
  const fm = frontmatter(src);
  if (!/\nstatus:\s*published\b/.test(fm) && !/^status:\s*published\b/.test(fm)) continue;

  const citeBlock = fm.match(/\ncitations:\s*([\s\S]*?)(\n[a-zA-Z]+:|$)/);
  const block = citeBlock ? citeBlock[1] : '';

  if (!/-\s*id:/.test(block)) {
    errors.push(`${file}: published but has no citations.`);
    continue;
  }
  if (!/\burl:\s*https?:\/\//.test(block)) {
    errors.push(`${file}: published citations but none has a url.`);
  }
}

if (errors.length) {
  console.error('\n✘ Citation check failed:\n' + errors.map((e) => '  - ' + e).join('\n') + '\n');
  process.exit(1);
}
console.log(`✓ Citation check passed (${files.length} articles).`);
