// ═══════════════════════════════════════════════════════════════
// MedAI Bot v3.1 — FINAL FIXED VERSION
// Multilingual (7 til) + Multi-Payment + Guideline Translation
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const client = new Anthropic();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Foydalanuvchi sessiyalari
const sessions = {};

// ═══════════════════════════════════════════════════════════════
// TILLAR SOZLAMASI
// ═══════════════════════════════════════════════════════════════

const LANGUAGES = {
  uz: { name: "O'zbekcha (Lotin)", flag: '🇺🇿' },
  uz_cyr: { name: 'Ўзбекча (Кирил)', flag: '🇺🇿' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  en: { name: 'English', flag: '🇬🇧' },
  kk: { name: 'Қазақша', flag: '🇰🇿' },
  ky: { name: 'Кыргызча', flag: '🇰🇬' },
  tg: { name: 'Тоҷикӣ', flag: '🇹🇯' }
};

// ═══════════════════════════════════════════════════════════════
// BARCHA INTERFEYS MATNLARI — 7 TILDA
// ═══════════════════════════════════════════════════════════════

const T = {

  welcome: {
    uz: (name) => `🏥 *MedAI — Sun'iy Intellekt Tibbiy Maslahatchi*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Assalomu alaykum, ${name}! 👋

Men MedAI — Yevropa va Amerika tibbiyot guideline'lariga asoslangan sun'iy intellekt tibbiy yordamchisiman.

*Mening imkoniyatlarim:*

👨‍⚕️ *Shifokor Maslahatchisi*
Simptomlarni tahlil, differensial diagnoz, guideline-based tavsiyalar

💊 *Dori Maslahatchisi*
Dori ma'lumotlari, o'zaro ta'sir, nojo'ya ta'sirlar

📋 *Surunkali Kasalliklar Nazorati*
Diabet, gipertoniya, astma va boshqalarni monitoring

🔬 *Tasviriy Diagnostika*
Qon, siydik, gormon tahlillari + Rentgen, MRT, KT, UZI

🆓 Bepul: kuniga 5 ta savol
💎 Premium: cheksiz — 40,000 so'm/oy

⚠️ _Eslatma: Men shifokor emasman. Tavsiyalarim yo'naltiruvchi xarakterga ega._`,

    uz_cyr: (name) => `🏥 *МедАИ — Сунъий Интеллект Тиббий Маслаҳатчи*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Ассалому алайкум, ${name}! 👋

Мен МедАИ — Европа ва Америка тиббиёт гайдлайнларига асосланган сунъий интеллект тиббий ёрдамчисиман.

*Менинг имкониятларим:*

👨‍⚕️ *Шифокор Маслаҳатчиси*
Симптомларни таҳлил, дифференциал диагноз

💊 *Дори Маслаҳатчиси*
Дори маълумотлари, ўзаро таъсир, ножўя таъсирлар

📋 *Сурункали Касалликлар Назорати*
Диабет, гипертония, астма ва бошқаларни мониторинг

🔬 *Тасвирий Диагностика*
Қон, сийдик, гормон таҳлиллари + Рентген, МРТ, КТ, УЗИ

🆓 Бепул: кунига 5 та савол
💎 Премиум: чексиз — 40,000 сўм/ой

⚠️ _Эслатма: Мен шифокор эмасман._`,

    ru: (name) => `🏥 *MedAI — Медицинский ИИ-консульта��т*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Здравствуйте, ${name}! 👋

Я MedAI — медицинский ИИ-помощник, основанный на европейских и американских клинических рекомендациях.

*Мои возможности:*

👨‍⚕️ *Консультант врача*
Анализ симптомов, дифференциальная диагностика

💊 *Консультант по лекарствам*
Информация о препаратах, взаимодействия, побочные эффекты

📋 *Мониторинг хронических заболеваний*
Диабет, гипертония, астма и другие

🔬 *Диагностика*
Анализы крови, мочи, гормоны + Рентген, МРТ, КТ, УЗИ

🆓 Бесплатно: 5 вопросов в день
💎 Премиум: безлимит — 40,000 сум/мес

⚠️ _Напоминание: Я не врач. Мои рекомендации носят ознакомительный характер._`,

    en: (name) => `🏥 *MedAI — AI Medical Consultant*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello, ${name}! 👋

I'm MedAI — an AI medical assistant based on European and American clinical guidelines.

*My capabilities:*

👨‍⚕️ *Doctor Advisor*
Symptom analysis, differential diagnosis, guideline-based recommendations

💊 *Drug Advisor*
Drug information, interactions, side effects

📋 *Chronic Disease Monitor*
Diabetes, hypertension, asthma and more

🔬 *Diagnostics*
Blood, urine, hormone tests + X-ray, MRI, CT, Ultrasound analysis

🆓 Free: 5 questions/day
💎 Premium: unlimited — 40,000 UZS/month

⚠️ _Disclaimer: I am not a doctor. My advice is for informational purposes only._`,

    kk: (name) => `🏥 *MedAI — Жасанды Интеллект Медициналық Кеңесші*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Сәлеметсіз бе, ${name}! 👋

Мен MedAI — Еуропа мен Америка медициналық нұсқаулықтарына негізделген ЖИ медициналық көмекшісімін.

*Менің мүмкіндіктерім:*

👨‍⚕️ *Дәрігер кеңесшісі* — Симптомдарды талдау, дифференциалды диагноз
��� *Дәрі-дәрмек кеңесшісі* — Дәрі ақпараты, өзара әсер
📋 *Созылмалы аурулар мониторингі* — Диабет, гипертония, астма
🔬 *Диагностика* — Қан, несеп, гормон + Рентген, МРТ, КТ, УДЗ

🆓 Тегін: күніне 5 сұрақ
💎 Премиум: шексіз — 40,000 сум/ай

⚠️ _Ескерту: Мен дәрігер емеспін._`,

    ky: (name) => `🏥 *MedAI — Жасалма Интеллект Медициналык Кеңешчи*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Саламатсызбы, ${name}! 👋

Мен MedAI — Европа жана Америка медициналык колдонмолоруна негизделген ЖИ медициналык жардамчысымын.

👨‍⚕️ *Дарыгер кеңешчиси* — Симптомдорду талдоо, дифференциалдык диагноз
💊 *Дары кеңешчиси* — Дары маалыматтары, өз ара таасирлер
📋 *Созулма оорулар мониторинги* — Диабет, гипертония, астма
🔬 *Диагностика* — Кан, заара, гормон + Рентген, МРТ, КТ, УЗИ

🆓 Бекер: күнүнө 5 суроо
💎 Премиум: чексиз — 40,000 сум/ай

⚠️ _Эскертүү: Мен дарыгер эмесмин._`,

    tg: (name) => `🏥 *MedAI — Маслиҳатгари тиббии зеҳни сунъӣ*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Салом, ${name}! 👋

Ман MedAI — ёрдамчии тиббии зеҳни сунъӣ мебошам, ки ба дастурҳои тиббии Аврупо ва Амрико ас��с ёфтааст.

👨‍⚕️ *Маслиҳатгари духтур* — Таҳлили аломатҳо, ташхиси дифференсиалӣ
💊 *Маслиҳатгари дору* — Маълумот дар бораи дору
📋 *Мониторинги бемориҳои музмин* — Диабет, гипертония, астма
🔬 *Диагностика* — Таҳлили хун, пешоб, ҳормонҳо + Рентген, МРТ, КТ, УЗИ

🆓 Ройгон: 5 савол дар як рӯз
💎 Премиум: беҳад — 40,000 сум/моҳ

⚠️ _Эзоҳ: Ман духтур нестам._`
  },

  choose_lang: {
    uz: '🌐 Tilni tanlang / Выберите язык / Choose language:',
    uz_cyr: '🌐 Тилни танланг:',
    ru: '🌐 Выберите язык:',
    en: '🌐 Choose your language:',
    kk: '🌐 Тілді таңдаңыз:',
    ky: '🌐 Тилди тандаңыз:',
    tg: '🌐 Забонро интихоб кунед:'
  },

  lang_set: {
    uz: "✅ Til o'rnatildi: O'zbekcha (Lotin)",
    uz_cyr: '✅ Тил ўрнатилди: Ўзбекча (Кирил)',
    ru: '✅ Язык установлен: Русский',
    en: '✅ Language set: English',
    kk: '✅ Тіл орнатылды: Қазақша',
    ky: '✅ Тил орнотулду: Кыргызча',
    tg: '✅ Забон гузошта шуд: Тоҷикӣ'
  },

  btn_doctor: {
    uz: '👨‍⚕️ Shifokor Maslahatchisi', uz_cyr: '👨‍⚕️ Шифокор М��слаҳатчиси',
    ru: '👨‍⚕️ Консультант врача', en: '👨‍⚕️ Doctor Advisor',
    kk: '👨‍⚕️ Дәрігер кеңесшісі', ky: '👨‍⚕️ Дарыгер кеңешчиси',
    tg: '👨‍⚕️ Маслиҳатгари духтур'
  },

  btn_drug: {
    uz: '💊 Dori Maslahatchisi', uz_cyr: '💊 Дори Маслаҳатчиси',
    ru: '💊 Консультант по лекарствам', en: '💊 Drug Advisor',
    kk: '💊 Дәрі кеңесшісі', ky: '💊 Дары кеңешчиси',
    tg: '💊 Маслиҳатгари дору'
  },

  btn_chronic: {
    uz: '📋 Surunkali Kasalliklar', uz_cyr: '📋 Сурункали Касалликлар',
    ru: '📋 Хронические заболевания', en: '📋 Chronic Diseases',
    kk: '📋 Созылмалы аурулар', ky: '📋 Созулма оорулар',
    tg: '📋 Бемориҳои музмин'
  },

  btn_diagnostic: {
    uz: '🔬 Diagnostika', uz_cyr: '🔬 Диагностика',
    ru: '🔬 Диагностика', en: '🔬 Diagnostics',
    kk: '🔬 Диагностика', ky: '🔬 Диагностика', tg: '🔬 Диагностика'
  },

  btn_profile: {
    uz: '👤 Profil', uz_cyr: '👤 Профил', ru: '👤 Профиль',
    en: '👤 Profile', kk: '👤 Профиль', ky: '👤 Профиль', tg: '👤 Профил'
  },

  btn_history: {
    uz: '📊 Tarix', uz_cyr: '📊 Тарих', ru: '📊 История',
    en: '📊 History', kk: '📊 Тарих', ky: '📊 Тарых', tg: '📊 Таърих'
  },

  btn_premium: {
    uz: '💎 Premium', uz_cyr: '💎 Премиум', ru: '💎 Премиум',
    en: '💎 Premium', kk: '💎 Премиум', ky: '💎 Премиум', tg: '💎 Премиум'
  },

  btn_status: {
    uz: '📈 Status', uz_cyr: '📈 Статус', ru: '📈 Статус',
    en: '📈 Status', kk: '📈 Статус', ky: '📈 Статус', tg: '📈 Статус'
  },

  btn_lang: {
    uz: '🌐 Til', uz_cyr: '🌐 Тил', ru: '🌐 Язык',
    en: '🌐 Language', kk: '🌐 Тіл', ky: '🌐 Тил', tg: '🌐 Забон'
  },

  btn_main_menu: {
    uz: '🏥 Asosiy menyu', uz_cyr: '🏥 Асосий меню', ru: '🏥 Главное меню',
    en: '🏥 Main menu', kk: '🏥 Басты мәзір', ky: '🏥 Башкы меню', tg: '🏥 Менюи асосӣ'
  },

  btn_end: {
    uz: '🔚 Suhbatni yakunlash', uz_cyr: '🔚 Суҳбатни якунлаш',
    ru: '🔚 Завершить консультацию', en: '🔚 End consultation',
    kk: '🔚 Кеңесті аяқтау', ky: '🔚 Кеңешти аяктоо', tg: '🔚 Анҷоми машварат'
  },

  btn_new_consult: {
    uz: '👨‍⚕️ Yangi konsultatsiya', uz_cyr: '👨‍⚕️ Янги консультация',
    ru: '👨‍⚕️ Новая консультация', en: '👨‍⚕️ New consultation',
    kk: '👨‍⚕️ Жаңа кеңес', ky: '👨‍⚕️ Жаңы кеңеш', tg: '👨‍⚕️ Машварати нав'
  },

  preparing: {
    uz: '⏳ Tayyorlanmoqda...', uz_cyr: '⏳ Тайёрланмоқда...',
    ru: '⏳ Подготовка...', en: '⏳ Preparing...',
    kk: '⏳ Дайындалуда...', ky: '⏳ Даярдалууда...', tg: '⏳ Омода шуда истодааст...'
  },

  analyzing: {
    uz: '⏳ Tahlil qilinmoqda...', uz_cyr: '⏳ Таҳлил қилинмоқда...',
    ru: '⏳ Анализируется...', en: '⏳ Analyzing...',
    kk: '⏳ Талданып жатыр...', ky: '⏳ Анализделүүдө...', tg: '⏳ Таҳлил шуда истодааст...'
  },

  type_question: {
    uz: '💬 Savolingizni yozing yoki shikoyatingizni ayting:',
    uz_cyr: '💬 Саволингизни ёзинг ёки шикоятингизни айтинг:',
    ru: '💬 Напишите ваш вопрос или опишите жалобу:',
    en: '💬 Type your question or describe your complaint:',
    kk: '💬 Сұрағыңызды жазыңыз немесе шағымыңызды айтыңыз:',
    ky: '💬 Суроонузду жазыңыз же даттанууңузду айтыңыз:',
    tg: '💬 Саволи худро нависед ё шикояти худро гӯед:'
  },

  continue_or_end: {
    uz: '💬 Davom eting yoki yakunlang:',
    uz_cyr: '💬 Давом этинг ёки якунланг:',
    ru: '💬 Продолжайте или завершите:',
    en: '💬 Continue or end:',
    kk: '💬 Жалғастырыңыз немесе аяқтаңыз:',
    ky: '💬 Улантыңыз же аяктаңыз:',
    tg: '💬 Идома диҳед ё анҷом диҳед:'
  },

  consult_ended: {
    uz: '✅ Konsultatsiya yakunlandi.\n📋 Natijani shifokoringizga ko\'rsating.',
    uz_cyr: '✅ Консультация якунланди.\n📋 Натижани шифокорингизга кўрсатинг.',
    ru: '✅ Консультация завершена.\n📋 Покажите результат вашему врачу.',
    en: '✅ Consultation completed.\n📋 Show the results to your doctor.',
    kk: '✅ Кеңес аяқталды.\n📋 Нәтижені дәрігеріңізге көрсетіңіз.',
    ky: '✅ Кеңеш аяктады.\n📋 Жыйынтыгын дарыгериңизге көрсөтүңүз.',
    tg: '✅ Машварат анҷом ёфт.\n📋 Натиҷаро ба духтуратон нишон диҳед.'
  },

  summary_preparing: {
    uz: '⏳ Xulosa tayyorlanmoqda...', uz_cyr: '⏳ Хулоса тайёрланмоқда...',
    ru: '⏳ Подготовка заключения...', en: '⏳ Preparing summary...',
    kk: '⏳ Қорытынды дайындалуда...', ky: '⏳ Корутунду даярдалууда...',
    tg: '⏳ Хулоса тайёр шуда истодааст...'
  },

  limit_reached: {
    uz: '❌ Kunlik bepul limitingiz tugadi (5/5).\n\n💎 Premium olish uchun tugmani bosing!',
    uz_cyr: '❌ Кунлик бепул лимитингиз тугади (5/5).\n\n💎 Премиум олиш учун тугмани босинг!',
    ru: '❌ Ваш бесплатный дневной лимит исчерпан (5/5).\n\n💎 Для безлимита нажмите кнопку!',
    en: '❌ Your free daily limit reached (5/5).\n\n💎 Press button for unlimited!',
    kk: '❌ Күнделікті тегін лимит аяқталды (5/5).\n\n💎 Шексіз үшін түймені басыңыз!',
    ky: '❌ Күнүмдүк бекер лимит аяктады (5/5).\n\n💎 Чексиз үчүн баскычты басыңыз!',
    tg: '❌ Ҳудуди ройгони рӯзонаи шумо тамом шуд (5/5).\n\n💎 Барои беҳад тугмаро пахш кунед!'
  },

  error_general: {
    uz: '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.',
    uz_cyr: '❌ Хатолик юз берди. Қайтадан уриниб кўринг.',
    ru: '❌ Произошла ошибка. Попробуйте снова.',
    en: '❌ An error occurred. Please try again.',
    kk: '❌ Қате болды. Қайта көріңіз.',
    ky: '❌ Ката кетти. Кайра аракет кылыңыз.',
    tg: '❌ Хатогӣ рух дод. Лутфан дубора кӯшиш кунед.'
  },

  no_active_session: {
    uz: 'Faol suhbat topilmadi.', uz_cyr: 'Фаол суҳбат топилмади.',
    ru: 'Активная сессия не найдена.', en: 'No active session found.',
    kk: 'Белсенді сеанс табылмады.', ky: 'Активдүү сессия табылган жок.',
    tg: 'Ҷаласаи фаъол ёфт нашуд.'
  },

  select_section: {
    uz: 'Bo\'limni tanlang 👇', uz_cyr: 'Бўлимни танланг 👇',
    ru: 'Выберите раздел 👇', en: 'Select a section 👇',
    kk: 'Бөлімді таңдаңыз 👇', ky: 'Бөлүмдү тандаңыз 👇',
    tg: 'Бахшро интихоб кунед 👇'
  },

  premium_info: {
    uz: `💎 *Premium tarif:*\n\n✅ Cheksiz savollar (barcha bo'limlarda)\n✅ Tezkor javob\n✅ Batafsil klinik tahlillar\n✅ Konsultatsiya tarixini saqlash\n\n💳 Narx: 40,000 so'm/oy\n\nTo'lov usulini tanlang:`,
    uz_cyr: `💎 *Премиум тариф:*\n\n✅ Чексиз саволлар\n✅ Тезкор жавоб\n✅ Батафсил клиник таҳлиллар\n\n💳 Нарх: 40,000 сўм/ой`,
    ru: `💎 *Премиум тариф:*\n\n✅ Безлимитные вопросы\n✅ Быстрые ответы\n✅ Детальный клинический анализ\n✅ Сохранение истории\n\n💳 Цена: 40,000 сум/мес\n\nВы��ерите способ оплаты:`,
    en: `💎 *Premium Plan:*\n\n✅ Unlimited questions\n✅ Fast responses\n✅ Detailed clinical analysis\n✅ History saving\n\n💳 Price: 40,000 UZS/month\n\nChoose payment method:`,
    kk: `💎 *Премиум тариф:*\n\n✅ Шексіз сұрақтар\n✅ Жылдам жауаптар\n\n��� Бағасы: 40,000 сум/ай`,
    ky: `💎 *Премиум тариф:*\n\n✅ Чексиз суроолор\n✅ Тез жооптор\n\n💳 Баасы: 40,000 сум/ай`,
    tg: `💎 *Тарифи Премиум:*\n\n✅ Саволҳои беҳад\n✅ Ҷавобҳои зуд\n\n💳 Нарх: 40,000 сум/моҳ`
  },

  payment_title: {
    uz: 'MedAI Premium — 1 oy', uz_cyr: 'МедАИ Премиум — 1 ой',
    ru: 'MedAI Премиум — 1 месяц', en: 'MedAI Premium — 1 month',
    kk: 'MedAI Премиум — 1 ай', ky: 'MedAI Премиум — 1 ай', tg: 'MedAI Премиум — 1 моҳ'
  },

  payment_desc: {
    uz: 'Barcha bo\'limlarda cheksiz savollar — 1 oy',
    uz_cyr: 'Барча бўлимларда чексиз саволлар — 1 ой',
    ru: 'Безлимитные вопросы во всех разделах — 1 месяц',
    en: 'Unlimited questions in all sections — 1 month',
    kk: 'Барлық бөлімдерде шексіз сұрақтар — 1 ай',
    ky: 'Бардык бөлүмдөрдө чексиз суроолор — 1 ай',
    tg: 'Саволҳои беҳад дар ҳамаи бахшҳо — 1 моҳ'
  },

  payment_success: {
    uz: (until) => `✅ To'lov muvaffaqiyatli!\n\n💎 Premium muddati: ${until}\nBarcha bo'limlarda cheksiz! 🎉`,
    uz_cyr: (until) => `✅ Тўлов муваффақиятли!\n\n💎 Премиум муддати: ${until} 🎉`,
    ru: (until) => `✅ Оплата прошла успешно!\n\n💎 Премиум до: ${until}\nБезлимит! 🎉`,
    en: (until) => `✅ Payment successful!\n\n💎 Premium until: ${until}\nUnlimited! 🎉`,
    kk: (until) => `✅ Төлем сәтті!\n\n💎 Премиум мерзімі: ${until} 🎉`,
    ky: (until) => `✅ Төлөм ийгиликтүү!\n\n💎 Премиум мөөнөтү: ${until} 🎉`,
    tg: (until) => `✅ Пардохт муваффақ!\n\n💎 Премиум то: ${until} 🎉`
  },

  diag_title: {
    uz: '🔬 *Tasviriy Diagnostika*\n\nTahlil turini tanlang:',
    uz_cyr: '🔬 *Тасвирий Диагностика*\n\nТаҳлил турини танланг:',
    ru: '🔬 *Диагностика*\n\nВыберите тип анализа:',
    en: '🔬 *Diagnostics*\n\nSelect analysis type:',
    kk: '🔬 *Диагностика*\n\nТалдау түрін таңдаңыз:',
    ky: '🔬 *Диагностика*\n\nАнализ түрүн тандаңыз:',
    tg: '🔬 *Диагностика*\n\nНавъи таҳлилро интихоб кунед:'
  },

  chronic_title: {
    uz: '📋 *Surunkali Kasalliklar*\n\nKasalligingizni tanlang:',
    uz_cyr: '📋 *Сурункали Касалликлар*\n\nКасаллигингизни танланг:',
    ru: '📋 *Хронические заболевания*\n\nВыберите заболевание:',
    en: '📋 *Chronic Diseases*\n\nSelect your condition:',
    kk: '📋 *Созылмалы аурулар*\n\nАуруыңызды таңдаңыз:',
    ky: '📋 *Созулма оорулар*\n\nОоруңузду тандаңыз:',
    tg: '📋 *Бемориҳои музмин*\n\nБеморӣатонро интихоб кунед:'
  },

  send_lab_text: {
    uz: '📝 Tahlil natijalarini matn sifatida yozing yoki 📸 rasm yuboring:',
    uz_cyr: '📝 Таҳлил натижаларини матн ёзинг ёки 📸 расм юборинг:',
    ru: '📝 Напишите результаты анализов текстом или отправьте 📸 фото:',
    en: '📝 Type your lab results or send a 📸 photo:',
    kk: '📝 Нәтижелерді жазыңыз немесе 📸 сурет жіберіңіз:',
    ky: '📝 Жыйынтыктарды жазыңыз же 📸 сүрөт жөнөтүңүз:',
    tg: '📝 Натиҷаҳоро бо матн нависед ё 📸 сурат фиристед:'
  },

  send_image: {
    uz: '📸 Tibbiy tasvirni yuboring:',
    uz_cyr: '📸 Тиббий тасвирни юборинг:',
    ru: '📸 Отправьте медицинское изображение:',
    en: '📸 Send the medical image:',
    kk: '📸 Медициналық суретті жіберіңіз:',
    ky: '📸 Медициналык сүрөттү жөнөтүңүз:',
    tg: '📸 Сурати тиббиро фиристед:'
  },

  image_analyzing: {
    uz: '⏳ Rasm tahlil qilinmoqda...',
    uz_cyr: '⏳ Расм таҳлил қилинмоқда...',
    ru: '⏳ Изображение анализируется...',
    en: '⏳ Analyzing image...',
    kk: '⏳ Сурет талданып жатыр...',
    ky: '⏳ Сүрөт анализделүүдө...',
    tg: '⏳ Сурат таҳлил шуда истодааст...'
  },

  again_analyze: {
    uz: '🔬 Yana tahlil', uz_cyr: '🔬 Яна таҳлил', ru: '🔬 Ещё анализ',
    en: '🔬 Analyze again', kk: '🔬 Тағы талдау', ky: '🔬 Дагы анализ', tg: '🔬 Таҳлили дигар'
  },

  ask_doctor: {
    uz: '👨‍⚕️ Shifokorga so\'rash', uz_cyr: '👨‍⚕️ Шифокорга сўраш',
    ru: '👨‍⚕️ Спросить врача', en: '👨‍⚕️ Ask doctor',
    kk: '👨‍⚕️ Дәрігерден сұрау', ky: '👨‍⚕️ Дарыгерден суроо', tg: '👨‍⚕️ Аз духтур пурсидан'
  },

  log_data: {
    uz: '📝 Ma\'lumot kiritish', uz_cyr: '📝 Маълумот киритиш',
    ru: '📝 Ввести данные', en: '📝 Enter data',
    kk: '📝 Деректерді енгізу', ky: '📝 Маалымат киргизүү', tg: '📝 Ворид кардани маълумот'
  },

  weekly_report: {
    uz: '📊 Haftalik', uz_cyr: '📊 Ҳафталик', ru: '📊 Неделя',
    en: '📊 Weekly', kk: '📊 Апталық', ky: '📊 Жумалык', tg: '📊 Ҳафтагӣ'
  },

  monthly_report: {
    uz: '📈 Oylik', uz_cyr: '📈 Ойлик', ru: '📈 Месяц',
    en: '📈 Monthly', kk: '📈 Айлық', ky: '📈 Айлык', tg: '📈 Моҳона'
  },

  status_text: {
    uz: (s, c, u) => `👤 *Holatingiz:*\n\nTarif: ${s}\nBugungi savollar: ${c}${u ? `\nPremium muddati: ${u}` : ''}`,
    uz_cyr: (s, c, u) => `👤 *Ҳолатингиз:*\n\nТариф: ${s}\nБугунги саволлар: ${c}${u ? `\nПремиум: ${u}` : ''}`,
    ru: (s, c, u) => `👤 *Ваш статус:*\n\nТариф: ${s}\nВопросов сегодня: ${c}${u ? `\nПремиум до: ${u}` : ''}`,
    en: (s, c, u) => `👤 *Your status:*\n\nPlan: ${s}\nQuestions today: ${c}${u ? `\nPremium until: ${u}` : ''}`,
    kk: (s, c, u) => `👤 *Жағдайыңыз:*\n\nТариф: ${s}\nСұрақтар: ${c}${u ? `\nПремиум: ${u}` : ''}`,
    ky: (s, c, u) => `👤 *Абалыңыз:*\n\nТариф: ${s}\nСуроолор: ${c}${u ? `\nПремиум: ${u}` : ''}`,
    tg: (s, c, u) => `👤 *Вазъият:*\n\nТариф: ${s}\nСаволҳо: ${c}${u ? `\nПремиум: ${u}` : ''}`
  },

  chronic_enter_data: {
    uz: (d) => `📝 *${d}*\n\nBugungi ko'rsatkichlarni yozing:`,
    uz_cyr: (d) => `📝 *${d}*\n\nБугунги кўрсаткичларни ёзинг:`,
    ru: (d) => `📝 *${d}*\n\nВведите сегодняшние показатели:`,
    en: (d) => `📝 *${d}*\n\nEnter today's readings:`,
    kk: (d) => `📝 *${d}*\n\nБүгінгі көрсеткіштерді жазыңыз:`,
    ky: (d) => `📝 *${d}*\n\nБүгүнкү көрсөткүчтөрдү жазыңыз:`,
    tg: (d) => `📝 *${d}*\n\nНишондиҳандаҳои имрӯзаро нависед:`
  },

  emergency: {
    uz: `🚨🚨🚨 SHOSHILINCH HOLAT 🚨🚨🚨\n━━━━━━━━━━━━━━━━━━━━━━━━━\n⚡ DARHOL 103 GA QO'NG'IROQ QILING!\n\n🏥 TEZ YORDAM KELGUNCHA:\n1. Tinch bo'ling\n2. Yoningizda birovni chaqiring\n3. 103 ga qo'ng'iroq qiling\n\n⏰ HAR BIR DAQIQA MUHIM!`,
    uz_cyr: `🚨🚨🚨 ШОШИЛИНЧ ҲОЛАТ 🚨🚨🚨\n⚡ ДАРҲОЛ 103 ГА ҚЎНҒИРОҚ ҚИЛИНГ!`,
    ru: `🚨🚨🚨 ЭКСТРЕННАЯ СИТУАЦИЯ 🚨🚨🚨\n⚡ НЕМЕДЛЕННО ЗВОНИТЕ 103!\n\n1. Сохраняйте спокойствие\n2. Позовите кого-то рядом\n3. Звоните 103\n\n⏰ КАЖДАЯ МИНУТА НА СЧЕТУ!`,
    en: `🚨🚨🚨 EMERGENCY 🚨🚨🚨\n⚡ CALL 103 IMMEDIATELY!\n\n1. Stay calm\n2. Call someone nearby\n3. Call 103\n\n⏰ EVERY MINUTE COUNTS!`,
    kk: `🚨🚨🚨 ШҰҒЫЛ ЖАҒДАЙ 🚨🚨🚨\n⚡ ДЕРЕУ 103-КЕ ҚОҢЫРАУ ШАЛЫҢЫЗ!`,
    ky: `🚨🚨🚨 ШАШЫЛЫШ АБАЛ 🚨🚨🚨\n⚡ ДАРОО 103-КӨ ЧАЛЫҢЫЗ!`,
    tg: `🚨🚨🚨 ҲОЛАТИ ФАВҚУЛОДДА 🚨🚨🚨\n⚡ ҲОЗИР БА 103 ЗАНГ ЗАНЕД!`
  }
};

// Matn olish
function t(key, lang) {
  if (!lang) lang = 'uz';
  const tr = T[key];
  if (!tr) return key;
  return tr[lang] || tr['uz'] || key;
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════════════════════════

function getLanguageInstruction(lang) {
  const map = {
    uz: `Respond ENTIRELY in Uzbek (Latin script). Medical terms: O'zbekcha (English). Example: Yurak yetishmovchiligi (Heart Failure). Guideline names: keep English, add Uzbek explanation. Example: "AHA/ACC (Amerika Yurak Assotsiatsiyasi) guideline'iga ko'ra..."`,
    uz_cyr: `Respond ENTIRELY in Uzbek CYRILLIC script (Ўзбек кирил). Medical terms: Ўзбекча (English). Example: Юрак етишмовчилиги (Heart Failure). All text in Cyrillic Uzbek.`,
    ru: `Respond ENTIRELY in Russian. Medical terms: по-русски (English). Example: Сердечная недостаточность (Heart Failure). Guideline: "Согласно рекомендациям AHA/ACC (Американская ассоциация сердца)..."`,
    en: `Respond ENTIRELY in English. Use standard medical terminology with layperson explanations. Example: "Heart Failure (a condition where the heart cannot pump blood effectively)"`,
    kk: `Respond ENTIRELY in Kazakh (Қазақ тілі, Cyrillic). Medical terms: Қазақша (English). Example: Жүрек жеткіліксіздігі (Heart Failure). Guideline: "AHA/ACC (Америка Жүрек Қауымдастығы) нұсқаулығына сәйкес..."`,
    ky: `Respond ENTIRELY in Kyrgyz (Кыргыз тили, Cyrillic). Medical terms: Кыргызча (English). Example: Жүрөк жетишсиздиги (Heart Failure). Guideline: "AHA/ACC (Америка Жүрөк Ассоциациясы) колдонмосуна ылайык..."`,
    tg: `Respond ENTIRELY in Tajik (Забони тоҷикӣ, Cyrillic). Medical terms: Тоҷикӣ (English). Example: Норасоии дил (Heart Failure). Guideline: "Мувофиқи тавсияҳои AHA/ACC (Ассотсиатсияи Дили Амрико)..."`
  };
  return map[lang] || map['uz'];
}

function getDoctorPrompt(lang) {
  return `You are MedAI Doctor Advisor — AI clinical decision support system. Strictly follow European/American guidelines.

LANGUAGE: ${getLanguageInstruction(lang)}

GUIDELINE TRANSLATION: When citing ANY guideline, provide abbreviation + full English name + translation in patient's language. Translate ALL medical terms.

GUIDELINES: AHA/ACC, ESC, ADA, EASD, GOLD, GINA, KDIGO, ACR, EULAR, NCCN, ESMO, IDSA, CDC, WHO, AAP, AAN, ACOG, APA, NICE, UpToDate, Cochrane, BMJ Best Practice

METHODOLOGY:
Phase 1: History taking (SOCRATES, PMH, meds, allergies, FH, SH). Ask 1-2 questions at a time.
Phase 2: After 4-5+ exchanges — differential diagnosis with %, risk level (🔴🟡🟢), clinical scores, investigations, can't-miss diagnoses.
Phase 3: Non-pharmacological + pharmacological (drug CLASS only) + referral + follow-up + red flags. Cite specific guideline for each recommendation.

EMERGENCY DETECTION: Chest pain+dyspnea, stroke signs, severe bleeding, anaphylaxis, suicidal ideation, high fever with AMS, seizure >5min → IMMEDIATELY flag, tell to call 103.

DISCLAIMER: Include warning that you're AI, not a doctor. Every response must end with reminder.

RULES: Never prescribe specific drugs with doses. Never deviate from guidelines. Always show differentials. Always cite guidelines WITH translation. Never say "100% certain".`;
}

function getDrugPrompt(lang) {
  return `You are MedAI Drug Advisor — AI pharmaceutical consultation system per FDA, EMA, WHO.

LANGUAGE: ${getLanguageInstruction(lang)}

SOURCES: FDA, EMA, WHO Essential Medicines, BNF, Lexicomp, Micromedex, Stockley's, Beers Criteria

CAPABILITIES: Drug info (MOA, pharmacokinetics), interactions (🔴🟠🟡🟢 severity), side effects, contraindications, pregnancy/lactation (FDA categories), geriatric/pediatric, renal/hepatic adjustments.

RULES: NEVER prescribe — only inform. ALWAYS recommend doctor. ALWAYS check interactions. ALWAYS ask about allergies and pregnancy. Translate all terms.`;
}

function getChronicPrompt(lang) {
  return `You are MedAI Chronic Disease Monitor — AI monitoring for chronic diseases per international guidelines.

LANGUAGE: ${getLanguageInstruction(lang)}

SUPPORTED: Diabetes T1/T2, Hypertension, Heart Failure, COPD, Asthma, CKD, RA, Thyroid, Epilepsy, Depression
GUIDELINES: ADA, AHA/ACC, ESC, GOLD, GINA, KDIGO, ACR/EULAR, ATA/ETA, ILAE, APA/NICE

ALERTS: 🔴 CRITICAL (call 103), 🟡 WARNING (see doctor 24-48h), 🟢 NORMAL

RULES: Never change meds. Always flag critical values. Track trends. Be encouraging. Translate all terms.`;
}

function getDiagnosticPrompt(lang) {
  return `You are MedAI Diagnostic Analyzer — AI for lab results and medical image analysis.

LANGUAGE: ${getLanguageInstruction(lang)}

LAB: CBC, BMP/CMP, LFT, Lipids, Coagulation, Thyroid, Diabetes, Hormones, Tumor markers, Autoimmune, Cardiac, Iron, Urinalysis, Vitamins. Use age/sex-specific ranges.
IMAGING: X-ray, CT, MRI, Ultrasound analysis.

METHODOLOGY: Compare to reference ranges, categorize severity, pattern recognition, correlate findings, suggest differentials, recommend follow-up.

DISCLAIMER: Every response must state this is preliminary AI analysis — final interpretation by qualified professional.

RULES: Always use age/sex ranges. Always identify critical values. Never make definitive diagnosis. Translate all terms.`;
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARD BUILDERS
// ═══════════════════════════════════════════════════════════════

function languageKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🇺🇿 O'zbekcha (Lotin)", callback_data: 'lang_uz' },
          { text: '🇺🇿 Ўзбекча (Кирил)', callback_data: 'lang_uz_cyr' }
        ],
        [
          { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
          { text: '🇬🇧 English', callback_data: 'lang_en' }
        ],
        [
          { text: '🇰🇿 Қазақша', callback_data: 'lang_kk' },
          { text: '🇰🇬 Кыргызча', callback_data: 'lang_ky' }
        ],
        [{ text: '🇹🇯 Тоҷикӣ', callback_data: 'lang_tg' }]
      ]
    }
  };
}

