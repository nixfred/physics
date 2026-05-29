import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

const METER_KEYS = [
  'gravityWeirdness',
  'matterWeirdness',
  'timeWeirdness',
  'observationalDifficulty',
  'theoryStress',
  'existentialDamage',
  'confidentlyWrongChance',
] as const;

export const METER_LABELS: Record<(typeof METER_KEYS)[number], string> = {
  gravityWeirdness: 'Gravity Weirdness',
  matterWeirdness: 'Matter Weirdness',
  timeWeirdness: 'Time Weirdness',
  observationalDifficulty: 'Observational Difficulty',
  theoryStress: 'Theory Stress',
  existentialDamage: 'Existential Damage',
  confidentlyWrongChance: 'Chance Humans Are Confidently Wrong',
};

export const BADGE_LABELS: Record<string, string> = {
  measured: 'Measured',
  inferred: 'Inferred',
  'model-dependent': 'Model Dependent',
  hypothesis: 'Hypothesis',
  speculative: 'Speculative',
};

/** Aggregate Known Unknown score (0-10), derived from the meters so it never drifts. */
export function knownUnknownScore(article: Article): number {
  const m = article.data.meters;
  const sum = METER_KEYS.reduce((acc, k) => acc + Math.min(m[k], 10), 0);
  return Math.round((sum / METER_KEYS.length) * 10) / 10;
}

export function meterEntries(article: Article) {
  const m = article.data.meters;
  return METER_KEYS.map((key) => ({ key, label: METER_LABELS[key], value: m[key] }));
}

/** All articles, sorted by their `order`. */
export async function getArticles(): Promise<Article[]> {
  const all = await getCollection('articles');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getPublished(): Promise<Article[]> {
  return (await getArticles()).filter((a) => a.data.status === 'published');
}

/** Articles belonging to a named cluster (e.g. the Neutron Star Problem). */
export async function getCluster(name: string): Promise<Article[]> {
  return (await getArticles()).filter((a) => a.data.cluster === name);
}

/** Resolve relatedArticles slugs into entries. */
export async function getRelated(article: Article): Promise<Article[]> {
  const all = await getArticles();
  const byId = new Map(all.map((a) => [a.id, a]));
  return article.data.relatedArticles.map((id) => byId.get(id)).filter((a): a is Article => !!a);
}

/** Articles that contribute an Observatory Mode station, in order. */
export async function getStations(): Promise<Article[]> {
  return (await getArticles()).filter((a) => a.data.station);
}
