require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const client = new Anthropic();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ==================== TIL SOZLAMALARI ====================

const LANGUAGES = {
  uz: { name: "O'zbekcha (Lotin)", flag: '🇺🇿' },
  uz_cyrl: { name: 'Ўзбекча (Кирилл)', flag: '🇺🇿' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  en: { name: 'English', flag: '🇬🇧' },
  kk: { name: 'Қазақша', flag: '🇰🇿' },
  ky: { name: 'Кыргызча', flag: '🇰🇬' },
  tg: { name: 'Тоҷикӣ', flag: '🇹🇯' }
};

const TRANSLATIONS = {
  uz: {
    welcome: (name) => `Salom ${name}! 👋\n\nMen MedAI — professional tibbiy AI yordamchiman.\n\n🏥 Xizmatlarimiz:\n\n💊 /dori — Dori maslahatchisi\n👨‍⚕️ /shifokor — Shifokor maslahatchisi\n🩺 /surunkali — Surunkali kasalliklar nazorati\n🔬 /diagnostika — Tasviriy diagnostika (Rentgen, MRT, Analiz)\n\n⚠️ Eslatma: Mening javoblarim shifokor maslahatini almashtirmaydi!\n\n�� Bepul tarif: kuniga 5 ta savol\n💎 Premium: cheksiz savol — 40,000 so'm/oy\n\n🌐 Tilni o'zgartirish: /til`,
    choose_lang: 'Tilni tanlang / Choose language:',
    lang_set: "Til o'zgartirildi: O'zbekcha (Lotin) 🇺🇿",
    premium_info: `💎 Premium tarif:\n\n✅ Cheksiz savollar\n✅ Tezkor javob\n✅ Barcha bo'limlar\n✅ Tarixni saqlash\n\n💳 Narx: 40,000 so'm/oy\n\nTo'lov usulini tanlang:`,
    status_text: (isPremium, count) => {
      const status = isPremium ? '💎 Premium' : '🆓 Bepul';
      const c = isPremium ? 'Cheksiz' : `${count}/5`;
      return `👤 Sizning holatingiz:\n\nTarif: ${status}\nBugungi savollar: ${c}`;
    },
    user_not_found: '❌ Foydalanuvchi topilmadi! /start bosing.',
    limit_reached: `❌ Kunlik bepul limitingiz tugadi (5/5).\n\n💎 Premium olish uchun /premium buyrug'ini bosing!`,
    loading: '⏳ Javob tayyorlanmoqda...',
    error: '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.',
    payment_success: `✅ To'lov muvaffaqiyatli!\n\n💎 Siz endi Premium foydalanuvchisiz!\nMuddati: 1 oy\n\nCheksiz savollar bilan foydalaning! 🎉`,
    menu_dori: '💊 Dori maslahatchisi',
    menu_shifokor: '👨‍⚕️ Shifokor maslahatchisi',
    menu_surunkali: '🩺 Surunkali kasalliklar nazorati',
    menu_diagnostika: '🔬 Tasviriy diagnostika',
    section_dori: `💊 *Dori maslahatchisi*\n\nQuyidagilarni so'rashingiz mumkin:\n\n• Dori haqida ma'lumot\n• Yon ta'sirlar\n• Dozalash\n• Dorilar o'zaro ta'siri\n• Analoglar\n• Qo'llash ko'rsatmalari va qarshi ko'rsatmalar\n\nSavolingizni yozing:`,
    section_shifokor: `👨‍⚕️ *Shifokor maslahatchisi*\n\nQuyidagilarni so'rashingiz mumkin:\n\n• Simptomlarni tahlil qilish\n• Kasallik haqida ma'lumot\n• Davolash usullari\n• Profilaktika\n• Qachon shifokorga murojaat qilish kerak\n• Shoshilinch holatlar\n\n⚕️ Yevropа va Amerika guidelinelari asosida\n\nSimptomlaringizni batafsil yozing:`,
    section_surunkali: `🩺 *Surunkali kasalliklar nazorati*\n\nQuyidagi kasalliklarni nazorat qilishda yordam beraman:\n\n• Diabet (1-tur, 2-tur)\n• Gipertoniya (yuqori qon bosimi)\n• Astma va XOAB\n• Yurak yetishmovchiligi\n• Buyrak kasalliklari\n• Epilepsiya\n• Revmatoid artrit\n• Va boshqalar\n\nKasalligingiz nomini yoki holatni yozing:`,
    section_diagnostika: `🔬 *Tasviriy diagnostika*\n\nQuyidagi turdagi natijalarni tahlil qila olaman:\n\n📋 *Laboratoriya analizlari:*\n• Qon umumiy tahlili (CBC)\n• Bioximik qon tahlili\n• Siydik tahlili\n• Gormon tahlillari (tireoid, jinsiy, boshqa)\n• Koagulogramma\n• Lipid profili\n• Jigar funktsiyasi (ALT, AST, bilirubin)\n• Buyrak funktsiyasi (kreatinin, urea)\n• Glikozilangan gemoglobin (HbA1c)\n• Tumor markerlari\n\n🏥 *Tasviriy tekshiruvlar:*\n• Rentgen tasviri tavsifi\n• MRT tasviri tavsifi\n• KT tasviri tavsifi\n• UZI tasviri tavsifi\n\nAnaliz natijalaringizni yoki tasvir tavsifini yuboring:`,
    back_menu: '🔙 Bosh menyu',
    disclaimer: '\n\n⚠️ *Bu ma\'lumot shifokor maslahatini almashtirmaydi! Aniq tashxis va davolash uchun mutaxassis shifokorga murojaat qiling.*'
  },

  uz_cyrl: {
    welcome: (name) => `Салом ${name}! 👋\n\nМен MedAI — профессионал тиббий AI ёрдамчиман.\n\n🏥 Хизматларимиз:\n\n💊 /dori — Дори маслаҳатчиси\n👨‍⚕️ /shifokor — Шифокор маслаҳатчиси\n🩺 /surunkali — Сурункали касалликлар назорати\n🔬 /diagnostika — Тасвирий диагностика\n\n⚠️ Эслатма: Менинг жавобларим шифокор маслаҳатини алмаштирмайди!\n\n🆓 Бепул тариф: кунига 5 та савол\n💎 Премиум: чексиз савол — 40,000 сўм/ой\n\n🌐 Тилни ўзгартириш: /til`,
    choose_lang: 'Тилни танланг / Choose language:',
    lang_set: 'Тил ўзгартирилди: Ўзбекча (Кирилл) 🇺🇿',
    premium_info: `💎 Премиум тариф:\n\n✅ Чексиз саволлар\n✅ Тезкор жавоб\n✅ Барча бўлимлар\n✅ Тарихни сақлаш\n\n💳 Нарх: 40,000 сўм/ой\n\nТўлов усулини танланг:`,
    status_text: (isPremium, count) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Бепул';
      const c = isPremium ? 'Чексиз' : `${count}/5`;
      return `👤 Сизнинг ҳолатингиз:\n\nТариф: ${status}\nБугунги саволлар: ${c}`;
    },
    user_not_found: '❌ Фойдаланувчи топилмади! /start босинг.',
    limit_reached: `❌ Кунлик бепул лимитингиз тугади (5/5).\n\n💎 Премиум олиш учун /premium буйруғини босинг!`,
    loading: '⏳ Жавоб тайёрланмоқда...',
    error: '❌ Хатолик юз берди. Қайтадан уриниб кўринг.',
    payment_success: `✅ Тўлов муваффақиятли!\n\n💎 Сиз энди Премиум фойдаланувчисиз!\nМуддати: 1 ой\n\nЧексиз саволлар билан фойдаланинг! 🎉`,
    menu_dori: '💊 Дори маслаҳатчиси',
    menu_shifokor: '👨‍⚕️ Шифокор маслаҳатчиси',
    menu_surunkali: '🩺 Сурункали касалликлар назорати',
    menu_diagnostika: '🔬 Тасвирий диагностика',
    section_dori: `💊 *Дори маслаҳатчиси*\n\nҚуйидагиларни сўрашингиз мумкин:\n\n• Дори ҳақида маълумот\n• Ён таъсирлар\n• Дозалаш\n• Дорилар ўзаро таъсири\n• Аналоглар\n\nСаволингизни ёзинг:`,
    section_shifokor: `👨‍⚕️ *Шифокор маслаҳатчиси*\n\nҚуйидагиларни сўрашингиз мумкин:\n\n• Симптомларни таҳлил қилиш\n• Касаллик ҳақида маълумот\n• Даволаш усуллари\n• Профилактика\n• Қачон шифокорга мурожаат қилиш керак\n\n⚕️ Европа ва Америка гайдлайнлари асосида\n\nСимптомларингизни батафсил ёзинг:`,
    section_surunkali: `🩺 *Сурункали касалликлар назорати*\n\nҚуйидаги касалликларни назорат қилишда ёрдам бераман:\n\n• Диабет\n• Гипертония\n• Астма ва ХОАБ\n• Юрак етишмовчилиги\n• Буйрак касалликлари\n• Ва бошқалар\n\nКасаллигингиз номини ёзинг:`,
    section_diagnostika: `🔬 *Тасвирий диагностика*\n\nҚуйидаги турдаги натижаларни таҳлил қила оламан:\n\n📋 *Лаборатория анализлари:*\n• Қон умумий таҳлили\n• Биокимёвий қон таҳлили\n• Сийдик таҳлили\n• Гормон таҳлиллари\n• Коагулограмма\n\n🏥 *Тасвирий текширувлар:*\n• Рентген\n• МРТ\n• КТ\n• УЗИ\n\nАнализ натижаларингизни юборинг:`,
    back_menu: '🔙 Бош меню',
    disclaimer: '\n\n⚠️ *Бу маълумот шифокор маслаҳатини алмаштирмайди! Аниқ ташхис ва даволаш учун мутахассис шифокорга мурожаат қилинг.*'
  },

  ru: {
    welcome: (name) => `Здравствуйте ${name}! 👋\n\nЯ MedAI — профессиональный медицинский AI-помощник.\n\n🏥 Наши услуги:\n\n💊 /dori — Консультант по лекарствам\n👨‍⚕️ /shifokor — Консультант врача\n🩺 /surunkali — Контроль хронических заболеваний\n🔬 /diagnostika — Диагностика (Рентген, МРТ, Анализы)\n\n⚠️ Предупреждение: Мои ответы не заменяют консультацию врача!\n\n🆓 Бесплатный тариф: 5 вопросов в день\n💎 Премиум: безлимитные вопросы — 40,000 сум/мес\n\n🌐 Сменить язык: /til`,
    choose_lang: 'Выберите язык / Tilni tanlang:',
    lang_set: 'Язык изменён: Русский 🇷🇺',
    premium_info: `💎 Премиум тариф:\n\n✅ Безлимитные вопросы\n✅ Быстрые ответы\n✅ Все разделы\n✅ Сохранение истории\n\n💳 Цена: 40,000 сум/мес\n\nВыберите способ оплаты:`,
    status_text: (isPremium, count) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Бесплатный';
      const c = isPremium ? 'Безлимит' : `${count}/5`;
      return `👤 Ваш статус:\n\nТариф: ${status}\nВопросы за сегодня: ${c}`;
    },
    user_not_found: '❌ Пользователь не найден! Нажмите /start.',
    limit_reached: `❌ Ваш бесплатный лимит исчерпан (5/5).\n\n💎 Для получения Премиума нажмите /premium!`,
    loading: '⏳ Готовлю ответ...',
    error: '❌ Произошла ошибка. Попробуйте ещё раз.',
    payment_success: `✅ Оплата прошла успешно!\n\n💎 Вы теперь Премиум пользователь!\nСрок: 1 месяц\n\nПользуйтесь безлимитными вопросами! 🎉`,
    menu_dori: '💊 Консультант по лекарствам',
    menu_shifokor: '👨‍⚕️ Консультант врача',
    menu_surunkali: '🩺 Хронические заболевания',
    menu_diagnostika: '🔬 Диагностика',
    section_dori: `💊 *Консультант по лекарствам*\n\nВы можете спросить:\n\n• Информацию о препарате\n• Побочные эффекты\n• Дозировку\n• Взаимодействие лекарств\n• Аналоги\n\nНапишите ваш вопрос:`,
    section_shifokor: `👨‍⚕️ *Консультант врача*\n\nВы можете спросить:\n\n• Анализ симптомов\n• Информацию о заболевании\n• Методы лечения\n• Профилактику\n• Когда обратиться к врачу\n\n⚕️ На основе европейских и американских гайдлайнов\n\nОпишите подробно ваши симптомы:`,
    section_surunkali: `🩺 *Контроль хронических заболеваний*\n\nПомогу с контролем:\n\n• Диабет\n• Гипертония\n• Астма и ХОБЛ\n• Сердечная недостаточность\n• Заболевания почек\n• И другие\n\nНапишите название заболевания:`,
    section_diagnostika: `🔬 *Диагностика*\n\nМогу проанализировать:\n\n📋 *Лабораторны�� анализы:*\n• ОАК (общий анализ крови)\n• Биохимический анализ крови\n• Анализ мочи\n• Гормональные анализы\n• Коагулограмма\n\n🏥 *Визуальные исследования:*\n• Рентген\n• МРТ\n• КТ\n• УЗИ\n\nОтправьте результаты анализов:`,
    back_menu: '🔙 Главное меню',
    disclaimer: '\n\n⚠️ *Эта информация не заменяет консультацию врача! Для точного диагноза и лечения обратитесь к специалисту.*'
  },

  en: {
    welcome: (name) => `Hello ${name}! 👋\n\nI'm MedAI — a professional medical AI assistant.\n\n🏥 Our Services:\n\n💊 /dori — Drug Consultant\n👨‍⚕️ /shifokor — Doctor Consultant\n🩺 /surunkali — Chronic Disease Management\n🔬 /diagnostika — Diagnostic Imaging & Lab Analysis\n\n⚠️ Disclaimer: My responses do not replace professional medical advice!\n\n🆓 Free plan: 5 questions per day\n💎 Premium: unlimited questions — 40,000 UZS/month\n\n🌐 Change language: /til`,
    choose_lang: 'Choose language:',
    lang_set: 'Language changed: English 🇬🇧',
    premium_info: `💎 Premium Plan:\n\n✅ Unlimited questions\n✅ Fast responses\n✅ All sections\n✅ History saving\n\n💳 Price: 40,000 UZS/month\n\nSelect payment method:`,
    status_text: (isPremium, count) => {
      const status = isPremium ? '💎 Premium' : '🆓 Free';
      const c = isPremium ? 'Unlimited' : `${count}/5`;
      return `👤 Your status:\n\nPlan: ${status}\nToday's questions: ${c}`;
    },
    user_not_found: '❌ User not found! Press /start.',
    limit_reached: `❌ Your daily free limit is reached (5/5).\n\n💎 Get Premium: /premium`,
    loading: '⏳ Preparing response...',
    error: '❌ An error occurred. Please try again.',
    payment_success: `✅ Payment successful!\n\n💎 You are now a Premium user!\nDuration: 1 month\n\nEnjoy unlimited questions! 🎉`,
    menu_dori: '💊 Drug Consultant',
    menu_shifokor: '👨‍⚕️ Doctor Consultant',
    menu_surunkali: '🩺 Chronic Disease Management',
    menu_diagnostika: '🔬 Diagnostics',
    section_dori: `💊 *Drug Consultant*\n\nYou can ask about:\n\n• Drug information\n• Side effects\n• Dosage\n• Drug interactions\n• Alternatives\n\nType your question:`,
    section_shifokor: `👨‍⚕️ *Doctor Consultant*\n\nYou can ask about:\n\n• Symptom analysis\n• Disease information\n• Treatment methods\n• Prevention\n• When to see a doctor\n\n⚕️ Based on European and American guidelines\n\nDescribe your symptoms in detail:`,
    section_surunkali: `🩺 *Chronic Disease Management*\n\nI can help manage:\n\n• Diabetes\n• Hypertension\n• Asthma and COPD\n• Heart failure\n• Kidney disease\n• And more\n\nType the disease name or condition:`,
    section_diagnostika: `🔬 *Diagnostics*\n\nI can analyze:\n\n📋 *Lab Tests:*\n• CBC (Complete Blood Count)\n• Biochemistry panel\n• Urinalysis\n• Hormone tests\n• Coagulation panel\n\n🏥 *Imaging:*\n• X-ray descriptions\n• MRI descriptions\n• CT descriptions\n• Ultrasound descriptions\n\nSend your test results:`,
    back_menu: '🔙 Main Menu',
    disclaimer: '\n\n⚠️ *This information does not replace professional medical advice! Consult a qualified physician for accurate diagnosis and treatment.*'
  },

  kk: {
    welcome: (name) => `Сәлем ${name}! 👋\n\nМен MedAI — кәсіби медициналық AI көмекшімін.\n\n🏥 Қызметтеріміз:\n\n💊 /dori — Дәрі кеңесшісі\n��‍⚕️ /shifokor — Дәрігер кеңесшісі\n🩺 /surunkali — Созылмалы аурулар бақылауы\n🔬 /diagnostika — Диагностика\n\n⚠️ Ескерту: Менің жауаптарым дәрігер кеңесін алмастырмайды!\n\n🆓 Тегін тариф: күніне 5 сұрақ\n💎 Премиум: шексіз сұрақ — 40,000 сум/ай\n\n🌐 Тілді өзгерту: /til`,
    choose_lang: 'Тілді таңдаңыз:',
    lang_set: 'Тіл өзгертілді: Қазақша 🇰🇿',
    premium_info: `💎 Премиум тариф:\n\n✅ Шексіз сұрақтар\n✅ Жылдам жауап\n✅ Барлық бөлімдер\n\n💳 Бағасы: 40,000 сум/ай\n\nТөл��м тәсілін таңдаңыз:`,
    status_text: (isPremium, count) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Тегін';
      const c = isPremium ? 'Шексіз' : `${count}/5`;
      return `👤 Сіздің мәртебеңіз:\n\nТариф: ${status}\nБүгінгі сұрақтар: ${c}`;
    },
    user_not_found: '❌ Қолданушы табылмады! /start басыңыз.',
    limit_reached: `❌ Күнделікті тегін лимитіңіз таусылды (5/5).\n\n💎 Премиум алу үшін /premium басыңыз!`,
    loading: '⏳ Жауап дайындалуда...',
    error: '❌ Қате орын алды. Қайта көріңіз.',
    payment_success: `✅ Төлем сәтті!\n\n💎 Сіз енді Премиум қолданушысыз!\nМерзімі: 1 ай 🎉`,
    menu_dori: '💊 Дәрі кеңесшісі',
    menu_shifokor: '👨‍⚕️ Дәрігер кеңесшісі',
    menu_surunkali: '🩺 Созылмалы аурулар',
    menu_diagnostika: '🔬 Диагностика',
    section_dori: `💊 *Дәрі кеңесшісі*\n\nСұрақтарыңызды жазыңыз:`,
    section_shifokor: `👨‍⚕️ *Дәрігер кеңесшісі*\n\n⚕️ Еуропа және Америка гайдлайндары негізінде\n\nСимптомдарыңызды жазыңыз:`,
    section_surunkali: `🩺 *Созылмалы аурулар бақылауы*\n\nАуру атын жазыңыз:`,
    section_diagnostika: `🔬 *Диагностика*\n\nАнализ нәтижелеріңізді жіберіңіз:`,
    back_menu: '🔙 Бас мәзір',
    disclaimer: '\n\n⚠️ *Бұл ақпарат дәрігер кеңесін алмастырмайды! Нақты диагноз үшін маманға хабарласыңыз.*'
  },

  ky: {
    welcome: (name) => `Салам ${name}! 👋\n\nМен MedAI — кесипкөй медициналык AI жардамчымын.\n\n🏥 Кызматтарыбыз:\n\n💊 /dori — Дары кеңешчиси\n👨‍⚕️ /shifokor — Доктур кеңешчиси\n🩺 /surunkali — Созулма оорулар көзөмөлү\n🔬 /diagnostika — Диагностика\n\n⚠️ Эскертүү: Менин жоопторум доктурдун кеңешин алмаштырбайт!\n\n🆓 Акысыз тариф: күнүнө 5 суроо\n💎 Премиум: чексиз суроо — 40,000 сум/ай\n\n🌐 Тилди өзгөртүү: /til`,
    choose_lang: 'Тилди тандаңыз:',
    lang_set: 'Тил өзгөртүлдү: Кыргызча 🇰🇬',
    premium_info: `💎 Премиум тариф:\n\n✅ Чексиз суроолор\n✅ Тез жооп\n✅ Бардык бөлүмдөр\n\n💳 Баасы: 40,000 сум/ай\n\nТөл��м ыкмасын тандаңыз:`,
    status_text: (isPremium, count) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Акысыз';
      const c = isPremium ? 'Чексиз' : `${count}/5`;
      return `👤 Сиздин абалыңыз:\n\nТариф: ${status}\nБүгүнкү суроолор: ${c}`;
    },
    user_not_found: '❌ Колдонуучу табылган жок! /start басыңыз.',
    limit_reached: `❌ Күнүмдүк акысыз лимитиңиз түгөндү (5/5).\n\n💎 Премиум алуу үчүн /premium басыңыз!`,
    loading: '⏳ Жооп даярдалууда...',
    error: '❌ Ката кетти. Кайра аракет кылыңыз.',
    payment_success: `✅ Төлөм ийгиликтүү!\n\n💎 Сиз эми Премиум колдонуучусуз!\nМөөнөтү: 1 ай 🎉`,
    menu_dori: '💊 Дары кеңешчиси',
    menu_shifokor: '👨‍⚕️ Доктур кеңешчиси',
    menu_surunkali: '🩺 Созулма оорулар',
    menu_diagnostika: '🔬 Диагностика',
    section_dori: `💊 *Дары кеңешчиси*\n\nСуроолоруңузду жазыңыз:`,
    section_shifokor: `👨‍⚕️ *Доктур кеңешчиси*\n\n⚕️ Европа жана Америка гайдлайндары боюнча\n\nСимптомдоруңузду жазыңыз:`,
    section_surunkali: `🩺 *Созулма оорулар көзөмөлү*\n\nОору атын жазыңыз:`,
    section_diagnostika: `🔬 *Диагностика*\n\nАнализ жыйынтыктарыңызды жөнөтүңүз:`,
    back_menu: '🔙 Башкы меню',
    disclaimer: '\n\n⚠️ *Бул маалымат доктурдун кеңешин алмаштырбайт! Так диагноз үчүн адиске кайрылыңыз.*'
  },

  tg: {
    welcome: (name) => `Салом ${name}! 👋\n\nМан MedAI — ёрдамчии тиббии AI ҳастам.\n\n🏥 Хизматҳои мо:\n\n💊 /dori — Маслиҳатчии дору\n👨‍⚕️ /shifokor — Маслиҳатчии духтур\n🩺 /surunkali — Назорати беморҳои музмин\n🔬 /diagnostika — Ташхис (Рентген, МРТ, Таҳлилҳо)\n\n⚠️ Огоҳӣ: Ҷавобҳои ман маслиҳати духтурро иваз намекунанд!\n\n🆓 Тарифи ройгон: 5 савол дар рӯз\n💎 Премиум: саволҳои беохир — 40,000 сўм/моҳ\n\n🌐 Иваз кардани забон: /til`,
    choose_lang: 'Забонро интихоб кунед:',
    lang_set: 'Забон иваз шуд: Тоҷикӣ 🇹🇯',
    premium_info: `💎 Тарифи Премиум:\n\n✅ Саволҳои беохир\n✅ Ҷавоби тез\n✅ Ҳамаи бахшҳо\n\n💳 Нарх: 40,000 сўм/моҳ\n\nУс��ли пардохтро интихоб кунед:`,
    status_text: (isPremium, count) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Ройгон';
      const c = isPremium ? 'Беохир' : `${count}/5`;
      return `👤 Вазъияти шумо:\n\nТариф: ${status}\nСаволҳои имрӯза: ${c}`;
    },
    user_not_found: '��� Корбар ёфт нашуд! /start -ро пахш кунед.',
    limit_reached: `❌ Маҳдудияти ройгони рӯзона тамом шуд (5/5).\n\n💎 Барои гирифтани Премиум /premium -ро пахш кунед!`,
    loading: '⏳ Ҷавоб тайёр мешавад...',
    error: '❌ Хатогӣ рух дод. Дубора кӯшиш кунед.',
    payment_success: `✅ Пардохт муваффақ!\n\n💎 Шумо акнун корбари Премиум ҳастед!\nМуддат: 1 моҳ 🎉`,
    menu_dori: '💊 Маслиҳатчии дору',
    menu_shifokor: '👨‍⚕️ Маслиҳатчии духтур',
    menu_surunkali: '🩺 Беморҳои музмин',
    menu_diagnostika: '🔬 Ташхис',
    section_dori: `💊 *Маслиҳатчии дору*\n\nСаволатонро нависед:`,
    section_shifokor: `👨‍⚕️ *Маслиҳатчии духтур*\n\n⚕️ Дар асоси гайдлайнҳои Аврупо ва Амрико\n\nАломатҳоятонро муфассал нависед:`,
    section_surunkali: `🩺 *Назорати беморҳои музмин*\n\nНоми касалиро нависед:`,
    section_diagnostika: `🔬 *Ташхис*\n\nНатиҷаҳои таҳлилро фиристед:`,
    back_menu: '🔙 Менюи асосӣ',
    disclaimer: '\n\n⚠️ *Ин маълумот маслиҳати духтурро иваз намекунад! Барои ташхиси дақиқ ба мутахассис муроҷиат кунед.*'
  }
};

