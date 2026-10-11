import { getCollection, type CollectionEntry } from 'astro:content';

export type NewsEntry = CollectionEntry<'news'>;
export type ColumnEntry = CollectionEntry<'column'>;

/** 公開中のお知らせ (期限切れを除外)。固定 → 日付降順 */
export async function getNews(opts: { limit?: number; includeExpired?: boolean } = {}): Promise<NewsEntry[]> {
  const now = new Date();
  const all = await getCollection('news', (e) => opts.includeExpired || !e.data.expires || e.data.expires >= now);
  all.sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return b.data.date.getTime() - a.data.date.getTime();
  });
  return opts.limit ? all.slice(0, opts.limit) : all;
}

/** 公開中のコラム (draft を除外)。日付降順 */
export async function getColumns(opts: { limit?: number } = {}): Promise<ColumnEntry[]> {
  const all = await getCollection('column', (e) => import.meta.env.DEV || !e.data.draft);
  all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return opts.limit ? all.slice(0, opts.limit) : all;
}

/** 本文から要約を作る (summary 省略時) */
export function excerpt(body: string | undefined, length = 80): string {
  if (!body) return '';
  const text = body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/[#>*_`\-\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? text.slice(0, length) + '…' : text;
}
