import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Citation badges. Every visible factual claim should be traceable to one of
 * these confidence levels. "measured" and "inferred" claims REQUIRE a citation
 * (enforced in scripts/check-citations.mjs at build time).
 */
const SourceBadge = z.enum([
  'measured',
  'inferred',
  'model-dependent',
  'hypothesis',
  'speculative',
]);

const citation = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string().optional(),
  organization: z.string().optional(),
  url: z.string().url().optional(),
  dateAccessed: z.string().optional(),
  note: z.string().optional(),
  usedFor: z.string().optional(),
  badge: SourceBadge.default('inferred'),
});

/**
 * The Known Unknown Index. Meters run 0-11 (existential damage is allowed to
 * exceed 10 on purpose). The aggregate knownUnknownScore is DERIVED from these
 * in src/lib/articles.ts, never stored, so the two can't drift apart.
 */
const meters = z.object({
  gravityWeirdness: z.number().min(0).max(11),
  matterWeirdness: z.number().min(0).max(11),
  timeWeirdness: z.number().min(0).max(11),
  observationalDifficulty: z.number().min(0).max(11),
  theoryStress: z.number().min(0).max(11),
  existentialDamage: z.number().min(0).max(11),
  confidentlyWrongChance: z.number().min(0).max(11),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      shortHook: z.string(),
      longHook: z.string().optional(),
      status: z.enum(['published', 'drafting', 'planned']).default('planned'),
      order: z.number(),

      // Asset slots. Filenames are placeholders; drop real images into
      // /public/assets/ and they appear. Strings (not image()) so planned
      // articles can reference files that don't exist on disk yet.
      heroImage: z.string().optional(),
      thumbnailImage: z.string().optional(),

      themeColor: z.string().default('#4f9cff'),
      difficultyLevel: z.enum(['accessible', 'intermediate', 'deep', 'abyssal']).default('intermediate'),

      meters,
      // Human-flavored note for the Theory Stress meter, e.g.
      // "Einstein is fine, but he has requested coffee."
      theoryStressNote: z.string().optional(),
      confidenceLevel: z.enum(['high', 'medium', 'low', 'contested']).default('medium'),

      tags: z.array(z.string()).default([]),
      summary: z.string().optional(),
      keyQuestions: z.array(z.string()).default([]),
      citations: z.array(citation).default([]),

      // Slugs of related articles (validated loosely; cross-refs resolved in lib).
      relatedArticles: z.array(z.string()).default([]),
      imageGallery: z
        .array(
          z.object({
            src: z.string(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .default([]),
      interactiveModules: z.array(z.string()).default([]),

      // Part of the featured "Neutron Star Problem" cluster on the landing page.
      cluster: z.string().optional(),

      // Observatory Mode station. Each published/planned article can contribute one.
      station: z
        .object({
          question: z.string(),
          known: z.string(),
          unknown: z.string(),
          continueLabel: z.string().default('Descend deeper'),
        })
        .optional(),
    }),
});

export const collections = { articles };
