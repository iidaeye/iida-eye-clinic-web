import clinic from '@/data/clinic.json';

export { clinic };

export type Locale = 'ja' | 'en';

/** グローバルナビゲーション (ヘッダー)。順序は Figma 案に合わせる */
export const nav = [
  { href: '/clinic', label: '当院について' },
  { href: '/medical', label: '診療案内' },
  { href: '/surgery', label: '手術のご案内' },
  { href: '/#first', label: '初めての方へ' },
  { href: '/visit', label: '受診案内' },
  { href: '/news', label: 'お知らせ' },
  { href: '/recruit', label: '採用情報' },
] as const;

/** フッターのサイトマップ (見出し + 下層リンク)。未作成のページは作成時に href を合わせる */
export const siteMap = [
  {
    label: '当院について',
    href: '/clinic',
    items: [
      { href: '/clinic#greeting', label: '院長挨拶' },
      { href: '/clinic/facilities', label: '院内・設備紹介' },
      { href: '/clinic/doctors', label: '医師紹介' },
      { href: '/visit#access', label: 'アクセス・駐車場' },
    ],
  },
  {
    label: '診療案内',
    href: '/medical',
    items: [
      { href: '/medical', label: '一般眼科' },
      { href: '/medical/glasses', label: 'メガネ処方' },
      { href: '/medical/contact-lens', label: 'コンタクト処方' },
      { href: '/medical/myopia-control', label: 'こどもの近視進行抑制治療' },
    ],
  },
  {
    label: '手術のご案内',
    href: '/surgery',
    items: [
      { href: '/surgery/cataract', label: '白内障手術' },
      { href: '/surgery/vitrectomy', label: '硝子体手術' },
      { href: '/surgery/glaucoma', label: '緑内障手術' },
      { href: '/surgery/lacrimal', label: '涙道手術' },
    ],
  },
  {
    label: '受診案内',
    href: '/visit',
    items: [
      { href: '/visit#hours', label: '受付時間・診療時間' },
      { href: '/visit#flow', label: '受診当日の流れ' },
      { href: '/visit#reception', label: '受付の方法' },
      { href: '/visit#notes', label: 'ご来院時の注意事項' },
    ],
  },
] as const;

/** フッター下段の単独リンク */
export const footerLinks = [
  { href: '/#first', label: '初めての方へ' },
  { href: '/news', label: 'お知らせ' },
  { href: '/column', label: 'コラム' },
  { href: '/recruit', label: '採用情報' },
  { href: '/disclosure', label: '掲示事項' },
] as const;

export const footerLegal = [
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/en', label: 'English' },
] as const;

/** 旧フッター互換 (英語ページなどで一覧として使う) */
export const footerNav = [...nav, { href: '/disclosure', label: '掲示事項' }, { href: '/privacy', label: 'プライバシーポリシー' }, { href: '/en', label: 'English' }] as const;

export const navEn = [
  { href: '/en', label: 'Home' },
  { href: '/en/about', label: 'About Us' },
  { href: '/en/services', label: 'Services' },
  { href: '/en/visit', label: 'For Your Visit' },
] as const;

/** 日付を 2026.10.05 形式に */
export function formatDate(d: Date, locale: Locale = 'ja'): string {
  if (locale === 'en') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Tokyo' });
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/** パスがナビ項目の配下かどうか (現在地ハイライト用) */
export function isCurrent(pathname: string, href: string): boolean {
  // build.format: 'file' ではビルド時の pathname が /news.html になるため拡張子を外して比較する
  const p = pathname.replace(/index\.html$/, '').replace(/\.html$/, '') || '/';
  const h = href.split('#')[0];
  if (!h || h === '/') return false;
  return p === h || p.startsWith(h + '/');
}

/**
 * 理念「「みえる」を守り、「くらす」を支える。」を装飾用に分解する。
 * 「 」で囲まれた語は強調 (kw)、かぎ括弧は q、それ以外は text。
 */
export type TaglinePart = { type: 'text' | 'q' | 'kw'; value: string };
export function taglineParts(tagline: string): TaglinePart[] {
  const parts: TaglinePart[] = [];
  const re = /「([^」]+)」/g;
  let last = 0;
  for (const m of tagline.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ type: 'text', value: tagline.slice(last, i) });
    parts.push({ type: 'q', value: '「' }, { type: 'kw', value: m[1] }, { type: 'q', value: '」' });
    last = i + m[0].length;
  }
  if (last < tagline.length) parts.push({ type: 'text', value: tagline.slice(last) });
  return parts;
}

/** schema.org MedicalClinic の構造化データ */
export function clinicJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinic.name,
    alternateName: clinic.nameEn,
    url: 'https://iida-eye-clinic.jp',
    telephone: '+81-54-246-3883',
    foundingDate: String(clinic.founded),
    medicalSpecialty: 'Ophthalmologic',
    address: {
      '@type': 'PostalAddress',
      postalCode: clinic.address.postal,
      addressRegion: clinic.address.pref,
      addressLocality: clinic.address.city,
      streetAddress: clinic.address.street,
      addressCountry: 'JP',
    },
    geo: { '@type': 'GeoCoordinates', latitude: clinic.geo.lat, longitude: clinic.geo.lng },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Friday'], opens: '08:15', closes: '17:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Thursday', 'Saturday'], opens: '08:15', closes: '11:00' },
    ],
    sameAs: [clinic.links.instagram],
  };
}
