/**
 * Adds footer.sources translation key to all language sections
 * Uses the `newsletter: { title:` pattern as insertion anchor
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../client/src/lib/translations.ts');
let code = fs.readFileSync(FILE, 'utf8');

// Each entry: [unique newsletter title fragment, sources translation]
const replacements = [
  // HU
  ["newsletter: { title: 'Maradjon naprakész'", "sources: 'Források és hitelesség', newsletter: { title: 'Maradjon naprakész'"],
  // HI
  ["newsletter: { title: 'अपडेट रहें'", "sources: 'स्रोत और विश्वसनीयता', newsletter: { title: 'अपडेट रहें'"],
  // ZH
  ["newsletter: { title: '保持更新'", "sources: '来源与可信度', newsletter: { title: '保持更新'"],
  // VI
  ["newsletter: { title: 'Cập nhật tin tức'", "sources: 'Nguồn & Độ tin cậy', newsletter: { title: 'Cập nhật tin tức'"],
  // DE
  ["newsletter: { title: 'Bleiben Sie auf dem Laufenden'", "sources: 'Quellen & Glaubwürdigkeit', newsletter: { title: 'Bleiben Sie auf dem Laufenden'"],
  // ES
  ["newsletter: { title: 'Mantente actualizado'", "sources: 'Fuentes y Credibilidad', newsletter: { title: 'Mantente actualizado'"],
  // PT
  ["newsletter: { title: 'Fique atualizado'", "sources: 'Fontes e Credibilidade', newsletter: { title: 'Fique atualizado'"],
  // RU
  ["newsletter: { title: 'Будьте в курсе'", "sources: 'Источники и достоверность', newsletter: { title: 'Будьте в курсе'"],
  // TH
  ["newsletter: { title: 'รับข่าวสาร'", "sources: 'แหล่งที่มาและความน่าเชื่อถือ', newsletter: { title: 'รับข่าวสาร'"],
  // RO
  ["newsletter: { title: 'Rămâi la curent'", "sources: 'Surse și credibilitate', newsletter: { title: 'Rămâi la curent'"],
];

let found = 0;
for (const [from, to] of replacements) {
  if (code.includes(from)) {
    code = code.replace(from, to);
    console.log(`✅ ${from.substring(0, 50)}`);
    found++;
  } else {
    console.log(`⚠️  NOT FOUND: ${from.substring(0, 50)}`);
  }
}

fs.writeFileSync(FILE, code, 'utf8');
console.log(`\n✅ Done — ${found}/${replacements.length} replacements made`);
