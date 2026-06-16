/**
 * Adds minimal test: { navTest, navDoctors, navKnowledge + doctors-page keys }
 * to the 9 languages that currently have no test section.
 * Uses each language's unique footer.from value as insertion anchor.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'lib', 'translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

// ─── Per-language test sections ───────────────────────────────────────────────
const testSections = {

  hi: `    test: { navTest: 'परीक्षण', navKnowledge: 'ज्ञान आधार', navDoctors: 'डॉक्टर', doctorsNearby: 'आपके पास के त्वचा विशेषज्ञ', doctorsSubtitle: 'Google Maps के माध्यम से अपने पास के त्वचा विशेषज्ञों की खोज करें', findDoctorsGps: 'मेरे पास त्वचा विशेषज्ञ खोजें', orText: 'या', locating: 'स्थान पहचाना जा रहा है...', searchCity: 'शहर या पिन कोड दर्ज करें...', backToTest: '← परीक्षण पर वापस', tryApp: 'पूरा ऐप आज़माएं', registerNow: 'मुफ़्त रजिस्टर करें', googleMapsTitle: 'Google Maps द्वारा संचालित', googleMapsDesc: 'नीचे दिए गए बटन Google Maps खोलेंगे जहाँ आप रेटिंग और दिशाओं के साथ सभी नजदीकी त्वचा विशेषज्ञ देख सकते हैं।', searchTips: 'खोज सुझाव', tip1: 'सर्वोत्तम परिणामों के लिए शहर का नाम, क्षेत्र या पिन कोड दर्ज करें', tip2: 'सबसे सटीक नजदीकी खोज के लिए स्थान पहुंच की अनुमति दें', tip3: 'शीर्ष विशेषज्ञों को खोजने के लिए Google Maps में रेटिंग द्वारा फ़िल्टर करें', errorLocationDesc: 'स्थान निर्धारण विफल। कृपया मैन्युअल रूप से शहर या पिन कोड दर्ज करें।' },`,

  zh: `    test: { navTest: '测试', navKnowledge: '知识库', navDoctors: '医生', doctorsNearby: '附近的皮肤科医生', doctorsSubtitle: '通过Google地图搜索您附近的皮肤科医生', findDoctorsGps: '查找我附近的皮肤科医生', orText: '或', locating: '正在定位...', searchCity: '输入城市或邮政编码...', backToTest: '← 返回测试', tryApp: '试用完整应用', registerNow: '免费注册', googleMapsTitle: '由Google地图提供支持', googleMapsDesc: '点击下方按钮将打开Google地图，您可以看到附近所有皮肤科医生和专科医生，包括评分和路线导航。', searchTips: '搜索提示', tip1: '输入城市名称、街区或邮政编码以获得最佳结果', tip2: '允许位置访问以获得最准确的附近搜索', tip3: '在Google地图中按评分筛选以找到评分最高的专家', errorLocationDesc: '无法确定位置。请手动输入城市或邮政编码。' },`,

  vi: `    test: { navTest: 'Kiểm tra', navKnowledge: 'Kiến thức', navDoctors: 'Bác sĩ', doctorsNearby: 'Bác sĩ da liễu gần bạn', doctorsSubtitle: 'Tìm kiếm bác sĩ da liễu gần bạn qua Google Maps', findDoctorsGps: 'Tìm bác sĩ da liễu gần tôi', orText: 'hoặc', locating: 'Đang xác định vị trí...', searchCity: 'Nhập thành phố hoặc mã bưu chính...', backToTest: '← Quay lại kiểm tra', tryApp: 'Thử ứng dụng đầy đủ', registerNow: 'Đăng ký miễn phí', googleMapsTitle: 'Powered by Google Maps', googleMapsDesc: 'Nhấn nút bên dưới sẽ mở Google Maps nơi bạn có thể thấy tất cả bác sĩ da liễu và chuyên gia da liễu gần đây với đánh giá và chỉ đường.', searchTips: 'Mẹo tìm kiếm', tip1: 'Nhập tên thành phố, khu phố hoặc mã bưu chính để có kết quả tốt nhất', tip2: 'Cho phép truy cập vị trí để tìm kiếm gần nhất chính xác nhất', tip3: 'Lọc theo đánh giá trên Google Maps để tìm chuyên gia được đánh giá cao nhất', errorLocationDesc: 'Không thể xác định vị trí. Vui lòng nhập thành phố hoặc mã bưu chính thủ công.' },`,

  de: `    test: { navTest: 'Test', navKnowledge: 'Wissensdatenbank', navDoctors: 'Ärzte', doctorsNearby: 'Dermatologen in Ihrer Nähe', doctorsSubtitle: 'Suchen Sie nach Dermatologen in Ihrer Nähe über Google Maps', findDoctorsGps: 'Dermatologen in meiner Nähe finden', orText: 'oder', locating: 'Standort wird ermittelt...', searchCity: 'Stadt oder Postleitzahl eingeben...', backToTest: '← Zurück zum Test', tryApp: 'Die vollständige App ausprobieren', registerNow: 'Kostenlos registrieren', googleMapsTitle: 'Powered by Google Maps', googleMapsDesc: 'Durch Klicken auf die Schaltflächen unten öffnet sich Google Maps, wo Sie alle nahegelegenen Dermatologen und Hautspezialisten mit Bewertungen und Wegbeschreibungen sehen können.', searchTips: 'Suchtipps', tip1: 'Geben Sie Stadtname, Stadtteil oder Postleitzahl für beste Ergebnisse ein', tip2: 'Erlauben Sie Standortzugriff für die genaueste Suche in der Nähe', tip3: 'Filtern Sie in Google Maps nach Bewertung, um die besten Spezialisten zu finden', errorLocationDesc: 'Standort konnte nicht ermittelt werden. Bitte geben Sie eine Stadt oder Postleitzahl manuell ein.' },`,

  es: `    test: { navTest: 'Prueba', navKnowledge: 'Base de conocimientos', navDoctors: 'Médicos', doctorsNearby: 'Dermatólogos cerca de ti', doctorsSubtitle: 'Busca dermatólogos cerca de ti a través de Google Maps', findDoctorsGps: 'Encontrar dermatólogos cerca de mí', orText: 'o', locating: 'Detectando ubicación...', searchCity: 'Introduce ciudad o código postal...', backToTest: '← Volver al test', tryApp: 'Probar la app completa', registerNow: 'Registrarse gratis', googleMapsTitle: 'Powered by Google Maps', googleMapsDesc: 'Al hacer clic en los botones de abajo se abrirá Google Maps donde podrás ver todos los dermatólogos y especialistas en piel cercanos con valoraciones e indicaciones.', searchTips: 'Consejos de búsqueda', tip1: 'Escribe el nombre de tu ciudad, barrio o código postal para mejores resultados', tip2: 'Permite el acceso a la ubicación para la búsqueda más precisa', tip3: 'Filtra por valoración en Google Maps para encontrar los mejores especialistas', errorLocationDesc: 'No se pudo determinar la ubicación. Por favor introduce una ciudad o código postal manualmente.' },`,

  pt: `    test: { navTest: 'Teste', navKnowledge: 'Base de conhecimento', navDoctors: 'Médicos', doctorsNearby: 'Dermatologistas perto de você', doctorsSubtitle: 'Pesquise dermatologistas perto de você via Google Maps', findDoctorsGps: 'Encontrar dermatologistas perto de mim', orText: 'ou', locating: 'A detetar localização...', searchCity: 'Introduza cidade ou código postal...', backToTest: '← Voltar ao teste', tryApp: 'Experimentar a app completa', registerNow: 'Registar gratuitamente', googleMapsTitle: 'Powered by Google Maps', googleMapsDesc: 'Ao clicar nos botões abaixo abrirá o Google Maps onde pode ver todos os dermatologistas e especialistas em pele próximos com avaliações e direções.', searchTips: 'Dicas de pesquisa', tip1: 'Digite o nome da cidade, bairro ou código postal para melhores resultados', tip2: 'Permita o acesso à localização para a pesquisa mais precisa', tip3: 'Filtre por avaliação no Google Maps para encontrar os melhores especialistas', errorLocationDesc: 'Não foi possível determinar a localização. Por favor introduza uma cidade ou código postal manualmente.' },`,

  ru: `    test: { navTest: 'Тест', navKnowledge: 'База знаний', navDoctors: 'Врачи', doctorsNearby: 'Дерматологи рядом с вами', doctorsSubtitle: 'Найдите дерматологов рядом через Google Maps', findDoctorsGps: 'Найти дерматологов рядом со мной', orText: 'или', locating: 'Определение местоположения...', searchCity: 'Введите город или почтовый индекс...', backToTest: '← Назад к тесту', tryApp: 'Попробовать полное приложение', registerNow: 'Зарегистрироваться бесплатно', googleMapsTitle: 'Powered by Google Maps', googleMapsDesc: 'Нажатие на кнопки ниже откроет Google Maps, где вы сможете увидеть всех ближайших дерматологов и специалистов по коже с рейтингами и маршрутами.', searchTips: 'Советы по поиску', tip1: 'Введите название города, района или почтовый индекс для лучших результатов', tip2: 'Разрешите доступ к местоположению для наиболее точного поиска', tip3: 'Фильтруйте по рейтингу в Google Maps для поиска лучших специалистов', errorLocationDesc: 'Не удалось определить местоположение. Пожалуйста, введите город или почтовый индекс вручную.' },`,

  th: `    test: { navTest: 'ทดสอบ', navKnowledge: 'ฐานความรู้', navDoctors: 'แพทย์', doctorsNearby: 'แพทย์ผิวหนังใกล้คุณ', doctorsSubtitle: 'ค้นหาแพทย์ผิวหนังใกล้คุณผ่าน Google Maps', findDoctorsGps: 'ค้นหาแพทย์ผิวหนังใกล้ฉัน', orText: 'หรือ', locating: 'กำลังระบุตำแหน่ง...', searchCity: 'กรอกชื่อเมืองหรือรหัสไปรษณีย์...', backToTest: '← กลับไปที่การทดสอบ', tryApp: 'ลองแอปเต็มรูปแบบ', registerNow: 'ลงทะเบียนฟรี', googleMapsTitle: 'Powered by Google Maps', googleMapsDesc: 'การคลิกปุ่มด้านล่างจะเปิด Google Maps ซึ่งคุณสามารถดูแพทย์ผิวหนังและผู้เชี่ยวชาญด้านผิวหนังทั้งหมดในบริเวณใกล้เคียงพร้อมคะแนนและเส้นทาง', searchTips: 'เคล็ดลับการค้นหา', tip1: 'พิมพ์ชื่อเมือง ย่าน หรือรหัสไปรษณีย์เพื่อผลลัพธ์ที่ดีที่สุด', tip2: 'อนุญาตการเข้าถึงตำแหน่งเพื่อการค้นหาที่แม่นยำที่สุด', tip3: 'กรองตามคะแนนใน Google Maps เพื่อค้นหาผู้เชี่ยวชาญที่ได้รับการประเมินสูงสุด', errorLocationDesc: 'ไม่สามารถระบุตำแหน่งได้ กรุณาป้อนชื่อเมืองหรือรหัสไปรษณีย์ด้วยตนเอง' },`,

  ro: `    test: { navTest: 'Test', navKnowledge: 'Baza de cunoștințe', navDoctors: 'Medici', doctorsNearby: 'Dermatologi în apropiere', doctorsSubtitle: 'Caută dermatologi în apropiere prin Google Maps', findDoctorsGps: 'Găsește dermatologi lângă mine', orText: 'sau', locating: 'Se detectează locația...', searchCity: 'Introduceți orașul sau codul poștal...', backToTest: '← Înapoi la test', tryApp: 'Încearcă aplicația completă', registerNow: 'Înregistrează-te gratuit', googleMapsTitle: 'Powered by Google Maps', googleMapsDesc: 'Făcând clic pe butoanele de mai jos se va deschide Google Maps unde puteți vedea toți dermatologii și specialiștii în piele din apropiere cu evaluări și indicații.', searchTips: 'Sfaturi de căutare', tip1: 'Introduceți numele orașului, cartierului sau codul poștal pentru cele mai bune rezultate', tip2: 'Permiteți accesul la locație pentru cea mai precisă căutare în apropiere', tip3: 'Filtrați după evaluare în Google Maps pentru a găsi cei mai buni specialiști', errorLocationDesc: 'Nu s-a putut determina locația. Vă rugăm să introduceți manual un oraș sau cod poștal.' },`,
};

// ─── Insertion anchors (unique footer.from text per language) ─────────────────
// For HI..RU: insert between footer close `    },\r\n` and section close `  },\r\n`
// For TH: insert before `},\r\n   ro:` (TH section has no standard close)
// For RO: insert before `    aiMessages: {` (RO has Thai aiMessages bug at end)

const anchors = {
  hi: { from: `from: '\u092C\u0947\u0939\u0924\u0930 \u0924\u094D\u0935\u091A\u093E \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0915\u0947 \u0932\u093F\u090F\u0964',` },
  zh: { from: `from: '\u4E3A\u66F4\u597D\u7684\u76AE\u80A4\u5065\u5EB7\u3002',` },
  vi: { from: `from: 'v\xEC s\u1EE9c kh\u1ECFe da t\u1ED1t h\u01A1n.',` },
  de: { from: `from: 'f\xFCr bessere Hautgesundheit.',` },
  es: { from: `from: 'para una mejor salud de la piel.',` },
  pt: { from: `from: 'para melhor sa\xFAde da pele.',` },
  ru: { from: `from: '\u0434\u043B\u044F \u043B\u0443\u0447\u0448\u0435\u0433\u043E \u0437\u0434\u043E\u0440\u043E\u0432\u044C\u044F \u043A\u043E\u0436\u0438.',` },
};

let changed = 0;

// ─── Process HI..RU (standard footer-based insertion) ─────────────────────────
for (const [lang, anchor] of Object.entries(anchors)) {
  const fromText = anchor.from;

  // Build the search pattern: "      from: '...',\r\n    },\r\n  },\r\n"
  const searchPattern = `      ${fromText}\r\n    },\r\n  },\r\n`;
  const replacement   = `      ${fromText}\r\n    },\r\n${testSections[lang]}\r\n  },\r\n`;

  if (content.includes(searchPattern)) {
    content = content.replace(searchPattern, replacement);
    console.log(`✅ ${lang.toUpperCase()}: test section inserted`);
    changed++;
  } else {
    // Try LF-only variant
    const searchLF = `      ${fromText}\n    },\n  },\n`;
    const replaceLF = `      ${fromText}\n    },\n${testSections[lang]}\n  },\n`;
    if (content.includes(searchLF)) {
      content = content.replace(searchLF, replaceLF);
      console.log(`✅ ${lang.toUpperCase()}: test section inserted (LF)`);
      changed++;
    } else {
      console.warn(`⚠️  ${lang.toUpperCase()}: anchor not found — skipping`);
    }
  }
}

// ─── TH: insert before `},\r\n   ro: {` ──────────────────────────────────────
const thAnchorCRLF = `' }    \r\n},\r\n   ro: {`;
const thAnchorLF   = `' }    \n},\n   ro: {`;

if (content.includes(thAnchorCRLF)) {
  content = content.replace(thAnchorCRLF, `' }    \r\n${testSections.th}\r\n},\r\n   ro: {`);
  console.log('✅ TH: test section inserted');
  changed++;
} else if (content.includes(thAnchorLF)) {
  content = content.replace(thAnchorLF, `' }    \n${testSections.th}\n},\n   ro: {`);
  console.log('✅ TH: test section inserted (LF)');
  changed++;
} else {
  // Try without trailing spaces
  const thAlt = `' }\r\n},\r\n   ro: {`;
  if (content.includes(thAlt)) {
    content = content.replace(thAlt, `' }\r\n${testSections.th}\r\n},\r\n   ro: {`);
    console.log('✅ TH: test section inserted (alt)');
    changed++;
  } else {
    console.warn('⚠️  TH: anchor not found — trying context search...');
    // Last resort: find the line with '},\r\n   ro: { pattern
    const idx = content.indexOf('\r\n   ro: {');
    if (idx !== -1) {
      // Find the `},` just before `\r\n   ro:`
      const insertPoint = content.lastIndexOf('\r\n', idx - 1);
      content = content.slice(0, insertPoint) + '\r\n' + testSections.th + content.slice(insertPoint);
      console.log('✅ TH: test section inserted (context fallback)');
      changed++;
    } else {
      console.warn('⚠️  TH: could not insert test section');
    }
  }
}

// ─── RO: insert before `    aiMessages: {` ───────────────────────────────────
const roAnchorCRLF = `    },\r\n    aiMessages: {\r\n`;
const roAnchorLF   = `    },\n    aiMessages: {\n`;

// Make sure we get the RO one (the Thai aiMessages) by checking context
const roAiIdx = content.indexOf(`    aiMessages: {\r\n      low: '\u0E41\u0E04\u0E48`);
if (roAiIdx !== -1) {
  const insertHere = content.lastIndexOf(`    },\r\n`, roAiIdx);
  if (insertHere !== -1 && roAiIdx - insertHere < 10) {
    content = content.slice(0, insertHere + 6) + '\r\n' + testSections.ro + content.slice(insertHere + 6);
    console.log('✅ RO: test section inserted (before Thai aiMessages)');
    changed++;
  } else {
    // Fallback: insert right before aiMessages line
    content = content.slice(0, roAiIdx) + testSections.ro + '\r\n    ' + content.slice(roAiIdx);
    console.log('✅ RO: test section inserted (before aiMessages fallback)');
    changed++;
  }
} else {
  // Try LF
  const roAiIdxLF = content.indexOf(`    aiMessages: {\n      low: '\u0E41\u0E04\u0E48`);
  if (roAiIdxLF !== -1) {
    content = content.slice(0, roAiIdxLF) + testSections.ro + '\n    ' + content.slice(roAiIdxLF);
    console.log('✅ RO: test section inserted (LF)');
    changed++;
  } else {
    console.warn('⚠️  RO: anchor not found');
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────
if (changed > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✅ Done! ${changed}/9 languages updated.`);
} else {
  console.log('\n⚠️  No changes made — check anchors.');
}
