import { getCollection, type CollectionEntry } from 'astro:content';
import { toLang } from './ui';

type Base = 'skills' | 'experiences' | 'projects' | 'education' | 'leadership';

const esCollection = {
  skills: 'skillsEs',
  experiences: 'experiencesEs',
  projects: 'projectsEs',
  education: 'educationEs',
  leadership: 'leadershipEs',
} as const;

/**
 * Entries of a collection in the requested language, sorted by `order`.
 * Spanish entries (src/content/<col>/es/<slug>.md) replace the English ones
 * with the same slug; anything untranslated falls back to English.
 */
export async function getLocalizedCollection<C extends Base>(
  collection: C,
  locale: string | undefined,
): Promise<CollectionEntry<C>[]> {
  const base = (await getCollection(collection)) as CollectionEntry<C>[];
  let entries = base;
  if (toLang(locale) === 'es') {
    const es = (await getCollection(esCollection[collection])) as unknown as CollectionEntry<C>[];
    const byId = new Map(es.map((e) => [e.id, e]));
    entries = base.map((e) => byId.get(e.id) ?? e);
  }
  return [...entries].sort(
    (a, b) => (a.data as { order: number }).order - (b.data as { order: number }).order,
  );
}