function mainMenuKeyboard(lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t('btn_doctor', lang), callback_data: 'section_doctor' }],
        [{ text: t('btn_drug', lang), callback_data: 'section_drug' }],
        [{ text: t('btn_chronic', lang), callback_data: 'section_chronic' }],
        [{ text: t('btn_diagnostic', lang), callback_data: 'section_diagnostic' }],
        [{ text: t('btn_profile', lang), callback_data: 'profile_view' }, { text: t('btn_history', lang), callback_data: 'history_view' }],
        [{ text: t('btn_premium', lang), callback_data: 'premium_menu' }, { text: t('btn_status', lang), callback_data: 'status_view' }],
        [{ text: t('btn_lang', lang), callback_data: 'change_lang' }]
      ]
    }
  };
}

function paymentKeyboard(lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💳 Telegram Pay (Visa/MC)', callback_data: 'pay_telegram' }],
        [{ text: '📱 Payme', callback_data: 'pay_payme' }],
        [{ text: '📱 Click', callback_data: 'pay_click' }],
        [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
      ]
    }
  };
}

function sessionKeyboard(section, lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t('btn_end', lang), callback_data: `end_${section}` }],
        [{ text: t('btn_main_menu', lang), callback_data: 'force_main_menu' }]
      ]
    }
  };
}

