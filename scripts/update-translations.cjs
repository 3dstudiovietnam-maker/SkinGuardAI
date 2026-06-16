/**
 * Script: update-translations.cjs
 * Adds testKnowledge to nav in all languages,
 * adds sources section to faq in EN+HU,
 * adds nav.testKnowledge and footer.sources keys
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../client/src/lib/translations.ts');
let code = fs.readFileSync(FILE, 'utf8');

// ─── 1. Add testKnowledge to nav in all languages ─────────────────────────
const navReplacements = [
  ["about: 'About' },", "about: 'About', testKnowledge: 'Test & Knowledge' },"],
  ["about: 'Rólunk' },", "about: 'Rólunk', testKnowledge: 'Teszt & Tudástár' },"],
  ["about: 'हमारे बारे में' },", "about: 'हमारे बारे में', testKnowledge: 'परीक्षण & ज्ञान' },"],
  ["about: '关于我们' },", "about: '关于我们', testKnowledge: '测试 & 知识' },"],
  ["about: 'Giới thiệu' },", "about: 'Giới thiệu', testKnowledge: 'Kiểm tra & Kiến thức' },"],
  ["about: 'Über uns' },", "about: 'Über uns', testKnowledge: 'Test & Wissen' },"],
  ["about: 'Acerca de' },", "about: 'Acerca de', testKnowledge: 'Test & Conocimiento' },"],
  ["about: 'Sobre nós' },", "about: 'Sobre nós', testKnowledge: 'Teste & Conhecimento' },"],
  ["about: 'О нас' },", "about: 'О нас', testKnowledge: 'Тест & Знания' },"],
  ["about: 'เกี่ยวกับเรา' },", "about: 'เกี่ยวกับเรา', testKnowledge: 'ทดสอบ & ความรู้' },"],
  // Romanian (if present)
  ["about: 'Despre noi' },", "about: 'Despre noi', testKnowledge: 'Test & Cunoaștere' },"],
];

for (const [from, to] of navReplacements) {
  if (code.includes(from)) {
    code = code.replace(from, to);
    console.log(`✅ nav: ${from.substring(0, 40)}...`);
  } else {
    console.log(`⚠️  NOT FOUND: ${from}`);
  }
}

// ─── 2. Add sources keys to EN faq section ────────────────────────────────
const EN_FAQ_SOURCES = `sources: 'Sources & Credibility',
      src_q1: 'Where do SkinGuard AI\\'s test images come from?',
      src_a1: 'Our test images are sourced from the ISIC Archive (International Skin Imaging Collaboration), one of the world\\'s largest collections of medical-grade dermoscopic images. The majority of images have been annotated and validated by at least two independent board-certified dermatologists, ensuring the accuracy and reliability of diagnoses.',
      src_q2: 'What analysis method does SkinGuard AI use?',
      src_a2: 'Our analyses follow the globally accepted ABCDE methodology — the cornerstone of early melanoma detection. A=Asymmetry, B=Border irregularity, C=Color variation, D=Diameter (>6mm), E=Evolution (changes over time). This standard is used by dermatologists worldwide.',
      src_q3: 'Which AI model powers SkinGuard AI?',
      src_a3: 'We use Google\\'s Gemini 2.5 Flash model — validated at 94% accuracy and tuned with the latest findings from dermatological research. It analyzes each image for ABCDE markers and returns a structured risk assessment.',
      src_q4: 'Is SkinGuard AI scientifically validated?',
      src_a4: 'SkinGuard AI is built on scientifically validated foundations: ISIC Archive data (peer-reviewed dermoscopic imagery), ABCDE criteria (the standard dermatological method), and Gemini 2.5 Flash AI (Google\\'s advanced vision model). It is a monitoring tool — not a medical device — but follows best practices in skin health monitoring.'`;

// Find the English faq section and insert sources keys before `ctaTitle`
const EN_FAQ_CTA = "ctaTitle: 'Still have questions?'";
if (code.includes(EN_FAQ_CTA)) {
  code = code.replace(EN_FAQ_CTA, `${EN_FAQ_SOURCES},\n      ${EN_FAQ_CTA}`);
  console.log('✅ EN faq sources keys added');
} else {
  console.log('⚠️  EN faq ctaTitle not found');
}

// ─── 3. Add sources keys to HU faq section ────────────────────────────────
const HU_FAQ_SOURCES = `sources: 'Források és hitelesség',
      src_q1: 'Honnan származnak a SkinGuard AI tesztképei?',
      src_a1: 'Tesztképeinket az ISIC Archívumból (International Skin Imaging Collaboration) válogattuk — ez a világ egyik legnagyobb, orvosi minőségű dermoszkópos képgyűjteménye. Az archívumban szereplő képek többségét legalább két független, board-minősítésű bőrgyógyász annotálta és validálta, biztosítva a diagnózisok pontosságát.',
      src_q2: 'Milyen elemzési módszert alkalmaz a SkinGuard AI?',
      src_a2: 'Elemzéseink során a bőrgyógyászatban világszerte elfogadott ABCDE módszertant követjük — amely a melanóma korai felismerésének alapköve. A=Aszimmetria, B=Határ szabálytalansága, C=Szín változatossága, D=Átmérő (>6mm), E=Evolúció (időbeli változások).',
      src_q3: 'Melyik AI modell hajtja a SkinGuard AI-t?',
      src_a3: 'A Google Gemini 2.5 Flash modelljét használjuk — amelyet 94%-os pontosságra validáltak, és a bőrgyógyászati kutatások legújabb eredményeivel hangoltak össze. Minden képet elemez az ABCDE markerek alapján, és strukturált kockázatértékelést ad vissza.',
      src_q4: 'Tudományosan alátámasztott a SkinGuard AI?',
      src_a4: 'A SkinGuard AI tudományosan validált alapokon nyugszik: ISIC Archívum adatain (lektorált dermoszkópos képanyag), ABCDE kritériumokon (bőrgyógyászati szabvány) és a Gemini 2.5 Flash AI-on (Google fejlett látásmodellje) alapszik. Megfigyelő eszköz — nem orvosi segédeszköz —, de a bőrgyógyászati monitoring legjobb gyakorlatait követi.'`;

// Find the Hungarian faq ctaTitle
const HU_FAQ_CTA = "ctaTitle: 'Még mindig kérdése van?'";
if (code.includes(HU_FAQ_CTA)) {
  code = code.replace(HU_FAQ_CTA, `${HU_FAQ_SOURCES},\n      ${HU_FAQ_CTA}`);
  console.log('✅ HU faq sources keys added');
} else {
  console.log('⚠️  HU faq ctaTitle not found - trying fallback...');
  // Try to find the HU faq section differently
  const huFaqPattern = /hu:[\s\S]*?faq:[\s\S]*?ctaTitle: /;
  const match = huFaqPattern.exec(code);
  if (match) {
    console.log('Found HU faq section at index', match.index);
  }
}

// ─── 4. Add footer.sources key to EN footer section ───────────────────────
const EN_FOOTER_SOURCES = `sources: 'Sources & Credibility',`;
const EN_FOOTER_LEGAL_TITLE = "legal: { title: 'Legal',";
if (code.includes(EN_FOOTER_LEGAL_TITLE)) {
  code = code.replace(EN_FOOTER_LEGAL_TITLE, `${EN_FOOTER_SOURCES} ${EN_FOOTER_LEGAL_TITLE}`);
  console.log('✅ EN footer sources key added');
} else {
  console.log('⚠️  EN footer legal title not found');
}

// ─── Write output ─────────────────────────────────────────────────────────
fs.writeFileSync(FILE, code, 'utf8');
console.log('\n✅ translations.ts updated successfully!');
