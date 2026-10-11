import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * お知らせ: FileMaker から GitHub Contents API 経由で src/content/news/*.md が push される (docs/filemaker-push.md)。
 * スキーマに合わないファイルはビルドが失敗し、壊れたデータの公開を防ぐ。
 */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string().min(1).max(120),
    date: z.coerce.date(),
    category: z.enum(['お知らせ', '休診', '重要']).default('お知らせ'),
    /** true の場合、一覧の先頭に固定する */
    pinned: z.boolean().default(false),
    /** この日付を過ぎると一覧・トップから消える (記事ページは残る) */
    expires: z.coerce.date().optional(),
    /** 一覧に表示する要約。省略時は本文の冒頭から生成 */
    summary: z.string().max(200).optional(),
  }),
});

/** コラム: 医師執筆の医療情報。Markdown 直書き (将来 microCMS を同じ形式で流し込める) */
const column = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/column' }),
  schema: z.object({
    title: z.string().min(1).max(120),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().max(200),
    author: z.string().default('イイダ眼科医院'),
    tags: z.array(z.string()).default([]),
    /** public/ 配下の画像パス */
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news, column };
