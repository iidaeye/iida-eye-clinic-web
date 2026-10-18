# DNS 移行と本番ドメイン切替 (iida-eye-clinic.jp)

ドメインは 2026-10 に医院へ譲渡済み。レジストラ/DNS は現在さくら。手順の正は docs/cloudflare-設定.xlsx の「DNS移行」シート (同内容)。


## 事前準備

1. **現在のDNSレコードを控える** — さくら ドメイン/DNS設定  
   iida-eye-clinic.jp の A / AAAA / CNAME / MX / TXT (SPF, DKIM, _dmarc) をすべて書き出す。www のレコードも  
   確認: レコード一覧のスクリーンショットを保存
2. **@iida-eye-clinic.jp のメール有無を確認** — さくら メール設定  
   メールボックスがあれば MX/SPF を Cloudflare にそのまま移す。無ければ MX は作らない  
   確認: 受信テスト (移行後にも再テスト)
3. **旧WordPressのバックアップ** — WP管理画面 / さくら  
   記事・画像・DB をエクスポート。旧URL一覧を取得して public/_redirects に反映  
   確認: エクスポートファイルを保管
4. **SSL (JPRS ドメイン認証型 RS) の自動更新をオフ** — さくら 契約管理  
   切替までは有効のまま。期限が切替予定より前なら1年だけ延長  
   確認: 期限日を記録

## Cloudflare

5. **サイト (ゾーン) を追加** — Cloudflare → Add a site  
   iida-eye-clinic.jp を入力 → Free プラン → 既存レコードの自動取り込み結果を No.1 の控えと突き合わせ、不足を手入力  
   確認: DNS Records 画面に全レコードがある
6. **旧サイト向けレコードを Proxy オフで維持** — Cloudflare → DNS  
   A @ と www は さくらのIPのまま、Proxy status を DNS only (灰色の雲) にする。こうすると NS を変えても旧サイトが表示され続ける
7. **SSL/TLS の暗号化モードを Full (strict) に** — Cloudflare → SSL/TLS → Overview  
   切替後に使う設定。Always Use HTTPS もオン

## NS切替

8. **ネームサーバーを Cloudflare に変更** — さくら ドメイン管理 (レジストラ)  
   Cloudflare が表示する2つの NS (例: xxx.ns.cloudflare.com) を設定。反映まで最大24〜48時間  
   確認: Cloudflare の Overview が Active になる。dig NS iida-eye-clinic.jp で確認
9. **旧サイトとメールが引き続き動くことを確認** — ブラウザ / メール  
   https://iida-eye-clinic.jp が旧サイトのまま表示される。メールの送受信テスト

## 公開日

10. **Workers にカスタムドメインを追加** — Workers & Pages → iida-eye-clinic-web → Settings → Domains & Routes → Add → Custom domain  
   iida-eye-clinic.jp と www.iida-eye-clinic.jp を追加。Cloudflare が DNS レコードと証明書 (Universal SSL) を自動作成。No.6 で残した A レコードは削除される (確認ダイアログで置き換えを許可)  
   確認: 数分後に https://iida-eye-clinic.jp で新サイトが表示される。鍵マークの証明書発行者が Cloudflare 系 (Google Trust Services / Let's Encrypt)
11. **www → ルートのリダイレクト** — Cloudflare → Rules → Redirect Rules  
   www.iida-eye-clinic.jp/* → https://iida-eye-clinic.jp/$1 (301)。カスタムドメインに www も追加した場合はこのルールで統一  
   確認: https://www.iida-eye-clinic.jp がルートに転送される
12. **Build variable の SITE_URL を削除して再ビルド** — Workers → Settings → Build → Build variables  
   SITE_URL を削除 → Deployments → Retry build。canonical / OGP が本番ドメインになる  
   確認: ページのソースで og:image が https://iida-eye-clinic.jp/og-default.jpg
13. **旧URLの転送確認** — ブラウザ  
   /clinic/ /medical/ /access/ /category/news/ などが新ページに301  
   確認: 旧サイトのブックマークや検索結果からのアクセスが届く
14. **Google Search Console の登録** — Search Console  
   ドメインプロパティで iida-eye-clinic.jp を追加 (TXT を Cloudflare DNS に追加)。sitemap-index.xml を送信

## 公開後

15. **workers.dev の仮URLを無効化 (任意)** — Workers → Settings → Domains & Routes  
   workers.dev を Disable。検証用に残すなら robots で noindex 済みか確認
16. **さくらのレンタルサーバ解約** — さくら 契約管理  
   メール・ファイルの移行が完了してから。ドメインはさくらで維持してもよい (レジストラとDNSは別)

## 証明書

さくらの SSL JPRS ドメイン認証型 RS は切替までは有効のまま (自動更新のみオフ)。切替後は Cloudflare の Universal SSL (DV・無料・自動更新) に置き換わるため更新しない。