function diagnosticMenu(lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🩸 Qon/Blood', callback_data: 'diag_lab_blood' }, { text: '💧 Siydik/Urine', callback_data: 'diag_lab_urine' }],
        [{ text: '🧬 Gormon/Hormone', callback_data: 'diag_lab_hormone' }, { text: '📝 Boshqa/Other', callback_data: 'diag_lab_other' }],
        [{ text: '🫁 Rentgen/X-ray', callback_data: 'diag_img_xray' }, { text: '🧲 MRT/MRI', callback_data: 'diag_img_mri' }],
        [{ text: '💻 KT/CT', callback_data: 'diag_img_ct' }, { text: '📡 UZI/US', callback_data: 'diag_img_ultrasound' }],
        [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
      ]
    }
  };
}

function chronicMenu(lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🩸 Diabet T2', callback_data: 'chr_diabetes2' }, { text: '💉 Diabet T1', callback_data: 'chr_diabetes1' }],
        [{ text: '🫀 Gipertoniya', callback_data: 'chr_hypertension' }, { text: '❤️ Heart Failure', callback_data: 'chr_heartfailure' }],
        [{ text: '🫁 COPD', callback_data: 'chr_copd' }, { text: '🌬 Astma', callback_data: 'chr_asthma' }],
        [{ text: '🫘 CKD', callback_data: 'chr_ckd' }, { text: '🦴 RA', callback_data: 'chr_ra' }],
        [{ text: '🦋 Hypothyroid', callback_data: 'chr_hypothyroid' }, { text: '⚡ Hyperthyroid', callback_data: 'chr_hyperthyroid' }],
        [{ text: '🧠 Epilepsy', callback_data: 'chr_epilepsy' }, { text: '😔 Depression', callback_data: 'chr_depression' }],
        [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
      ]
    }
  };
}