// ==================== SYSTEM PROMPTLAR ====================

function getSystemPrompt(section, lang) {
  const langInstructions = {
    uz: `O'zbek tilida (lotin alifbosi) javob bering. Barcha tibbiy terminlarni o'zbek tiliga tarjima qiling, qavsda inglizcha asl terminni ham ko'rsating. Masalan: "Yuqori qon bosimi (Hypertension)", "Qandli diabet (Diabetes Mellitus)".`,
    uz_cyrl: `Ўзбек тилида (кирилл алифбоси) жавоб беринг. Барча тиббий терминларни ўзбек тилига таржима қилинг, қавсда инглизча асл терминни ҳам кўрсатинг.`,
    ru: `Отвечайте на русском языке. Все медицинские термины переводите на русский, в скобках указывайте оригинальный английский термин. Например: "Повышенное артериальное давление (Hypertension)".`,
    en: `Respond in English. Use standard medical terminology with clear explanations for patients.`,
    kk: `Қазақ тілінде жауап беріңіз. Барлық медициналық терминдерді қазақ тіліне аударыңыз, жақша ішінде ағылшынша түпнұсқа терминді де көрсетіңіз. Мысалы: "Қан қысымының жоғарылауы (Hypertension)".`,
    ky: `Кыргыз тилинде жооп бериңиз. Бардык медициналык терминдерди кыргыз тилине которуңуз, кашааларда англисче түпнуска терминди да көрсөтүңүз.`,
    tg: `Бо забони тоҷикӣ ҷавоб диҳед. Ҳамаи истилоҳоти тиббиро ба забони тоҷикӣ тарҷума кунед, дар қавс истилоҳи англисиро низ нишон диҳед.`
  };

  const langInstruction = langInstructions[lang] || langInstructions.uz;

  const prompts = {
    dori: `Siz MedAI — professional farmatsevtik AI maslahatchiisiz.

${langInstruction}

VAZIFALARINGIZ:
1. Dori-darmonlar haqida to'liq va aniq ma'lumot bering
2. Dori tarkibi, ta'sir mexanizmi, farmakokinetikasi
3. Qo'llash ko'rsatmalari (indikatsiyalar) va qarshi ko'rsatmalar (kontraindikatsiyalar)
4. Yon ta'sirlar — tez-tez uchraydigan, kam uchraydigan va jiddiy
5. Dozalash — yosh guruhlari bo'yicha (bolalar, kattalar, keksalar)
6. Dorilarning o'zaro ta'siri (drug interactions) — xavfli kombinatsiyalar
7. Homiladorlik va emizish davrida qo'llash
8. Dori analoglarini taklif qiling (generik va brendlar)
9. Saqlash sharoitlari va yaroqlilik muddati
10. Maxsus ogohlantirishlar

MUHIM QOIDALAR:
- Faqat FDA, EMA, BNF ma'lumotlar bazasidagi tasdiqlangan ma'lumotlardan foydalaning
- Har doim "bu ma'lumot shifokor maslahatini almashtirmaydi" deb yozing
- Noaniq dori nomlarida aniqlashtiruvchi savol bering
- O'z-o'zini davolashga undamang`,

    shifokor: `Siz MedAI — yuqori malakali shifokor-maslahatchi AI tizimisiz.

${langInstruction}

SIZ QUYIDAGI XALQARO GUIDELINELAR ASOSIDA ISHLAYSIZ:
- AHA/ACC (American Heart Association / American College of Cardiology) — yurak-qon tomir kasalliklari
- ADA (American Diabetes Association) — diabet
- GINA (Global Initiative for Asthma) — astma
- GOLD (Global Initiative for COPD) — XOAB/COPD
- ESC (European Society of Cardiology) — kardiyologiya
- NICE (National Institute for Health and Care Excellence) — umumiy amaliyot
- WHO (World Health Organization) — infektsion kasalliklar
- KDIGO (Kidney Disease: Improving Global Outcomes) — buyrak kasalliklari
- ACR (American College of Rheumatology) — revmatologiya
- NCCN (National Comprehensive Cancer Network) — onkologiya
- AAN (American Academy of Neurology) — nevrologiya
- ACOG (American College of Obstetricians and Gynecologists) — akusherlik va ginekologiya
- AAP (American Academy of Pediatrics) — pediatriya
- IDSA (Infectious Diseases Society of America) — infektsion kasalliklar
- ATS (American Thoracic Society) — pulmonologiya
- AASLD (American Association for the Study of Liver Diseases) — gepatologiya
- ACG (American College of Gastroenterology) — gastroenterologiya
- AUA (American Urological Association) — urologiya
- AAD (American Academy of Dermatology) — dermatologiya
- AAO (American Academy of Ophthalmology) — oftalmologiya
- EULAR (European League Against Rheumatism) — revmatologiya
- EASL (European Association for the Study of the Liver) — jigar kasalliklari
- ERS (European Respiratory Society) — nafas olish kasalliklari

SIMPTOMLARNI TAHLIL QILISH TARTIBI:

1. **ANAMNEZ YIG'ISH:**
   - Asosiy shikoyat (Chief Complaint)
   - Hozirgi kasallik tarixi (History of Present Illness — HPI):
     * Qachon boshlangan? (Onset)
     * Qanday xarakterda? (Character)
     * Qayerda? (Location)
     * Tarqalishi? (Radiation)
     * Kuchaytiradigan/kamaytaradigan omillar? (Aggravating/Relieving factors)
     * Shiddati 1-10 shkala? (Severity)
     * Davomiyligi? (Duration)
     * Vaqt o'tishi bilan o'zgarishi? (Temporal pattern)
   - O'tgan kasalliklar tarixi (Past Medical History)
   - Qo'llayotgan dorilar (Current Medications)
   - Allergiyalar (Allergies)
   - Oilaviy anamnez (Family History)
   - Ijtimoiy anamnez (Social History — chekish, alkogol, kasbiy xavflar)

2. **DIFFERENTSIAL DIAGNOZ:**
   - Eng ehtimoliy diagnozlarni sanab chiqing (3-5 ta)
   - Har birining ehtimollik darajasini ko'rsating
   - Har bir diagnoz uchun qo'shimcha tekshiruvlarni taklif qiling
   - "Red flags" — xavfli alomatlarni alohida ta'kidlang

3. **TEKSHIRUVLAR TAKLIFI:**
   - Laboratoriya tekshiruvlari (qaysi analizlar kerak)
   - Instrumental tekshiruvlar (Rentgen, UZI, MRT, KT, EKG va h.k.)
   - Tekshiruvlarning sabablari

4. **DASTLABKI TAVSIYALAR:**
   - Umumiy hayot tarzi tavsiyalari
   - Oziqlanish tavsiyalari
   - Jismoniy faollik
   - Dori-darmon tavsiyalari (faqat OTC — retseptsiz dorilar)
   - Retseptli dorilarni faqat shifokor yozishi mumkinligini ta'kidlang

5. **QACHON SHOSHILINCH YORDAM KERAK:**
   - Darhol tez yordam chaqirish kerak bo'lgan alomatlar
   - 24 soat ichida shifokorga murojaat qilish kerak bo'lgan holatlar
   - Rejalashtirilgan murojaat tavsiyalari

6. **QAYSI MUTAXASSISGA MUROJAAT QILISH:**
   - Terapevt / Umumiy amaliyot shifokori
   - Tor mutaxassis (kardiolog, endokrinolog, nevrolog va h.k.)

MUHIM QOIDALAR:
- HECH QACHON aniq tashxis qo'ymang — faqat "taxminiy diagnoz" yoki "ehtimoliy diagnoz" deng
- Har doim professional shifokorga murojaat qilishni tavsiya qiling
- "Red flags" alomatlarida DARHOL tez yordam chaqirishni buyuring
- Retseptli dorilarni tavsiya qilmang — faqat shifokor yozishi mumkin deb yozing
- O'z-o'zini davolashga undamang
- Guideline manbasini ko'rsating (masalan: "ADA 2024 Guidelines bo'yicha...")
- Javob oxirida har doim: "Bu taxminiy tahlildir. Aniq tashxis va davolash uchun shifokorga murojaat qiling" deb yozing
- Tibbiy terminlarni foydalanuvchi tiliga tarjima qiling
- Bemorning yoshi, jinsi, vazni muhim — iloji boricha so'rang`,

    surunkali: `Siz MedAI — surunkali (muzmin) kasalliklarni nazorat qilish bo'yicha AI mutaxassisisiz.

${langInstruction}

SIZ QUYIDAGI KASALLIKLARNI NAZORAT QILISHDA YORDAM BERASIZ:

1. **DIABET (Diabetes Mellitus)**
   - ADA 2024 Standards of Care asosida
   - HbA1c maqsadlari (odatda <7%, individuallashtirilgan)
   - Qon qandi monitoringi (FBG, PPG)
   - Dorilar kuzatuvi (Metformin, Insulin, SGLT2i, GLP-1RA, DPP-4i)
   - Asoratlar skriningi (ko'z, buyrak, oyoq, neyropatiya)
   - Ovqatlanish rejasi va karbohidratlarni hisoblash
   - Jismoniy mashqlar tavsiyasi
   - Gipoglikemiya belgilari va boshqarish

2. **GIPERTONIYA (Hypertension)**
   - AHA/ACC 2017 va ESC/ESH 2023 guidelinelari
   - Qon bosimi maqsadlari (<130/80 mmHg ko'p hollarda)
   - Uy sharoitida monitoring
   - DASH dieta
   - Tuz cheklash (<5g/kun)
   - Dorilar kuzatuvi (ACEi, ARB, CCB, diuretiklar, beta-blokerlar)

3. **ASTMA (Asthma)**
   - GINA 2024 guidelines
   - Astma nazorat testi (ACT)
   - Inhaler texnikasi
   - Bosqichli davolash (Step 1-5)
   - Tetiklovchi omillardan qochish
   - Amal qilish rejasi (Action Plan)

4. **XOAB / COPD**
   - GOLD 2024 guidelines
   - ABCD baholash
   - Inhaler davolash
   - Pnevmoniya profilaktikasi
   - Kislorod terapiyasi
   - Pulmonar reabilitatsiya

5. **YURAK YETISHMOVCHILIGI (Heart Failure)**
   - AHA/ACC va ESC guidelinelari
   - EF (chiqarish fraksiyasi) bo'yicha tasniflash
   - Kundalik vazn nazorati
   - Suyuqlik va tuz cheklash
   - Dorilar (ACEi/ARB/ARNI, beta-blokerlar, MRA, SGLT2i, diuretiklar)
   - Og'irlashish belgilari

6. **BUYRAK KASALLIKLARI (CKD)**
   - KDIGO guidelines
   - GFR va albuminuriya kuzatuvi
   - Qon bosimi nazorati
   - Diabet nazorati (buyrak kasalligida)
   - Nefrotoksik dorilardan qochish
   - Dieta tavsiyalari (oqsil, kaliy, fosfor cheklash)

7. **EPILEPSIYA**
   - Dori qabul qilish qoidalari
   - Tetiklovchi omillar
   - Xuruj paytida yordam

8. **REVMATOID ARTRIT va BOSHQA AUTOIMMUN KASALLIKLAR**
   - ACR/EULAR guidelinelari
   - DMARD monitoring
   - Laboratoriya kuzatuvi

NAZORAT TARTIBI:
- Har safar kasallik holatini so'rang
- Dorilarni muntazam qabul qilayotganligini tekshiring
- Yon ta'sirlar borligini so'rang
- Oxirgi laboratoriya natijalarini so'rang
- Navbatdagi shifokor tekshiruvini eslatib turing
- Hayot tarzi tavsiyalarini bering
- Ogohlantirish belgilarini tushuntiring`,

    diagnostika: `Siz MedAI — laboratoriya va tasviriy diagnostika natijalari bo'yicha AI tahlilchisisiz.

${langInstruction}

SIZ QUYIDAGI TAHLILLARNI TAHLIL QILA OLASIZ:

📋 **LABORATORIYA TAHLILLARI:**

1. **QON UMUMIY TAHLILI (CBC — Complete Blood Count):**
   - WBC (Leykositlar) — norma: 4.0-11.0 × 10⁹/L
   - RBC (Eritrositlar) — norma: E 4.5-5.5, A 3.8-5.1 × 10¹²/L
   - Hemoglobin (Hb) — norma: E 130-170, A 120-150 g/L
   - Hematokrit (Hct) — norma: E 40-54%, A 36-48%
   - MCV — norma: 80-100 fL
   - MCH — norma: 27-33 pg
   - MCHC — norma: 320-360 g/L
   - PLT (Trombositlar) — norma: 150-400 × 10⁹/L
   - Leykositar formula: Neytrofillar, Limfositlar, Monotsitlar, Eozinofillar, Bazofillar
   - ESR (ECHT) — norma: E 1-10, A 2-15 mm/soat
   - RDW — norma: 11.5-14.5%

2. **BIOXIMIK QON TAHLILI:**
   - Glyukoza (qon qandi) — norma: 3.9-6.1 mmol/L (och qoringa)
   - HbA1c — norma: <5.7%, prediabet: 5.7-6.4%, diabet: ≥6.5%
   - Umumiy oqsil — norma: 65-85 g/L
   - Albumin — norma: 35-50 g/L
   - Umumiy bilirubin — norma: 3.4-20.5 μmol/L
   - To'g'ridan-to'g'ri bilirubin — norma: 0-5.1 μmol/L
   - ALT (ALAT) — norma: E <41, A <33 U/L
   - AST (ASAT) — norma: E <40, A <32 U/L
   - Ishqoriy fosfataza (ALP) — norma: 44-147 U/L
   - GGT — norma: E <60, A <40 U/L
   - Kreatinin — norma: E 74-110, A 44-80 μmol/L
   - Urea (Mochevina) — norma: 2.8-7.2 mmol/L
   - Siydik kislotasi — norma: E 210-420, A 150-350 μmol/L
   - GFR (hisoblangan) — norma: >90 mL/min/1.73m²
   - Natriy (Na) — norma: 136-145 mmol/L
   - Kaliy (K) — norma: 3.5-5.1 mmol/L
   - Kaltsiy (Ca) — norma: 2.15-2.55 mmol/L
   - Fosfor — norma: 0.87-1.45 mmol/L
   - Magniy — norma: 0.66-1.07 mmol/L
   - Temir (Fe) — norma: E 12.5-32.2, A 10.7-32.2 μmol/L
   - Ferritin — norma: E 20-250, A 10-120 ng/mL
   - TIBC / Transferrin — norma: 45-80 μmol/L
   - CRP (C-reaktiv oqsil) — norma: <5 mg/L
   - Prokalsitonin — norma: <0.05 ng/mL

3. **LIPID PROFILI:**
   - Umumiy xolesterin — norma: <5.2 mmol/L
   - LDL (yomon xolesterin) — norma: <3.4 mmol/L (xavf omillariga qarab <2.6 yoki <1.8)
   - HDL (yaxshi xolesterin) — norma: E >1.0, A >1.3 mmol/L
   - Triglitseridlar — norma: <1.7 mmol/L
   - Aterogenlik indeksi

4. **KOAGULOGRAMMA (Qon ivish tizimi):**
   - PTI / INR — norma INR: 0.8-1.2 (varfarin qabul qilayotganlarda 2.0-3.0)
   - APTT — norma: 25-35 sekund
   - Fibrinogen — norma: 2-4 g/L
   - D-dimer — norma: <0.5 mg/L
   - Trombositlar soni va funktsiyasi

5. **GORMON TAHLILLARI:**
   
   *Tireoid gormonlari:*
   - TSH — norma: 0.27-4.2 mIU/L
   - T4 erkin (FT4) — norma: 12-22 pmol/L
   - T3 erkin (FT3) — norma: 3.1-6.8 pmol/L
   - Anti-TPO — norma: <34 IU/mL
   - Anti-TG — norma: <115 IU/mL
   
   *Jinsiy gormonlar:*
   - Testosteron (E) — norma: 8.64-29.0 nmol/L
   - Estradiol (A) — sikl bosqichiga qarab
   - Progesteron — sikl bosqichiga qarab
   - FSH, LH — yosh va siklga qarab
   - Prolaktin — norma: E 4.0-15.2, A 4.8-23.3 ng/mL
   - DHEA-S, 17-OH progesteron
   - AMH (anti-Myulleryan gormon)
   
   *Boshqa gormonlar:*
   - Kortizol — norma: ertalab 171-536 nmol/L
   - Insulin — norma: 2.6-24.9 mU/L
   - HOMA-IR — norma: <2.7
   - Paratgormon (PTH) — norma: 15-65 pg/mL
   - Vitamin D (25-OH) — norma: 30-100 ng/mL
   - O'sish gormoni (GH/STH)
   - IGF-1

6. **SIYDIK TAHLILI:**
   - Rang, tiniqlik, zichlik (norma: 1.005-1.030)
   - pH (norma: 5.0-7.0)
   - Oqsil (norma: salbiy)
   - Glyukoza (norma: salbiy)
   - Keton tanachalari
   - Bilirubin, urobilinogen
   - Eritrositlar (norma: 0-2 ko'rish maydonida)
   - Leykositlar (norma: E 0-3, A 0-6 ko'rish maydonida)
   - Silindrlar, tuzlar, bakteriyalar
   - Nechiporenko bo'yicha tahlil

7. **TUMOR MARKERLARI:**
   - PSA (prostata) — norma: <4.0 ng/mL
   - CEA — norma: <5.0 ng/mL
   - CA 19-9 — norma: <37 U/mL
   - CA 125 — norma: <35 U/mL
   - AFP — norma: <10 ng/mL
   - CA 15-3 — norma: <31.3 U/mL
   - Beta-HCG

8. **INFEKTSION MARKERLARI:**
   - HBsAg, Anti-HCV, Anti-HIV
   - RPR/VDRL (sifilis)
   - Prokalsitonin, Presepsin

🏥 **TASVIRIY TEKSHIRUVLAR:**
   - Rentgen tasvirlari tavsifi
   - MRT (MRI) natijalari
   - KT (CT) natijalari
   - UZI (Ultratovush) natijalari
   - EKG natijalari
   - Exokardiografiya (ExoKG) natijalari

TAHLIL QILISH TARTIBI:
1. Foydalanuvchi yuborgan barcha ko'rsatkichlarni ko'rib chiqing
2. Har bir ko'rsatkichni normal diapazoni bilan solishtiring
3. Normadan chetga chiqqan ko'rsatkichlarni ⬆️ (yuqori) yoki ⬇️ (past) belgilang
4. Har bir og'ish uchun mumkin bo'lgan sabablarni tushuntiring
5. Ko'rsatkichlar orasidagi bog'liqlikni tahlil qiling (pattern recognition)
6. Ehtimoliy tashxislarni taklif qiling
7. Qo'shimcha tekshiruvlar kerakligini ko'rsating
8. Qaysi mutaxassisga murojaat qilish kerakligini ayting

MUHIM QOIDALAR:
- Natijalarni faqat interpretatsiya qilasiz, TASHXIS QO'YMAYSIZ
- Normal diapazoni har doim ko'rsating
- Laboratoriya va klinik kontekstni birgalikda ko'rib chiqing
- Kritik qiymatlarni (Critical Values) darhol ta'kidlang
- "Bu tahlil shifokorning klinik bahosi bilan birgalikda ko'rib chiqilishi kerak" deb yozing`
  };

  return prompts[section] || prompts.shifokor;
}

