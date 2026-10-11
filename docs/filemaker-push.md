# FileMaker → GitHub へのお知らせ push 仕様

お知らせは FileMaker (FMS) で入力し、「公開」スクリプトが GitHub Contents API で `src/content/news/` に Markdown を書き込む。push されると Cloudflare Pages が自動でビルド・公開する。FMS は外部に公開しない (outbound の HTTPS のみ)。

```
FileMaker で入力 → 公開スクリプト → GitHub Contents API (PUT) → main に commit → Cloudflare Pages が自動ビルド → 公開
```

## 1. ファイルの形式

パス: `src/content/news/<YYYY-MM-DD>-<slug>.md`

- `<slug>` は半角英数とハイフン (例: `reception-time-change`)。FileMaker 側でレコードIDから生成してもよい (例: `2026-10-05-n00123.md`)。URL は `/news/<ファイル名から .md を除いたもの>` になる
- 文字コード UTF-8、改行 LF

```markdown
---
title: 午後の最終受付時間 変更のお知らせ
date: 2026-10-05
category: 重要
pinned: true
expires: 2026-12-31
summary: 11月2日(月)より、午後の最終受付時間を17:30から17:00に変更します。
---

本文 (Markdown)。見出しは ## から。箇条書きは - 。
強調は **太字**。リンクは [文言](URL)。
```

| フィールド | 必須 | 型 | 説明 |
| --- | --- | --- | --- |
| `title` | 必須 | 文字列 (120文字以内) | 見出し |
| `date` | 必須 | `YYYY-MM-DD` | 掲載日。一覧の並び順に使う |
| `category` | 任意 | `お知らせ` / `休診` / `重要` | 省略時 `お知らせ`。`重要` は一覧で紺枠のラベルになる |
| `pinned` | 任意 | `true` / `false` | `true` で一覧とトップの先頭に固定 |
| `expires` | 任意 | `YYYY-MM-DD` | この日を過ぎると一覧・トップから消える (記事URLは残り「掲載期間終了」と表示) |
| `summary` | 任意 | 文字列 (200文字以内) | 一覧ページの要約。省略時は本文冒頭 |

値にコロン `:` や `#` を含む場合は `"..."` で囲む。スキーマは `src/content.config.ts` で検証され、不正な値があるとビルドが失敗する (壊れたデータが公開されない)。

## 2. GitHub API の呼び出し

事前準備 (ゆうとさんが実施):

1. GitHub で Fine-grained personal access token を発行。対象リポジトリ `iidaeye/iida-eye-clinic-web` のみ、権限は **Contents: Read and write** だけ
2. トークンを FileMaker 側に安全に保管 (スクリプト内に直書きしない)

作成・更新は同じエンドポイント (PUT)。更新時は既存ファイルの `sha` が必要なので、先に GET する。

```
GET https://api.github.com/repos/iidaeye/iida-eye-clinic-web/contents/src/content/news/<file>.md
  Authorization: Bearer <token>
  Accept: application/vnd.github+json
  X-GitHub-Api-Version: 2022-11-28
→ 200 なら body.sha を控える / 404 なら新規

PUT https://api.github.com/repos/iidaeye/iida-eye-clinic-web/contents/src/content/news/<file>.md
  (同じヘッダー)
  {
    "message": "news: 午後の最終受付時間 変更のお知らせ",
    "content": "<ファイル全文の Base64>",
    "sha": "<更新時のみ>",
    "branch": "main"
  }
→ 201 (新規) / 200 (更新)
```

削除は DELETE に `message` と `sha` を渡す。ただし通常は削除せず `expires` を過去日にして更新する方が安全 (URLが生き、履歴が残る)。

FileMaker からの呼び出しは `Insert from URL` の cURL オプションで行える:

```
-X PUT
-H "Authorization: Bearer <token>"
-H "Accept: application/vnd.github+json"
-H "X-GitHub-Api-Version: 2022-11-28"
-d @$json
```

Base64 は `Base64EncodeRFC ( 4648 ; TextEncode ( $markdown ; "utf-8" ; 3 ) )` で生成する (改行 LF)。

## 3. 公開までの時間と確認

push から公開まで Cloudflare Pages のビルドで 1〜2 分。公開結果は `/news` で確認する。ビルドが失敗した場合は Cloudflare Pages のダッシュボードに原因 (多くは frontmatter の形式エラー) が出る。失敗しても前回の公開内容がそのまま残る。

## 4. コラム

コラム (`src/content/column/*.md`) は医師が Markdown で直接書く運用。同じ API で push することもできる。frontmatter は `title / date / description / tags / image / draft` (`src/content.config.ts` 参照)。`draft: true` の間はビルドに含まれない。
