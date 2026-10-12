// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * イイダ眼科医院 公式サイト
 * - 完全静的生成 (Cloudflare Workers 静的アセットでホスティング)
 * - 日本語をデフォルト、英語は /en/ 配下の主要4ページのみ
 */
export default defineConfig({
  site: 'https://iida-eye-clinic.jp',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  // 旧挙動 (true): インライン要素間の空白を保持する。日本語本文の予期しない詰まりを避ける
  compressHTML: true,
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ja',
        locales: { ja: 'ja-JP', en: 'en' },
      },
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
