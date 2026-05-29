import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublished } from '../lib/articles';

// Field reports feed. Only published articles appear; planned teasers are
// excluded until their report ships.
export async function GET(context: APIContext) {
  const articles = await getPublished();
  return rss({
    title: 'Where Physics Starts Sweating',
    description:
      'Field reports from the edge of known physics: neutron stars, black holes, dark matter, and the places where our best theories still fail.',
    site: context.site!,
    items: articles.map((a) => ({
      title: a.data.title,
      pubDate: a.data.publishDate ?? new Date(),
      description: a.data.summary ?? a.data.shortHook,
      link: `/articles/${a.id}/`,
      categories: a.data.tags,
    })),
    customData: '<language>en-us</language>',
  });
}