function chronicActiveKB(diseaseKey, lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t('log_data', lang), callback_data: `chrlog_${diseaseKey}` }],
        [{ text: t('weekly_report', lang), callback_data: `chrrpt_weekly_${diseaseKey}` }, { text: t('monthly_report', lang), callback_data: `chrrpt_monthly_${diseaseKey}` }],
        [{ text: t('btn_end', lang), callback_data: 'end_chronic' }],
        [{ text: t('btn_main_menu', lang), callback_data: 'force_main_menu' }]
      ]
    }
  };
}

function afterDiagKB(lang) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t('again_analyze', lang), callback_data: 'section_diagnostic' }],
        [{ text: t('ask_doctor', lang), callback_data: 'section_doctor' }],
        [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
      ]
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// DATABASE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function getUser(userId, firstName, username) {
  try {
    let { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!user) {
      await supabase.from('users').insert({ id: userId, first_name: firstName || 'User', username: username || null, language: 'uz' });
      const { data: n } = await supabase.from('users').select('*').eq('id', userId).single();
      user = n;
    }
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    if (user.last_reset !== today) {
      await supabase.from('users').update({ daily_count: 0, last_reset: today }).eq('id', userId);
      user.daily_count = 0;
    }
    if (user.is_premium && user.premium_until && new Date(user.premium_until) < new Date()) {
      await supabase.from('users').update({ is_premium: false }).eq('id', userId);
      user.is_premium = false;
    }
    return user;
  } catch (err) { console.error('getUser:', err.message); return null; }
}

