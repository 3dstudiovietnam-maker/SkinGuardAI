const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/lib/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Each entry: unique AI_DISCLAIMER ending text (unique per language) → footer block to insert
// Pattern: find `UNIQUE_END\n    }\n  },` and replace with `UNIQUE_END\n    },\n    footer: {...},\n  },`
// For th: ends with `\" \n    }\n  }   \n};` (unusual spacing, last section)

const insertions = [
  {
    lang: 'hu',
    // HU-specific AI_DISCLAIMER ending
    find: 'szakmai értékelés érdekében."\n    }\n  },',
    footer: `szakmai értékelés érdekében."\n    },\n    footer: {\n      about: { title: 'SkinGuard AI', description: 'AI-precizitással védi a bőr egészségét. A korai felismerés életeket ment — kövesse anyajegyeit otthonról.' },\n      links: { title: 'Gyors linkek' },\n      legal: { title: 'Jogi', privacy: 'Adatvédelmi irányelvek', terms: 'Felhasználási feltételek' },\n      newsletter: { title: 'Maradjon naprakész', subtitle: 'Legfrissebb hírek a bőregészségről és az AI-technológiáról.', emailPlaceholder: 'Adja meg email-jét', sending: 'Küldés...', button: 'Feliratkozás', success: '✓ Feliratkozott! Köszönjük.', error: 'Hiba történt. Kérjük, próbálja újra.', privacy: 'Tiszteletben tartjuk adatait. Bármikor leiratkozhat.' },\n      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },\n      copyright: '© {year} SkinGuard AI. Minden jog fenntartva.',\n      madeWith: 'Készült',\n      from: 'a jobb bőrészségért.',\n    },\n  },`,
  },
  {
    lang: 'hi',
    find: 'योग्य त्वचा विशेषज्ञ से परामर्श लें।\'\n    }\n  },',
    footer: `योग्य त्वचा विशेषज्ञ से परामर्श लें।'\n    },\n    footer: {\n      about: { title: 'SkinGuard AI', description: 'AI सटीकता के साथ त्वचा स्वास्थ्य की सुरक्षा। जल्दी पता चलने से जीवन बचते हैं — घर से अपने तिलों की निगरानी करें।' },\n      links: { title: 'त्वरित लिंक' },\n      legal: { title: 'कानूनी', privacy: 'गोपनीयता नीति', terms: 'सेवा की शर्तें' },\n      newsletter: { title: 'अपडेट रहें', subtitle: 'त्वचा स्वास्थ्य और AI तकनीक पर नवीनतम अपडेट प्राप्त करें।', emailPlaceholder: 'अपना ईमेल दर्ज करें', sending: 'भेजा जा रहा है...', button: 'सदस्यता लें', success: '✓ सदस्यता ली! शामिल होने के लिए धन्यवाद।', error: 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।', privacy: 'हम आपकी गोपनीयता का सम्मान करते हैं। कभी भी सदस्यता रद्द करें।' },\n      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },\n      copyright: '© {year} SkinGuard AI. सर्वाधिकार सुरक्षित।',\n      madeWith: 'बनाया गया',\n      from: 'बेहतर त्वचा स्वास्थ्य के लिए।',\n    },\n  },`,
  },
  {
    lang: 'de',
    find: 'qualifizierten Dermatologen.\'\n    }\n  },',
    footer: `qualifizierten Dermatologen.'\n    },\n    footer: {\n      about: { title: 'SkinGuard AI', description: 'Schützt Hautgesundheit mit KI-Präzision. Früherkennung rettet Leben — überwachen Sie Ihre Muttermale von zu Hause.' },\n      links: { title: 'Schnelllinks' },\n      legal: { title: 'Rechtliches', privacy: 'Datenschutzrichtlinie', terms: 'Nutzungsbedingungen' },\n      newsletter: { title: 'Auf dem Laufenden bleiben', subtitle: 'Erhalten Sie die neuesten Updates zu Hautgesundheit und KI-Technologie.', emailPlaceholder: 'Ihre E-Mail eingeben', sending: 'Senden...', button: 'Abonnieren', success: '✓ Abonniert! Danke fürs Mitmachen.', error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.', privacy: 'Wir respektieren Ihre Privatsphäre. Jederzeit abbestellen.' },\n      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },\n      copyright: '© {year} SkinGuard AI. Alle Rechte vorbehalten.',\n      madeWith: 'Erstellt mit',\n      from: 'für bessere Hautgesundheit.',\n    },\n  },`,
  },
  {
    lang: 'es',
    find: 'dermatólogo calificado para una evaluación profesional.\'\n    }\n  },',
    footer: `dermatólogo calificado para una evaluación profesional.'\n    },\n    footer: {\n      about: { title: 'SkinGuard AI', description: 'Protegiendo la salud de la piel con precisión de IA. La detección temprana salva vidas — monitorea tus lunares desde casa.' },\n      links: { title: 'Enlaces rápidos' },\n      legal: { title: 'Legal', privacy: 'Política de privacidad', terms: 'Términos de servicio' },\n      newsletter: { title: 'Mantente actualizado', subtitle: 'Recibe las últimas noticias sobre salud de la piel y tecnología de IA.', emailPlaceholder: 'Ingresa tu correo', sending: 'Enviando...', button: 'Suscribirse', success: '✓ ¡Suscrito! Gracias por unirte.', error: 'Algo salió mal. Por favor intenta de nuevo.', privacy: 'Respetamos tu privacidad. Cancela la suscripción en cualquier momento.' },\n      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },\n      copyright: '© {year} SkinGuard AI. Todos los derechos reservados.',\n      madeWith: 'Hecho con',\n      from: 'para una mejor salud de la piel.',\n    },\n  },`,
  },
  {
    lang: 'pt',
    find: 'dermatologista qualificado para avaliação profissional.\'\n    }\n  },',
    footer: `dermatologista qualificado para avaliação profissional.'\n    },\n    footer: {\n      about: { title: 'SkinGuard AI', description: 'Protegendo a saúde da pele com precisão de IA. A detecção precoce salva vidas — monitore suas pintas em casa.' },\n      links: { title: 'Links rápidos' },\n      legal: { title: 'Legal', privacy: 'Política de privacidade', terms: 'Termos de serviço' },\n      newsletter: { title: 'Fique atualizado', subtitle: 'Receba as últimas novidades sobre saúde da pele e tecnologia de IA.', emailPlaceholder: 'Digite seu e-mail', sending: 'Enviando...', button: 'Assinar', success: '✓ Inscrito! Obrigado por se juntar.', error: 'Algo deu errado. Por favor tente novamente.', privacy: 'Respeitamos sua privacidade. Cancele a inscrição a qualquer momento.' },\n      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },\n      copyright: '© {year} SkinGuard AI. Todos os direitos reservados.',\n      madeWith: 'Feito com',\n      from: 'para melhor saúde da pele.',\n    },\n  },`,
  },
  {
    lang: 'th',
    // TH ends with unusual spacing: `" \n    }\n  }   \n};`
    find: 'evaluare profesională." \n    }\n  }   \n};',
    footer: `evaluare profesională." \n    },\n    footer: {\n      about: { title: 'SkinGuard AI', description: 'ปกป้องสุขภาพผิวด้วยความแม่นยำของ AI การตรวจพบตั้งแต่เนิ่นๆ ช่วยชีวิตได้ — ติดตามไฝของคุณจากที่บ้าน' },\n      links: { title: 'ลิงก์ด่วน' },\n      legal: { title: 'กฎหมาย', privacy: 'นโยบายความเป็นส่วนตัว', terms: 'ข้อกำหนดในการให้บริการ' },\n      newsletter: { title: 'อัปเดตข่าวสาร', subtitle: 'รับข้อมูลล่าสุดเกี่ยวกับสุขภาพผิวและเทคโนโลยี AI', emailPlaceholder: 'ใส่อีเมลของคุณ', sending: 'กำลังส่ง...', button: 'สมัครรับข่าวสาร', success: '✓ สมัครแล้ว! ขอบคุณที่เข้าร่วม', error: 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง', privacy: 'เราเคารพความเป็นส่วนตัวของคุณ ยกเลิกการสมัครได้ตลอดเวลา' },\n      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },\n      copyright: '© {year} SkinGuard AI. สงวนลิขสิทธิ์ทั้งหมด',\n      madeWith: 'สร้างด้วย',\n      from: 'เพื่อสุขภาพผิวที่ดีขึ้น',\n    },\n  }   \n};`,
  },
];

let count = 0;
for (const { lang, find, footer } of insertions) {
  const occurrences = (content.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (occurrences === 0) {
    console.warn(`⚠️  ${lang}: marker not found`);
  } else if (occurrences > 1) {
    console.warn(`⚠️  ${lang}: marker found ${occurrences} times — skipping`);
  } else {
    content = content.replace(find, footer);
    count++;
    console.log(`✅  ${lang}: footer inserted`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone. ${count} languages updated.`);
