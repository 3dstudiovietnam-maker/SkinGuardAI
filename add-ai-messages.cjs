const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/lib/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// aiMessages translations for all 10 languages
const messages = {
  en: {
    low:    "Just a tiny spot – but keep an eye on it!",
    medium: "Hmm... I'd get that checked by a doctor.",
    high:   "Yikes! That looks suspicious. See a doctor soon!"
  },
  hu: {
    low:    "Ez csak egy pici pötty – de azért figyeld!",
    medium: "Hmm... Én a helyedben megnézetném egy dokival.",
    high:   "Húha! Ez gyanús. Gyorsan orvoshoz vinnélek!"
  },
  hi: {
    low:    "बस एक छोटा सा दाग – पर नज़र रखें!",
    medium: "हम्म... मैं इसे डॉक्टर को दिखाने की सलाह दूंगा।",
    high:   "अरे! यह संदिग्ध लगता है। जल्दी डॉक्टर के पास जाएं!"
  },
  zh: {
    low:    "只是一个小斑点 – 但要留意哦！",
    medium: "嗯... 我建议去看看医生。",
    high:   "哎呀！这看起来可疑。快去看医生！"
  },
  vi: {
    low:    "Chỉ là một đốm nhỏ – nhưng hãy theo dõi nhé!",
    medium: "Hmm... Mình sẽ cho bác sĩ xem cái này.",
    high:   "Ôi! Trông đáng ngờ đấy. Hãy đến bác sĩ sớm!"
  },
  de: {
    low:    "Nur ein kleines Fleckchen – aber behalte es im Auge!",
    medium: "Hmm... Ich würde das von einem Arzt untersuchen lassen.",
    high:   "Ups! Das sieht verdächtig aus. Schnell zum Arzt!"
  },
  es: {
    low:    "¡Solo un pequeño punto – pero vigílalo!",
    medium: "Hmm... Yo que tú lo haría ver por un médico.",
    high:   "¡Vaya! Eso parece sospechoso. ¡Ve al médico pronto!"
  },
  pt: {
    low:    "Apenas uma pequena mancha – mas fique de olho!",
    medium: "Hmm... Eu mostraria isso a um médico.",
    high:   "Ei! Isso parece suspeito. Vá ao médico logo!"
  },
  ru: {
    low:    "Просто маленькая точка – но следи за ней!",
    medium: "Хмм... На твоём месте я бы показал это врачу.",
    high:   "Ого! Это подозрительно. Срочно к врачу!"
  },
  th: {
    low:    "แค่จุดเล็กๆ – แต่ควรสังเกตไว้นะ!",
    medium: "อืม... ถ้าเป็นฉัน จะไปให้หมอดูเลย",
    high:   "โอ้โห! ดูน่าสงสัยเลย รีบไปหาหมอด้วยนะ!"
  },
};

// For each language, find its AI_DISCLAIMER and insert aiMessages after aiDescriptions closes
// Pattern: AI_DISCLAIMER: "...",\n    },\n  (}, or };\n)
// We use unique AI_DISCLAIMER text per language to locate insertion points

const disclaimers = {
  en: 'Always consult a qualified dermatologist for professional evaluation.',
  hu: 'Mindig konzultáljon szakképzett bőrgyógyásszal a szakmai értékelés érdekében.',
  hi: 'पेशेवर मूल्यांकन के लिए हमेशा एक योग्य त्वचा विशेषज्ञ से परामर्श लें।',
  zh: '始终咨询合格的皮肤科医生进行专业评估。',
  vi: 'Luôn tham khảo ý kiến bác sĩ da liễu có chuyên môn để được đánh giá chuyên nghiệp.',
  de: 'Konsultieren Sie für eine professionelle Bewertung immer einen qualifizierten Dermatologen.',
  es: 'Siempre consulte a un dermatólogo calificado para una evaluación profesional.',
  pt: 'Sempre consulte um dermatologista qualificado para avaliação profissional.',
  ru: 'Всегда консультируйтесь с квалифицированным дерматологом для профессиональной оценки.',
  th: 'Consultă întotdeauna un dermatolog calificat pentru evaluare profesională.',
};

let modified = 0;

for (const [lang, msgs] of Object.entries(messages)) {
  const disclaimer = disclaimers[lang];
  // Find the closing of aiDescriptions after this disclaimer
  // The pattern is: disclaimer text, then (with possible trailing quote/space), then \n    },
  const searchStr = disclaimer + '"';
  const idx = content.indexOf(searchStr);
  if (idx === -1) {
    // try single quote
    const idx2 = content.indexOf(disclaimer + "'");
    if (idx2 === -1) { console.log(`⚠️  Not found: ${lang}`); continue; }
    // find the \n    }, after it
    const closeIdx = content.indexOf('\n    },', idx2);
    if (closeIdx === -1) { console.log(`⚠️  Close not found: ${lang}`); continue; }
    const insertAt = closeIdx + '\n    },'.length;
    const block = `\n    aiMessages: {\n      low: '${msgs.low}',\n      medium: '${msgs.medium}',\n      high: '${msgs.high}',\n    },`;
    content = content.slice(0, insertAt) + block + content.slice(insertAt);
    console.log(`✅ ${lang} (single quote)`);
    modified++;
    continue;
  }
  const closeIdx = content.indexOf('\n    },', idx);
  if (closeIdx === -1) { console.log(`⚠️  Close not found: ${lang}`); continue; }
  const insertAt = closeIdx + '\n    },'.length;
  const block = `\n    aiMessages: {\n      low: '${msgs.low}',\n      medium: '${msgs.medium}',\n      high: '${msgs.high}',\n    },`;
  content = content.slice(0, insertAt) + block + content.slice(insertAt);
  console.log(`✅ ${lang}`);
  modified++;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone! Modified ${modified} languages.`);