// ==================== FOYDALANUVCHI BOSHQARISH ====================

const userSessions = {};

function getUserSession(userId) {
  if (!userSessions[userId]) {
    userSessions[userId] = {
      section: null,
      lang: 'uz',
      conversationHistory: []
    };
  }
  return userSessions[userId];
}

function getT(userId) {
  const session = getUserSession(userId);
  return TRANSLATIONS[session.lang] || TRANSLATIONS.uz;
}

async function getUser(userId, firstName, username) {
  try {
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      await supabase
        .from('users')
        .insert({
          id: userId,
          first_name: firstName,
          username: username,
          language: 'uz'
        });

      const { data: newUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      user = newUser;
    }

    if (!user) return null;

    // Til ma'lumotini session ga yuklash
    if (user.language) {
      getUserSession(userId).lang = user.language;
    }

    // Premium muddati tugaganligini tekshirish
    if (user.is_premium && user.premium_until) {
      const premiumEnd = new Date(user.premium_until);
      if (premiumEnd < new Date()) {
        await supabase
          .from('users')
          .update({ is_premium: false, premium_until: null })
          .eq('id', userId);
        user.is_premium = false;
        user.premium_until = null;
      }
    }

    // Kunlik limitni tiklash
    const today = new Date().toISOString().split('T')[0];
    if (user.last_reset !== today) {
      await supabase
        .from('users')
        .update({ daily_count: 0, last_reset: today })
        .eq('id', userId);
      user.daily_count = 0;
      user.last_reset = today;
    }

    return user;
  } catch (err) {
    console.log('getUser xato:', err.message);
    return null;
  }
}

