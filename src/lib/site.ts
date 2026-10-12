import clinic from '@/data/clinic.json';

export { clinic };

export type Locale = 'ja' | 'en';

/** サイト全体のナビゲーション。順序はヘッダー・フッター共通 */
export const nav = [
  { href: '/clinic', label: '当院について' },
  { href: '/medical', label: '診療案内' },
  { href: '/surgery', label: '手術のご案内' },
  { href: '/visit', label: '受診案内' },
  { href: '/column', label: 'コラム' },
  { href: '/recruit', label: '採用情報' },
] as const;

export const footerNav = [
  ...nav,
  { href: '/news', label: 'お知らせ' },
  { href: '/disclosure', label: '掲示事項' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/en', label: 'English' },
] as const;

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
  if (href === '/') return p === '/';
  return p === href || p.startsWith(href + '/');
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