async function getUserLang(userId) {
  try {
    const { data, error } = await supabase.from('users').select('language').eq('id', userId).single();
    if (error || !data || !data.language) return 'uz';
    return data.language;
  } catch { return 'uz'; }
}

async function setUserLang(userId, lang) {
  try {
    const { data } = await supabase.from('users').select('id').eq('id', userId).single();
    if (!data) {
      await supabase.from('users').insert({ id: userId, language: lang });
    } else {
      await supabase.from('users').update({ language: lang }).eq('id', userId);
    }
    return true;
  } catch (err) { console.error('setUserLang:', err.message); return false; }
}

async function getUserProfile(userId) {
  try {
    const { data } = await supabase.from('users')
      .select('age,gender,weight,height,blood_type,allergies,chronic_diseases,current_medications')
      .eq('id', userId).single();
    return data || {};
  } catch { return {}; }
}

async function updateUserField(userId, field, value) {
  try { await supabase.from('users').update({ [field]: value }).eq('id', userId); return true; }
  catch { return false; }
}

async function incrementUsage(userId, count) {
  await supabase.from('users').update({ daily_count: count + 1 }).eq('id', userId);
}

async function saveConsultation(userId, section, messages, summary, specialty) {
  try {
    await supabase.from('consultations').insert({
      user_id: userId, section, status: 'completed', messages,
      summary: summary?.substring(0, 5000), specialty, completed_at: new Date().toISOString()
    });
  } catch (e) { console.error('saveConsult:', e.message); }
}

async function saveChronicLog(userId, disease, data, feedback, alertLevel) {
  try {
    await supabase.from('chronic_logs').insert({ user_id: userId, disease, data, ai_feedback: feedback, alert_level: alertLevel });
  } catch (e) { console.error('saveChronicLog:', e.message); }
}

async function getChronicLogs(userId, disease, days) {
  try {
    const since = new Date(); since.setDate(since.getDate() - days);
    const { data } = await supabase.from('chronic_logs').select('*').eq('user_id', userId).eq('disease', disease)
      .gte('created_at', since.toISOString()).order('created_at', { ascending: true });
    return data || [];
  } catch { return []; }
}

async function saveMedicalRecord(userId, type, title, data, fileId, analysis) {
  try {
    await supabase.from('medical_records').insert({ user_id: userId, record_type: type, title, data, file_id: fileId, ai_analysis: analysis });
  } catch (e) { console.error('saveMedRec:', e.message); }
}

async function getHistory(userId) {
  try {
    const { data } = await supabase.from('consultations').select('id,section,summary,created_at')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    return data || [];
  } catch { return []; }
}

async function savePayment(userId, provider, amount, status, txId) {
  try { await supabase.from('payments').insert({ user_id: userId, provider, amount, status, transaction_id: txId }); }
  catch (e) { console.error('savePayment:', e.message); }
}

// ═══════════════════════════════════════════════════════════════
// SESSION & HELPERS
// ═══════════════════════════════════════════════════════════════

function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = {
      section: null, messages: [], specialty: null,
      chronicDisease: null, chronicKey: null,
      diagType: null, diagSub: null,
      profileEditing: null, awaitingInput: null, msgCount: 0
    };
  }
  return sessions[userId];
}

function clearSession(userId) {
  sessions[userId] = {
    section: null, messages: [], specialty: null,
    chronicDisease: null, chronicKey: null,
    diagType: null, diagSub: null,
    profileEditing: null, awaitingInput: null, msgCount: 0
  };
}

async function sendToAI(sysPrompt, msgs, maxTokens) {
  const res = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: maxTokens || 8192,
    temperature: 0.3, system: sysPrompt, messages: msgs
  });
  return res.content[0].text;
}

async function sendToAIImg(sysPrompt, msgs, imgB64, mediaType) {
  const last = msgs[msgs.length - 1];
  const prev = msgs.slice(0, -1);
  const imgMsg = {
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imgB64 } },
      { type: 'text', text: last?.content || 'Analyze this medical image.' }
    ]
  };
  const res = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: 8192,
    temperature: 0.2, system: sysPrompt, messages: [...prev, imgMsg]
  });
  return res.content[0].text;
}