// ==================== MENYU TUGMALARI ====================

function getMainMenuKeyboard(userId) {
  const t = getT(userId);
  return {
    reply_markup: {
      keyboard: [
        [{ text: t.menu_dori }, { text: t.menu_shifokor }],
        [{ text: t.menu_surunkali }, { text: t.menu_diagnostika }],
        [{ text: t.back_menu }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
}

function getLanguageKeyboard() {
  const buttons = Object.entries(LANGUAGES).map(([code, lang]) => {
    return [{ text: `${lang.flag} ${lang.name}`, callback_data: `lang_${code}` }];
  });
  return { reply_markup: { inline_keyboard: buttons } };
}

function getPaymentKeyboard(userId) {
  const t = getT(userId);
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💳 Click — 40,000 so'm", callback_data: 'pay_click' }],
        [{ text: "💳 Payme — 40,000 so'm", callback_data: 'pay_payme' }]
      ]
    }
  };
}

// ==================== /start KOMANDASI ====================

bot.onText(/\/start/, async (msg) => {
  const name = msg.from.first_name;
  const userId = msg.from.id;
  await getUser(userId, name, msg.from.username);

  const session = getUserSession(userId);
  session.section = null;
  session.conversationHistory = [];

  const t = getT(userId);
  bot.sendMessage(msg.chat.id, t.welcome(name), getMainMenuKeyboard(userId));
});

// ==================== /til KOMANDASI ====================

bot.onText(/\/til/, (msg) => {
  const t = getT(msg.from.id);
  bot.sendMessage(msg.chat.id, t.choose_lang, getLanguageKeyboard());
});

// ==================== /premium KOMANDASI ====================

bot.onText(/\/premium/, (msg) => {
  const userId = msg.from.id;
  const t = getT(userId);
  bot.sendMessage(msg.chat.id, t.premium_info, getPaymentKeyboard(userId));
});

// ==================== /status KOMANDASI ====================

bot.onText(/\/status/, async (msg) => {
  const userId = msg.from.id;
  const t = getT(userId);
  try {
    const user = await getUser(userId, msg.from.first_name, msg.from.username);
    if (!user) {
      bot.sendMessage(msg.chat.id, t.user_not_found);
      return;
    }
    bot.sendMessage(msg.chat.id, t.status_text(user.is_premium, user.daily_count));
  } catch (err) {
    console.log('Status xato:', err.message);
    bot.sendMessage(msg.chat.id, t.error);
  }
});

// ==================== /dori KOMANDASI ====================

bot.onText(/\/dori/, async (msg) => {
  const userId = msg.from.id;
  const session = getUserSession(userId);
  session.section = 'dori';
  session.conversationHistory = [];
  const t = getT(userId);
  bot.sendMessage(msg.chat.id, t.section_dori, {
    parse_mode: 'Markdown',
    ...getMainMenuKeyboard(userId)
  });
});

// ==================== /shifokor KOMANDASI ====================

bot.onText(/\/shifokor/, async (msg) => {
  const userId = msg.from.id;
  const session = getUserSession(userId);
  session.section = 'shifokor';
  session.conversationHistory = [];
  const t = getT(userId);
  bot.sendMessage(msg.chat.id, t.section_shifokor, {
    parse_mode: 'Markdown',
    ...getMainMenuKeyboard(userId)
  });
});

// ==================== /surunkali KOMANDASI ====================

bot.onText(/\/surunkali/, async (msg) => {
  const userId = msg.from.id;
  const session = getUserSession(userId);
  session.section = 'surunkali';
  session.conversationHistory = [];
  const t = getT(userId);
  bot.sendMessage(msg.chat.id, t.section_surunkali, {
    parse_mode: 'Markdown',
    ...getMainMenuKeyboard(userId)
  });
});

// ==================== /diagnostika KOMANDASI ====================

bot.onText(/\/diagnostika/, async (msg) => {
  const userId = msg.from.id;
  const session = getUserSession(userId);
  session.section = 'diagnostika';
  session.conversationHistory = [];
  const t = getT(userId);
  bot.sendMessage(msg.chat.id, t.section_diagnostika, {
    parse_mode: 'Markdown',
    ...getMainMenuKeyboard(userId)
  });
});

// ==================== /help KOMANDASI ====================

bot.onText(/\/help/, (msg) => {
  const userId = msg.from.id;
  const session = getUserSession(userId);
  const lang = session.lang;

  const helpTexts = {
    uz: `📖 *MedAI Yordam*\n\n*Buyruqlar:*\n/start — Botni boshlash\n/dori — 💊 Dori maslahatchisi\n/shifokor — 👨‍⚕️ Shifokor maslahatchisi\n/surunkali — 🩺 Surunkali kasalliklar\n/diagnostika — 🔬 Diagnostika\n/premium — 💎 Premium sotib olish\n/status — 👤 Holatingizni ko'rish\n/til — 🌐 Tilni o'zgartirish\n/help — 📖 Yordam\n\n*Bo'limlar:*\n💊 Dori — dorilar haqida to'liq ma'lumot\n👨‍⚕️ Shifokor — simptomlar tahlili, kasallik ma'lumoti\n🩺 Surunkali — diabet, gipertoniya va boshqa kasalliklarni nazorat\n🔬 Diagnostika — analiz natijalari, rentgen, MRT tahlili`,
    ru: `📖 *MedAI Помощь*\n\n*Команды:*\n/start — Запуск бота\n/dori — 💊 Консультант по лекарствам\n/shifokor — 👨‍⚕️ Консультант врача\n/surunkali — 🩺 Хронические заболевания\n/diagnostika — 🔬 Диагностика\n/premium — 💎 Купить Премиум\n/status — 👤 Ваш статус\n/til — 🌐 Сменить язык\n/help — 📖 Помощь`,
    en: `📖 *MedAI Help*\n\n*Commands:*\n/start — Start bot\n/dori — 💊 Drug Consultant\n/shifokor — 👨‍⚕️ Doctor Consultant\n/surunkali — 🩺 Chronic Diseases\n/diagnostika — 🔬 Diagnostics\n/premium — 💎 Buy Premium\n/status — 👤 Your status\n/til — 🌐 Change language\n/help — 📖 Help`
  };

  const text = helpTexts[lang] || helpTexts.uz;
  bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

// ==================== CALLBACK QUERY HANDLER ====================

bot.on('callback_query', async (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const data = query.data;

  // ---- TIL TANLASH ----
  if (data.startsWith('lang_')) {
    const langCode = data.replace('lang_', '');
    const session = getUserSession(userId);
    session.lang = langCode;

    // Supabaseda saqlash
    await supabase
      .from('users')
      .update({ language: langCode })
      .eq('id', userId);

    const t = TRANSLATIONS[langCode] || TRANSLATIONS.uz;
    bot.answerCallbackQuery(query.id, { text: t.lang_set });
    bot.sendMessage(chatId, t.lang_set, getMainMenuKeyboard(userId));
    return;
  }

  // ---- CLICK TO'LOV ----
  if (data === 'pay_click') {
    try {
      bot.sendInvoice(
        chatId,
        'MedAI Premium',
        'Cheksiz tibbiy savollar — 1 oy / Unlimited medical questions — 1 month',
        'premium_click_1month',
        process.env.PAYMENT_TOKEN_CLICK,
        'UZS',
        [{ label: 'Premium 1 oy', amount: 4000000 }]
      );
      bot.answerCallbackQuery(query.id);
    } catch (err) {
      console.log('Click to\'lov xato:', err.message);
      bot.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi!' });
    }
    return;
  }

  // ---- PAYME TO'LOV ----
  if (data === 'pay_payme') {
    try {
      bot.sendInvoice(
        chatId,
        'MedAI Premium',
        'Cheksiz tibbiy savollar — 1 oy / Unlimited medical questions — 1 month',
        'premium_payme_1month',
        process.env.PAYMENT_TOKEN_PAYME,
        'UZS',
        [{ label: 'Premium 1 oy', amount: 4000000 }]
      );
      bot.answerCallbackQuery(query.id);
    } catch (err) {
      console.log('Payme to\'lov xato:', err.message);
      bot.answerCallbackQuery(query.id, { text: 'Xatolik yuz berdi!' });
    }
    return;
  }

  // ---- BO'LIM TANLASH ----
  if (data.startsWith('section_')) {
    const section = data.replace('section_', '');
    const session = getUserSession(userId);
    session.section = section;
    session.conversationHistory = [];

    const t = getT(userId);
    const sectionTexts = {
      dori: t.section_dori,
      shifokor: t.section_shifokor,
      surunkali: t.section_surunkali,
      diagnostika: t.section_diagnostika
    };

    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId, sectionTexts[section] || t.section_shifokor, {
      parse_mode: 'Markdown',
      ...getMainMenuKeyboard(userId)
    });
    return;
  }

  bot.answerCallbackQuery(query.id);
});

// ==================== TO'LOV HANDLERLARI ====================

bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('successful_payment', async (msg) => {
  const userId = msg.from.id;
  const t = getT(userId);

  const premiumUntil = new Date();
  premiumUntil.setMonth(premiumUntil.getMonth() + 1);

  await supabase
    .from('users')
    .update({
      is_premium: true,
      premium_until: premiumUntil.toISOString()
    })
    .eq('id', userId);

  bot.sendMessage(msg.chat.id, t.payment_success, getMainMenuKeyboard(userId));
});

// ==================== ASOSIY XABAR HANDLER ====================

bot.on('message', async (msg) => {
  // Komandalarni o'tkazib yuborish
  if (!msg.text || msg.text.startsWith('/')) return;
  // To'lov xabarlarini o'tkazib yuborish
  if (msg.successful_payment) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const session = getUserSession(userId);
  const t = getT(userId);
  const text = msg.text.trim();

  // ---- MENYU TUGMALARI ----
  const allMenuTexts = {};
  Object.keys(TRANSLATIONS).forEach(lang => {
    const tr = TRANSLATIONS[lang];
    allMenuTexts[tr.menu_dori] = 'dori';
    allMenuTexts[tr.menu_shifokor] = 'shifokor';
    allMenuTexts[tr.menu_surunkali] = 'surunkali';
    allMenuTexts[tr.menu_diagnostika] = 'diagnostika';
  });

  if (allMenuTexts[text]) {
    const section = allMenuTexts[text];
    session.section = section;
    session.conversationHistory = [];

    const sectionTexts = {
      dori: t.section_dori,
      shifokor: t.section_shifokor,
      surunkali: t.section_surunkali,
      diagnostika: t.section_diagnostika
    };

    bot.sendMessage(chatId, sectionTexts[section], {
      parse_mode: 'Markdown',
      ...getMainMenuKeyboard(userId)
    });
    return;
  }

  // Bosh menyu tugmasi
  const allBackTexts = Object.values(TRANSLATIONS).map(tr => tr.back_menu);
  if (allBackTexts.includes(text)) {
    session.section = null;
    session.conversationHistory = [];
    bot.sendMessage(chatId, t.welcome(msg.from.first_name), getMainMenuKeyboard(userId));
    return;
  }

  // ---- FOYDALANUVCHI TEKSHIRISH ----
  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  if (!user) {
    bot.sendMessage(chatId, t.user_not_found);
    return;
  }

  // ---- LIMIT TEKSHIRISH ----
  if (!user.is_premium && user.daily_count >= 5) {
    bot.sendMessage(chatId, t.limit_reached);
    return;
  }

  // ---- LIMIT YANGILASH ----
  await supabase
    .from('users')
    .update({ daily_count: user.daily_count + 1 })
    .eq('id', user.id);

  // ---- BO'LIM TEKSHIRISH ----
  if (!session.section) {
    session.section = 'shifokor'; // Default bo'lim
  }

  // ---- LOADING XABAR ----
  const loadingMsg = await bot.sendMessage(chatId, t.loading);

  try {
    // Conversation history ga qo'shish
    session.conversationHistory.push({
      role: 'user',
      content: text
    });

    // Oxirgi 10 ta xabarni saqlash (context oynasi)
    if (session.conversationHistory.length > 20) {
      session.conversationHistory = session.conversationHistory.slice(-20);
    }

    // Claude API ga so'rov
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: getSystemPrompt(session.section, session.lang),
      messages: session.conversationHistory
    });

    const aiResponse = response.content[0].text;

    // AI javobini tarixga qo'shish
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse
    });

    // Loading xabarni o'chirish
    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) {
      // O'chirilmasa ham davom etamiz
    }

    // Javobni yuborish (uzun xabarlarni bo'lib yuborish)
    const maxLength = 4000;
    if (aiResponse.length <= maxLength) {
      await bot.sendMessage(chatId, aiResponse, {
        parse_mode: 'Markdown',
        ...getMainMenuKeyboard(userId)
      }).catch(async () => {
        // Markdown ishlamasa oddiy text sifatida yuborish
        await bot.sendMessage(chatId, aiResponse, getMainMenuKeyboard(userId));
      });
    } else {
      // Uzun javoblarni bo'laklarga bo'lib yuborish
      const parts = [];
      let remaining = aiResponse;
      while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
          parts.push(remaining);
          break;
        }
        // Eng yaqin paragraf yoki gap oxiridan kesish
        let splitIndex = remaining.lastIndexOf('\n\n', maxLength);
        if (splitIndex === -1 || splitIndex < maxLength / 2) {
          splitIndex = remaining.lastIndexOf('\n', maxLength);
        }
        if (splitIndex === -1 || splitIndex < maxLength / 2) {
          splitIndex = remaining.lastIndexOf('. ', maxLength);
        }
        if (splitIndex === -1 || splitIndex < maxLength / 2) {
          splitIndex = maxLength;
        }
        parts.push(remaining.substring(0, splitIndex + 1));
        remaining = remaining.substring(splitIndex + 1);
      }

      for (let i = 0; i < parts.length; i++) {
        const opts = i === parts.length - 1 ? getMainMenuKeyboard(userId) : {};
        await bot.sendMessage(chatId, parts[i], {
          parse_mode: 'Markdown',
          ...opts
        }).catch(async () => {
          await bot.sendMessage(chatId, parts[i], opts);
        });
      }
    }

    // Supabase ga so'rov tarixini saqlash
    try {
      await supabase.from('chat_history').insert({
        user_id: userId,
        section: session.section,
        user_message: text,
        ai_response: aiResponse,
        language: session.lang
      });
    } catch (e) {
      // Chat history jadvali mavjud bo'lmasa xato bermaydi
      console.log('Chat history saqlashda xato (jadval mavjud emasligida e\'tiborsiz qoldiring):', e.message);
    }

  } catch (error) {
    console.log('AI xato:', error.message);

    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) { }

    bot.sendMessage(chatId, t.error, getMainMenuKeyboard(userId));
  }
});

