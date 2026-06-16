/**
 * Adds disclaimer.* translations to all 9 remaining languages
 * (HI, ZH, VI, DE, ES, PT, RU, TH, RO)
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../client/src/lib/translations.ts');
let code = fs.readFileSync(FILE, 'utf8');

// Each disclaimer block per language
const disclaimers = {
  hi: `    disclaimer: {
      title: 'चिकित्सा अस्वीकरण',
      subtitle: 'SkinGuard AI का उपयोग करने से पहले कृपया ध्यान से पढ़ें',
      badge: '⚠️ महत्वपूर्ण चिकित्सा जानकारी',
      warning: 'SkinGuard AI एक चिकित्सा निदान उपकरण नहीं है और इसे पेशेवर चिकित्सा सलाह, निदान या उपचार के विकल्प के रूप में उपयोग नहीं किया जाना चाहिए।',
      intro: 'SkinGuard AI केवल एक व्यक्तिगत त्वचा स्वास्थ्य निगरानी और ट्रैकिंग उपकरण के रूप में डिज़ाइन किया गया है। इस एप्लिकेशन द्वारा प्रदान किया गया AI विश्लेषण:',
      bullet1: 'त्वचाविज्ञान डेटा पर प्रशिक्षित मशीन लर्निंग मॉडल पर आधारित है',
      bullet2: 'चिकित्सा निदान या उपचार के निर्णयों के लिए इस पर भरोसा नहीं किया जाना चाहिए',
      bullet3: 'पेशेवर त्वचाविज्ञान मूल्यांकन का विकल्प नहीं है',
      bullet4: 'इसमें अशुद्धियाँ या त्रुटियाँ हो सकती हैं',
      bullet5: 'केवल परिवर्तनों को ट्रैक करने और आपको स्वास्थ्य पेशेवर से परामर्श करने की याद दिलाने के लिए है',
      alwaysConsult: 'किसी भी त्वचा संबंधी चिंता, संदिग्ध परिवर्तन या चिकित्सा सलाह के लिए हमेशा एक योग्य त्वचा विशेषज्ञ या स्वास्थ्य पेशेवर से परामर्श करें। यदि आपको त्वचा कैंसर या किसी गंभीर त्वचा की स्थिति का संदेह है, तो तुरंत पेशेवर चिकित्सा सहायता लें।',
      section2Title: 'दायित्व की सीमा',
      section2Intro: 'कानून द्वारा अनुमत अधिकतम सीमा तक, Visa Line Inc. और SkinGuard AI इनके लिए उत्तरदायी नहीं होंगे:',
      section2b1: 'कोई भी अप्रत्यक्ष, आकस्मिक, विशेष या परिणामी नुकसान',
      section2b2: 'एप्लिकेशन के उपयोग से उत्पन्न चिकित्सा जटिलताएं या स्वास्थ्य समस्याएं',
      section2b3: 'AI विश्लेषण और सिफारिशों में अशुद्धियाँ',
      section2b4: 'एप्लिकेशन के विश्लेषण के आधार पर लिए गए कोई भी निर्णय',
      section2footer: 'SkinGuard AI का उपयोग आपके अपने जोखिम पर है। आप एप्लिकेशन के विश्लेषण के आधार पर लिए गए किसी भी निर्णय की पूरी जिम्मेदारी लेते हैं।',
      section3Title: 'तत्काल चिकित्सा सहायता कब लें',
      section3Intro: 'केवल SkinGuard AI पर निर्भर न रहें। यदि आप निम्नलिखित देखें तो तुरंत डॉक्टर से मिलें:',
      section3b1: 'तेजी से बढ़ रहा या बदल रहा तिल',
      section3b2: 'त्वचा के घाव से रक्तस्राव, खुजली या दर्द',
      section3b3: '50 वर्ष की आयु के बाद एक नया तिल दिखना',
      section3b4: 'कोई भी त्वचा परिवर्तन जो आपको चिंतित करे',
      readBtn: 'चिकित्सा अस्वीकरण',
      backToAnalysis: '← वापस',
      lastUpdated: 'अंतिम अपडेट',
      ctaTitle: 'त्वचा संबंधी चिंता है?',
      ctaBtn: 'त्वचा विशेषज्ञ खोजें',
    },`,

  zh: `    disclaimer: {
      title: '医疗免责声明',
      subtitle: '使用SkinGuard AI前请仔细阅读',
      badge: '⚠️ 重要医疗信息',
      warning: 'SkinGuard AI不是医疗诊断工具，不应作为专业医疗建议、诊断或治疗的替代品。',
      intro: 'SkinGuard AI仅作为个人皮肤健康监测和跟踪工具。本应用程序提供的AI分析：',
      bullet1: '基于皮肤病学数据训练的机器学习模型',
      bullet2: '不应依赖于医疗诊断或治疗决定',
      bullet3: '不能替代专业皮肤病学评估',
      bullet4: '可能含有不准确或错误',
      bullet5: '仅用于帮助您跟踪变化并提醒您咨询医疗专业人员',
      alwaysConsult: '对于任何皮肤问题、可疑变化或医疗建议，请始终咨询合格的皮肤科医生或医疗专业人员。如果您怀疑皮肤癌或任何严重皮肤病，请立即寻求专业医疗帮助。',
      section2Title: '责任限制',
      section2Intro: '在法律允许的最大范围内，Visa Line Inc.和SkinGuard AI不对以下情况负责：',
      section2b1: '任何间接、偶然、特殊或后果性损失',
      section2b2: '使用本应用程序引起的医疗并发症或健康问题',
      section2b3: 'AI分析和建议中的不准确性',
      section2b4: '基于应用程序分析所做的任何决定',
      section2footer: '使用SkinGuard AI的风险由您自行承担。您对基于应用程序分析所做的任何决定承担全部责任。',
      section3Title: '何时寻求立即就医',
      section3Intro: '不要单独依赖SkinGuard AI。如果您注意到以下情况，请立即就医：',
      section3b1: '快速生长或变化的痣',
      section3b2: '皮肤病变出血、瘙痒或疼痛',
      section3b3: '50岁后出现新痣',
      section3b4: '任何让您担忧的皮肤变化',
      readBtn: '医疗免责声明',
      backToAnalysis: '← 返回',
      lastUpdated: '最后更新',
      ctaTitle: '有皮肤问题？',
      ctaBtn: '查找皮肤科医生',
    },`,

  vi: `    disclaimer: {
      title: 'Tuyên bố miễn trách nhiệm y tế',
      subtitle: 'Vui lòng đọc kỹ trước khi sử dụng SkinGuard AI',
      badge: '⚠️ Thông tin y tế quan trọng',
      warning: 'SkinGuard AI KHÔNG phải là công cụ chẩn đoán y tế và KHÔNG nên được sử dụng thay thế cho lời khuyên, chẩn đoán hoặc điều trị y tế chuyên nghiệp.',
      intro: 'SkinGuard AI được thiết kế chỉ như một công cụ theo dõi và giám sát sức khỏe da cá nhân. Phân tích AI do ứng dụng này cung cấp:',
      bullet1: 'Dựa trên các mô hình học máy được đào tạo trên dữ liệu da liễu',
      bullet2: 'KHÔNG nên dựa vào để chẩn đoán y tế hoặc quyết định điều trị',
      bullet3: 'KHÔNG thay thế đánh giá da liễu chuyên nghiệp',
      bullet4: 'Có thể chứa sai sót hoặc lỗi',
      bullet5: 'Chỉ nhằm giúp bạn theo dõi các thay đổi và nhắc nhở bạn tham khảo ý kiến chuyên gia y tế',
      alwaysConsult: 'Luôn tham khảo ý kiến bác sĩ da liễu hoặc chuyên gia y tế có chuyên môn về bất kỳ lo ngại về da, thay đổi đáng ngờ hoặc tư vấn y tế. Nếu bạn nghi ngờ ung thư da hoặc bất kỳ tình trạng da nghiêm trọng nào, hãy tìm kiếm sự chú ý y tế chuyên nghiệp ngay lập tức.',
      section2Title: 'Giới hạn trách nhiệm',
      section2Intro: 'Trong phạm vi tối đa được pháp luật cho phép, Visa Line Inc. và SkinGuard AI sẽ không chịu trách nhiệm về:',
      section2b1: 'Bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào',
      section2b2: 'Biến chứng y tế hoặc vấn đề sức khỏe phát sinh từ việc sử dụng ứng dụng',
      section2b3: 'Sự không chính xác trong phân tích AI và khuyến nghị',
      section2b4: 'Bất kỳ quyết định nào được đưa ra dựa trên phân tích của ứng dụng',
      section2footer: 'Việc sử dụng SkinGuard AI là theo rủi ro của riêng bạn. Bạn chịu toàn bộ trách nhiệm cho bất kỳ quyết định nào được đưa ra dựa trên phân tích của ứng dụng.',
      section3Title: 'Khi nào cần tìm kiếm sự chú ý y tế ngay lập tức',
      section3Intro: 'Đừng chỉ dựa vào SkinGuard AI. Hãy tham khảo ý kiến bác sĩ ngay nếu bạn nhận thấy:',
      section3b1: 'Một nốt ruồi đang phát triển hoặc thay đổi nhanh chóng',
      section3b2: 'Chảy máu, ngứa hoặc đau từ tổn thương da',
      section3b3: 'Một nốt ruồi mới xuất hiện sau 50 tuổi',
      section3b4: 'Bất kỳ thay đổi da nào khiến bạn lo lắng',
      readBtn: 'Tuyên bố miễn trách nhiệm y tế',
      backToAnalysis: '← Quay lại',
      lastUpdated: 'Cập nhật lần cuối',
      ctaTitle: 'Có vấn đề về da?',
      ctaBtn: 'Tìm bác sĩ da liễu',
    },`,

  de: `    disclaimer: {
      title: 'Medizinischer Haftungsausschluss',
      subtitle: 'Bitte lesen Sie dies sorgfältig durch, bevor Sie SkinGuard AI nutzen',
      badge: '⚠️ Wichtige medizinische Informationen',
      warning: 'SkinGuard AI ist KEIN medizinisches Diagnosewerkzeug und sollte NICHT als Ersatz für professionellen medizinischen Rat, Diagnose oder Behandlung verwendet werden.',
      intro: 'SkinGuard AI ist ausschließlich als persönliches Hautgesundheits-Überwachungs- und Tracking-Tool konzipiert. Die von dieser Anwendung bereitgestellte KI-Analyse:',
      bullet1: 'Basiert auf maschinellen Lernmodellen, die auf dermatologischen Daten trainiert wurden',
      bullet2: 'Sollte NICHT für medizinische Diagnosen oder Behandlungsentscheidungen herangezogen werden',
      bullet3: 'Ist KEIN Ersatz für eine professionelle dermatologische Bewertung',
      bullet4: 'Kann Ungenauigkeiten oder Fehler enthalten',
      bullet5: 'Soll Ihnen nur helfen, Veränderungen zu verfolgen und Sie daran erinnern, einen Arzt aufzusuchen',
      alwaysConsult: 'Konsultieren Sie bei Hautproblemen, verdächtigen Veränderungen oder medizinischen Fragen stets einen qualifizierten Dermatologen oder Arzt. Wenn Sie Hautkrebs oder eine andere ernsthafte Hauterkrankung vermuten, suchen Sie sofort professionelle medizinische Hilfe.',
      section2Title: 'Haftungsbeschränkung',
      section2Intro: 'Im größtmöglichen gesetzlich zulässigen Umfang haften Visa Line Inc. und SkinGuard AI nicht für:',
      section2b1: 'Indirekte, zufällige, besondere oder Folgeschäden',
      section2b2: 'Medizinische Komplikationen oder Gesundheitsprobleme durch die Nutzung der Anwendung',
      section2b3: 'Ungenauigkeiten in der KI-Analyse und den Empfehlungen',
      section2b4: 'Entscheidungen, die auf der Grundlage der Anwendungsanalyse getroffen werden',
      section2footer: 'Die Nutzung von SkinGuard AI erfolgt auf eigenes Risiko. Sie übernehmen die volle Verantwortung für alle Entscheidungen, die auf der Grundlage der Anwendungsanalyse getroffen werden.',
      section3Title: 'Wann Sie sofort einen Arzt aufsuchen sollten',
      section3Intro: 'Verlassen Sie sich nicht allein auf SkinGuard AI. Konsultieren Sie sofort einen Arzt, wenn Sie Folgendes bemerken:',
      section3b1: 'Ein Muttermal, das sich schnell vergrößert oder verändert',
      section3b2: 'Blutungen, Juckreiz oder Schmerzen an einer Hautstelle',
      section3b3: 'Ein neues Muttermal, das nach dem 50. Lebensjahr auftritt',
      section3b4: 'Jede Hautveränderung, die Sie besorgt',
      readBtn: 'Medizinischer Haftungsausschluss',
      backToAnalysis: '← Zurück',
      lastUpdated: 'Zuletzt aktualisiert',
      ctaTitle: 'Haben Sie Hautprobleme?',
      ctaBtn: 'Dermatologen finden',
    },`,

  es: `    disclaimer: {
      title: 'Aviso médico legal',
      subtitle: 'Por favor, lea esto detenidamente antes de usar SkinGuard AI',
      badge: '⚠️ Información médica importante',
      warning: 'SkinGuard AI NO es una herramienta de diagnóstico médico y NO debe utilizarse como sustituto del consejo médico profesional, diagnóstico o tratamiento.',
      intro: 'SkinGuard AI está diseñado únicamente como una herramienta personal de seguimiento y monitoreo de la salud de la piel. El análisis de IA proporcionado por esta aplicación:',
      bullet1: 'Está basado en modelos de aprendizaje automático entrenados con datos dermatológicos',
      bullet2: 'NO debe utilizarse para tomar decisiones de diagnóstico médico o tratamiento',
      bullet3: 'NO reemplaza la evaluación dermatológica profesional',
      bullet4: 'Puede contener inexactitudes o errores',
      bullet5: 'Solo pretende ayudarle a rastrear cambios y recordarle consultar a un profesional de salud',
      alwaysConsult: 'Consulte siempre a un dermatólogo o profesional de salud calificado ante cualquier preocupación cutánea, cambio sospechoso o consejo médico. Si sospecha cáncer de piel o cualquier condición cutánea grave, busque atención médica profesional de inmediato.',
      section2Title: 'Limitación de responsabilidad',
      section2Intro: 'En la máxima medida permitida por la ley, Visa Line Inc. y SkinGuard AI no serán responsables de:',
      section2b1: 'Cualquier daño indirecto, incidental, especial o consecuente',
      section2b2: 'Complicaciones médicas o problemas de salud derivados del uso de la aplicación',
      section2b3: 'Inexactitudes en el análisis y las recomendaciones de IA',
      section2b4: 'Cualquier decisión tomada basándose en el análisis de la aplicación',
      section2footer: 'El uso de SkinGuard AI es bajo su propio riesgo. Usted asume toda la responsabilidad por las decisiones tomadas basándose en el análisis de la aplicación.',
      section3Title: 'Cuándo buscar atención médica inmediata',
      section3Intro: 'No dependa únicamente de SkinGuard AI. Consulte a un médico de inmediato si nota:',
      section3b1: 'Un lunar que crece o cambia rápidamente',
      section3b2: 'Sangrado, picazón o dolor en una lesión cutánea',
      section3b3: 'Un nuevo lunar que aparece después de los 50 años',
      section3b4: 'Cualquier cambio en la piel que le preocupe',
      readBtn: 'Aviso médico legal',
      backToAnalysis: '← Volver',
      lastUpdated: 'Última actualización',
      ctaTitle: '¿Tiene problemas de piel?',
      ctaBtn: 'Encontrar un dermatólogo',
    },`,

  pt: `    disclaimer: {
      title: 'Aviso médico legal',
      subtitle: 'Por favor, leia cuidadosamente antes de usar o SkinGuard AI',
      badge: '⚠️ Informação médica importante',
      warning: 'SkinGuard AI NÃO é uma ferramenta de diagnóstico médico e NÃO deve ser usada como substituta de aconselhamento médico profissional, diagnóstico ou tratamento.',
      intro: 'SkinGuard AI foi concebido apenas como uma ferramenta pessoal de monitoramento e acompanhamento da saúde da pele. A análise de IA fornecida por esta aplicação:',
      bullet1: 'É baseada em modelos de aprendizado de máquina treinados com dados dermatológicos',
      bullet2: 'NÃO deve ser usada para decisões de diagnóstico médico ou tratamento',
      bullet3: 'NÃO substitui a avaliação dermatológica profissional',
      bullet4: 'Pode conter imprecisões ou erros',
      bullet5: 'Destina-se apenas a ajudá-lo a acompanhar mudanças e lembrá-lo de consultar um profissional de saúde',
      alwaysConsult: 'Consulte sempre um dermatologista ou profissional de saúde qualificado para qualquer preocupação com a pele, mudanças suspeitas ou aconselhamento médico. Se suspeitar de câncer de pele ou qualquer condição cutânea grave, procure atenção médica profissional imediatamente.',
      section2Title: 'Limitação de responsabilidade',
      section2Intro: 'Na máxima extensão permitida por lei, Visa Line Inc. e SkinGuard AI não serão responsáveis por:',
      section2b1: 'Quaisquer danos indiretos, acidentais, especiais ou consequentes',
      section2b2: 'Complicações médicas ou problemas de saúde decorrentes do uso da aplicação',
      section2b3: 'Imprecisões na análise e nas recomendações de IA',
      section2b4: 'Quaisquer decisões tomadas com base na análise da aplicação',
      section2footer: 'O uso do SkinGuard AI é por sua conta e risco. Você assume total responsabilidade por quaisquer decisões tomadas com base na análise da aplicação.',
      section3Title: 'Quando procurar atenção médica imediata',
      section3Intro: 'Não dependa apenas do SkinGuard AI. Consulte um médico imediatamente se notar:',
      section3b1: 'Uma pinta que está crescendo ou mudando rapidamente',
      section3b2: 'Sangramento, coceira ou dor em uma lesão cutânea',
      section3b3: 'Uma pinta nova surgindo após os 50 anos',
      section3b4: 'Qualquer mudança na pele que o preocupe',
      readBtn: 'Aviso médico legal',
      backToAnalysis: '← Voltar',
      lastUpdated: 'Última atualização',
      ctaTitle: 'Tem problemas de pele?',
      ctaBtn: 'Encontrar um dermatologista',
    },`,

  ru: `    disclaimer: {
      title: 'Медицинский отказ от ответственности',
      subtitle: 'Пожалуйста, внимательно прочитайте перед использованием SkinGuard AI',
      badge: '⚠️ Важная медицинская информация',
      warning: 'SkinGuard AI НЕ является медицинским диагностическим инструментом и НЕ должен использоваться в качестве замены профессионального медицинского совета, диагноза или лечения.',
      intro: 'SkinGuard AI разработан исключительно как личный инструмент мониторинга и отслеживания здоровья кожи. ИИ-анализ, предоставляемый этим приложением:',
      bullet1: 'Основан на моделях машинного обучения, обученных на дерматологических данных',
      bullet2: 'НЕ следует использовать для принятия решений о медицинском диагнозе или лечении',
      bullet3: 'НЕ заменяет профессиональную дерматологическую оценку',
      bullet4: 'Может содержать неточности или ошибки',
      bullet5: 'Предназначен только для помощи в отслеживании изменений и напоминания об обращении к специалисту',
      alwaysConsult: 'Всегда консультируйтесь с квалифицированным дерматологом или медицинским специалистом по любым кожным проблемам, подозрительным изменениям или медицинским вопросам. Если вы подозреваете рак кожи или любое серьёзное кожное заболевание, немедленно обратитесь за профессиональной медицинской помощью.',
      section2Title: 'Ограничение ответственности',
      section2Intro: 'В максимальной степени, допустимой законодательством, Visa Line Inc. и SkinGuard AI не несут ответственности за:',
      section2b1: 'Любые косвенные, случайные, специальные или последующие убытки',
      section2b2: 'Медицинские осложнения или проблемы со здоровьем, возникшие в результате использования приложения',
      section2b3: 'Неточности в ИИ-анализе и рекомендациях',
      section2b4: 'Любые решения, принятые на основе анализа приложения',
      section2footer: 'Вы используете SkinGuard AI на свой страх и риск. Вы несёте полную ответственность за любые решения, принятые на основе анализа приложения.',
      section3Title: 'Когда следует немедленно обратиться к врачу',
      section3Intro: 'Не полагайтесь исключительно на SkinGuard AI. Немедленно обратитесь к врачу, если заметите:',
      section3b1: 'Родинку, которая быстро растёт или изменяется',
      section3b2: 'Кровотечение, зуд или боль в области кожного поражения',
      section3b3: 'Новую родинку, появившуюся после 50 лет',
      section3b4: 'Любые изменения кожи, которые вас беспокоят',
      readBtn: 'Медицинский отказ от ответственности',
      backToAnalysis: '← Назад',
      lastUpdated: 'Последнее обновление',
      ctaTitle: 'Есть проблемы с кожей?',
      ctaBtn: 'Найти дерматолога',
    },`,

  th: `    disclaimer: {
      title: 'ข้อจำกัดความรับผิดชอบทางการแพทย์',
      subtitle: 'กรุณาอ่านอย่างละเอียดก่อนใช้ SkinGuard AI',
      badge: '⚠️ ข้อมูลทางการแพทย์ที่สำคัญ',
      warning: 'SkinGuard AI ไม่ใช่เครื่องมือวินิจฉัยทางการแพทย์ และไม่ควรใช้แทนคำแนะนำ การวินิจฉัย หรือการรักษาจากผู้เชี่ยวชาญทางการแพทย์',
      intro: 'SkinGuard AI ออกแบบมาเป็นเครื่องมือติดตามสุขภาพผิวส่วนตัวเท่านั้น การวิเคราะห์โดย AI ที่ให้บริการโดยแอปพลิเคชันนี้:',
      bullet1: 'อ้างอิงจากโมเดลการเรียนรู้ของเครื่องที่ฝึกด้วยข้อมูลทางผิวหนัง',
      bullet2: 'ไม่ควรใช้เป็นฐานในการวินิจฉัยทางการแพทย์หรือการตัดสินใจรักษา',
      bullet3: 'ไม่สามารถทดแทนการประเมินจากผู้เชี่ยวชาญด้านผิวหนัง',
      bullet4: 'อาจมีความไม่แม่นยำหรือข้อผิดพลาด',
      bullet5: 'มีวัตถุประสงค์เพื่อช่วยติดตามการเปลี่ยนแปลงและเตือนให้คุณพบผู้เชี่ยวชาญด้านสุขภาพเท่านั้น',
      alwaysConsult: 'ควรปรึกษาแพทย์ผิวหนังหรือผู้เชี่ยวชาญทางการแพทย์ที่มีคุณสมบัติเหมาะสมเสมอสำหรับความกังวลเกี่ยวกับผิวหนัง การเปลี่ยนแปลงที่น่าสงสัย หรือคำแนะนำทางการแพทย์ หากคุณสงสัยว่าเป็นมะเร็งผิวหนังหรือโรคผิวหนังรุนแรง ให้รีบพบแพทย์ทันที',
      section2Title: 'การจำกัดความรับผิดชอบ',
      section2Intro: 'ในขอบเขตสูงสุดที่กฎหมายอนุญาต Visa Line Inc. และ SkinGuard AI จะไม่รับผิดชอบต่อ:',
      section2b1: 'ความเสียหายทางอ้อม โดยบังเอิญ พิเศษ หรือที่เป็นผลตามมา',
      section2b2: 'ภาวะแทรกซ้อนทางการแพทย์หรือปัญหาสุขภาพที่เกิดจากการใช้แอปพลิเคชัน',
      section2b3: 'ความไม่ถูกต้องในการวิเคราะห์ AI และคำแนะนำ',
      section2b4: 'การตัดสินใจใดๆ ที่เกิดจากการวิเคราะห์ของแอปพลิเคชัน',
      section2footer: 'การใช้ SkinGuard AI เป็นความเสี่ยงของคุณเอง คุณรับผิดชอบอย่างเต็มที่สำหรับการตัดสินใจใดๆ ที่เกิดจากการวิเคราะห์ของแอปพลิเคชัน',
      section3Title: 'เมื่อใดควรพบแพทย์ทันที',
      section3Intro: 'อย่าพึ่งพา SkinGuard AI เพียงอย่างเดียว ปรึกษาแพทย์ทันทีหากคุณสังเกตเห็น:',
      section3b1: 'ไฝที่เติบโตหรือเปลี่ยนแปลงอย่างรวดเร็ว',
      section3b2: 'เลือดออก คัน หรือเจ็บปวดจากผิวหนัง',
      section3b3: 'ไฝใหม่ที่ปรากฏขึ้นหลังอายุ 50 ปี',
      section3b4: 'การเปลี่ยนแปลงผิวหนังใดๆ ที่ทำให้คุณกังวล',
      readBtn: 'ข้อจำกัดความรับผิดชอบทางการแพทย์',
      backToAnalysis: '← กลับ',
      lastUpdated: 'อัปเดตล่าสุด',
      ctaTitle: 'มีปัญหาผิวหนังใช่ไหม?',
      ctaBtn: 'ค้นหาแพทย์ผิวหนัง',
    },`,

  ro: `    disclaimer: {
      title: 'Declinare a responsabilității medicale',
      subtitle: 'Vă rugăm să citiți cu atenție înainte de a utiliza SkinGuard AI',
      badge: '⚠️ Informații medicale importante',
      warning: 'SkinGuard AI NU este un instrument de diagnostic medical și NU trebuie utilizat ca substitut pentru sfatul medical profesionist, diagnostic sau tratament.',
      intro: 'SkinGuard AI este conceput exclusiv ca un instrument personal de monitorizare și urmărire a sănătății pielii. Analiza AI furnizată de această aplicație:',
      bullet1: 'Se bazează pe modele de învățare automată antrenate pe date dermatologice',
      bullet2: 'NU trebuie utilizat pentru decizii de diagnostic medical sau tratament',
      bullet3: 'NU înlocuiește evaluarea dermatologică profesionistă',
      bullet4: 'Poate conține inexactități sau erori',
      bullet5: 'Este destinat doar să vă ajute să urmăriți modificările și să vă amintească să consultați un specialist medical',
      alwaysConsult: 'Consultați întotdeauna un dermatolog sau specialist medical calificat pentru orice problemă de piele, modificare suspectă sau sfat medical. Dacă suspectați cancer de piele sau orice afecțiune cutanată gravă, solicitați imediat asistență medicală profesionistă.',
      section2Title: 'Limitarea răspunderii',
      section2Intro: 'În măsura maximă permisă de lege, Visa Line Inc. și SkinGuard AI nu vor fi răspunzători pentru:',
      section2b1: 'Orice daune indirecte, incidentale, speciale sau consecvente',
      section2b2: 'Complicații medicale sau probleme de sănătate apărute din utilizarea aplicației',
      section2b3: 'Inexactități în analiza AI și recomandări',
      section2b4: 'Orice decizii luate pe baza analizei aplicației',
      section2footer: 'Utilizarea SkinGuard AI este pe propriul dumneavoastră risc. Vă asumați întreaga responsabilitate pentru orice decizii luate pe baza analizei aplicației.',
      section3Title: 'Când să solicitați asistență medicală imediată',
      section3Intro: 'Nu vă bazați exclusiv pe SkinGuard AI. Consultați imediat un medic dacă observați:',
      section3b1: 'O aluniță care crește sau se schimbă rapid',
      section3b2: 'Sângerare, mâncărime sau durere dintr-o leziune cutanată',
      section3b3: 'O aluniță nouă apărută după vârsta de 50 de ani',
      section3b4: 'Orice modificare a pielii care vă îngrijorează',
      readBtn: 'Declinare a responsabilității medicale',
      backToAnalysis: '← Înapoi',
      lastUpdated: 'Ultima actualizare',
      ctaTitle: 'Aveți probleme cu pielea?',
      ctaBtn: 'Găsiți un dermatolog',
    },`,
};

// For HI, ZH, DE, ES, PT, RU: insert before footer: {
const beforeFooter = [
  { lang: 'hi', anchor: "      high: 'अरे! यह संदिग्ध लगता है। जल्दी डॉक्टर के पास जाएं!',\n    },\n    footer: {" },
  { lang: 'zh', anchor: "      high: '哎呀！这看起来可疑。快去看医生！',\n    },\n    footer: {" },
  { lang: 'de', anchor: "      high: 'Ups! Das sieht verdächtig aus. Schnell zum Arzt!',\n    },\n    footer: {" },
  { lang: 'es', anchor: "      high: '¡Vaya! Eso parece sospechoso. ¡Ve al médico pronto!',\n    },\n    footer: {" },
  { lang: 'pt', anchor: "      high: 'Ei! Isso parece suspeito. Vá ao médico logo!',\n    },\n    footer: {" },
  { lang: 'ru', anchor: "      high: 'Ого! Это подозрительно. Срочно к врачу!',\n    },\n    footer: {" },
];

for (const { lang, anchor } of beforeFooter) {
  if (code.includes(anchor)) {
    const replacement = `      high: '${anchor.split("'")[1]}',\n    },\n${disclaimers[lang]}\n    footer: {`;
    code = code.replace(anchor, `      high: '${anchor.split("'")[1]}',\n    },\n${disclaimers[lang]}\n    footer: {`);
    console.log(`✅ ${lang.toUpperCase()}: disclaimer added`);
  } else {
    console.log(`⚠️  ${lang.toUpperCase()}: anchor NOT found`);
  }
}

// For VI: insert before the section close (before "  },\n  de: {")
const viAnchor = "      from: 'vì sức khỏe da tốt hơn.',\n    },\n  },\n  de: {";
if (code.includes(viAnchor)) {
  code = code.replace(viAnchor, `      from: 'vì sức khỏe da tốt hơn.',\n    },\n${disclaimers.vi}\n  },\n  de: {`);
  console.log('✅ VI: disclaimer added');
} else {
  console.log('⚠️  VI: anchor NOT found');
}

// For TH: insert after the monitor object, before the TH section closing
// The TH section ends with monitor: {...}    \n},\n   ro: {
// We look for the unique Thai monitor end content + closing
const thAnchor = "yogaBalanceStep5: 'หายใจลึกๆ ตลอดเวลา ผ่อนคลายและทำซ้ำ' }    \n},\n   ro: {";
if (code.includes(thAnchor)) {
  code = code.replace(thAnchor, `yogaBalanceStep5: 'หายใจลึกๆ ตลอดเวลา ผ่อนคลายและทำซ้ำ' },\n${disclaimers.th}\n  },\n   ro: {`);
  console.log('✅ TH: disclaimer added');
} else {
  // Try alternate: without trailing spaces
  const thAnchorAlt = "yogaBalanceStep5: 'หายใจลึกๆ ตลอดเวลา ผ่อนคลายและทำซ้ำ' }\n},\n   ro: {";
  if (code.includes(thAnchorAlt)) {
    code = code.replace(thAnchorAlt, `yogaBalanceStep5: 'หายใจลึกๆ ตลอดเวลา ผ่อนคลายและทำซ้ำ' },\n${disclaimers.th}\n  },\n   ro: {`);
    console.log('✅ TH (alt): disclaimer added');
  } else {
    console.log('⚠️  TH: anchor NOT found (tried both variants)');
    // Find the position and report context
    const idx = code.indexOf('yogaBalanceStep5');
    if (idx !== -1) {
      console.log('  Context around yogaBalanceStep5:', JSON.stringify(code.substring(idx, idx + 80)));
    }
  }
}

// For RO: insert before the final closing of the translations object
// The file ends with: }   \n};\n
const roAnchor = "AI_DISCLAIMER: \"Acest screening AI are doar scop informativ și nu constituie un diagnostic medical. Consultă întotdeauna un dermatolog calificat pentru evaluare profesională.\" \n    },\n    aiMessages: {";
if (code.includes(roAnchor)) {
  // This means the Thai aiMessages are inside RO - insert disclaimer before those Thai aiMessages
  code = code.replace(roAnchor, `AI_DISCLAIMER: "Acest screening AI are doar scop informativ și nu constituie un diagnostic medical. Consultă întotdeauna un dermatolog calificat pentru evaluare profesională." \n    },\n${disclaimers.ro}\n    aiMessages: {`);
  console.log('✅ RO: disclaimer added (before Thai aiMessages)');
} else {
  // Try to insert at end of file before the closing }
  const endAnchor = "\n  }   \n};";
  if (code.endsWith('\n  }   \n};\n\n\n') || code.includes('\n  }   \n};')) {
    code = code.replace('\n  }   \n};', `\n${disclaimers.ro}\n  }   \n};`);
    console.log('✅ RO: disclaimer added (at end)');
  } else {
    console.log('⚠️  RO: anchor NOT found');
  }
}

fs.writeFileSync(FILE, code, 'utf8');
console.log('\n✅ Done! All disclaimer translations processed.');
