# 診療状況・休診カレンダー API との接続

トップページの「ただいまの診療状況」と「休診カレンダー」は、既存システム (line.iida-eye.net) の API をブラウザから直接 fetch して表示する。URL は環境変数で指定する (Cloudflare Pages の Environment variables に設定)。

```
PUBLIC_STATUS_API_URL=https://line.iida-eye.net/api/...
PUBLIC_CALENDAR_API_URL=https://line.iida-eye.net/api/...
```

未設定、または取得に失敗した場合は、診療状況は「公式LINEのミニアプリでご確認ください」、カレンダーは定休ルール (`src/data/clinic.json` の `hours`) だけの表示にフォールバックする。サイト自体は静的なので、API が停止してもページは表示される。

## CORS

`iida-eye-clinic.jp` (開発中は `*.pages.dev`) から fetch するため、API 側で次のヘッダーが必要:

```
Access-Control-Allow-Origin: https://iida-eye-clinic.jp
```

(開発中は `*` か、`https://iida-eye-clinic-web.pages.dev` も許可する。) 付けられない場合は Cloudflare Pages Functions (`functions/api/status.ts`) で薄いプロキシを作る。

## 診療状況: 現在の想定レスポンス

```json
{
  "open": true,
  "waiting": 12,
  "calling": 38,
  "message": "本日は3診体制です",
  "updatedAt": "2026-10-11T09:42:00+09:00"
}
```

実際の形式が異なる場合は `src/components/ClinicStatus.astro` の `normalize()` でフィールド名を読み替える (`isOpen` / `waitingCount` / `callingNumber` / `updated_at` は読めるようにしてある)。

## 休診カレンダー: 現在の想定レスポンス

定休 (水・日・祝、木・土午後) は clinic.json のルールで描くので、API は **例外日だけ** 返せばよい。

```json
{
  "2026-10-30": "pm-closed",
  "2026-10-31": "closed",
  "2026-11-26": "note",
  "2026-11-27": "note"
}
```

| 値 | 表示 |
| --- | --- |
| `closed` | 終日休診 (灰色) |
| `pm-closed` | 午後休診 (下半分灰色) |
| `note` | お知らせ参照 (緑枠。2診体制など) |

祝日は API 側で `closed` として返す (サイト側は祝日判定を持たない)。

## 更新頻度

診療状況は `cache: 'no-store'` でページ表示ごとに取得する。自動更新 (ポーリング) は現時点では行わない。必要なら `ClinicStatus.astro` に `setInterval` を足す。
