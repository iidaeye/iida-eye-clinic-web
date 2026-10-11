// design/tokens.json → src/styles/tokens.css
//
// デザインシステム (tokens.json) を唯一の正とし、CSS変数と文字スタイルのクラスを生成する。
// 色・余白・角丸・罫線は :root の変数、文字スタイルは .t-<name> クラスになる。
// 実行: pnpm tokens  (dev / build の前に自動実行される)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'design/tokens.json');
const out = resolve(root, 'src/styles/tokens.css');

const tokens = JSON.parse(await readFile(src, 'utf8'));

const lines = [];
lines.push(`/* 自動生成: design/tokens.json から scripts/build-tokens.mjs が生成。直接編集しない */`);
lines.push(`:root {`);

// 色 (単一テーマ。将来ダークテーマを足す場合は themes[1] 以降を [data-theme] ブロックに出す)
const firstTheme = tokens.color.themes[0].id;
lines.push(`  /* color */`);
for (const t of tokens.color.tokens) {
  const v = typeof t.value === 'string' ? t.value : t.value[firstTheme];
  lines.push(`  --${t.name}: ${v};`);
}

// 書体ファミリー
lines.push(`  /* font family */`);
for (const [key, stack] of Object.entries(tokens.type.families)) {
  lines.push(`  --font-${key}: ${stack};`);
}

// 余白・角丸・罫線・その他 {tokens:[...]} 形式の family
for (const family of ['spacing', 'radius', 'border']) {
  if (!tokens[family]) continue;
  lines.push(`  /* ${family} */`);
  for (const t of tokens[family].tokens) {
    lines.push(`  --${t.name}: ${t.value};`);
  }
}
lines.push(`}`);
lines.push(``);

// 文字スタイル → .t-<name>
lines.push(`/* type styles */`);
for (const group of tokens.type.groups) {
  const family = `var(--font-${group.family})`;
  for (const s of group.styles) {
    const decl = [
      `font-family: ${s.family ? `var(--font-${s.family})` : family}`,
      `font-size: ${s.fontSize}`,
      `line-height: ${s.lineHeight}`,
      `font-weight: ${s.fontWeight}`,
    ];
    if (s.letterSpacing) decl.push(`letter-spacing: ${s.letterSpacing}`);
    lines.push(`.t-${s.name} { ${decl.join('; ')}; }`);
  }
}
lines.push(``);

await mkdir(dirname(out), { recursive: true });
await writeFile(out, lines.join('\n'), 'utf8');
console.log(`tokens: wrote ${out.replace(root + '/', '')} (${tokens.color.tokens.length} colors)`);