async function sendLong(chatId, text) {
  const max = 4096;
  if (text.length <= max) {
    try { await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' }); }
    catch { try { await bot.sendMessage(chatId, text); } catch (e) {
      for (let i = 0; i < text.length; i += max) await bot.sendMessage(chatId, text.substring(i, i + max));
    }}
  } else {
    const chunks = []; let rem = text;
    while (rem.length > 0) {
      if (rem.length <= max) { chunks.push(rem); break; }
      let idx = rem.lastIndexOf('\n\n', max);
      if (idx < max / 2) idx = rem.lastIndexOf('\n', max);
      if (idx < max / 2) idx = max;
      chunks.push(rem.substring(0, idx)); rem = rem.substring(idx).trim();
    }
    for (const c of chunks) {
      try { await bot.sendMessage(chatId, c, { parse_mode: 'Markdown' }); }
      catch { await bot.sendMessage(chatId, c); }
    }
  }
}

function profileCtx(p) {
  if (!p) return '';
  const a = [];
  if (p.age) a.push(`Age: ${p.age}`); if (p.gender) a.push(`Gender: ${p.gender}`);
  if (p.weight) a.push(`Weight: ${p.weight}kg`); if (p.height) a.push(`Height: ${p.height}cm`);
  if (p.blood_type) a.push(`Blood: ${p.blood_type}`); if (p.allergies) a.push(`Allergies: ${p.allergies}`);
  if (p.chronic_diseases) a.push(`Chronic: ${p.chronic_diseases}`); if (p.current_medications) a.push(`Meds: ${p.current_medications}`);
  return a.length ? '\n\nPatient profile:\n' + a.join('\n') : '';
}

function checkEmergency(text) {
  const l = text.toLowerCase();
  return ['hushimdan ketdim','nafas ololmayapman','qon ketayapti','kokrak ogrigi kuchli',
    'yuzim qiyshaydi','gapira olmayapman','zaharlandim','o\'zimni o\'ldirmoqchiman',
    'haroratim 40','haroratim 41','tutqanoq','bolam nafas olmayapti','anafilaksiya',
    'потерял сознание','не могу дышать','кровотечение','сильная боль в груди',
    'перекосило лицо','отравился','хочу покончить','температура 40','судороги',
    'lost consciousness','cannot breathe','severe bleeding','severe chest pain',
    'face drooping','poisoned','suicidal','temperature 40','seizure',
    'есімнен таныдым','тын��с ала алмаймын','ҳушёриро аз даст додам'
  ].some(p => l.includes(p));
}

function detectSpec(text) {
  const l = text.toLowerCase();
  const m = {
    cardiology: ['yurak','сердц','heart','жүрек','жүрөк','дил','qon bosim','давлен','pressure'],
    endocrinology: ['qand','diabet','сахар','sugar','diabetes','gormon','гормон','hormone','tireoid','щитовид','thyroid'],
    pulmonology: ['nafas','yo\'tal','дыхан','кашель','breath','cough','astma','астма','asthma','opka','лёгк','lung'],
    gastroenterology: ['oshqozon','ichak','ж��луд','кишеч','stomach','intestin','jigar','печен','liver'],
    neurology: ['bosh og\'rig','головн','headache','migren','мигрен','migraine','tutqanoq','судорог','seizure'],
    nephrology: ['buyrak','почк','kidney','siydik','моч','urin'],
    psychiatry: ['depressiya','депресси','depression','stress','стресс','uyqu','сон','sleep']
  };
  for (const [s, kw] of Object.entries(m)) { for (const k of kw) { if (l.includes(k)) return s; } }
  return null;
}

async function dlFile(fileId) {
  const f = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${f.file_path}`;
  return new Promise((res, rej) => {
    https.get(url, r => { const c = []; r.on('data', d => c.push(d)); r.on('end', () => res(Buffer.concat(c))); r.on('error', rej); }).on('error', rej);
  });
}

function checkLimit(user) { return user.is_premium || user.daily_count < 5; }

// ═══════════════════════════════════════════════════════════════
// CORE: startSection & endSession
// ═══════════════════════════════════════════════════════════════

async function startSection(chatId, userId, section) {
  const user = await getUser(userId);
  const lang = user?.language || 'uz';
  if (!user) return bot.sendMessage(chatId, t('error_general', lang));
  if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentKeyboard(lang));

  clearSession(userId);
  const s = getSession(userId);
  s.section = section;

  const profile = await getUserProfile(userId);
  const ctx = profileCtx(profile);
  const start = section === 'doctor'
    ? `New consultation. Patient greeting.${ctx}` : `New drug consultation.${ctx}`;
  s.messages.push({ role: 'user', content: start });

  await bot.sendMessage(chatId, t('preparing', lang));
  try {
    const prompt = section === 'doctor' ? getDoctorPrompt(lang) : getDrugPrompt(lang);
    const res = await sendToAI(prompt, s.messages);
    s.messages.push({ role: 'assistant', content: res }); s.msgCount++;
    await incrementUsage(userId, user.daily_count);
    await sendLong(chatId, res);
    await bot.sendMessage(chatId, t('type_question', lang), sessionKeyboard(section, lang));
  } catch (e) {
    console.error('startSection:', e.message);
    await bot.sendMessage(chatId, t('error_general', lang), mainMenuKeyboard(lang));
    clearSession(userId);
  }
}

async function endSession(chatId, userId) {
  const lang = await getUserLang(userId);
  const s = getSession(userId);
  if (!s.section || s.messages.length < 2) {
    clearSession(userId);
    return bot.sendMessage(chatId, t('no_active_session', lang), mainMenuKeyboard(lang));
  }
  await bot.sendMessage(chatId, t('summary_preparing', lang));
  const prompts = { doctor: getDoctorPrompt, drug: getDrugPrompt, chronic: getChronicPrompt, diagnostic: getDiagnosticPrompt };
  const fn = (prompts[s.section] || getDoctorPrompt)(lang);
  s.messages.push({ role: 'user', content: 'End consultation. Provide summary, differentials, tests, urgency, next steps, guidelines used. Translate all terms.' });
  try {
    const sum = await sendToAI(fn, s.messages);
    await saveConsultation(userId, s.section, s.messages, sum, s.specialty);
    await sendLong(chatId, sum);
    await bot.sendMessage(chatId, t('consult_ended', lang), {
      reply_markup: { inline_keyboard: [
        [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }],
        [{ text: t('btn_new_consult', lang), callback_data: 'section_doctor' }]
      ]}
    });
  } catch (e) { console.error('endSession:', e.message); await bot.sendMessage(chatId, t('error_general', lang), mainMenuKeyboard(lang)); }
  clearSession(userId);
}

// ═══════════════════════════════════════════════════════════════
// PROFILE & HISTORY
// ═══════════════════════════════════════════════════════════════

async function showProfile(chatId, userId) {
  const lang = await getUserLang(userId);
  const p = await getUserProfile(userId);
  const { data: u } = await supabase.from('users').select('first_name').eq('id', userId).single();
  const e = '❌';
  const text = `👤 *${u?.first_name || '?'}*\n\n🎂 ${p.age || e}\n⚧ ${p.gender || e}\n⚖️ ${p.weight ? p.weight + 'kg' : e}\n📏 ${p.height ? p.height + 'cm' : e}\n🩸 ${p.blood_type || e}\n⚠️ ${p.allergies || e}\n🏥 ${p.chronic_diseases || e}\n💊 ${p.current_medications || e}`;
  await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: [
      [{ text: '🎂 Age', callback_data: 'pedit_age' }, { text: '⚧ Gender', callback_data: 'pedit_gender' }],
      [{ text: '⚖️ Weight', callback_data: 'pedit_weight' }, { text: '📏 Height', callback_data: 'pedit_height' }],
      [{ text: '🩸 Blood', callback_data: 'pedit_blood' }, { text: '⚠️ Allergy', callback_data: 'pedit_allergies' }],
      [{ text: '🏥 Chronic', callback_data: 'pedit_chronic' }, { text: '💊 Meds', callback_data: 'pedit_meds' }],
      [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
    ]}
  });
}

async function showHistory(chatId, userId) {
  const lang = await getUserLang(userId);
  const h = await getHistory(userId);
  if (!h.length) return bot.sendMessage(chatId, '📊 —', mainMenuKeyboard(lang));
  const em = { doctor: '👨‍⚕️', drug: '💊', chronic: '📋', diagnostic: '🔬' };
  let txt = '📊 *History:*\n\n';
  for (const i of h) {
    const d = new Date(i.created_at).toLocaleDateString();
    txt += `${em[i.section] || '📄'} ${i.section} — ${d}\n${(i.summary || '').substring(0, 80)}...\n\n`;
  }
  await bot.sendMessage(chatId, txt, { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
}

// ═══════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════

bot.onText(/\/start/, async (msg) => {
  await getUser(msg.from.id, msg.from.first_name, msg.from.username);
  clearSession(msg.from.id);
  const lang = await getUserLang(msg.from.id);
  const wFn = T.welcome[lang] || T.welcome.uz;
  await bot.sendMessage(msg.chat.id, wFn(msg.from.first_name), { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
});

bot.onText(/\/lang/, async (msg) => {
  await getUser(msg.from.id, msg.from.first_name, msg.from.username);
  const lang = await getUserLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, t('choose_lang', lang), languageKeyboard());
});

bot.onText(/\/menu/, async (msg) => {
  clearSession(msg.from.id);
  const lang = await getUserLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, t('select_section', lang), { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
});

bot.onText(/\/doctor/, async (msg) => { await startSection(msg.chat.id, msg.from.id, 'doctor'); });
bot.onText(/\/drug/, async (msg) => { await startSection(msg.chat.id, msg.from.id, 'drug'); });

bot.onText(/\/chronic/, async (msg) => {
  clearSession(msg.from.id);
  const lang = await getUserLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, t('chronic_title', lang), { parse_mode: 'Markdown', ...chronicMenu(lang) });
});

bot.onText(/\/diagnostic/, async (msg) => {
  clearSession(msg.from.id);
  const lang = await getUserLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, t('diag_title', lang), { parse_mode: 'Markdown', ...diagnosticMenu(lang) });
});

bot.onText(/\/premium/, async (msg) => {
  const lang = await getUserLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, t('premium_info', lang), { parse_mode: 'Markdown', ...paymentKeyboard(lang) });
});

bot.onText(/\/status/, async (msg) => {
  const user = await getUser(msg.from.id, msg.from.first_name, msg.from.username);
  const lang = user?.language || 'uz';
  if (!user) return bot.sendMessage(msg.chat.id, t('error_general', lang));
  const st = user.is_premium ? '💎 Premium' : '🆓 Free';
  const cnt = user.is_premium ? '∞' : `${user.daily_count}/5`;
  const unt = user.premium_until ? new Date(user.premium_until).toLocaleDateString() : null;
  const fn = T.status_text[lang] || T.status_text.uz;
  await bot.sendMessage(msg.chat.id, fn(st, cnt, unt), { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
});

bot.onText(/\/end/, async (msg) => {
  const s = getSession(msg.from.id);
  if (s.section) await endSession(msg.chat.id, msg.from.id);
  else { const lang = await getUserLang(msg.from.id); await bot.sendMessage(msg.chat.id, t('no_active_session', lang), mainMenuKeyboard(lang)); }
});

bot.onText(/\/profile/, async (msg) => { await showProfile(msg.chat.id, msg.from.id); });
bot.onText(/\/history/, async (msg) => { await showHistory(msg.chat.id, msg.from.id); });

bot.onText(/\/help/, async (msg) => {
  const lang = await getUserLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, `ℹ️ /start /menu /doctor /drug /chronic /diagnostic /profile /history /end /premium /status /lang /help`, mainMenuKeyboard(lang));
});

// ═══════════════════════════════════════════════════════════════
// CALLBACK QUERY HANDLER — ASOSIY
// ═══════════════════════════════════════════════════════════════

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  // HAR DOIM avval user yaratamiz
  await getUser(userId, query.from.first_name, query.from.username);

  // ══ TIL TANLASH (eng birinchi) ══
  if (data === 'change_lang') {
    const lang = await getUserLang(userId);
    return bot.sendMessage(chatId, t('choose_lang', lang), languageKeyboard());
  }

  if (data.startsWith('lang_')) {
    const newLang = data.replace('lang_', '');
    const ok = await setUserLang(userId, newLang);
    if (ok) {
      await bot.sendMessage(chatId, t('lang_set', newLang));
      const wFn = T.welcome[newLang] || T.welcome.uz;
      await bot.sendMessage(chatId, wFn(query.from.first_name), { parse_mode: 'Markdown', ...mainMenuKeyboard(newLang) });
    } else {
      await bot.sendMessage(chatId, '❌ Error. Try again.', languageKeyboard());
    }
    return;
  }

  // Endi tilni olamiz
  const lang = await getUserLang(userId);

  // ══ MENYU ══
  if (data === 'main_menu' || data === 'force_main_menu') {
    if (data === 'force_main_menu') {
      const s = getSession(userId);
      if (s.section && s.messages.length > 2) await saveConsultation(userId, s.section, s.messages, null, s.specialty);
    }
    clearSession(userId);
    return bot.sendMessage(chatId, t('select_section', lang), { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
  }

  if (data === 'ignore') return;

  // ══ BO'LIMLAR ══
  if (data === 'section_doctor') return startSection(chatId, userId, 'doctor');
  if (data === 'section_drug') return startSection(chatId, userId, 'drug');
  if (data === 'section_chronic') { clearSession(userId); return bot.sendMessage(chatId, t('chronic_title', lang), { parse_mode: 'Markdown', ...chronicMenu(lang) }); }
  if (data === 'section_diagnostic') { clearSession(userId); return bot.sendMessage(chatId, t('diag_title', lang), { parse_mode: 'Markdown', ...diagnosticMenu(lang) }); }
  if (data.startsWith('end_')) return endSession(chatId, userId);

  // ══ PREMIUM & TO'LOV ══
  if (data === 'premium_menu') return bot.sendMessage(chatId, t('premium_info', lang), { parse_mode: 'Markdown', ...paymentKeyboard(lang) });

  if (data === 'pay_telegram') {
    try {
      return bot.sendInvoice(chatId, t('payment_title', lang), t('payment_desc', lang), 'premium_1month', process.env.PAYMENT_TOKEN, 'UZS', [{ label: 'Premium', amount: 4000000 }]);
    } catch { return bot.sendMessage(chatId, '💳 Telegram Pay unavailable.', paymentKeyboard(lang)); }
  }

  if (data === 'pay_payme') {
    const url = `https://checkout.paycom.uz/${Buffer.from(JSON.stringify({ m: process.env.PAYME_MERCHANT_ID || 'YOUR_ID', ac: { user_id: userId }, a: 4000000 })).toString('base64')}`;
    await savePayment(userId, 'payme', 4000000, 'pending', null);
    return bot.sendMessage(chatId, `📱 *Payme*\n💳 40,000 so'm`, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '📱 Payme', url }], [{ text: '✅ To\'ladim', callback_data: 'payconfirm_payme' }], [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]] }
    });
  }

  if (data === 'pay_click') {
    const url = `https://my.click.uz/services/pay?service_id=${process.env.CLICK_SERVICE_ID || 'ID'}&merchant_id=${process.env.CLICK_MERCHANT_ID || 'ID'}&amount=40000&transaction_param=${userId}`;
    await savePayment(userId, 'click', 4000000, 'pending', null);
    return bot.sendMessage(chatId, `📱 *Click*\n💳 40,000 so'm`, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '📱 Click', url }], [{ text: '✅ To\'ladim', callback_data: 'payconfirm_click' }], [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]] }
    });
  }

  if (data.startsWith('payconfirm_')) {
    const prov = data.includes('payme') ? 'Payme' : 'Click';
    const adminId = process.env.ADMIN_ID;
    if (adminId) {
      await bot.sendMessage(adminId, `💳 ${prov}\nUser: ${userId}\n40,000 so'm`, {
        reply_markup: { inline_keyboard: [[{ text: '✅', callback_data: `admok_${userId}` }, { text: '❌', callback_data: `admno_${userId}` }]] }
      });
    }
    return bot.sendMessage(chatId, '⏳ Tekshirilmoqda... / Checking...', mainMenuKeyboard(lang));
  }

  if (data.startsWith('admok_')) {
    const tid = parseInt(data.replace('admok_', ''));
    const until = new Date(); until.setMonth(until.getMonth() + 1);
    await supabase.from('users').update({ is_premium: true, premium_until: until.toISOString() }).eq('id', tid);
    await savePayment(tid, 'manual', 4000000, 'completed', `adm_${Date.now()}`);
    const tl = await getUserLang(tid);
    const fn = T.payment_success[tl] || T.payment_success.uz;
    await bot.sendMessage(tid, fn(until.toLocaleDateString()), mainMenuKeyboard(tl));
    return bot.sendMessage(chatId, `✅ Done: ${tid}`);
  }
  if (data.startsWith('admno_')) {
    const tid = parseInt(data.replace('admno_', ''));
    await bot.sendMessage(tid, '❌ Payment rejected. @medai_admin');
    return bot.sendMessage(chatId, `❌ Rejected: ${tid}`);
  }

  // ══ STATUS & PROFILE & HISTORY ══
  if (data === 'status_view') {
    const user = await getUser(userId);
    const st = user?.is_premium ? '💎' : '🆓'; const cnt = user?.is_premium ? '∞' : `${user?.daily_count || 0}/5`;
    const unt = user?.premium_until ? new Date(user.premium_until).toLocaleDateString() : null;
    const fn = T.status_text[lang] || T.status_text.uz;
    return bot.sendMessage(chatId, fn(st, cnt, unt), { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
  }
  if (data === 'profile_view') return showProfile(chatId, userId);
  if (data === 'history_view') return showHistory(chatId, userId);

  // ══ PROFIL TAHRIRLASH ══
  if (data.startsWith('pedit_')) {
    const f = data.replace('pedit_', '');
    const s = getSession(userId);
    if (f === 'gender') return bot.sendMessage(chatId, '⚧', { reply_markup: { inline_keyboard: [[{ text: '👨 Erkak/Male', callback_data: 'pset_g_erkak' }, { text: '👩 Ayol/Female', callback_data: 'pset_g_ayol' }]] } });
    if (f === 'blood') return bot.sendMessage(chatId, '🩸', { reply_markup: { inline_keyboard: [
      [{ text: 'O+', callback_data: 'pset_b_O+' }, { text: 'O-', callback_data: 'pset_b_O-' }],
      [{ text: 'A+', callback_data: 'pset_b_A+' }, { text: 'A-', callback_data: 'pset_b_A-' }],
      [{ text: 'B+', callback_data: 'pset_b_B+' }, { text: 'B-', callback_data: 'pset_b_B-' }],
      [{ text: 'AB+', callback_data: 'pset_b_AB+' }, { text: 'AB-', callback_data: 'pset_b_AB-' }]
    ] } });
    s.profileEditing = f; s.section = null;
    const pr = { age: '🎂 (1-150):', weight: '⚖️ (kg):', height: '📏 (cm):', allergies: '⚠️:', chronic: '🏥:', meds: '💊:' };
    return bot.sendMessage(chatId, pr[f] || 'Enter:');
  }
  if (data.startsWith('pset_g_')) { await updateUserField(userId, 'gender', data.replace('pset_g_', '')); return bot.sendMessage(chatId, '✅', mainMenuKeyboard(lang)); }
  if (data.startsWith('pset_b_')) { await updateUserField(userId, 'blood_type', data.replace('pset_b_', '')); return bot.sendMessage(chatId, '✅', mainMenuKeyboard(lang)); }

  // ══ SURUNKALI KASALLIKLAR ══
  const dMap = {
    chr_diabetes2: 'Diabetes T2', chr_diabetes1: 'Diabetes T1', chr_hypertension: 'Hypertension',
    chr_heartfailure: 'Heart Failure', chr_copd: 'COPD', chr_asthma: 'Asthma',
    chr_ckd: 'CKD', chr_ra: 'RA', chr_hypothyroid: 'Hypothyroidism',
    chr_hyperthyroid: 'Hyperthyroidism', chr_epilepsy: 'Epilepsy', chr_depression: 'Depression'
  };
  if (dMap[data]) {
    const user = await getUser(userId);
    if (!user || !checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentKeyboard(lang));
    clearSession(userId); const s = getSession(userId);
    s.section = 'chronic'; s.chronicDisease = dMap[data]; s.chronicKey = data;
    const p = await getUserProfile(userId);
    s.messages.push({ role: 'user', content: `Start monitoring ${dMap[data]}.${profileCtx(p)} Set up plan.` });
    await bot.sendMessage(chatId, t('preparing', lang));
    try {
      const r = await sendToAI(getChronicPrompt(lang), s.messages);
      s.messages.push({ role: 'assistant', content: r });
      await incrementUsage(userId, user.daily_count);
      await sendLong(chatId, r);
      await bot.sendMessage(chatId, '✅', chronicActiveKB(data, lang));
    } catch (e) { console.error(e.message); await bot.sendMessage(chatId, t('error_general', lang), mainMenuKeyboard(lang)); clearSession(userId); }
    return;
  }

  if (data.startsWith('chrlog_')) {
    const s = getSession(userId);
    if (!s.chronicDisease) return bot.sendMessage(chatId, t('error_general', lang), chronicMenu(lang));
    s.awaitingInput = 'chronic_data';
    const fn = T.chronic_enter_data[lang] || T.chronic_enter_data.uz;
    return bot.sendMessage(chatId, fn(s.chronicDisease), { parse_mode: 'Markdown' });
  }

  if (data.startsWith('chrrpt_')) {
    const s = getSession(userId);
    if (!s.chronicDisease) return;
    const user = await getUser(userId);
    if (!user || !checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang));
    const period = data.includes('weekly') ? 'weekly' : 'monthly';
    const days = period === 'weekly' ? 7 : 30;
    await bot.sendMessage(chatId, t('preparing', lang));
    const logs = await getChronicLogs(userId, s.chronicDisease, days);
    if (!logs.length) return bot.sendMessage(chatId, '📊 No data.', chronicActiveKB(s.chronicKey, lang));
    s.messages.push({ role: 'user', content: `${period} report for ${s.chronicDisease}.\nData: ${JSON.stringify(logs)}` });
    try {
      const r = await sendToAI(getChronicPrompt(lang), s.messages); s.messages.push({ role: 'assistant', content: r });
      await incrementUsage(userId, user.daily_count); await sendLong(chatId, r);
    } catch { await bot.sendMessage(chatId, t('error_general', lang)); }
    return;
  }

  // ══ DIAGNOSTIKA ══
  if (data.startsWith('diag_lab_') || data.startsWith('diag_img_')) {
    clearSession(userId); const s = getSession(userId); s.section = 'diagnostic';
    if (data.startsWith('diag_lab_')) {
      s.diagType = 'lab'; s.diagSub = data.replace('diag_lab_', ''); s.awaitingInput = 'lab_results';
      return bot.sendMessage(chatId, t('send_lab_text', lang));
    }
    s.diagType = 'imaging'; s.diagSub = data.replace('diag_img_', ''); s.awaitingInput = 'medical_image';
    return bot.sendMessage(chatId, t('send_image', lang));
  }
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT (Telegram native)
// ═══════════════════════════════════════════════════════════════

bot.on('pre_checkout_query', q => bot.answerPreCheckoutQuery(q.id, true));
bot.on('successful_payment', async (msg) => {
  const userId = msg.from.id;
  const lang = await getUserLang(userId);
  const until = new Date(); until.setMonth(until.getMonth() + 1);
  await supabase.from('users').update({ is_premium: true, premium_until: until.toISOString() }).eq('id', userId);
  await savePayment(userId, 'telegram', 4000000, 'completed', msg.successful_payment?.telegram_payment_charge_id);
  const fn = T.payment_success[lang] || T.payment_success.uz;
  await bot.sendMessage(msg.chat.id, fn(until.toLocaleDateString()), mainMenuKeyboard(lang));
});

// ═══════════════════════════════════════════════════════════════
// PHOTO HANDLER
// ═══════════════════════════════════════════════════════════════

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  const lang = user?.language || 'uz';
  const s = getSession(userId);
  if (!user) return bot.sendMessage(chatId, t('error_general', lang));
  if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentKeyboard(lang));

  if (s.section === 'diagnostic' || s.awaitingInput === 'lab_results' || s.awaitingInput === 'medical_image') {
    if (!s.section) s.section = 'diagnostic';
    await bot.sendMessage(chatId, t('image_analyzing', lang));
    try {
      const photo = msg.photo[msg.photo.length - 1];
      const buf = await dlFile(photo.file_id);
      const b64 = buf.toString('base64');
      const p = await getUserProfile(userId);
      const cap = msg.caption || '';
      const types = { xray: 'X-ray', mri: 'MRI', ct: 'CT', ultrasound: 'Ultrasound', blood: 'Blood test', urine: 'Urine test', hormone: 'Hormone test', other: 'Medical document' };
      const tn = types[s.diagSub] || 'Medical image';
      const prompt = (s.diagType === 'lab' || s.awaitingInput === 'lab_results')
        ? `This is a ${tn} sheet. Read all values, compare with ranges, analyze.${profileCtx(p)}\n${cap ? 'Note: ' + cap : ''}`
        : `Analyze this ${tn}. Identify findings, differentials.${profileCtx(p)}\n${cap ? 'Info: ' + cap : ''}`;
      const r = await sendToAIImg(getDiagnosticPrompt(lang), [{ role: 'user', content: prompt }], b64);
      await incrementUsage(userId, user.daily_count);
      await saveMedicalRecord(userId, s.diagType || 'unknown', tn, { cap, sub: s.diagSub }, photo.file_id, r);
      await sendLong(chatId, r); clearSession(userId);
      await bot.sendMessage(chatId, '—', afterDiagKB(lang));
    } catch (e) { console.error('photo:', e.message); await bot.sendMessage(chatId, t('error_general', lang)); clearSession(userId); }
    return;
  }
  await bot.sendMessage(chatId, t('diag_title', lang), { parse_mode: 'Markdown', ...diagnosticMenu(lang) });
});

