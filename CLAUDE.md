# iida-eye-clinic-web

イイダ眼科医院 (静岡市葵区) 公式サイト。Astro 7 の完全静的サイト、Cloudflare Workers (静的アセット) でホスティング。詳細は README.md と docs/ を参照。

## 原則

- 医院情報 (住所・電話・診療時間・休診ルール・医師・術式) は `src/data/clinic.json` が唯一の正。ページに直書きしない
- 色・書体・余白は `design/tokens.json` が正。`src/styles/tokens.css` は生成物 (`pnpm tokens`)。直接編集しない。固定の hex をコンポーネントに書かず `var(--navy-700)` 等を使う
- デザイン原則 (2026-11 の Figma 案に準拠): 書体はゴシックで統一。セクション見出しは `.heading` (中央揃え・`--brand-blue`、直下に `--brand-green` の英字ラベル)。理念は太字ゴシックで「みえる」「くらす」を青、かぎ括弧を緑にする。ボタンはピル型 (`.btn` = 砂色 `--accent-300`、`.btn--line` = LINE緑、`.btn--brown` = `--accent-700`、`.btn--white`)、右端に `▷`。カードは白または `--surface-100` の面に角丸 `--radius-lg` (16px) まで、影は使わない。装飾は青・緑・生成りの有機的なブロブ (インラインSVG) を少量。欧文セリフ・漢数字は使わない
- 下層ページ固有のスタイルで `--font-serif` (明朝) が残っている箇所は、ページを触るときに上の原則へ寄せる
- 下層ページは `src/layouts/Page.astro` を使う。共通部品のクラスは `src/styles/base.css`
- お知らせは `src/content/news/*.md`。FileMaker から push されるため、frontmatter のスキーマ (`src/content.config.ts`) を変える場合は docs/filemaker-push.md も更新する
- 医療広告ガイドライン: 体験談・ビフォーアフター・最上級表現 (「最新」「最高」「No.1」) を書かない。多焦点眼内レンズ・近視進行抑制 (選定療養) は制度と費用の説明に徹し、利点だけでなく限界も書く
- 未確認の事実は `[要確認]` のまま残す。推測で埋めない

## コマンド

- `pnpm dev` 開発サーバー / `pnpm build` ビルド / `pnpm check` 型検査
- ビルド前に `pnpm tokens` が自動実行される

## 変更時の確認

- `pnpm build` と `pnpm check` が通ること
- モバイル幅 (390px) で崩れないこと (ヘッダーはハンバーガー、下部に固定CTA、右端の「診療時間」タブは PC のみ)
- 新しいページには `title` / `description` を必ず渡す (OGP と sitemap に使われる)
