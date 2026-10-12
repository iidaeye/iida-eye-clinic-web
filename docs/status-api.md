# 診療状況・休診カレンダー API との接続

トップページの「ただいまの診療状況」と「休診カレンダー」は、既存システム (line.iida-eye.net) の API をブラウザから直接 fetch して表示する。URL は環境変数で指定する (Cloudflare Workers の Build variables に設定)。

```
PUBLIC_STATUS_API_URL=https://line.iida-eye.net/api/...
PUBLIC_CALENDAR_API_URL=https://line.iida-eye.net/api/public/calendar/
```

未設定、または取得に失敗した場合は、診療状況は「公式LINEのミニアプリでご確認ください」、カレンダーは定休ルール (`src/data/clinic.json` の `hours`) だけの表示にフォールバックする (カレンダーは未設定時に本番 URL を既定値として使う)。サイト自体は静的なので、API が停止してもページは表示される。

## CORS

カレンダー API は `Access-Control-Allow-Origin: *` を返すので対応不要。診療状況 API は `iida-eye-clinic.jp` (開発中は `iida-eye-clinic-web.winter-silence-cb11.workers.dev`) から fetch するため、API 側で次のヘッダーが必要:

```
Access-Control-Allow-Origin: https://iida-eye-clinic.jp
```

(開発中は `*` か、`https://iida-eye-clinic-web.winter-silence-cb11.workers.dev` も許可する。) 付けられない場合は Worker スクリプト (`src/worker.ts` を追加し `wrangler.jsonc` の `main` に指定) で薄いプロキシを作る。

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

## 休診カレンダー: LIFF 公開カレンダー API (接続済み)

LIFF (liff_iec_cliniqueue) の `GET /api/public/calendar/?from=YYYY-MM-DD&to=YYYY-MM-DD` を使う。仕様の正は LIFF リポジトリの `docs/PUBLIC_CALENDAR_API.md`。

- 本番 `https://line.iida-eye.net/api/public/calendar/`、開発 `https://line-dev.iida-eye.net/api/public/calendar/`
- 認証不要、`Access-Control-Allow-Origin: *`、サーバー側 5 分キャッシュ (`Cache-Control: public, max-age=300`)、IP 単位 60 回/分
- `PUBLIC_CALENDAR_API_URL` 未設定時は本番 URL を既定値として使う (2026-10-13 に接続確認済み)
- 期間は最大 124 日。`Calendar.astro` は表示中の月だけを `from`=1日, `to`=末日で取得し、月ごとにメモリにキャッシュする

レスポンスの `days[]` を次の規則で表示に変換する (`Calendar.astro` の `classify`)。LINE 受付の休診判定と同じ結果になる。

| 条件 | 表示 |
| --- | --- |
| `exception_type === 'special'` | 臨時診療 (緑枠) |
| `is_clinic_day === false` | 休診 (灰色)。祝日もここに含まれる |
| `am.available && !pm.available` | 午後休診 (下半分灰色) |
| `!am.available && pm.available` | 午前休診 (上半分灰色) |

`exception_type` が `closed` / `special` の日は、グリッドの下に日付・種別・理由 (`exception_reason`) を一覧で出す。祝日 (`holiday`) と定休は一覧に載せない。理由は FileMaker の自由入力なので `textContent` で挿入する。

取得失敗時、または `complete: false` (例外日を取得できず曜日の通常予定だけで組まれている) のときは、定休ルール (`clinic.json` の `hours`) で描き、「最新の休診情報を取得できませんでした」の注意文を出す。

休診情報の更新は FileMaker の例外日 (`api_ClinicScheduleException`) に行を追加するだけでよい。LINE 受付・受付機・ホームページに同時に反映される (最大 5 分 + ブラウザキャッシュ分の遅れ)。

## 更新頻度

診療状況は `cache: 'no-store'` でページ表示ごとに取得する。自動更新 (ポーリング) は現時点では行わない。必要なら `ClinicStatus.astro` に `setInterval` を足す。