// ═══════════════════════════════════════════════════════════════
// MAIN MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/') || msg.successful_payment) return;
  const chatId = msg.chat.id, userId = msg.from.id, text = msg.text.trim();
  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  const lang = user?.language || 'uz';
  const s = getSession(userId);
  if (!user) return bot.sendMessage(chatId, t('error_general', lang));

  // ── PROFIL ──
  if (s.profileEditing) {
    const f = s.profileEditing; let dbF, v;
    switch (f) {
      case 'age': { const n = parseInt(text); if (!n || n < 1 || n > 150) return bot.sendMessage(chatId, '❌ 1-150'); dbF = 'age'; v = n; break; }
      case 'weight': { const n = parseFloat(text); if (!n || n < 1) return bot.sendMessage(chatId, '❌'); dbF = 'weight'; v = n; break; }
      case 'height': { const n = parseFloat(text); if (!n || n < 30) return bot.sendMessage(chatId, '❌'); dbF = 'height'; v = n; break; }
      case 'allergies': dbF = 'allergies'; v = text; break;
      case 'chronic': dbF = 'chronic_diseases'; v = text; break;
      case 'meds': dbF = 'current_medications'; v = text; break;
      default: s.profileEditing = null; return;
    }
    await updateUserField(userId, dbF, v); s.profileEditing = null;
    return bot.sendMessage(chatId, '✅', mainMenuKeyboard(lang));
  }

  // ── CHRONIC DATA ──
  if (s.awaitingInput === 'chronic_data' && s.section === 'chronic' && s.chronicDisease) {
    if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentKeyboard(lang));
    await bot.sendMessage(chatId, t('analyzing', lang)); s.awaitingInput = null;
    const logs = await getChronicLogs(userId, s.chronicDisease, 7);
    s.messages.push({ role: 'user', content: `Disease: ${s.chronicDisease}\nToday: ${text}\n${logs.length ? 'Last 7d: ' + JSON.stringify(logs.map(l => ({ d: l.created_at, v: l.data }))) : 'First entry.'}\nAnalyze.` });
    try {
      const r = await sendToAI(getChronicPrompt(lang), s.messages.slice(-20));
      s.messages.push({ role: 'assistant', content: r });
      await incrementUsage(userId, user.daily_count);
      let al = 'normal';
      if (r.includes('🔴') || r.includes('CRITICAL')) al = 'critical';
      else if (r.includes('🟡') || r.includes('WARNING')) al = 'warning';
      await saveChronicLog(userId, s.chronicDisease, { raw: text }, r, al);
      await sendLong(chatId, r);
      await bot.sendMessage(chatId, '—', chronicActiveKB(s.chronicKey, lang));
    } catch (e) { console.error(e.message); await bot.sendMessage(chatId, t('error_general', lang)); }
    return;
  }

  // ── DIAG LAB TEXT ──
  if (s.awaitingInput === 'lab_results' && s.section === 'diagnostic') {
    if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentKeyboard(lang));
    await bot.sendMessage(chatId, t('analyzing', lang)); s.awaitingInput = null;
    const p = await getUserProfile(userId);
    try {
      const r = await sendToAI(getDiagnosticPrompt(lang), [{ role: 'user', content: `Analyze lab results:${profileCtx(p)}\n\n${text}` }]);
      await incrementUsage(userId, user.daily_count);
      await saveMedicalRecord(userId, 'lab', s.diagSub || 'lab', { raw: text }, null, r);
      await sendLong(chatId, r); clearSession(userId);
      await bot.sendMessage(chatId, '—', afterDiagKB(lang));
    } catch (e) { console.error(e.message); await bot.sendMessage(chatId, t('error_general', lang)); clearSession(userId); }
    return;
  }

  // ── IMAGE AWAITING ──
  if (s.awaitingInput === 'medical_image') {
    s.diagCaption = text;
    return bot.sendMessage(chatId, `✅ ${t('send_image', lang)}`);
  }

  // ── ACTIVE DOCTOR/DRUG ──
  if (s.section === 'doctor' || s.section === 'drug') {
    if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentKeyboard(lang));
    if (checkEmergency(text)) await bot.sendMessage(chatId, t('emergency', lang));
    if (!s.specialty) { const d = detectSpec(text); if (d) s.specialty = d; }
    s.messages.push({ role: 'user', content: text }); s.msgCount++;
    await bot.sendMessage(chatId, t('analyzing', lang));
    const fn = s.section === 'doctor' ? getDoctorPrompt : getDrugPrompt;
    try {
      const r = await sendToAI(fn(lang), s.messages.slice(-20));
      s.messages.push({ role: 'assistant', content: r });
      await incrementUsage(userId, user.daily_count);
      await sendLong(chatId, r);
      await bot.sendMessage(chatId, t('continue_or_end', lang), sessionKeyboard(s.section, lang));
    } catch (e) { console.error(e.message); await bot.sendMessage(chatId, t('error_general', lang)); }
    return;
  }

  // ── CHRONIC FREE MSG ──
  if (s.section === 'chronic' && s.chronicDisease) {
    if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentKeyboard(lang));
    s.messages.push({ role: 'user', content: text });
    await bot.sendMessage(chatId, t('analyzing', lang));
    try {
      const r = await sendToAI(getChronicPrompt(lang), s.messages.slice(-20));
      s.messages.push({ role: 'assistant', content: r });
      await incrementUsage(userId, user.daily_count); await sendLong(chatId, r);
    } catch { await bot.sendMessage(chatId, t('error_general', lang)); }
    return;
  }

  // ── DEFAULT (hech narsa tanlanmagan) ──
  if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentKeyboard(lang));
  await bot.sendMessage(chatId, t('analyzing', lang));
  try {
    const p = await getUserProfile(userId);
    const r = await sendToAI(getDrugPrompt(lang), [{ role: 'user', content: text + profileCtx(p) }]);
    await incrementUsage(userId, user.daily_count);
    await sendLong(chatId, r);
    await bot.sendMessage(chatId, t('select_section', lang), mainMenuKeyboard(lang));
  } catch (e) { console.error(e.message); await bot.sendMessage(chatId, t('error_general', lang)); }
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

bot.on('polling_error', e => console.error('Poll:', e.message));
process.on('unhandledRejection', r => console.error('Unhandled:', r));
process.on('uncaughtException', e => console.error('Uncaught:', e));

// ═══════════════════════════════════════════════════════════════
console.log('🏥 MedAI v3.1 ishga tushdi!');
console.log('🌐 Tillar: UZ, UZ-Cyr, RU, EN, KK, KY, TG');
console.log('💳 To\'lov: Telegram Pay, Payme, Click');
console.log('⏰', new Date().toLocaleString());
