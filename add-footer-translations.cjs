const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/lib/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Footer block template — same structure, different text per language
// format: [searchMarker, footerBlock]
// We insert footer block just before the closing of each language section
// Each searchMarker is unique text appearing right before that language's closing `  },`

const footerBlocks = {
  // HU: insert before "  },\n  hi: {"
  hu: {
    marker: '  },\n  hi: {',
    footer: `    footer: {
      about: { title: 'SkinGuard AI', description: 'AI-precizitással védi a bőr egészségét. A korai felismerés életeket ment — kövesse anyajegyeit otthonról.' },
      links: { title: 'Gyors linkek' },
      legal: { title: 'Jogi', privacy: 'Adatvédelmi irányelvek', terms: 'Felhasználási feltételek' },
      newsletter: { title: 'Maradjon naprakész', subtitle: 'Legfrissebb hírek a bőregészségről és az AI-technológiáról.', emailPlaceholder: 'Adja meg email-jét', sending: 'Küldés...', button: 'Feliratkozás', success: '✓ Feliratkozott! Köszönjük.', error: 'Hiba történt. Kérjük, próbálja újra.', privacy: 'Tiszteletben tartjuk adatait. Bármikor leiratkozhat.' },
      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },
      copyright: '© {year} SkinGuard AI. Minden jog fenntartva.',
      madeWith: 'Készült',
      from: 'a jobb bőrészségért.',
    },\n  },\n  hi: {`
  },
  // HI: insert before "  },\n  zh: {"
  hi: {
    marker: '  },\n  zh: {',
    footer: `    footer: {
      about: { title: 'SkinGuard AI', description: 'AI सटीकता के साथ त्वचा स्वास्थ्य की सुरक्षा। जल्दी पता चलने से जीवन बचते हैं — घर से अपने तिलों की निगरानी करें।' },
      links: { title: 'त्वरित लिंक' },
      legal: { title: 'कानूनी', privacy: 'गोपनीयता नीति', terms: 'सेवा की शर्तें' },
      newsletter: { title: 'अपडेट रहें', subtitle: 'त्वचा स्वास्थ्य और AI तकनीक पर नवीनतम अपडेट प्राप्त करें।', emailPlaceholder: 'अपना ईमेल दर्ज करें', sending: 'भेजा जा रहा है...', button: 'सदस्यता लें', success: '✓ सदस्यता ली! शामिल होने के लिए धन्यवाद।', error: 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।', privacy: 'हम आपकी गोपनीयता का सम्मान करते हैं। कभी भी सदस्यता रद्द करें।' },
      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },
      copyright: '© {year} SkinGuard AI. सर्वाधिकार सुरक्षित।',
      madeWith: 'बनाया गया',
      from: 'बेहतर त्वचा स्वास्थ्य के लिए।',
    },\n  },\n  zh: {`
  },
  // ZH: insert before "  },\n  vi: {"
  zh: {
    marker: '  },\n  vi: {',
    footer: `    footer: {
      about: { title: 'SkinGuard AI', description: '以AI精准保护皮肤健康。早期发现拯救生命 — 从家中监测您的痣。' },
      links: { title: '快速链接' },
      legal: { title: '法律', privacy: '隐私政策', terms: '服务条款' },
      newsletter: { title: '保持更新', subtitle: '获取皮肤健康和AI技术的最新动态。', emailPlaceholder: '输入您的电子邮件', sending: '发送中...', button: '订阅', success: '✓ 已订阅！感谢加入。', error: '出现错误，请重试。', privacy: '我们尊重您的隐私。随时取消订阅。' },
      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },
      copyright: '© {year} SkinGuard AI. 保留所有权利。',
      madeWith: '精心打造',
      from: '为更好的皮肤健康。',
    },\n  },\n  vi: {`
  },
  // VI: insert before "  },\n  de: {"
  vi: {
    marker: '  },\n  de: {',
    footer: `    footer: {
      about: { title: 'SkinGuard AI', description: 'Bảo vệ sức khỏe da với độ chính xác AI. Phát hiện sớm cứu sống — theo dõi nốt ruồi từ nhà của bạn.' },
      links: { title: 'Liên kết nhanh' },
      legal: { title: 'Pháp lý', privacy: 'Chính sách bảo mật', terms: 'Điều khoản dịch vụ' },
      newsletter: { title: 'Cập nhật mới nhất', subtitle: 'Nhận thông tin mới nhất về sức khỏe da và công nghệ AI.', emailPlaceholder: 'Nhập email của bạn', sending: 'Đang gửi...', button: 'Đăng ký', success: '✓ Đã đăng ký! Cảm ơn bạn.', error: 'Có lỗi xảy ra. Vui lòng thử lại.', privacy: 'Chúng tôi tôn trọng quyền riêng tư. Hủy đăng ký bất cứ lúc nào.' },
      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },
      copyright: '© {year} SkinGuard AI. Bảo lưu mọi quyền.',
      madeWith: 'Được tạo với',
      from: 'vì sức khỏe da tốt hơn.',
    },\n  },\n  de: {`
  },
  // DE: insert before "  },\n  es: {"
  de: {
    marker: '  },\n  es: {',
    footer: `    footer: {
      about: { title: 'SkinGuard AI', description: 'Schützt Hautgesundheit mit KI-Präzision. Früherkennung rettet Leben — überwachen Sie Ihre Muttermale von zu Hause.' },
      links: { title: 'Schnelllinks' },
      legal: { title: 'Rechtliches', privacy: 'Datenschutzrichtlinie', terms: 'Nutzungsbedingungen' },
      newsletter: { title: 'Auf dem Laufenden bleiben', subtitle: 'Erhalten Sie die neuesten Updates zu Hautgesundheit und KI-Technologie.', emailPlaceholder: 'Ihre E-Mail eingeben', sending: 'Senden...', button: 'Abonnieren', success: '✓ Abonniert! Danke fürs Mitmachen.', error: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.', privacy: 'Wir respektieren Ihre Privatsphäre. Jederzeit abbestellen.' },
      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },
      copyright: '© {year} SkinGuard AI. Alle Rechte vorbehalten.',
      madeWith: 'Erstellt mit',
      from: 'für bessere Hautgesundheit.',
    },\n  },\n  es: {`
  },
  // ES: insert before "  },\n  pt: {"
  es: {
    marker: '  },\n  pt: {',
    footer: `    footer: {
      about: { title: 'SkinGuard AI', description: 'Protegiendo la salud de la piel con precisión de IA. La detección temprana salva vidas — monitorea tus lunares desde casa.' },
      links: { title: 'Enlaces rápidos' },
      legal: { title: 'Legal', privacy: 'Política de privacidad', terms: 'Términos de servicio' },
      newsletter: { title: 'Mantente actualizado', subtitle: 'Recibe las últimas noticias sobre salud de la piel y tecnología de IA.', emailPlaceholder: 'Ingresa tu correo', sending: 'Enviando...', button: 'Suscribirse', success: '✓ ¡Suscrito! Gracias por unirte.', error: 'Algo salió mal. Por favor intenta de nuevo.', privacy: 'Respetamos tu privacidad. Cancela la suscripción en cualquier momento.' },
      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },
      copyright: '© {year} SkinGuard AI. Todos los derechos reservados.',
      madeWith: 'Hecho con',
      from: 'para una mejor salud de la piel.',
    },\n  },\n  pt: {`
  },
  // PT: insert before "  },\n  ru: {"
  pt: {
    marker: '  },\n  ru: {',
    footer: `    footer: {
      about: { title: 'SkinGuard AI', description: 'Protegendo a saúde da pele com precisão de IA. A detecção precoce salva vidas — monitore suas pintas em casa.' },
      links: { title: 'Links rápidos' },
      legal: { title: 'Legal', privacy: 'Política de privacidade', terms: 'Termos de serviço' },
      newsletter: { title: 'Fique atualizado', subtitle: 'Receba as últimas novidades sobre saúde da pele e tecnologia de IA.', emailPlaceholder: 'Digite seu e-mail', sending: 'Enviando...', button: 'Assinar', success: '✓ Inscrito! Obrigado por se juntar.', error: 'Algo deu errado. Por favor tente novamente.', privacy: 'Respeitamos sua privacidade. Cancele a inscrição a qualquer momento.' },
      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },
      copyright: '© {year} SkinGuard AI. Todos os direitos reservados.',
      madeWith: 'Feito com',
      from: 'para melhor saúde da pele.',
    },\n  },\n  ru: {`
  },
  // RU: insert before "  },\n  th: {"
  ru: {
    marker: '  },\n  th: {',
    footer: `    footer: {
      about: { title: 'SkinGuard AI', description: 'Защита здоровья кожи с точностью ИИ. Раннее выявление спасает жизни — следите за родинками из дома.' },
      links: { title: 'Быстрые ссылки' },
      legal: { title: 'Правовая информация', privacy: 'Политика конфиденциальности', terms: 'Условия использования' },
      newsletter: { title: 'Будьте в курсе', subtitle: 'Получайте последние новости о здоровье кожи и технологиях ИИ.', emailPlaceholder: 'Введите ваш email', sending: 'Отправка...', button: 'Подписаться', success: '✓ Подписано! Спасибо за присоединение.', error: 'Что-то пошло не так. Пожалуйста, попробуйте снова.', privacy: 'Мы уважаем вашу конфиденциальность. Отписаться можно в любое время.' },
      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },
      copyright: '© {year} SkinGuard AI. Все права защищены.',
      madeWith: 'Создано с',
      from: 'для лучшего здоровья кожи.',
    },\n  },\n  th: {`
  },
  // TH: insert before "  },\n};"
  th: {
    marker: '  },\n};',
    footer: `    footer: {
      about: { title: 'SkinGuard AI', description: 'ปกป้องสุขภาพผิวด้วยความแม่นยำของ AI การตรวจพบตั้งแต่เนิ่นๆ ช่วยชีวิตได้ — ติดตามไฝของคุณจากที่บ้าน' },
      links: { title: 'ลิงก์ด่วน' },
      legal: { title: 'กฎหมาย', privacy: 'นโยบายความเป็นส่วนตัว', terms: 'ข้อกำหนดในการให้บริการ' },
      newsletter: { title: 'อัปเดตข่าวสาร', subtitle: 'รับข้อมูลล่าสุดเกี่ยวกับสุขภาพผิวและเทคโนโลยี AI', emailPlaceholder: 'ใส่อีเมลของคุณ', sending: 'กำลังส่ง...', button: 'สมัครรับข่าวสาร', success: '✓ สมัครแล้ว! ขอบคุณที่เข้าร่วม', error: 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง', privacy: 'เราเคารพความเป็นส่วนตัวของคุณ ยกเลิกการสมัครได้ตลอดเวลา' },
      contact: { email: 'info@skinguardai.app', partnershipEmail: 'partners@skinguardai.app' },
      copyright: '© {year} SkinGuard AI. สงวนลิขสิทธิ์ทั้งหมด',
      madeWith: 'สร้างด้วย',
      from: 'เพื่อสุขภาพผิวที่ดีขึ้น',
    },\n  },\n};`
  },
};

let insertCount = 0;

for (const [lang, { marker, footer }] of Object.entries(footerBlocks)) {
  // Skip if this language already has a footer section
  if (content.includes(`footer: {\n      about: { title: 'SkinGuard AI'`) &&
      content.indexOf(`footer: {\n      about: { title: 'SkinGuard AI'`) < content.indexOf(marker)) {
    // Check if footer appears WITHIN this language's section specifically
    // Simple check: count occurrences
  }

  if (content.includes(marker)) {
    const count = (content.match(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count !== 1) {
      console.warn(`⚠️  Marker for '${lang}' found ${count} times — skipping to be safe.`);
      continue;
    }
    content = content.replace(marker, footer);
    insertCount++;
    console.log(`✅  Added footer to: ${lang}`);
  } else {
    console.warn(`⚠️  Marker for '${lang}' not found — already inserted or structure changed.`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone. Inserted footer into ${insertCount} languages.`);
