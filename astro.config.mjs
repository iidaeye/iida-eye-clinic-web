// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * イイダ眼科医院 公式サイト
 * - 完全静的生成 (Cloudflare Workers 静的アセットでホスティング)
 * - 日本語をデフォルト、英語は /en/ 配下の主要4ページのみ
 */
/**
 * サイトの絶対URL。canonical / OGP画像 / sitemap / 構造化データに使う。
 * 本番ドメイン切替前は仮URL (workers.dev) で配信するため、Cloudflare の Build variables に
 * SITE_URL=https://iida-eye-clinic-web.<account>.workers.dev を設定する。
 * 未設定 (本番) では iida-eye-clinic.jp になる。
 */
const site = (process.env.SITE_URL || 'https://iida-eye-clinic.jp').replace(/\/+$/, '');

export default defineConfig({
  site,
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
