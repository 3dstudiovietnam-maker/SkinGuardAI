/**
 * Adds disclaimer translations to all 9 remaining language sections.
 * Uses unique footer.from values as anchors (CRLF-aware).
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'client', 'src', 'lib', 'translations.ts');
let content = fs.readFileSync(FILE, 'utf8');

// Helper: build a disclaimer block with 4-space indent
function block(fields) {
  const lines = ['    disclaimer: {'];
  for (const [k, v] of Object.entries(fields)) {
    // Escape single quotes and backslashes
    const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    lines.push(`      ${k}: '${escaped}',`);
  }
  lines.push('    },');
  return lines.join('\r\n') + '\r\n';
}

// ─── Language disclaimer data ─────────────────────────────────────────────────

const HI = block({
  title: 'चिकित्सा अस्वीकरण',
  subtitle: 'SkinGuard AI का उपयोग करने से पहले कृपया ध्यान से पढ़ें',
  badge: '⚠️ महत्वपूर्ण चिकित्सा जानकारी',
  warning: 'SkinGuard AI एक चिकित्सा निदान उपकरण नहीं है।',
  intro: 'SkinGuard AI व्यक्तिगत त्वचा स्वास्थ्य निगरानी के रूप में डिज़ाइन किया गया है, न कि चिकित्सा सलाह के प्रतिस्थापन के रूप में।',
  bullet1: 'AI विश्लेषण केवल सूचनात्मक उद्देश्यों के लिए है',
  bullet2: 'पेशेवर त्वचाविज्ञान परीक्षण को प्रतिस्थापित नहीं करता',
  bullet3: 'कैंसर या किसी भी स्थिति का निदान नहीं करता',
  bullet4: 'परिणाम मानव त्वचाविज्ञानी मूल्यांकन से भिन्न हो सकते हैं',
  bullet5: 'चिकित्सा आपातकाल के लिए तुरंत अपने डॉक्टर से संपर्क करें',
  alwaysConsult: 'हमेशा त्वचा की किसी भी चिंता के लिए योग्य त्वचाविज्ञानी से परामर्श करें।',
  section2Title: 'दायित्व की सीमा',
  section2Intro: 'SkinGuard AI प्रदान करता है:',
  section2b1: 'AI-आधारित स्क्रीनिंग उपकरण, चिकित्सा सलाह नहीं',
  section2b2: 'सूचनात्मक विश्लेषण जिसे पेशेवर देखभाल की आवश्यकता हो सकती है',
  section2b3: 'निगरानी सहायता जो नियमित त्वचाविज्ञान जांच को पूरक बनाती है',
  section2b4: 'शैक्षिक सामग्री जो ABCDE विधि पर आधारित है',
  section2footer: 'हम किसी भी नैदानिक निर्णय या चिकित्सा उपचार के लिए जिम्मेदार नहीं हैं।',
  section3Title: 'तत्काल चिकित्सा सहायता कब लें',
  section3Intro: 'इन संकेतों के लिए तुरंत चिकित्सक से मिलें:',
  section3b1: 'तेजी से बदलता हुआ, खून बहता या ना ठीक होने वाला घाव',
  section3b2: 'नया विकास या मौजूदा तिल में अचानक परिवर्तन',
  section3b3: 'अनियमित सीमाओं वाला काला या भूरा क्षेत्र',
  section3b4: 'किसी भी त्वचा परिवर्तन के बारे में चिंता',
  readBtn: 'चिकित्सा अस्वीकरण',
  backToAnalysis: '← वापस',
  lastUpdated: 'अंतिम अपडेट',
  ctaTitle: 'त्वचा संबंधी समस्याएं हैं?',
  ctaBtn: 'त्वचा विशेषज्ञ खोजें',
});

const ZH = block({
  title: '医疗免责声明',
  subtitle: '使用SkinGuard AI前请仔细阅读',
  badge: '⚠️ 重要医疗信息',
  warning: 'SkinGuard AI不是医疗诊断工具。',
  intro: 'SkinGuard AI旨在作为个人皮肤健康监测工具，而非医疗建议的替代品。',
  bullet1: 'AI分析仅供参考',
  bullet2: '不能替代专业皮肤科检查',
  bullet3: '不能诊断癌症或任何疾病',
  bullet4: '结果可能与皮肤科医生评估不同',
  bullet5: '医疗紧急情况请立即联系医生',
  alwaysConsult: '对于任何皮肤问题，请始终咨询有资质的皮肤科医生。',
  section2Title: '责任限制',
  section2Intro: 'SkinGuard AI提供的是：',
  section2b1: '基于AI的筛查工具，而非医疗建议',
  section2b2: '可能需要专业护理的信息性分析',
  section2b3: '补充定期皮肤科检查的监测辅助',
  section2b4: '基于ABCDE方法的教育内容',
  section2footer: '我们对任何临床决定或医疗治疗不承担责任。',
  section3Title: '何时寻求紧急医疗救助',
  section3Intro: '出现以下迹象请立即就医：',
  section3b1: '快速变化、出血或不愈合的病变',
  section3b2: '新生物或现有痣的突然变化',
  section3b3: '边缘不规则的黑色或棕色区域',
  section3b4: '对任何皮肤变化的担忧',
  readBtn: '医疗免责声明',
  backToAnalysis: '← 返回',
  lastUpdated: '最后更新',
  ctaTitle: '有皮肤问题？',
  ctaBtn: '寻找皮肤科医生',
});

const VI = block({
  title: 'Tuyên bố miễn trách nhiệm y tế',
  subtitle: 'Vui lòng đọc kỹ trước khi sử dụng SkinGuard AI',
  badge: '⚠️ Thông tin y tế quan trọng',
  warning: 'SkinGuard AI KHÔNG phải là công cụ chẩn đoán y tế.',
  intro: 'SkinGuard AI được thiết kế như một công cụ theo dõi sức khỏe da cá nhân, không phải thay thế tư vấn y tế.',
  bullet1: 'Phân tích AI chỉ mang tính chất thông tin',
  bullet2: 'Không thay thế khám da liễu chuyên nghiệp',
  bullet3: 'Không chẩn đoán ung thư hay bất kỳ bệnh nào',
  bullet4: 'Kết quả có thể khác với đánh giá của bác sĩ da liễu',
  bullet5: 'Trong trường hợp khẩn cấp y tế, liên hệ bác sĩ ngay',
  alwaysConsult: 'Luôn tham khảo ý kiến bác sĩ da liễu có chuyên môn cho mọi lo ngại về da.',
  section2Title: 'Giới hạn trách nhiệm pháp lý',
  section2Intro: 'SkinGuard AI cung cấp:',
  section2b1: 'Công cụ sàng lọc dựa trên AI, không phải tư vấn y tế',
  section2b2: 'Phân tích thông tin có thể cần chăm sóc chuyên nghiệp',
  section2b3: 'Hỗ trợ theo dõi bổ sung cho các lần khám da liễu định kỳ',
  section2b4: 'Nội dung giáo dục dựa trên phương pháp ABCDE',
  section2footer: 'Chúng tôi không chịu trách nhiệm về bất kỳ quyết định lâm sàng hay điều trị y tế nào.',
  section3Title: 'Khi nào cần tìm kiếm sự chăm sóc y tế khẩn cấp',
  section3Intro: 'Đến gặp bác sĩ ngay nếu có các dấu hiệu sau:',
  section3b1: 'Tổn thương thay đổi nhanh, chảy máu hoặc không lành',
  section3b2: 'Nốt ruồi mới mọc hoặc thay đổi đột ngột',
  section3b3: 'Vùng đen hoặc nâu có viền không đều',
  section3b4: 'Lo lắng về bất kỳ thay đổi nào trên da',
  readBtn: 'Tuyên bố miễn trách nhiệm y tế',
  backToAnalysis: '← Quay lại',
  lastUpdated: 'Cập nhật lần cuối',
  ctaTitle: 'Bạn có lo lắng về da không?',
  ctaBtn: 'Tìm bác sĩ da liễu',
});

const DE = block({
  title: 'Medizinischer Haftungsausschluss',
  subtitle: 'Bitte lesen Sie dies sorgfältig durch, bevor Sie SkinGuard AI verwenden',
  badge: '⚠️ Wichtige medizinische Information',
  warning: 'SkinGuard AI ist KEIN medizinisches Diagnosewerkzeug.',
  intro: 'SkinGuard AI wurde als persönliches Hautgesundheits-Monitoring-Tool entwickelt, nicht als Ersatz für medizinischen Rat.',
  bullet1: 'KI-Analyse dient nur zu Informationszwecken',
  bullet2: 'Ersetzt keine professionelle dermatologische Untersuchung',
  bullet3: 'Diagnostiziert keinen Krebs oder andere Erkrankungen',
  bullet4: 'Ergebnisse können von ärztlichen Bewertungen abweichen',
  bullet5: 'Bei medizinischen Notfällen sofort einen Arzt aufsuchen',
  alwaysConsult: 'Konsultieren Sie bei Hautbedenken stets einen qualifizierten Dermatologen.',
  section2Title: 'Haftungsbeschränkung',
  section2Intro: 'SkinGuard AI bietet:',
  section2b1: 'KI-basiertes Screening-Tool, keine medizinische Beratung',
  section2b2: 'Informative Analysen, die professionelle Versorgung erfordern können',
  section2b3: 'Monitoring-Unterstützung als Ergänzung zu dermatologischen Untersuchungen',
  section2b4: 'Aufklärungs-Inhalte basierend auf der ABCDE-Methode',
  section2footer: 'Wir haften nicht für klinische Entscheidungen oder medizinische Behandlungen.',
  section3Title: 'Wann sofortige medizinische Hilfe gesucht werden sollte',
  section3Intro: 'Suchen Sie sofort einen Arzt auf bei:',
  section3b1: 'Schnell wachsenden, blutenden oder nicht heilenden Läsionen',
  section3b2: 'Neuem Wachstum oder plötzlichen Veränderungen an bestehenden Molen',
  section3b3: 'Schwarzen oder braunen Bereichen mit unregelmäßigen Rändern',
  section3b4: 'Bedenken bei jeglichen Hautveränderungen',
  readBtn: 'Medizinischer Haftungsausschluss',
  backToAnalysis: '← Zurück',
  lastUpdated: 'Zuletzt aktualisiert',
  ctaTitle: 'Hautbedenken?',
  ctaBtn: 'Dermatologen finden',
});

const ES = block({
  title: 'Aviso médico legal',
  subtitle: 'Por favor lea detenidamente antes de usar SkinGuard AI',
  badge: '⚠️ Información médica importante',
  warning: 'SkinGuard AI NO es una herramienta de diagnóstico médico.',
  intro: 'SkinGuard AI está diseñado como herramienta de monitoreo personal de salud de la piel, no como sustituto de asesoramiento médico.',
  bullet1: 'El análisis de IA es solo con fines informativos',
  bullet2: 'No reemplaza el examen dermatológico profesional',
  bullet3: 'No diagnostica cáncer ni ninguna otra enfermedad',
  bullet4: 'Los resultados pueden diferir de la evaluación médica',
  bullet5: 'En emergencias médicas, contacte inmediatamente a su médico',
  alwaysConsult: 'Consulte siempre a un dermatólogo calificado para cualquier preocupación cutánea.',
  section2Title: 'Limitación de responsabilidad',
  section2Intro: 'SkinGuard AI proporciona:',
  section2b1: 'Herramienta de detección basada en IA, no asesoramiento médico',
  section2b2: 'Análisis informativos que pueden requerir atención profesional',
  section2b3: 'Asistencia de monitoreo complementaria a las revisiones dermatológicas regulares',
  section2b4: 'Contenido educativo basado en el método ABCDE',
  section2footer: 'No somos responsables de ninguna decisión clínica ni tratamiento médico.',
  section3Title: 'Cuándo buscar atención médica inmediata',
  section3Intro: 'Consulte a un médico de inmediato si presenta:',
  section3b1: 'Lesiones que cambian rápidamente, sangran o no cicatrizan',
  section3b2: 'Nueva formación o cambios repentinos en lunares existentes',
  section3b3: 'Áreas negras o marrones con bordes irregulares',
  section3b4: 'Preocupación por cualquier cambio en la piel',
  readBtn: 'Aviso médico legal',
  backToAnalysis: '← Volver',
  lastUpdated: 'Última actualización',
  ctaTitle: '¿Tiene preocupaciones cutáneas?',
  ctaBtn: 'Encontrar un dermatólogo',
});

const PT = block({
  title: 'Aviso médico legal',
  subtitle: 'Por favor leia atentamente antes de usar o SkinGuard AI',
  badge: '⚠️ Informação médica importante',
  warning: 'SkinGuard AI NÃO é uma ferramenta de diagnóstico médico.',
  intro: 'SkinGuard AI foi concebido como ferramenta de monitorização pessoal da saúde da pele, não como substituto de aconselhamento médico.',
  bullet1: 'A análise de IA é apenas para fins informativos',
  bullet2: 'Não substitui o exame dermatológico profissional',
  bullet3: 'Não diagnostica cancro nem qualquer outra doença',
  bullet4: 'Os resultados podem diferir da avaliação médica',
  bullet5: 'Em emergências médicas, contacte imediatamente o seu médico',
  alwaysConsult: 'Consulte sempre um dermatologista qualificado para qualquer preocupação com a pele.',
  section2Title: 'Limitação de responsabilidade',
  section2Intro: 'SkinGuard AI fornece:',
  section2b1: 'Ferramenta de triagem baseada em IA, não aconselhamento médico',
  section2b2: 'Análises informativas que podem requerer cuidados profissionais',
  section2b3: 'Assistência de monitorização complementar às consultas dermatológicas regulares',
  section2b4: 'Conteúdo educativo baseado no método ABCDE',
  section2footer: 'Não somos responsáveis por quaisquer decisões clínicas ou tratamentos médicos.',
  section3Title: 'Quando procurar cuidados médicos urgentes',
  section3Intro: 'Consulte um médico imediatamente se:',
  section3b1: 'Lesões que mudam rapidamente, sangram ou não cicatrizam',
  section3b2: 'Nova formação ou alterações repentinas em sinais existentes',
  section3b3: 'Áreas pretas ou castanhas com bordos irregulares',
  section3b4: 'Preocupação com qualquer alteração na pele',
  readBtn: 'Aviso médico legal',
  backToAnalysis: '← Voltar',
  lastUpdated: 'Última atualização',
  ctaTitle: 'Tem preocupações com a pele?',
  ctaBtn: 'Encontrar um dermatologista',
});

const RU = block({
  title: 'Медицинский отказ от ответственности',
  subtitle: 'Пожалуйста, внимательно прочтите перед использованием SkinGuard AI',
  badge: '⚠️ Важная медицинская информация',
  warning: 'SkinGuard AI НЕ является инструментом медицинской диагностики.',
  intro: 'SkinGuard AI разработан как инструмент для личного мониторинга здоровья кожи, а не как замена медицинской консультации.',
  bullet1: 'Анализ ИИ предназначен только для информационных целей',
  bullet2: 'Не заменяет профессиональный дерматологический осмотр',
  bullet3: 'Не диагностирует рак или какие-либо заболевания',
  bullet4: 'Результаты могут отличаться от оценки врача-дерматолога',
  bullet5: 'При медицинской экстренной ситуации немедленно обратитесь к врачу',
  alwaysConsult: 'При любых проблемах с кожей всегда консультируйтесь с квалифицированным дерматологом.',
  section2Title: 'Ограничение ответственности',
  section2Intro: 'SkinGuard AI предоставляет:',
  section2b1: 'Инструмент скрининга на основе ИИ, а не медицинскую консультацию',
  section2b2: 'Информационный анализ, который может потребовать профессиональной помощи',
  section2b3: 'Помощь в мониторинге как дополнение к регулярным дерматологическим осмотрам',
  section2b4: 'Образовательный контент на основе метода ABCDE',
  section2footer: 'Мы не несём ответственности за какие-либо клинические решения или медицинское лечение.',
  section3Title: 'Когда необходимо срочно обратиться за медицинской помощью',
  section3Intro: 'Немедленно обратитесь к врачу при:',
  section3b1: 'Быстро меняющихся, кровоточащих или незаживающих повреждениях',
  section3b2: 'Новообразованиях или внезапных изменениях существующих родинок',
  section3b3: 'Чёрных или коричневых областях с неровными краями',
  section3b4: 'Беспокойстве по поводу любых изменений на коже',
  readBtn: 'Медицинский отказ от ответственности',
  backToAnalysis: '← Назад',
  lastUpdated: 'Последнее обновление',
  ctaTitle: 'Есть проблемы с кожей?',
  ctaBtn: 'Найти дерматолога',
});

const TH = block({
  title: 'ข้อจำกัดความรับผิดชอบทางการแพทย์',
  subtitle: 'กรุณาอ่านอย่างละเอียดก่อนใช้งาน SkinGuard AI',
  badge: '⚠️ ข้อมูลทางการแพทย์สำคัญ',
  warning: 'SkinGuard AI ไม่ใช่เครื่องมือวินิจฉัยโรค',
  intro: 'SkinGuard AI ออกแบบมาเป็นเครื่องมือติดตามสุขภาพผิวส่วนตัว ไม่ใช่การทดแทนคำแนะนำทางการแพทย์',
  bullet1: 'การวิเคราะห์ด้วย AI เพื่อวัตถุประสงค์ด้านข้อมูลเท่านั้น',
  bullet2: 'ไม่แทนที่การตรวจโดยแพทย์ผิวหนังมืออาชีพ',
  bullet3: 'ไม่ได้วินิจฉัยโรคมะเร็งหรือโรคอื่นใด',
  bullet4: 'ผลลัพธ์อาจแตกต่างจากการประเมินของแพทย์ผิวหนัง',
  bullet5: 'สำหรับฉุกเฉินทางการแพทย์ ให้ติดต่อแพทย์ทันที',
  alwaysConsult: 'ปรึกษาแพทย์ผิวหนังที่มีคุณสมบัติเหมาะสมเสมอสำหรับความกังวลเกี่ยวกับผิวหนังทุกอย่าง',
  section2Title: 'การจำกัดความรับผิดชอบ',
  section2Intro: 'SkinGuard AI ให้บริการ:',
  section2b1: 'เครื่องมือคัดกรองด้วย AI ไม่ใช่คำแนะนำทางการแพทย์',
  section2b2: 'การวิเคราะห์เชิงข้อมูลที่อาจต้องการการดูแลจากผู้เชี่ยวชาญ',
  section2b3: 'ความช่วยเหลือในการติดตามเพื่อเสริมการตรวจผิวหนังตามปกติ',
  section2b4: 'เนื้อหาการศึกษาตามวิธี ABCDE',
  section2footer: 'เราไม่รับผิดชอบต่อการตัดสินใจทางคลินิกหรือการรักษาพยาบาลใดๆ',
  section3Title: 'เมื่อใดควรขอความช่วยเหลือทางการแพทย์ทันที',
  section3Intro: 'พบแพทย์ทันทีหากมีสัญญาณเหล่านี้:',
  section3b1: 'รอยโรคที่เปลี่ยนแปลงเร็ว มีเลือดออก หรือไม่หาย',
  section3b2: 'การเจริญเติบโตใหม่หรือการเปลี่ยนแปลงอย่างกะทันหันของไฝที่มีอยู่',
  section3b3: 'บริเวณสีดำหรือสีน้ำตาลที่มีขอบไม่สม่ำเสมอ',
  section3b4: 'ความกังวลเกี่ยวกับการเปลี่ยนแปลงผิวหนังใดๆ',
  readBtn: 'ข้อจำกัดความรับผิดชอบทางการแพทย์',
  backToAnalysis: '← กลับ',
  lastUpdated: 'อัปเดตล่าสุด',
  ctaTitle: 'มีความกังวลเกี่ยวกับผิวหนัง?',
  ctaBtn: 'ค้นหาแพทย์ผิวหนัง',
});

const RO = block({
  title: 'Declinare a responsabilității medicale',
  subtitle: 'Vă rugăm să citiți cu atenție înainte de a utiliza SkinGuard AI',
  badge: '⚠️ Informații medicale importante',
  warning: 'SkinGuard AI NU este un instrument de diagnostic medical.',
  intro: 'SkinGuard AI este conceput ca un instrument personal de monitorizare a sănătății pielii, nu ca înlocuitor al sfatului medical.',
  bullet1: 'Analiza AI este exclusiv în scop informativ',
  bullet2: 'Nu înlocuiește examinarea dermatologică profesională',
  bullet3: 'Nu diagnostichează cancerul sau orice altă afecțiune',
  bullet4: 'Rezultatele pot diferi de evaluarea medicală',
  bullet5: 'În urgențe medicale, contactați imediat medicul dumneavoastră',
  alwaysConsult: 'Consultați întotdeauna un dermatolog calificat pentru orice îngrijorare cutanată.',
  section2Title: 'Limitarea responsabilității',
  section2Intro: 'SkinGuard AI oferă:',
  section2b1: 'Instrument de screening bazat pe IA, nu consultanță medicală',
  section2b2: 'Analize informative care pot necesita îngrijire profesională',
  section2b3: 'Asistență de monitorizare care completează controalele dermatologice regulate',
  section2b4: 'Conținut educativ bazat pe metoda ABCDE',
  section2footer: 'Nu suntem responsabili pentru nicio decizie clinică sau tratament medical.',
  section3Title: 'Când să solicitați asistență medicală imediată',
  section3Intro: 'Consultați imediat un medic dacă observați:',
  section3b1: 'Leziuni care se schimbă rapid, sângerează sau nu se vindecă',
  section3b2: 'Formațiuni noi sau modificări bruște ale alunițelor existente',
  section3b3: 'Zone negre sau maronii cu margini neregulate',
  section3b4: 'Îngrijorare cu privire la orice modificare a pielii',
  readBtn: 'Declinare a responsabilității medicale',
  backToAnalysis: '← Înapoi',
  lastUpdated: 'Ultima actualizare',
  ctaTitle: 'Aveți îngrijorări privind pielea?',
  ctaBtn: 'Găsești un dermatolog',
});

// ─── Insertions ───────────────────────────────────────────────────────────────

let changed = 0;

function replace(lang, search, replacement) {
  if (!content.includes(search)) {
    console.log(`⚠️  ${lang}: anchor NOT found`);
    return;
  }
  content = content.replace(search, replacement);
  changed++;
  console.log(`✅  ${lang}: inserted`);
}

// For HI–RU: pattern is footer.from line + footer close + section close
// Insert disclaimer BETWEEN footer close and section close

replace('HI',
  `      from: 'बेहतर त्वचा स्वास्थ्य के लिए।',\r\n    },\r\n  },\r\n`,
  `      from: 'बेहतर त्वचा स्वास्थ्य के लिए।',\r\n    },\r\n${HI}  },\r\n`
);

replace('ZH',
  `      from: '为更好的皮肤健康。',\r\n    },\r\n  },\r\n`,
  `      from: '为更好的皮肤健康。',\r\n    },\r\n${ZH}  },\r\n`
);

replace('VI',
  `      from: 'vì sức khỏe da tốt hơn.',\r\n    },\r\n  },\r\n`,
  `      from: 'vì sức khỏe da tốt hơn.',\r\n    },\r\n${VI}  },\r\n`
);

replace('DE',
  `      from: 'für bessere Hautgesundheit.',\r\n    },\r\n  },\r\n`,
  `      from: 'für bessere Hautgesundheit.',\r\n    },\r\n${DE}  },\r\n`
);

replace('ES',
  `      from: 'para una mejor salud de la piel.',\r\n    },\r\n  },\r\n`,
  `      from: 'para una mejor salud de la piel.',\r\n    },\r\n${ES}  },\r\n`
);

replace('PT',
  `      from: 'para melhor saúde da pele.',\r\n    },\r\n  },\r\n`,
  `      from: 'para melhor saúde da pele.',\r\n    },\r\n${PT}  },\r\n`
);

replace('RU',
  `      from: 'для лучшего здоровья кожи.',\r\n    },\r\n  },\r\n`,
  `      from: 'для лучшего здоровья кожи.',\r\n    },\r\n${RU}  },\r\n`
);

// TH: insert before the section close `},\r\n   ro: {`
// The monitor line ends with trailing spaces: '...ทำซ้ำ' }    \r\n},\r\n
replace('TH',
  `' }    \r\n},\r\n   ro: {\r\n`,
  `' }    \r\n${TH}},\r\n   ro: {\r\n`
);

// RO: insert before aiMessages block (which has Thai content — pre-existing bug)
// Unique anchor: the Thai aiMessages.low text
replace('RO',
  `    },\r\n    aiMessages: {\r\n      low: 'แค่จุดเล็กๆ`,
  `    },\r\n${RO}    aiMessages: {\r\n      low: 'แค่จุดเล็กๆ`
);

console.log(`\n✅ Done! ${changed}/9 languages updated.`);

if (changed > 0) {
  fs.writeFileSync(FILE, content, 'utf8');
  console.log('File saved.');
} else {
  console.log('No changes made.');
}
