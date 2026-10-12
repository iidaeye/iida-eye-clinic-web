# イイダ眼科医院 公式サイト

[iida-eye-clinic.jp](https://iida-eye-clinic.jp) のソース。2026年の新築移転に合わせたリニューアル版。

- **Astro 7** (完全静的生成) + TypeScript
- ホスティング: **Cloudflare Workers 静的アセット** (main へ push で自動デプロイ)。仮URL: https://iida-eye-clinic-web.winter-silence-cb11.workers.dev
- お知らせ: FileMaker から GitHub へ push ([docs/filemaker-push.md](docs/filemaker-push.md))
- 診療状況・休診カレンダー: 既存システムの API をブラウザから取得 ([docs/status-api.md](docs/status-api.md))
- デザイン: `design/tokens.json` を正とする ([デザインシステム](https://claude.ai/artifact/VPk3LSdxqiG9UoPHErwQeW))

## 開発

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # dist/ に出力
pnpm preview    # dist/ を確認
pnpm check      # 型・テンプレートの検査
```

Node 22.12 以上、pnpm 10。`pnpm dev` / `pnpm build` の前に `scripts/build-tokens.mjs` が走り、`design/tokens.json` から `src/styles/tokens.css` (CSS変数と `.t-*` クラス) を生成する。`tokens.css` は生成物なので編集しない。

環境変数は `.env.example` を `.env` にコピーして設定する (ローカルでは未設定でも動く)。

## 構成

```
design/tokens.json        デザイントークン (色・書体・余白・角丸・罫線) ← デザインシステムと同期
scripts/build-tokens.mjs  tokens.json → src/styles/tokens.css
src/
  data/clinic.json        医院情報 (住所・電話・診療時間・休診ルール・医師・術式) を一元管理
  lib/site.ts             ナビ定義・日付整形・構造化データ
  lib/content.ts          お知らせ・コラムの取得ヘルパー
  content.config.ts       Content Collections のスキーマ (news / column)
  content/news/*.md       お知らせ (FileMaker から push される)
  content/column/*.md     コラム (医師が Markdown で執筆)
  layouts/Base.astro      全ページ共通 (head/OGP/構造化データ/ヘッダー/フッター/モバイルCTA)
  layouts/Page.astro      下層ページの型 (パンくず/タイトル/目次/CTA)
  components/             Header, Footer, MobileBar, Hours, ClinicStatus, Calendar, NewsList, SurgeryCards, Cta
  pages/                  ルーティング (/, /surgery, /news, /column, /en, 404)
  styles/base.css         リセット・共通部品 (.btn .card .heading .rule-list など)
public/
  logo/*.svg              ロゴ (縦組み・シンボル・文字)
  images/                 写真 (exterior.jpg は仮写真。プロ撮影後に差し替え)
  _redirects / _headers   リダイレクト・レスポンスヘッダー (Workers 静的アセットが読む)
docs/                     連携仕様
```

## ページの追加

下層ページは `src/layouts/Page.astro` を使う。`title / description / eyebrow / lead / crumbs / toc / heroImage` を渡し、本文は `<section>` を並べる。見出しは `<h2 class="heading">見出し<span class="sub">LABEL</span></h2>`。部品のクラスは `src/styles/base.css` を参照。

医院情報 (電話・住所・診療時間) はページに直書きせず `src/data/clinic.json` から参照する。

## デプロイ (Cloudflare Workers 静的アセット)

Cloudflare は Pages を Workers に統合しているため、Workers の静的アセット配信を使う。設定は `wrangler.jsonc` (配信フォルダ `dist/`、404ページ、URLの扱い)。

1. Cloudflare ダッシュボード → Workers & Pages → Create → Import a repository → このリポジトリ
2. Build command `pnpm run build`、Deploy command `npx wrangler deploy` (既定のまま)
3. Advanced settings → Build variables に `SITE_URL` (仮URLで公開している間は `https://iida-eye-clinic-web.<account>.workers.dev`。本番ドメイン切替時に削除)、`PUBLIC_STATUS_API_URL`、`PUBLIC_CALENDAR_API_URL`、`PUBLIC_CF_ANALYTICS_TOKEN` (任意)。Node は `.node-version` (22) が使われる
4. まず `iida-eye-clinic-web.<account>.workers.dev` の仮URLで確認。DNS の引き継ぎ完了後に Custom domain で `iida-eye-clinic.jp` を追加

main 以外のブランチへの push はプレビューURLが発行される (Enable Preview builds)。手元から `pnpm exec wrangler deploy --dry-run` で設定を検証できる。

## 公開前チェック

- [ ] `public/images/exterior.jpg` をプロ撮影の写真に差し替え (`og-default.jpg` も)
- [ ] 医師名・写真 (`clinic.json` の `doctors`、`/images/doctor-*.jpg`)
- [ ] 旧WordPressのURL一覧を `public/_redirects` に反映
- [ ] `[要確認]` の記述を本文から消す (`grep -rn "要確認" src`)
- [ ] 掲示事項ページを無床化後の内容に更新
- [ ] 選定療養の金額が院内掲示と一致していること