// ==================== RASM (PHOTO) HANDLER ====================

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const session = getUserSession(userId);
  const t = getT(userId);

  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  if (!user) {
    bot.sendMessage(chatId, t.user_not_found);
    return;
  }

  if (!user.is_premium && user.daily_count >= 5) {
    bot.sendMessage(chatId, t.limit_reached);
    return;
  }

  await supabase
    .from('users')
    .update({ daily_count: user.daily_count + 1 })
    .eq('id', user.id);

  if (!session.section) {
    session.section = 'diagnostika';
  }

  const loadingMsg = await bot.sendMessage(chatId, t.loading);

  try {
    // Eng katta rasmni olish
    const photo = msg.photo[msg.photo.length - 1];
    const file = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    // Rasmni yuklash
    const fetch = (await import('node-fetch')).default;
    const imageResponse = await fetch(fileUrl);
    const imageBuffer = await imageResponse.buffer();
    const base64Image = imageBuffer.toString('base64');

    // Rasm formatini aniqlash
    const mediaType = file.file_path.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const caption = msg.caption || '';

    const userMessage = caption
      ? `Foydalanuvchi quyidagi rasmni va izohni yubordi: "${caption}". Iltimos, rasmni tahlil qiling.`
      : `Foydalanuvchi quyidagi rasmni yubordi. Iltimos, rasmni tahlil qiling. Agar bu tibbiy tasvir (rentgen, MRT, KT, UZI) yoki analiz natijasi bo'lsa, batafsil tahlil qiling.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: getSystemPrompt(session.section, session.lang),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: userMessage
            }
          ]
        }
      ]
    });

    const aiResponse = response.content[0].text;

    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) { }

    // Javobni yuborish
    const maxLength = 4000;
    if (aiResponse.length <= maxLength) {
      await bot.sendMessage(chatId, aiResponse, {
        parse_mode: 'Markdown',
        ...getMainMenuKeyboard(userId)
      }).catch(async () => {
        await bot.sendMessage(chatId, aiResponse, getMainMenuKeyboard(userId));
      });
    } else {
      const parts = [];
      let remaining = aiResponse;
      while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
          parts.push(remaining);
          break;
        }
        let splitIndex = remaining.lastIndexOf('\n\n', maxLength);
        if (splitIndex === -1 || splitIndex < maxLength / 2) {
          splitIndex = remaining.lastIndexOf('\n', maxLength);
        }
        if (splitIndex === -1 || splitIndex < maxLength / 2) {
          splitIndex = remaining.lastIndexOf('. ', maxLength);
        }
        if (splitIndex === -1 || splitIndex < maxLength / 2) {
          splitIndex = maxLength;
        }
        parts.push(remaining.substring(0, splitIndex + 1));
        remaining = remaining.substring(splitIndex + 1);
      }

      for (let i = 0; i < parts.length; i++) {
        const opts = i === parts.length - 1 ? getMainMenuKeyboard(userId) : {};
        await bot.sendMessage(chatId, parts[i], {
          parse_mode: 'Markdown',
          ...opts
        }).catch(async () => {
          await bot.sendMessage(chatId, parts[i], opts);
        });
      }
    }

    // Tarixga saqlash
    try {
      await supabase.from('chat_history').insert({
        user_id: userId,
        section: session.section,
        user_message: '[RASM] ' + (caption || 'Tasvir yuborildi'),
        ai_response: aiResponse,
        language: session.lang
      });
    } catch (e) {
      console.log('Chat history saqlashda xato:', e.message);
    }

  } catch (error) {
    console.log('Rasm tahlil xato:', error.message);
    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) { }
    bot.sendMessage(chatId, t.error, getMainMenuKeyboard(userId));
  }
});

// ==================== DOKUMENT (FAYL) HANDLER ====================

bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const session = getUserSession(userId);
  const t = getT(userId);

  // Faqat rasm fayllarni qabul qilish
  const mimeType = msg.document.mime_type || '';
  if (!mimeType.startsWith('image/')) {
    const errorTexts = {
      uz: '📎 Hozircha faqat rasm fayllarini (JPG, PNG) tahlil qila olaman. Iltimos, rasm sifatida yuboring.',
      ru: '📎 Пока могу анализировать только изображения (JPG, PNG). Пожалуйста, отправьте как фото.',
      en: '📎 Currently I can only analyze image files (JPG, PNG). Please send as photo.',
      uz_cyrl: '📎 Ҳозирча фақат расм файлларини таҳлил қила оламан.',
      kk: '📎 Қазір тек сурет файлдарын талдай аламын.',
      ky: '📎 Азыр сүрөт файлдарын гана анализдей алам.',
      tg: '📎 Ҳозир танҳо файлҳои расмро таҳлил карда метавонам.'
    };
    bot.sendMessage(chatId, errorTexts[session.lang] || errorTexts.uz);
    return;
  }

  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  if (!user) {
    bot.sendMessage(chatId, t.user_not_found);
    return;
  }

  if (!user.is_premium && user.daily_count >= 5) {
    bot.sendMessage(chatId, t.limit_reached);
    return;
  }

  await supabase
    .from('users')
    .update({ daily_count: user.daily_count + 1 })
    .eq('id', user.id);

  if (!session.section) {
    session.section = 'diagnostika';
  }

  const loadingMsg = await bot.sendMessage(chatId, t.loading);

  try {
    const file = await bot.getFile(msg.document.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const fetch = (await import('node-fetch')).default;
    const imageResponse = await fetch(fileUrl);
    const imageBuffer = await imageResponse.buffer();
    const base64Image = imageBuffer.toString('base64');

    const mediaType = mimeType.includes('png') ? 'image/png' : 'image/jpeg';

    const caption = msg.caption || '';
    const userMessage = caption
      ? `Foydalanuvchi quyidagi rasmni fayl sifatida yubordi va izoh yozdi: "${caption}". Iltimos, tahlil qiling.`
      : `Foydalanuvchi quyidagi rasmni fayl sifatida yubordi. Iltimos, tahlil qiling.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: getSystemPrompt(session.section, session.lang),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: userMessage
            }
          ]
        }
      ]
    });

    const aiResponse = response.content[0].text;

    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) { }

    const maxLength = 4000;
    if (aiResponse.length <= maxLength) {
      await bot.sendMessage(chatId, aiResponse, {
        parse_mode: 'Markdown',
        ...getMainMenuKeyboard(userId)
      }).catch(async () => {
        await bot.sendMessage(chatId, aiResponse, getMainMenuKeyboard(userId));
      });
    } else {
      const parts = [];
      let remaining = aiResponse;
      while (remaining.length > 0) {
        if (remaining.length <= maxLength) {
          parts.push(remaining);
          break;
        }
        let splitIndex = remaining.lastIndexOf('\n\n', maxLength);
        if (splitIndex === -1 || splitIndex < maxLength / 2) {
          splitIndex = remaining.lastIndexOf('\n', maxLength);
        }
        if (splitIndex === -1 || splitIndex < maxLength / 2) {
          splitIndex = remaining.lastIndexOf('. ', maxLength);
        }
        if (splitIndex === -1 || splitIndex < maxLength / 2) {
          splitIndex = maxLength;
        }
        parts.push(remaining.substring(0, splitIndex + 1));
        remaining = remaining.substring(splitIndex + 1);
      }

      for (let i = 0; i < parts.length; i++) {
        const opts = i === parts.length - 1 ? getMainMenuKeyboard(userId) : {};
        await bot.sendMessage(chatId, parts[i], {
          parse_mode: 'Markdown',
          ...opts
        }).catch(async () => {
          await bot.sendMessage(chatId, parts[i], opts);
        });
      }
    }

  } catch (error) {
    console.log('Dokument tahlil xato:', error.message);
    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) { }
    bot.sendMessage(chatId, t.error, getMainMenuKeyboard(userId));
  }
});

// ==================== XATO HANDLER ====================

bot.on('polling_error', (error) => {
  console.log('Polling xato:', error.code, error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.log('Uncaught Exception:', error.message);
});

console.log('✅ MedAI Bot ishga tushdi!');
console.log('📋 Bo\'limlar: Dori | Shifokor | Surunkali | Diagnostika');
console.log('🌐 Tillar: UZ | UZ-Кирилл | RU | EN | KK | KY | TG');
console.log('💳 To\'lov: Click + Payme');
