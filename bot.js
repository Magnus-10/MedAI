// ═══════════════════════════════════════════════════════════════════════
// MedAI Bot v3.0 — Full Multilingual + Multi-Payment + Guideline Translation
// ═══════════════════════════════════════════════════════════════════════

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const client = new Anthropic();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const sessions = {};

// ═══════════════════════════════════════════════════════════════════════
// 1. KO'P TILLI TIZIM — 7 TA TIL
// ═══════════════════════════════════════════════════════════════════════

const LANGUAGES = {
  uz: { name: "O'zbekcha (Lotin)", flag: '🇺🇿', code: 'uz' },
  uz_cyr: { name: 'Ўзбекча (Кирил)', flag: '🇺🇿', code: 'uz_cyr' },
  ru: { name: 'Русский', flag: '🇷🇺', code: 'ru' },
  en: { name: 'English', flag: '🇬🇧', code: 'en' },
  kk: { name: 'Қазақша', flag: '🇰🇿', code: 'kk' },
  ky: { name: 'Кыргызча', flag: '🇰🇬', code: 'ky' },
  tg: { name: 'Тоҷикӣ', flag: '🇹🇯', code: 'tg' }
};

// ─────────────────────────────────────────────
// BARCHA INTERFEYS MATNLARI 7 TILDA
// ─────────────────────────────────────────────

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

    uz_cyr: (name) => `🏥 *MедАИ — Сунъий Интеллект Тиббий Маслаҳатчи*
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

    ru: (name) => `🏥 *MedAI — Медицинский ИИ-консультант*
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

👨‍⚕️ *Дәрігер кеңесшісі*
Симптомдарды талдау, дифференциалды диагноз

💊 *Дәрі-дәрмек кеңесшісі*
Дәрі ақпараты, өзара әсер, жанама әсерлер

📋 *Созылмалы аурулар мониторингі*
Диабет, гипертония, астма және басқалар

🔬 *Диагностика*
Қан, несеп, гормон талдаулары + Рентген, МРТ, КТ, УДЗ

🆓 Тегін: күніне 5 сұрақ
💎 Премиум: шексіз — 40,000 сум/ай

⚠️ _Ескерту: Мен дәрігер емеспін._`,

    ky: (name) => `🏥 *MedAI — Жасалма Интеллект Медициналык Кеңешчи*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Саламатсызбы, ${name}! 👋

Мен MedAI — Европа жана Америка медициналык колдонмолоруна негизделген ЖИ медициналык жардамчысымын.

*Менин мүмкүнчүлүктөрүм:*

👨‍⚕️ *Дарыгер кеңешчиси*
Симптомдорду талдоо, дифференциалдык диагноз

💊 *Дары кеңешчиси*
Дары маалыматтары, өз ара таасирлер

📋 *Созулма оорулар мониторинги*
Диабет, гипертония, астма жана башкалар

🔬 *Диагностика*
Кан, заара, гормон анализдери + Рентген, МРТ, КТ, УЗИ

🆓 Бекер: күнүнө 5 суроо
💎 Премиум: чексиз — 40,000 сум/ай

⚠️ _Эскертүү: Мен дарыгер эмесмин._`,

    tg: (name) => `🏥 *MedAI — Маслиҳатгари тиббии зеҳни сунъӣ*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Салом, ${name}! 👋

Ман MedAI — ёрдамчии тиббии зеҳни сунъӣ мебошам, ки ба дастурҳои тиббии Аврупо ва Амрико асос ёфтааст.

*Имкониятҳои ман:*

👨‍⚕️ *Маслиҳатгари духтур*
Таҳлили аломатҳо, ташхиси дифференсиалӣ

💊 *Маслиҳатгари дору*
Маълумот дар бораи дору, таъсири мутақобила

📋 *Мониторинги бемориҳои музмин*
Диабет, гипертония, астма ва ғайра

🔬 *Диагностика*
Таҳлили хун, пешоб, ҳормонҳо + Рентген, МРТ, КТ, УЗИ

🆓 Ройгон: 5 савол дар як рӯз
💎 Премиум: беҳад — 40,000 сум/моҳ

⚠️ _Эзоҳ: Ман духтур нестам._`
  },

  choose_lang: {
    uz: '🌐 Tilni tanlang:',
    uz_cyr: '🌐 Тилни танланг:',
    ru: '🌐 Выберите язык:',
    en: '🌐 Choose language:',
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
    uz: '👨‍⚕️ Shifokor Maslahatchisi',
    uz_cyr: '👨‍⚕️ Шифокор Маслаҳатчиси',
    ru: '👨‍⚕️ Консультант врача',
    en: '👨‍⚕️ Doctor Advisor',
    kk: '👨‍⚕️ Дәрігер кеңесшісі',
    ky: '👨‍⚕️ Дарыгер кеңешчиси',
    tg: '👨‍⚕️ Маслиҳатгари духтур'
  },

  btn_drug: {
    uz: '💊 Dori Maslahatchisi',
    uz_cyr: '💊 Дори Маслаҳатчиси',
    ru: '💊 Консультант по лекарствам',
    en: '💊 Drug Advisor',
    kk: '💊 Дәрі кеңесшісі',
    ky: '💊 Дары кеңешчиси',
    tg: '💊 Маслиҳатгари дору'
  },

  btn_chronic: {
    uz: '📋 Surunkali Kasalliklar',
    uz_cyr: '📋 Сурункали Касалликлар',
    ru: '📋 Хронические заболевания',
    en: '📋 Chronic Diseases',
    kk: '📋 Созылмалы аурулар',
    ky: '📋 Созулма оорулар',
    tg: '📋 Бемориҳои музмин'
  },

  btn_diagnostic: {
    uz: '🔬 Diagnostika',
    uz_cyr: '🔬 Диагностика',
    ru: '🔬 Диагностика',
    en: '🔬 Diagnostics',
    kk: '🔬 Диагностика',
    ky: '🔬 Диагностика',
    tg: '🔬 Диагностика'
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
    uz: '💬 Savolingizni yozing:',
    uz_cyr: '💬 Саволингизни ёзинг:',
    ru: '💬 Напишите ��аш вопрос:',
    en: '💬 Type your question:',
    kk: '💬 Сұрағыңызды жазыңыз:',
    ky: '💬 Суроонузду жазыңыз:',
    tg: '💬 Саволи худро нависед:'
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
    uz: '⏳ Xulosa tayyorlanmoqda...',
    uz_cyr: '⏳ Хулоса тайёрланмоқда...',
    ru: '⏳ Подготовка заключения...',
    en: '⏳ Preparing summary...',
    kk: '⏳ Қорытынды дайындалуда...',
    ky: '⏳ Корутунду даярдалууда...',
    tg: '⏳ Хулоса тайёр шуда истодааст...'
  },

  limit_reached: {
    uz: '❌ Kunlik bepul limitingiz tugadi (5/5).\n\n💎 Premium olish uchun /premium bosing!',
    uz_cyr: '❌ Кунлик бепул лимитингиз тугади (5/5).\n\n💎 Премиум олиш учун /premium босинг!',
    ru: '❌ Ваш бесплатный дневной лимит исчерпан (5/5).\n\n💎 Для безлимита нажмите /premium!',
    en: '❌ Your free daily limit reached (5/5).\n\n💎 For unlimited access press /premium!',
    kk: '❌ Күнделікті тегін лимит аяқталды (5/5).\n\n💎 Шексіз қолжетімділік үшін /premium басыңыз!',
    ky: '❌ Күнүмдүк бекер лимит аяктады (5/5).\n\n💎 Чексиз мүмкүнчүлүк үчүн /premium басыңыз!',
    tg: '❌ Ҳудуди ройгони рӯзонаи шумо тамом шуд (5/5).\n\n💎 Барои дастрасии беҳад /premium -ро пахш кунед!'
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
    uz: 'Faol suhbat topilmadi.',
    uz_cyr: 'Фаол суҳбат топилмади.',
    ru: 'Активная сессия не найдена.',
    en: 'No active session found.',
    kk: 'Белсенді сеанс табылмады.',
    ky: 'Активдүү сессия табылган жок.',
    tg: 'Ҷаласаи фаъол ёфт нашуд.'
  },

  select_section: {
    uz: 'Bo\'limni tanlang 👇',
    uz_cyr: 'Бўлимни танланг 👇',
    ru: 'Выберите раздел 👇',
    en: 'Select a section 👇',
    kk: 'Бөлімді таңдаңыз 👇',
    ky: 'Бөлүмдү тандаңыз 👇',
    tg: 'Бахшро интихоб кунед 👇'
  },

  payment_title: {
    uz: 'MedAI Premium — 1 oy',
    uz_cyr: 'МедАИ Премиум — 1 ой',
    ru: 'MedAI Премиум — 1 месяц',
    en: 'MedAI Premium — 1 month',
    kk: 'MedAI Премиум — 1 ай',
    ky: 'MedAI Премиум — 1 ай',
    tg: 'MedAI Премиум — 1 моҳ'
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
    uz_cyr: (until) => `✅ Тўлов муваффақиятли!\n\n💎 Премиум муддати: ${until}\nБарча бўлимларда чексиз! 🎉`,
    ru: (until) => `✅ Оплата прошла успешно!\n\n💎 Премиум до: ${until}\nБезлим��т во всех разделах! 🎉`,
    en: (until) => `✅ Payment successful!\n\n💎 Premium until: ${until}\nUnlimited in all sections! 🎉`,
    kk: (until) => `✅ Төлем сәтті!\n\n💎 Премиум мерзімі: ${until}\nБарлық бөлімдерде шексіз! 🎉`,
    ky: (until) => `✅ Төлөм ийгиликтүү!\n\n💎 Премиум мөөнөтү: ${until}\nБардык бөлүмдөрдө чексиз! 🎉`,
    tg: (until) => `✅ Пардохт муваффақ!\n\n💎 Премиум то: ${until}\nДар ҳамаи бахшҳо беҳад! 🎉`
  },

  premium_info: {
    uz: `💎 *Premium tarif:*\n\n✅ Cheksiz savollar (barcha bo'limlarda)\n✅ Tezkor javob\n✅ Batafsil klinik tahlillar\n✅ Konsultatsiya tarixini saqlash\n\n💳 Narx: 40,000 so'm/oy\n\nTo'lov usulini tanlang:`,
    uz_cyr: `💎 *Премиум тариф:*\n\n✅ Чексиз саволлар\n✅ Тезкор жавоб\n✅ Батафсил клиник таҳлиллар\n\n💳 Нарх: 40,000 сўм/ой\n\nТўл��в усулини танланг:`,
    ru: `💎 *Премиум тариф:*\n\n✅ Безлимитные вопросы (во всех разделах)\n✅ Быстрые ответы\n✅ Детальный клинический анализ\n✅ Сохранение истории\n\n💳 Цена: 40,000 сум/мес\n\nВы��ерите способ оплаты:`,
    en: `💎 *Premium Plan:*\n\n✅ Unlimited questions (all sections)\n✅ Fast responses\n✅ Detailed clinical analysis\n✅ Consultation history\n\n💳 Price: 40,000 UZS/month\n\nChoose payment method:`,
    kk: `💎 *Премиум тариф:*\n\n✅ Шексіз сұрақтар\n✅ Жылдам жауаптар\n✅ Егжей-тегжейлі талдау\n\n💳 Бағасы: 40,000 сум/ай\n\nТөлем әдісін таңдаңыз:`,
    ky: `💎 *Премиум тариф:*\n\n✅ Чексиз суроолор\n✅ Тез жооптор\n✅ Деталдуу анализ\n\n💳 Баасы: 40,000 сум/ай\n\nТөлөм ыкмасын тандаңыз:`,
    tg: `💎 *Тарифи Премиум:*\n\n✅ Саволҳои беҳад\n✅ Ҷавобҳои зуд\n✅ Таҳлили муфассали клиникӣ\n\n💳 Нарх: 40,000 сум/моҳ\n\nТарзи пардохтро интихоб кунед:`
  },

  choose_payment: {
    uz: 'To\'lov usulini tanlang:',
    uz_cyr: 'Тўлов усулини танланг:',
    ru: 'Выберите способ оплаты:',
    en: 'Choose payment method:',
    kk: 'Төлем әдісін таңдаңыз:',
    ky: 'Төлөм ыкмасын тандаңыз:',
    tg: 'Тарзи пардохтро интихоб кунед:'
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
    tg: '📋 *Бемориҳои музмин*\n\nБеморіатонро интихоб кунед:'
  },

  send_lab_text: {
    uz: 'Tahlil natijalarini matn sifatida yozing yoki 📸 rasm yuboring:',
    uz_cyr: 'Таҳлил натижаларини матн сифатида ёзинг ёки 📸 расм юборинг:',
    ru: 'Напишите результаты анализов текстом или отправьте 📸 фото:',
    en: 'Type your lab results or send a 📸 photo:',
    kk: 'Талдау нәтижелерін мәтін түрінде жазыңыз немесе 📸 сурет жіберіңіз:',
    ky: 'Анализ жыйынтыктарын жазыңыз же 📸 сүрөт жөнөтүңүз:',
    tg: 'Натиҷаҳои таҳлилро бо матн нависед ё 📸 сурат фиристед:'
  },

  send_image: {
    uz: '📸 Tibbiy tasvirni yuboring (rasm aniq bo\'lishi kerak):',
    uz_cyr: '📸 Тиббий тасвирни юборинг:',
    ru: '📸 Отправьте медицинское изображение:',
    en: '📸 Send the medical image:',
    kk: '📸 Медициналық суретті жіберіңіз:',
    ky: '📸 Медициналык сүрөттү жөнөтүңүз:',
    tg: '📸 Сурати тиббиро фиристед:'
  },

  image_analyzing: {
    uz: '⏳ Rasm tahlil qilinmoqda... Bu biroz vaqt olishi mumkin.',
    uz_cyr: '⏳ Расм таҳлил қилинмоқда...',
    ru: '⏳ Изображение анализируется... Это может занять некоторое время.',
    en: '⏳ Analyzing image... This may take a moment.',
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
    uz: (status, count, until) => `👤 *Holatingiz:*\n\nTarif: ${status}\nBugungi savollar: ${count}${until ? `\nPremium muddati: ${until}` : ''}`,
    uz_cyr: (status, count, until) => `👤 *Ҳолатингиз:*\n\nТариф: ${status}\nБугунги саволлар: ${count}${until ? `\nПремиум муддати: ${until}` : ''}`,
    ru: (status, count, until) => `👤 *Ваш статус:*\n\nТариф: ${status}\nВопросов сегодня: ${count}${until ? `\nПремиум до: ${until}` : ''}`,
    en: (status, count, until) => `👤 *Your status:*\n\nPlan: ${status}\nQuestions today: ${count}${until ? `\nPremium until: ${until}` : ''}`,
    kk: (status, count, until) => `👤 *Жағдайыңыз:*\n\nТариф: ${status}\nБүгінгі сұрақтар: ${count}${until ? `\nПремиум мерзімі: ${until}` : ''}`,
    ky: (status, count, until) => `👤 *Абалыңыз:*\n\nТариф: ${status}\nБүгүнкү суроолор: ${count}${until ? `\nПремиум мөөнөтү: ${until}` : ''}`,
    tg: (status, count, until) => `👤 *Вазъияти шумо:*\n\nТариф: ${status}\nСаволҳои имрӯза: ${count}${until ? `\nПремиум то: ${until}` : ''}`
  },

  chronic_enter_data: {
    uz: (disease) => `📝 *${disease} — Bugungi ma'lumotlar*\n\nKo'rsatkichlarni yozing:`,
    uz_cyr: (disease) => `📝 *${disease} — Бугунги маълумотлар*\n\nКўрсаткичларни ёзинг:`,
    ru: (disease) => `📝 *${disease} — Данные за сегодня*\n\nВведите показатели:`,
    en: (disease) => `📝 *${disease} — Today's data*\n\nEnter your readings:`,
    kk: (disease) => `📝 *${disease} — Бүгінгі деректер*\n\n��өрсеткіштерді жазыңыз:`,
    ky: (disease) => `📝 *${disease} — Бүгүнкү маалыматтар*\n\nКөрсөткүчтөрдү жазыңыз:`,
    tg: (disease) => `📝 *${disease} — Маълумоти имрӯза*\n\nНишондиҳандаҳоро нависед:`
  },

  emergency: {
    uz: `🚨🚨🚨 SHOSHILINCH HOLAT 🚨🚨🚨\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚡ DARHOL 103 GA QO'NG'IROQ QILING!\n\n🏥 TEZ YORDAM KELGUNCHA:\n1. Tinch bo'ling\n2. Yoningizda birovni chaqiring\n3. 103 ga qo'ng'iroq qiling\n\n⏰ HAR BIR DAQIQA MUHIM!`,
    uz_cyr: `🚨🚨🚨 ШОШИЛИНЧ ҲОЛАТ 🚨🚨🚨\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚡ ДАРҲОЛ 103 ГА ҚЎНҒИРОҚ ҚИЛИНГ!`,
    ru: `🚨🚨🚨 ЭКСТРЕННАЯ СИТУАЦИЯ 🚨🚨🚨\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚡ НЕМЕДЛЕННО ВЫЗОВИТЕ 103!\n\n🏥 ДО ПРИЕЗДА СКОРОЙ:\n1. Сохраняйте спокойствие\n2. Позовите кого-нибудь рядом\n3. Звоните 103\n\n⏰ КАЖДАЯ МИНУТА НА СЧЕТУ!`,
    en: `🚨🚨🚨 EMERGENCY 🚨🚨🚨\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚡ CALL 103 IMMEDIATELY!\n\n🏥 WHILE WAITING:\n1. Stay calm\n2. Call someone nearby\n3. Call 103\n\n⏰ EVERY MINUTE COUNTS!`,
    kk: `🚨🚨🚨 ШҰҒЫЛ ЖАҒДАЙ 🚨🚨🚨\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚡ ДЕРЕУ 103-КЕ ҚОҢЫРАУ ШАЛЫҢЫЗ!`,
    ky: `🚨🚨🚨 ШАШЫЛЫШ АБАЛ 🚨🚨🚨\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚡ ДАРОО 103-КӨ ЧАЛЫҢЫЗ!`,
    tg: `🚨🚨🚨 ҲОЛАТИ ФАВҚУЛОДДА 🚨🚨🚨\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚡ ҲОЗИР БА 103 ЗАНГ ЗАНЕД!`
  }
};

// Matn olish funksiyasi
function t(key, lang = 'uz') {
  const translation = T[key];
  if (!translation) return key;
  return translation[lang] || translation['uz'] || key;
}

// ═══════════════════════════════════════════════════════════════════════
// 2. SYSTEM PROMPTS — GUIDELINE TARJIMASI BILAN
// ═══════════════════════════════════════════════════════════════════════

function getLanguageInstruction(lang) {
  const instructions = {
    uz: `
# LANGUAGE RULES:
- Respond ENTIRELY in Uzbek (Latin script)
- Medical terms: write in Uzbek first, then English in parentheses
  Example: Yurak yetishmovchiligi (Heart Failure)
- Guideline names: keep in original English BUT add Uzbek translation/explanation
  Example: "AHA/ACC (Amerika Yurak Assotsiatsiyasi / Amerika Kardiologlar Kollejji) guideline'iga ko'ra..."
- Drug class names: Uzbek (English)
  Example: "Angiotenzin konvertaz fermenti inhibitorlari (ACE inhibitors)"
- Scoring systems: explain in Uzbek what each component means
- Clinical terms: always provide Uzbek equivalent
  Example: "Differensial diagnoz (Differential diagnosis) — farqlash kerak bo'lgan kasalliklar ro'yxati"
`,
    uz_cyr: `
# LANGUAGE RULES:
- Respond ENTIRELY in Uzbek CYRILLIC script (Ўзбек кирил ёзуви)
- Medical terms: write in Uzbek Cyrillic first, then English in parentheses
  Example: Юрак етишмовчилиги (Heart Failure)
- Guideline names: keep in original English BUT add Uzbek Cyrillic explanation
  Example: "AHA/ACC (Америка Юрак Ассоциацияси) гайдлайнига кўра..."
- All text must be in Cyrillic Uzbek script
- Drug class names: Ўзбекча (English)
  Example: "Ангиотензин конвертаз фермент ингибиторлари (ACE inhibitors)"
`,
    ru: `
# LANGUAGE RULES:
- Respond ENTIRELY in Russian (Русский язык)
- Medical terms: write in Russian first, then English in parentheses
  Example: Сердечная недостаточность (Heart Failure)
- Guideline names: keep in original English BUT add Russian translation
  Example: "Согласно рекомендациям AHA/ACC (Американская ассоциация сердца / Американский колледж кардиологии)..."
- Drug class names: Russian (English)
  Example: "Ингибиторы ангиотензинпревращающего фермента (ACE inhibitors)"
- Scoring systems: explain in Russian
- Use standard Russian medical terminology
`,
    en: `
# LANGUAGE RULES:
- Respond ENTIRELY in English
- Use standard medical terminology
- Reference guidelines by their standard abbreviations
- Provide clear, professional medical English
- Use layperson-friendly explanations alongside medical terms
  Example: "Heart Failure (a condition where the heart cannot pump blood effectively)"
`,
    kk: `
# LANGUAGE RULES:
- Respond ENTIRELY in Kazakh (Қазақ тілі, Cyrillic script)
- Medical terms: write in Kazakh first, then English in parentheses
  Example: Жүрек жеткіліксіздігі (Heart Failure)
- Guideline names: keep in original English BUT add Kazakh explanation
  Example: "AHA/ACC (Америка Жүрек Қауымдастығы) нұсқаулығына сәйкес..."
- Drug class names: Қазақша (English)
  Example: "Ангиотензин айналдырушы фермент тежегіштері (ACE inhibitors)"
- Use standard Kazakh medical terminology
- All text must be in Kazakh Cyrillic
`,
    ky: `
# LANGUAGE RULES:
- Respond ENTIRELY in Kyrgyz (Кыргыз тили, Cyrillic script)
- Medical terms: write in Kyrgyz first, then English in parentheses
  Example: Жүрөк жетишсиздиги (Heart Failure)
- Guideline names: keep in original English BUT add Kyrgyz explanation
  Example: "AHA/ACC (Америка Жүрөк Ассоциациясы) колдонмосуна ылайык..."
- Drug class names: Кыргызча (English)
  Example: "Ангиотензин айландыргыч фермент ингибиторлору (ACE inhibitors)"
- Use standard Kyrgyz medical terminology
`,
    tg: `
# LANGUAGE RULES:
- Respond ENTIRELY in Tajik (Забони тоҷикӣ, Cyrillic script)
- Medical terms: write in Tajik first, then English in parentheses
  Example: Норасоии дил (Heart Failure)
- Guideline names: keep in original English BUT add Tajik explanation
  Example: "Мувофиқи тавсияҳои AHA/ACC (Ассотсиатсияи Дили Амрико)..."
- Drug class names: Тоҷикӣ (English)
  Example: "Ингибиторҳои ферменти табдилдиҳандаи ангиотензин (ACE inhibitors)"
- Use standard Tajik medical terminology
- All text must be in Tajik Cyrillic
`
  };
  return instructions[lang] || instructions['uz'];
}

function getDoctorPrompt(lang) {
  return `
# ROLE & IDENTITY
You are MedAI Doctor Advisor — a highly advanced AI clinical decision support system providing evidence-based medical guidance strictly adhering to European and American clinical guidelines.

${getLanguageInstruction(lang)}

# GUIDELINE TRANSLATION RULES (CRITICAL):
When citing ANY guideline or clinical term, you MUST:
1. State the guideline abbreviation (e.g., AHA/ACC)
2. Provide the FULL NAME in English
3. Translate/explain the guideline's purpose in the patient's language
4. When quoting specific recommendations, translate the clinical meaning

Example for Uzbek:
"AHA/ACC (American Heart Association / American College of Cardiology — Amerika Yurak Assotsiatsiyasi) ning 2023-yilgi yurak yetishmovchiligi bo'yicha guideline'iga ko'ra, HFrEF (Heart Failure with Reduced Ejection Fraction — chiqarish fraktsiyasi pasaygan yurak yetishmovchiligi) da birinchi qator davo sifatida GDMT (Guideline-Directed Medical Therapy — guideline asosida boshqariladigan davo) tavsiya etiladi, bu quyidagilarni o'z ichiga oladi:
• RASS inhibitorlari (RAAS inhibitors — renin-angiotenzin-aldosteron tizimi inhibitorlari)
• Beta-blokerlar (Beta-blockers — yurak urish tezligini pasaytiradigan dorilar guruhi)
• MRA (Mineralocorticoid Receptor Antagonists — mineralokortikoid retseptor antagonistlari)
• SGLT2 inhibitorlari (SGLT2 inhibitors — natriy-glyukoza ko'chirish oqsili 2 inhibitorlari)"

# CRITICAL LEGAL DISCLAIMER
Include this in the patient's language at the START of every first consultation.

# CORE GUIDELINES (FULL LIST)
## Cardiology: AHA/ACC, ESC, JNC 8, CHEST
## Endocrinology: ADA, EASD, Endocrine Society, ATA/ETA, AACE
## Pulmonology: GOLD, GINA, ATS/ERS, BTS
## Gastroenterology: ACG, AGA, AASLD, EASL, Rome IV
## Nephrology: KDIGO, KDOQI
## Rheumatology: ACR, EULAR
## Neurology: AAN, EAN, ICHD-3
## Infectious: IDSA, CDC, WHO, ESCMID
## Oncology: NCCN, ESMO, ACS, ASCO
## Urology: AUA, EAU
## Dermatology: AAD, EADV, BAD
## Psychiatry: APA, NICE, WFSBP, CANMAT
## OB/GYN: ACOG, RCOG, FIGO
## Pediatrics: AAP, ESPID, ESPGHAN
## General: UpToDate, Cochrane, BMJ Best Practice, DynaMed, NICE, SIGN

# CONSULTATION METHODOLOGY

## Phase 1: COMPREHENSIVE HISTORY (SOCRATES + PMH + Meds + Allergies + FH + SH + ROS)
- Ask 1-2 questions at a time, conversationally
- Minimum 4-5 exchanges before analysis

## Phase 2: CLINICAL ANALYSIS (after sufficient data)
- Differential diagnosis with probabilities and guideline references
- Risk stratification (🔴🟡🟢)
- Clinical scoring when applicable
- "Can't miss" diagnoses

## Phase 3: GUIDELINE-BASED RECOMMENDATIONS
- Non-pharmacological
- Pharmacological (drug CLASS only, with guideline reference)
- Referral recommendations
- Follow-up plan
- Red flags

# EMERGENCY DETECTION — immediately flag life-threatening situations

# STRICT RULES:
1. NEVER prescribe specific drugs with doses
2. NEVER deviate from listed guidelines
3. ALWAYS show differential diagnosis
4. ALWAYS assign risk level
5. ALWAYS cite guidelines WITH translation
6. ALWAYS recommend doctor consultation
7. NEVER claim to be a doctor
8. ALWAYS check for emergencies
`;
}

function getDrugPrompt(lang) {
  return `
# ROLE
You are MedAI Drug Advisor — AI pharmaceutical consultation system providing evidence-based drug information per FDA, EMA, WHO standards.

${getLanguageInstruction(lang)}

# GUIDELINE TRANSLATION: Same rules as Doctor — translate all terms and guideline names.

# SOURCES: FDA, EMA, WHO Essential Medicines, BNF, Lexicomp, Micromedex, Stockley's, Beers Criteria, PharmGKB

# CAPABILITIES:
1. Drug information (MOA, pharmacokinetics)
2. Drug interactions (drug-drug, drug-food, drug-herb) with severity: 🔴🟠🟡🟢
3. Side effects (common, uncommon, serious)
4. Contraindications (absolute, relative)
5. Pregnancy/Lactation (FDA categories)
6. Geriatric/Pediatric considerations
7. Renal/Hepatic dose adjustments

# STRICT RULES:
1. NEVER prescribe — only inform
2. ALWAYS recommend doctor consultation
3. ALWAYS check interactions
4. ALWAYS ask about allergies and pregnancy
`;
}

function getChronicPrompt(lang) {
  return `
# ROLE
You are MedAI Chronic Disease Monitor — AI monitoring system for chronic diseases based on international guidelines.

${getLanguageInstruction(lang)}

# SUPPORTED: Diabetes T1/T2, Hypertension, Heart Failure, COPD, Asthma, CKD, RA, Thyroid disorders, Epilepsy, Depression

# MONITORING: Daily parameters, targets, alerts (🔴🟡🟢), trends, lifestyle advice

# GUIDELINES: ADA, AHA/ACC, ESC, GOLD, GINA, KDIGO, ACR/EULAR, ATA/ETA, ILAE, APA/NICE

# ALERT LEVELS:
🔴 CRITICAL: Immediate medical attention (call 103)
🟡 WARNING: See doctor within 24-48h
🟢 NORMAL: Continue current plan

# RULES:
1. NEVER change medication doses
2. ALWAYS flag critical values
3. ALWAYS track trends
4. Be encouraging and supportive
`;
}

function getDiagnosticPrompt(lang) {
  return `
# ROLE
You are MedAI Diagnostic Analyzer — AI system for analyzing lab results and medical images.

${getLanguageInstruction(lang)}

# GUIDELINE TRANSLATION: Translate ALL medical terms, reference ranges explanations, and diagnostic criteria names.

# CAPABILITIES:
A. LAB ANALYSIS: CBC, BMP/CMP, LFT, Lipids, Coagulation, Thyroid, Diabetes markers, Hormones, Tumor markers, Inflammatory/Autoimmune, Cardiac markers, Iron studies, Urinalysis, Vitamins
B. IMAGING: X-ray, CT, MRI, Ultrasound

# METHODOLOGY:
1. Compare each value to age/sex-specific reference range
2. Categorize severity (mild/moderate/severe)
3. Pattern recognition
4. Correlate findings
5. Suggest differential causes
6. Recommend follow-up

# REFERENCES: WHO/IFCC, Mayo Clinic Lab, Tietz, ACR Appropriateness Criteria

# RULES:
1. ALWAYS use age/sex-specific ranges
2. ALWAYS identify critical values
3. NEVER make definitive diagnosis
4. ALWAYS recommend professional interpretation
`;
}

// ═══════════════════════════════════════════════════════════════════════
// 3. KEYBOARD BUILDERS (Tilga qarab)
// ═══════════════════════════════════════════════════════════════════════

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
        [
          { text: '🇹🇯 Тоҷикӣ', callback_data: 'lang_tg' }
        ]
      ]
    }
  };
}

function mainMenuKeyboard(lang = 'uz') {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t('btn_doctor', lang), callback_data: 'section_doctor' }],
        [{ text: t('btn_drug', lang), callback_data: 'section_drug' }],
        [{ text: t('btn_chronic', lang), callback_data: 'section_chronic' }],
        [{ text: t('btn_diagnostic', lang), callback_data: 'section_diagnostic' }],
        [
          { text: t('btn_profile', lang), callback_data: 'profile_view' },
          { text: t('btn_history', lang), callback_data: 'history_view' }
        ],
        [
          { text: t('btn_premium', lang), callback_data: 'premium_menu' },
          { text: t('btn_status', lang), callback_data: 'status_view' }
        ],
        [{ text: t('btn_lang', lang), callback_data: 'change_lang' }]
      ]
    }
  };
}

function paymentMethodKeyboard(lang = 'uz') {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💳 Telegram Pay (Visa/MasterCard)', callback_data: 'pay_telegram' }],
        [{ text: '📱 Payme (Payme)', callback_data: 'pay_payme' }],
        [{ text: '📱 Click (Click)', callback_data: 'pay_click' }],
        [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
      ]
    }
  };
}

function activeSessionKeyboard(section, lang = 'uz') {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t('btn_end', lang), callback_data: `end_${section}` }],
        [{ text: t('btn_main_menu', lang), callback_data: 'force_main_menu' }]
      ]
    }
  };
}

function diagnosticSubMenu(lang = 'uz') {
  const labLabel = { uz: 'Qon', uz_cyr: 'Қон', ru: 'Кровь', en: 'Blood', kk: 'Қан', ky: 'Кан', tg: 'Хун' };
  const urineLabel = { uz: 'Siydik', uz_cyr: 'Сийдик', ru: 'Моча', en: 'Urine', kk: 'Несеп', ky: 'Заара', tg: 'Пешоб' };
  const hormoneLabel = { uz: 'Gormon', uz_cyr: 'Гормон', ru: 'Гормоны', en: 'Hormone', kk: 'Гормон', ky: 'Гормон', tg: 'Ҳормон' };
  const otherLabel = { uz: 'Boshqa', uz_cyr: 'Бошқа', ru: 'Другое', en: 'Other', kk: 'Басқа', ky: 'Башка', tg: 'Дигар' };

  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: `🩸 ${labLabel[lang] || labLabel.uz}`, callback_data: 'diag_lab_blood' },
          { text: `💧 ${urineLabel[lang] || urineLabel.uz}`, callback_data: 'diag_lab_urine' }
        ],
        [
          { text: `🧬 ${hormoneLabel[lang] || hormoneLabel.uz}`, callback_data: 'diag_lab_hormone' },
          { text: `📝 ${otherLabel[lang] || otherLabel.uz}`, callback_data: 'diag_lab_other' }
        ],
        [
          { text: '🫁 Rentgen/X-ray', callback_data: 'diag_img_xray' },
          { text: '🧲 MRT/MRI', callback_data: 'diag_img_mri' }
        ],
        [
          { text: '💻 KT/CT', callback_data: 'diag_img_ct' },
          { text: '📡 UZI/US', callback_data: 'diag_img_ultrasound' }
        ],
        [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
      ]
    }
  };
}

function chronicDiseaseMenu(lang = 'uz') {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🩸 Diabet T2', callback_data: 'chronic_diabetes2' },
          { text: '💉 Diabet T1', callback_data: 'chronic_diabetes1' }
        ],
        [
          { text: '🫀 Gipertoniya', callback_data: 'chronic_hypertension' },
          { text: '❤️ Heart Failure', callback_data: 'chronic_heartfailure' }
        ],
        [
          { text: '🫁 COPD', callback_data: 'chronic_copd' },
          { text: '🌬 Astma', callback_data: 'chronic_asthma' }
        ],
        [
          { text: '🫘 CKD', callback_data: 'chronic_ckd' },
          { text: '🦴 RA', callback_data: 'chronic_ra' }
        ],
        [
          { text: '🦋 Hypothyroid', callback_data: 'chronic_hypothyroid' },
          { text: '⚡ Hyperthyroid', callback_data: 'chronic_hyperthyroid' }
        ],
        [
          { text: '🧠 Epilepsy', callback_data: 'chronic_epilepsy' },
          { text: '😔 Depression', callback_data: 'chronic_depression' }
        ],
        [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
      ]
    }
  };
}

function chronicActiveKeyboard(diseaseKey, lang = 'uz') {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: t('log_data', lang), callback_data: `chronic_log_${diseaseKey}` }],
        [
          { text: t('weekly_report', lang), callback_data: `chronic_report_weekly_${diseaseKey}` },
          { text: t('monthly_report', lang), callback_data: `chronic_report_monthly_${diseaseKey}` }
        ],
        [{ text: t('btn_end', lang), callback_data: 'end_chronic' }],
        [{ text: t('btn_main_menu', lang), callback_data: 'force_main_menu' }]
      ]
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 4. DATABASE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

async function getUser(userId, firstName, username) {
  try {
    let { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!user) {
      await supabase.from('users').insert({ id: userId, first_name: firstName, username, language: 'uz' });
      const { data: newUser } = await supabase.from('users').select('*').eq('id', userId).single();
      user = newUser;
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
    const { data } = await supabase.from('users').select('language').eq('id', userId).single();
    return data?.language || 'uz';
  } catch { return 'uz'; }
}

async function setUserLang(userId, lang) {
  await supabase.from('users').update({ language: lang }).eq('id', userId);
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

async function incrementUsage(userId, currentCount) {
  await supabase.from('users').update({ daily_count: currentCount + 1 }).eq('id', userId);
}

async function saveConsultation(userId, section, messages, summary, specialty) {
  try {
    await supabase.from('consultations').insert({
      user_id: userId, section, status: 'completed',
      messages, summary: summary?.substring(0, 5000), specialty,
      completed_at: new Date().toISOString()
    });
  } catch (err) { console.error('saveConsultation:', err.message); }
}

async function saveChronicLog(userId, disease, data, feedback, alertLevel) {
  try {
    await supabase.from('chronic_logs').insert({
      user_id: userId, disease, data, ai_feedback: feedback, alert_level: alertLevel
    });
  } catch (err) { console.error('saveChronicLog:', err.message); }
}

async function getChronicLogs(userId, disease, days = 7) {
  try {
    const since = new Date(); since.setDate(since.getDate() - days);
    const { data } = await supabase.from('chronic_logs').select('*')
      .eq('user_id', userId).eq('disease', disease)
      .gte('created_at', since.toISOString()).order('created_at', { ascending: true });
    return data || [];
  } catch { return []; }
}

async function saveMedicalRecord(userId, type, title, data, fileId, analysis) {
  try {
    await supabase.from('medical_records').insert({
      user_id: userId, record_type: type, title, data, file_id: fileId, ai_analysis: analysis
    });
  } catch (err) { console.error('saveMedicalRecord:', err.message); }
}

async function getConsultationHistory(userId, limit = 10) {
  try {
    const { data } = await supabase.from('consultations')
      .select('id,section,summary,created_at')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    return data || [];
  } catch { return []; }
}

async function savePayment(userId, provider, amount, status, transactionId) {
  try {
    await supabase.from('payments').insert({
      user_id: userId, provider, amount, status, transaction_id: transactionId
    });
  } catch (err) { console.error('savePayment:', err.message); }
}

// ═══════════════════════════════════════════════════════════════════════
// 5. SESSION & HELPERS
// ═══════════════════════════════════════════════════════════════════════

function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = {
      section: null, messages: [], specialty: null,
      chronicDisease: null, chronicKey: null,
      diagnosticType: null, diagnosticSubType: null,
      profileEditing: null, awaitingInput: null, messageCount: 0
    };
  }
  return sessions[userId];
}

function clearSession(userId) {
  sessions[userId] = {
    section: null, messages: [], specialty: null,
    chronicDisease: null, chronicKey: null,
    diagnosticType: null, diagnosticSubType: null,
    profileEditing: null, awaitingInput: null, messageCount: 0
  };
}

async function sendToAI(systemPrompt, messages, maxTokens = 8192) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: maxTokens,
    temperature: 0.3, system: systemPrompt, messages
  });
  return response.content[0].text;
}

async function sendToAIWithImage(systemPrompt, messages, imageBase64, mediaType = 'image/jpeg') {
  const lastMsg = messages[messages.length - 1];
  const otherMsgs = messages.slice(0, -1);
  const imageMessage = {
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
      { type: 'text', text: lastMsg?.content || 'Analyze this medical image.' }
    ]
  };
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: 8192,
    temperature: 0.2, system: systemPrompt, messages: [...otherMsgs, imageMessage]
  });
  return response.content[0].text;
}

async function sendLongMessage(chatId, text) {
  const max = 4096;
  if (text.length <= max) {
    try { await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' }); }
    catch { try { await bot.sendMessage(chatId, text); } catch (e) {
      for (let i = 0; i < text.length; i += max) await bot.sendMessage(chatId, text.substring(i, i + max));
    }}
  } else {
    const chunks = [];
    let rem = text;
    while (rem.length > 0) {
      if (rem.length <= max) { chunks.push(rem); break; }
      let idx = rem.lastIndexOf('\n\n', max);
      if (idx < max / 2) idx = rem.lastIndexOf('\n', max);
      if (idx < max / 2) idx = max;
      chunks.push(rem.substring(0, idx));
      rem = rem.substring(idx).trim();
    }
    for (const c of chunks) {
      try { await bot.sendMessage(chatId, c, { parse_mode: 'Markdown' }); }
      catch { await bot.sendMessage(chatId, c); }
    }
  }
}

function buildProfileContext(profile) {
  if (!profile) return '';
  const p = [];
  if (profile.age) p.push(`Age: ${profile.age}`);
  if (profile.gender) p.push(`Gender: ${profile.gender}`);
  if (profile.weight) p.push(`Weight: ${profile.weight} kg`);
  if (profile.height) p.push(`Height: ${profile.height} cm`);
  if (profile.blood_type) p.push(`Blood type: ${profile.blood_type}`);
  if (profile.allergies) p.push(`Allergies: ${profile.allergies}`);
  if (profile.chronic_diseases) p.push(`Chronic diseases: ${profile.chronic_diseases}`);
  if (profile.current_medications) p.push(`Current medications: ${profile.current_medications}`);
  return p.length ? '\n\nPatient profile:\n' + p.join('\n') : '';
}

function checkEmergency(text) {
  const lower = text.toLowerCase();
  const phrases = [
    'hushimdan ketdim','nafas ololmayapman','qon ketayapti','kokrak ogrigi kuchli',
    'yuzim qiyshaydi','gapira olmayapman','zaharlandim','o\'zimni o\'ldirmoqchiman',
    'haroratim 40','haroratim 41','tutqanoq','bolam nafas olmayapti','anafilaksiya',
    'потерял сознание','не могу дышать','кровотечение','сильная боль в груди',
    'перекосило лицо','отравился','хочу покончить','температура 40','судороги',
    'lost consciousness','cannot breathe','severe bleeding','severe chest pain',
    'face drooping','poisoned','suicidal','temperature 40','seizure',
    'есімнен таныдым','тыныс ала алмаймын','қан кетіп жатыр',
    'ушундан кеттим','дем ала албай жатам',
    'ҳушёриро аз даст додам','нафас гирифта наметавонам'
  ];
  return phrases.some(p => lower.includes(p));
}

function detectSpecialty(text) {
  const lower = text.toLowerCase();
  const map = {
    cardiology: ['yurak','сердц','heart','жүрек','жүрөк','дил','qon bosim','давлени','pressure','ko\'krak og\'rig'],
    endocrinology: ['qand','diabet','сахар','диабет','sugar','diabetes','gormon','гормон','hormone','tireoid','щитовид','thyroid'],
    pulmonology: ['nafas','yo\'tal','дыхан','кашель','breath','cough','astma','астма','asthma','opka','лёгк','lung'],
    gastroenterology: ['oshqozon','ichak','желуд','кишеч','stomach','intestin','jigar','печен','liver'],
    neurology: ['bosh og\'rig','головн','headache','migren','мигрен','migraine','tutqanoq','судорог','seizure'],
    nephrology: ['buyrak','почк','kidney','siydik','моч','urin'],
    psychiatry: ['depressiya','депр��сси','depression','stress','стресс','uyqu','сон','sleep','тревог','anxiety']
  };
  for (const [spec, kws] of Object.entries(map)) {
    for (const kw of kws) { if (lower.includes(kw)) return spec; }
  }
  return null;
}

async function downloadFile(fileId) {
  const file = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function checkLimit(user) { return user.is_premium || user.daily_count < 5; }

// ═══════════════════════════════════════════════════════════════════════
// 6. CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

async function startSection(chatId, userId, section) {
  const user = await getUser(userId);
  const lang = user?.language || 'uz';
  if (!user) return bot.sendMessage(chatId, t('error_general', lang));
  if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentMethodKeyboard(lang));

  clearSession(userId);
  const session = getSession(userId);
  session.section = section;

  const profile = await getUserProfile(userId);
  const ctx = buildProfileContext(profile);

  const prompts = { doctor: getDoctorPrompt, drug: getDrugPrompt };
  const promptFn = prompts[section];
  if (!promptFn) return;

  const startMsg = section === 'doctor'
    ? `New consultation started. Patient greeting.${ctx}`
    : `New pharmaceutical consultation started.${ctx}`;

  session.messages.push({ role: 'user', content: startMsg });
  await bot.sendMessage(chatId, t('preparing', lang));

  try {
    const response = await sendToAI(promptFn(lang), session.messages);
    session.messages.push({ role: 'assistant', content: response });
    session.messageCount++;
    await incrementUsage(userId, user.daily_count);
    await sendLongMessage(chatId, response);
    await bot.sendMessage(chatId, t('type_question', lang), activeSessionKeyboard(section, lang));
  } catch (err) {
    console.error('startSection:', err.message);
    await bot.sendMessage(chatId, t('error_general', lang), mainMenuKeyboard(lang));
    clearSession(userId);
  }
}

async function endSession(chatId, userId) {
  const lang = await getUserLang(userId);
  const session = getSession(userId);
  if (!session.section || session.messages.length < 2) {
    clearSession(userId);
    return bot.sendMessage(chatId, t('no_active_session', lang), mainMenuKeyboard(lang));
  }

  await bot.sendMessage(chatId, t('summary_preparing', lang));

  const promptFns = { doctor: getDoctorPrompt, drug: getDrugPrompt, chronic: getChronicPrompt, diagnostic: getDiagnosticPrompt };
  const promptFn = promptFns[session.section] || getDoctorPrompt;

  session.messages.push({
    role: 'user',
    content: 'End the consultation. Provide: 1) Summary 2) Key differentials 3) Recommended tests 4) Urgency level 5) Next steps 6) Guidelines used. Translate all terms.'
  });

  try {
    const summary = await sendToAI(promptFn(lang), session.messages);
    await saveConsultation(userId, session.section, session.messages, summary, session.specialty);
    await sendLongMessage(chatId, summary);
    await bot.sendMessage(chatId, t('consult_ended', lang), {
      reply_markup: {
        inline_keyboard: [
          [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }],
          [{ text: t('btn_new_consult', lang), callback_data: 'section_doctor' }]
        ]
      }
    });
  } catch (err) {
    console.error('endSession:', err.message);
    await bot.sendMessage(chatId, t('error_general', lang), mainMenuKeyboard(lang));
  }
  clearSession(userId);
}

// ═══════════════════════════════════════════════════════════════════════
// 7. COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════════════

bot.onText(/\/start/, async (msg) => {
  await getUser(msg.from.id, msg.from.first_name, msg.from.username);
  clearSession(msg.from.id);
  const lang = await getUserLang(msg.from.id);
  const welcomeFn = T.welcome[lang] || T.welcome.uz;
  await bot.sendMessage(msg.chat.id, welcomeFn(msg.from.first_name), {
    parse_mode: 'Markdown', ...mainMenuKeyboard(lang)
  });
});

bot.onText(/\/lang/, async (msg) => {
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
  await bot.sendMessage(msg.chat.id, t('chronic_title', lang), { parse_mode: 'Markdown', ...chronicDiseaseMenu(lang) });
});

bot.onText(/\/diagnostic/, async (msg) => {
  clearSession(msg.from.id);
  const lang = await getUserLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, t('diag_title', lang), { parse_mode: 'Markdown', ...diagnosticSubMenu(lang) });
});

bot.onText(/\/premium/, async (msg) => {
  const lang = await getUserLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, t('premium_info', lang), { parse_mode: 'Markdown', ...paymentMethodKeyboard(lang) });
});

bot.onText(/\/status/, async (msg) => {
  const user = await getUser(msg.from.id, msg.from.first_name, msg.from.username);
  const lang = user?.language || 'uz';
  if (!user) return bot.sendMessage(msg.chat.id, t('error_general', lang));
  const status = user.is_premium ? '💎 Premium' : '🆓 Free';
  const count = user.is_premium ? '∞' : `${user.daily_count}/5`;
  const until = user.premium_until ? new Date(user.premium_until).toLocaleDateString() : null;
  const textFn = T.status_text[lang] || T.status_text.uz;
  await bot.sendMessage(msg.chat.id, textFn(status, count, until), { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
});

bot.onText(/\/end/, async (msg) => {
  const session = getSession(msg.from.id);
  if (session.section) { await endSession(msg.chat.id, msg.from.id); }
  else {
    const lang = await getUserLang(msg.from.id);
    await bot.sendMessage(msg.chat.id, t('no_active_session', lang), mainMenuKeyboard(lang));
  }
});

bot.onText(/\/profile/, async (msg) => { await showProfile(msg.chat.id, msg.from.id); });
bot.onText(/\/history/, async (msg) => { await showHistory(msg.chat.id, msg.from.id); });

async function showProfile(chatId, userId) {
  const lang = await getUserLang(userId);
  const p = await getUserProfile(userId);
  const { data: u } = await supabase.from('users').select('first_name').eq('id', userId).single();
  const labels = {
    uz: { name: 'Ism', age: 'Yosh', gender: 'Jins', weight: 'Vazn', height: "Bo'y", blood: 'Qon guruhi', allergy: 'Allergiya', chronic: 'Surunkali', meds: 'Dorilar', empty: 'Kiritilmagan', edit: 'Tahrirlash' },
    ru: { name: 'Имя', age: 'Возраст', gender: 'Пол', weight: 'Вес', height: 'Рост', blood: 'Группа крови', allergy: 'Аллергии', chronic: 'Хронические', meds: 'Лекарства', empty: 'Не указано', edit: 'Редактировать' },
    en: { name: 'Name', age: 'Age', gender: 'Gender', weight: 'Weight', height: 'Height', blood: 'Blood type', allergy: 'Allergies', chronic: 'Chronic', meds: 'Medications', empty: 'Not set', edit: 'Edit' }
  };
  const l = labels[lang] || labels[lang === 'uz_cyr' ? 'ru' : 'uz'] || labels.uz;
  const e = `❌ ${l.empty}`;
  const text = `👤 *${l.name}:* ${u?.first_name || '?'}
🎂 *${l.age}:* ${p.age || e}
⚧ *${l.gender}:* ${p.gender || e}
⚖️ *${l.weight}:* ${p.weight ? p.weight + ' kg' : e}
📏 *${l.height}:* ${p.height ? p.height + ' cm' : e}
🩸 *${l.blood}:* ${p.blood_type || e}
⚠️ *${l.allergy}:* ${p.allergies || e}
🏥 *${l.chronic}:* ${p.chronic_diseases || e}
💊 *${l.meds}:* ${p.current_medications || e}`;

  await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: `🎂 ${l.age}`, callback_data: 'profile_edit_age' }, { text: `⚧ ${l.gender}`, callback_data: 'profile_edit_gender' }],
        [{ text: `⚖️ ${l.weight}`, callback_data: 'profile_edit_weight' }, { text: `📏 ${l.height}`, callback_data: 'profile_edit_height' }],
        [{ text: `🩸 ${l.blood}`, callback_data: 'profile_edit_blood' }, { text: `⚠️ ${l.allergy}`, callback_data: 'profile_edit_allergies' }],
        [{ text: `🏥 ${l.chronic}`, callback_data: 'profile_edit_chronic' }, { text: `💊 ${l.meds}`, callback_data: 'profile_edit_meds' }],
        [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
      ]
    }
  });
}

async function showHistory(chatId, userId) {
  const lang = await getUserLang(userId);
  const history = await getConsultationHistory(userId);
  if (!history.length) return bot.sendMessage(chatId, '📊 —', mainMenuKeyboard(lang));
  const emojis = { doctor: '👨‍⚕️', drug: '💊', chronic: '📋', diagnostic: '🔬' };
  let text = '📊 *History:*\n\n';
  for (const h of history) {
    const d = new Date(h.created_at).toLocaleDateString();
    text += `${emojis[h.section] || '📄'} ${h.section} — ${d}\n${(h.summary || '').substring(0, 80)}...\n\n`;
  }
  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
}

// ═══════════════════════════════════════════════════════════════════════
// 8. CALLBACK QUERY HANDLER
// ═══════════════════════════════════════════════════════════════════════

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;
  await bot.answerCallbackQuery(query.id);
  const lang = await getUserLang(userId);

  // ── Til tanlash ──
  if (data.startsWith('lang_')) {
    const newLang = data.replace('lang_', '');
    await setUserLang(userId, newLang);
    await bot.sendMessage(chatId, t('lang_set', newLang), mainMenuKeyboard(newLang));
    return;
  }

  if (data === 'change_lang') return bot.sendMessage(chatId, t('choose_lang', lang), languageKeyboard());
  if (data === 'main_menu' || data === 'force_main_menu') {
    if (data === 'force_main_menu') {
      const s = getSession(userId);
      if (s.section && s.messages.length > 2) await saveConsultation(userId, s.section, s.messages, null, s.specialty);
    }
    clearSession(userId);
    return bot.sendMessage(chatId, t('select_section', lang), { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
  }
  if (data === 'ignore') return;

  // ── Bo'limlar ──
  if (data === 'section_doctor') return startSection(chatId, userId, 'doctor');
  if (data === 'section_drug') return startSection(chatId, userId, 'drug');
  if (data === 'section_chronic') {
    clearSession(userId);
    return bot.sendMessage(chatId, t('chronic_title', lang), { parse_mode: 'Markdown', ...chronicDiseaseMenu(lang) });
  }
  if (data === 'section_diagnostic') {
    clearSession(userId);
    return bot.sendMessage(chatId, t('diag_title', lang), { parse_mode: 'Markdown', ...diagnosticSubMenu(lang) });
  }
  if (data.startsWith('end_')) return endSession(chatId, userId);

  // ── Premium & Payment ──
  if (data === 'premium_menu') {
    return bot.sendMessage(chatId, t('premium_info', lang), { parse_mode: 'Markdown', ...paymentMethodKeyboard(lang) });
  }

  if (data === 'pay_telegram') {
    try {
      return bot.sendInvoice(chatId, t('payment_title', lang), t('payment_desc', lang),
        'premium_1month', process.env.PAYMENT_TOKEN, 'UZS',
        [{ label: 'Premium 1 month', amount: 4000000 }]);
    } catch { return bot.sendMessage(chatId, '💳 Telegram Pay unavailable. Try Payme or Click.', paymentMethodKeyboard(lang)); }
  }

  if (data === 'pay_payme') {
    const paymeUrl = `https://checkout.paycom.uz/${Buffer.from(JSON.stringify({
      m: process.env.PAYME_MERCHANT_ID || 'YOUR_MERCHANT_ID',
      ac: { user_id: userId },
      a: 4000000,
      c: `https://t.me/${(await bot.getMe()).username}`
    })).toString('base64')}`;

    await savePayment(userId, 'payme', 4000000, 'pending', null);
    return bot.sendMessage(chatId,
      `📱 *Payme orqali to'lash:*\n\n💳 Summa: 40,000 so'm\n\nQuyidagi tugmani bosing:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Payme da to\'lash', url: paymeUrl }],
            [{ text: '✅ To\'ladim', callback_data: 'payment_confirm_payme' }],
            [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
          ]
        }
      }
    );
  }

  if (data === 'pay_click') {
    const clickUrl = `https://my.click.uz/services/pay?service_id=${process.env.CLICK_SERVICE_ID || 'YOUR_SERVICE_ID'}&merchant_id=${process.env.CLICK_MERCHANT_ID || 'YOUR_MERCHANT_ID'}&amount=40000&transaction_param=${userId}`;

    await savePayment(userId, 'click', 4000000, 'pending', null);
    return bot.sendMessage(chatId,
      `📱 *Click orqali to'lash:*\n\n💳 Summa: 40,000 so'm\n\nQuyidagi tugmani bosing:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Click da to\'lash', url: clickUrl }],
            [{ text: '✅ To\'ladim', callback_data: 'payment_confirm_click' }],
            [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
          ]
        }
      }
    );
  }

  if (data === 'payment_confirm_payme' || data === 'payment_confirm_click') {
    const provider = data.includes('payme') ? 'Payme' : 'Click';
    // TODO: Bu yerda haqiqiy to'lovni tekshirish kerak (Payme/Click API webhook orqali)
    // Hozircha admin tasdiqlashi uchun xabar
    const adminId = process.env.ADMIN_ID;
    if (adminId) {
      await bot.sendMessage(adminId,
        `💳 TO'LOV TASDIQLASH:\n\nUser ID: ${userId}\nProvider: ${provider}\nSumma: 40,000\n\nTasdiqlash:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Tasdiqlash', callback_data: `admin_confirm_${userId}` }],
              [{ text: '❌ Rad etish', callback_data: `admin_reject_${userId}` }]
            ]
          }
        }
      );
    }
    return bot.sendMessage(chatId,
      `⏳ To'lovingiz tekshirilmoqda...\n\n${provider} orqali to'lov qilgan bo'lsangiz, tez orada Premium faollashtiriladi.\n\nAdmin bilan bog'lanish: @medai_admin`,
      mainMenuKeyboard(lang));
  }

  // Admin to'lovni tasdiqlash
  if (data.startsWith('admin_confirm_')) {
    const targetUserId = parseInt(data.replace('admin_confirm_', ''));
    const premiumUntil = new Date();
    premiumUntil.setMonth(premiumUntil.getMonth() + 1);
    await supabase.from('users').update({ is_premium: true, premium_until: premiumUntil.toISOString() }).eq('id', targetUserId);
    await savePayment(targetUserId, 'manual', 4000000, 'completed', `admin_${Date.now()}`);
    const targetLang = await getUserLang(targetUserId);
    const untilStr = premiumUntil.toLocaleDateString();
    const successFn = T.payment_success[targetLang] || T.payment_success.uz;
    await bot.sendMessage(targetUserId, successFn(untilStr), mainMenuKeyboard(targetLang));
    await bot.sendMessage(query.message.chat.id, `✅ Premium faollashtirildi: ${targetUserId}`);
    return;
  }

  if (data.startsWith('admin_reject_')) {
    const targetUserId = parseInt(data.replace('admin_reject_', ''));
    await bot.sendMessage(targetUserId, '❌ To\'lov tasdiqlanmadi. Admin bilan bog\'laning: @medai_admin');
    await bot.sendMessage(query.message.chat.id, `❌ Rad etildi: ${targetUserId}`);
    return;
  }

  if (data === 'status_view') {
    const user = await getUser(userId);
    const status = user?.is_premium ? '💎 Premium' : '🆓 Free';
    const count = user?.is_premium ? '∞' : `${user?.daily_count || 0}/5`;
    const until = user?.premium_until ? new Date(user.premium_until).toLocaleDateString() : null;
    const textFn = T.status_text[lang] || T.status_text.uz;
    return bot.sendMessage(chatId, textFn(status, count, until), { parse_mode: 'Markdown', ...mainMenuKeyboard(lang) });
  }

  if (data === 'profile_view') return showProfile(chatId, userId);
  if (data === 'history_view') return showHistory(chatId, userId);

  // ── Profil tahrirlash ──
  if (data.startsWith('profile_edit_')) {
    const field = data.replace('profile_edit_', '');
    const session = getSession(userId);

    if (field === 'gender') {
      return bot.sendMessage(chatId, '⚧', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '👨 Erkak/Male/Мужской', callback_data: 'pset_gender_erkak' },
             { text: '👩 Ayol/Female/Женский', callback_data: 'pset_gender_ayol' }]
          ]
        }
      });
    }
    if (field === 'blood') {
      return bot.sendMessage(chatId, '🩸', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'I(O)+', callback_data: 'pset_blood_O+' }, { text: 'I(O)-', callback_data: 'pset_blood_O-' }],
            [{ text: 'II(A)+', callback_data: 'pset_blood_A+' }, { text: 'II(A)-', callback_data: 'pset_blood_A-' }],
            [{ text: 'III(B)+', callback_data: 'pset_blood_B+' }, { text: 'III(B)-', callback_data: 'pset_blood_B-' }],
            [{ text: 'IV(AB)+', callback_data: 'pset_blood_AB+' }, { text: 'IV(AB)-', callback_data: 'pset_blood_AB-' }]
          ]
        }
      });
    }

    session.profileEditing = field;
    session.section = null;
    const prompts = {
      age: '🎂 Age/Yosh (1-150):', weight: '⚖️ Weight/Vazn (kg):', height: '📏 Height/Bo\'y (cm):',
      allergies: '⚠️ Allergies:', chronic: '🏥 Chronic diseases:', meds: '💊 Medications:'
    };
    return bot.sendMessage(chatId, prompts[field] || 'Enter value:');
  }

  if (data.startsWith('pset_gender_')) {
    const v = data.replace('pset_gender_', '');
    await updateUserField(userId, 'gender', v);
    return bot.sendMessage(chatId, `✅ ${v}`, mainMenuKeyboard(lang));
  }
  if (data.startsWith('pset_blood_')) {
    const v = data.replace('pset_blood_', '');
    await updateUserField(userId, 'blood_type', v);
    return bot.sendMessage(chatId, `✅ ${v}`, mainMenuKeyboard(lang));
  }

  // ── Surunkali kasalliklar ──
  const diseaseMap = {
    chronic_diabetes2: 'Diabetes mellitus Type 2', chronic_diabetes1: 'Diabetes mellitus Type 1',
    chronic_hypertension: 'Hypertension', chronic_heartfailure: 'Heart Failure',
    chronic_copd: 'COPD', chronic_asthma: 'Bronchial Asthma',
    chronic_ckd: 'Chronic Kidney Disease', chronic_ra: 'Rheumatoid Arthritis',
    chronic_hypothyroid: 'Hypothyroidism', chronic_hyperthyroid: 'Hyperthyroidism',
    chronic_epilepsy: 'Epilepsy', chronic_depression: 'Depression'
  };

  if (diseaseMap[data]) {
    const user = await getUser(userId);
    if (!user || !checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang));

    clearSession(userId);
    const s = getSession(userId);
    s.section = 'chronic'; s.chronicDisease = diseaseMap[data]; s.chronicKey = data;

    const profile = await getUserProfile(userId);
    s.messages.push({
      role: 'user',
      content: `Patient starts monitoring for ${diseaseMap[data]}.${buildProfileContext(profile)}\n\nSet up monitoring plan: daily parameters, targets, alert thresholds, schedule, lifestyle advice.`
    });

    await bot.sendMessage(chatId, t('preparing', lang));
    try {
      const response = await sendToAI(getChronicPrompt(lang), s.messages);
      s.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);
      await sendLongMessage(chatId, response);
      await bot.sendMessage(chatId, '✅', chronicActiveKeyboard(data, lang));
    } catch (err) {
      console.error('chronic start:', err.message);
      await bot.sendMessage(chatId, t('error_general', lang), mainMenuKeyboard(lang));
      clearSession(userId);
    }
    return;
  }

  // Chronic log
  if (data.startsWith('chronic_log_')) {
    const s = getSession(userId);
    if (!s.chronicDisease) return bot.sendMessage(chatId, t('error_general', lang), chronicDiseaseMenu(lang));
    s.awaitingInput = 'chronic_data';
    const enterFn = T.chronic_enter_data[lang] || T.chronic_enter_data.uz;
    return bot.sendMessage(chatId, enterFn(s.chronicDisease), { parse_mode: 'Markdown' });
  }

  // Chronic report
  if (data.startsWith('chronic_report_')) {
    const s = getSession(userId);
    if (!s.chronicDisease) return;
    const user = await getUser(userId);
    if (!user || !checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang));
    const parts = data.split('_');
    const period = parts[2];
    const days = period === 'weekly' ? 7 : 30;
    await bot.sendMessage(chatId, t('preparing', lang));
    const logs = await getChronicLogs(userId, s.chronicDisease, days);
    if (!logs.length) return bot.sendMessage(chatId, '📊 No data yet.', chronicActiveKeyboard(s.chronicKey, lang));
    s.messages.push({ role: 'user', content: `Generate ${period} report for ${s.chronicDisease}.\n\nData:\n${JSON.stringify(logs)}` });
    try {
      const response = await sendToAI(getChronicPrompt(lang), s.messages);
      s.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);
      await sendLongMessage(chatId, response);
    } catch { await bot.sendMessage(chatId, t('error_general', lang)); }
    return;
  }

  // ── Diagnostika ──
  if (data.startsWith('diag_lab_') || data.startsWith('diag_img_')) {
    clearSession(userId);
    const s = getSession(userId);
    s.section = 'diagnostic';

    if (data.startsWith('diag_lab_')) {
      s.diagnosticType = 'lab'; s.diagnosticSubType = data.replace('diag_lab_', '');
      s.awaitingInput = 'lab_results';
      return bot.sendMessage(chatId, t('send_lab_text', lang));
    }
    if (data.startsWith('diag_img_')) {
      s.diagnosticType = 'imaging'; s.diagnosticSubType = data.replace('diag_img_', '');
      s.awaitingInput = 'medical_image';
      return bot.sendMessage(chatId, t('send_image', lang));
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════
// 9. PAYMENT HANDLERS (Telegram native)
// ═══════════════════════════════════════════════════════════════════════

bot.on('pre_checkout_query', q => bot.answerPreCheckoutQuery(q.id, true));

bot.on('successful_payment', async (msg) => {
  const userId = msg.from.id;
  const lang = await getUserLang(userId);
  const until = new Date();
  until.setMonth(until.getMonth() + 1);
  await supabase.from('users').update({ is_premium: true, premium_until: until.toISOString() }).eq('id', userId);
  await savePayment(userId, 'telegram', 4000000, 'completed', msg.successful_payment.telegram_payment_charge_id);
  const fn = T.payment_success[lang] || T.payment_success.uz;
  await bot.sendMessage(msg.chat.id, fn(until.toLocaleDateString()), mainMenuKeyboard(lang));
});

// ═══════════════════════════════════════════════════════════════════════
// 10. PHOTO HANDLER
// ═══════════════════════════════════════════════════════════════════════

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  const lang = user?.language || 'uz';
  const session = getSession(userId);

  if (!user) return bot.sendMessage(chatId, t('error_general', lang));
  if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang));

  if (session.section === 'diagnostic' || session.awaitingInput === 'lab_results' || session.awaitingInput === 'medical_image') {
    if (!session.section) session.section = 'diagnostic';
    await bot.sendMessage(chatId, t('image_analyzing', lang));

    try {
      const photo = msg.photo[msg.photo.length - 1];
      const buf = await downloadFile(photo.file_id);
      const b64 = buf.toString('base64');
      const profile = await getUserProfile(userId);
      const caption = msg.caption || '';

      const typeNames = { xray: 'X-ray', mri: 'MRI', ct: 'CT Scan', ultrasound: 'Ultrasound', blood: 'Blood test', urine: 'Urine test', hormone: 'Hormone test', other: 'Medical document' };
      const typeName = typeNames[session.diagnosticSubType] || 'Medical image';

      const promptText = session.diagnosticType === 'lab' || session.awaitingInput === 'lab_results'
        ? `This is a ${typeName} result sheet. Read all values, compare with normal ranges, provide detailed analysis.${buildProfileContext(profile)}\n${caption ? 'Patient note: ' + caption : ''}`
        : `Analyze this ${typeName}. Identify anatomy, normal/abnormal findings, differentials.${buildProfileContext(profile)}\n${caption ? 'Clinical info: ' + caption : ''}`;

      const messages = [{ role: 'user', content: promptText }];
      const response = await sendToAIWithImage(getDiagnosticPrompt(lang), messages, b64);
      await incrementUsage(userId, user.daily_count);
      await saveMedicalRecord(userId, session.diagnosticType || 'unknown', typeName, { caption, subType: session.diagnosticSubType }, photo.file_id, response);
      await sendLongMessage(chatId, response);
      clearSession(userId);

      await bot.sendMessage(chatId, '—', {
        reply_markup: {
          inline_keyboard: [
            [{ text: t('again_analyze', lang), callback_data: 'section_diagnostic' }],
            [{ text: t('ask_doctor', lang), callback_data: 'section_doctor' }],
            [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
          ]
        }
      });
    } catch (err) {
      console.error('photo analysis:', err.message);
      await bot.sendMessage(chatId, t('error_general', lang));
      clearSession(userId);
    }
    return;
  }

  await bot.sendMessage(chatId, t('diag_title', lang), { parse_mode: 'Markdown', ...diagnosticSubMenu(lang) });
});

// ═══════════════════════════════════════════════════════════════════════
// 11. MAIN MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/') || msg.successful_payment) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text.trim();
  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  const lang = user?.language || 'uz';
  const session = getSession(userId);

  if (!user) return bot.sendMessage(chatId, t('error_general', lang));

  // ── Profil tahrirlash ──
  if (session.profileEditing) {
    const f = session.profileEditing;
    let dbField, val;
    switch (f) {
      case 'age': { const v = parseInt(text); if (!v || v < 1 || v > 150) return bot.sendMessage(chatId, '❌ 1-150'); dbField = 'age'; val = v; break; }
      case 'weight': { const v = parseFloat(text); if (!v || v < 1 || v > 500) return bot.sendMessage(chatId, '❌'); dbField = 'weight'; val = v; break; }
      case 'height': { const v = parseFloat(text); if (!v || v < 30 || v > 300) return bot.sendMessage(chatId, '❌'); dbField = 'height'; val = v; break; }
      case 'allergies': dbField = 'allergies'; val = text; break;
      case 'chronic': dbField = 'chronic_diseases'; val = text; break;
      case 'meds': dbField = 'current_medications'; val = text; break;
      default: session.profileEditing = null; return;
    }
    await updateUserField(userId, dbField, val);
    session.profileEditing = null;
    return bot.sendMessage(chatId, `✅ Saved!`, mainMenuKeyboard(lang));
  }

  // ── Chronic data input ──
  if (session.awaitingInput === 'chronic_data' && session.section === 'chronic' && session.chronicDisease) {
    if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang));
    await bot.sendMessage(chatId, t('analyzing', lang));
    session.awaitingInput = null;
    const logs = await getChronicLogs(userId, session.chronicDisease, 7);
    session.messages.push({
      role: 'user',
      content: `Disease: ${session.chronicDisease}\n\nToday's data:\n${text}\n\n${logs.length ? 'Last 7 days:\n' + JSON.stringify(logs.map(l => ({ date: l.created_at, data: l.data }))) : 'First entry.'}\n\nAnalyze: normal/abnormal, trends, alerts, recommendations.`
    });

    try {
      const response = await sendToAI(getChronicPrompt(lang), session.messages.slice(-20));
      session.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);
      let al = 'normal';
      if (response.includes('🔴') || response.includes('CRITICAL')) al = 'critical';
      else if (response.includes('🟡') || response.includes('WARNING')) al = 'warning';
      await saveChronicLog(userId, session.chronicDisease, { raw: text }, response, al);
      await sendLongMessage(chatId, response);
      await bot.sendMessage(chatId, '—', chronicActiveKeyboard(session.chronicKey, lang));
    } catch (err) { console.error(err.message); await bot.sendMessage(chatId, t('error_general', lang)); }
    return;
  }

  // ── Diagnostika lab text ──
  if (session.awaitingInput === 'lab_results' && session.section === 'diagnostic') {
    if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang));
    await bot.sendMessage(chatId, t('analyzing', lang));
    session.awaitingInput = null;
    const profile = await getUserProfile(userId);
    const messages = [{ role: 'user', content: `Analyze these lab results:${buildProfileContext(profile)}\n\nRESULTS:\n${text}` }];

    try {
      const response = await sendToAI(getDiagnosticPrompt(lang), messages);
      await incrementUsage(userId, user.daily_count);
      await saveMedicalRecord(userId, 'lab', session.diagnosticSubType || 'lab', { raw: text }, null, response);
      await sendLongMessage(chatId, response);
      clearSession(userId);
      await bot.sendMessage(chatId, '—', {
        reply_markup: {
          inline_keyboard: [
            [{ text: t('again_analyze', lang), callback_data: 'section_diagnostic' }],
            [{ text: t('ask_doctor', lang), callback_data: 'section_doctor' }],
            [{ text: t('btn_main_menu', lang), callback_data: 'main_menu' }]
          ]
        }
      });
    } catch (err) { console.error(err.message); await bot.sendMessage(chatId, t('error_general', lang)); clearSession(userId); }
    return;
  }

  // ── Image awaiting (text came instead) ──
  if (session.awaitingInput === 'medical_image') {
    session.diagnosticCaption = text;
    return bot.sendMessage(chatId, `✅ ${t('send_image', lang)}`);
  }

  // ── Active doctor/drug session ──
  if (session.section === 'doctor' || session.section === 'drug') {
    if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentMethodKeyboard(lang));

    if (checkEmergency(text)) await bot.sendMessage(chatId, t('emergency', lang));

    if (!session.specialty) {
      const det = detectSpecialty(text);
      if (det) session.specialty = det;
    }

    session.messages.push({ role: 'user', content: text });
    session.messageCount++;
    await bot.sendMessage(chatId, t('analyzing', lang));

    const promptFns = { doctor: getDoctorPrompt, drug: getDrugPrompt };
    try {
      const response = await sendToAI(promptFns[session.section](lang), session.messages.slice(-20));
      session.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);
      await sendLongMessage(chatId, response);
      await bot.sendMessage(chatId, t('continue_or_end', lang), activeSessionKeyboard(session.section, lang));
    } catch (err) { console.error(err.message); await bot.sendMessage(chatId, t('error_general', lang)); }
    return;
  }

  // ── Chronic free message ──
  if (session.section === 'chronic' && session.chronicDisease) {
    if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang));
    session.messages.push({ role: 'user', content: text });
    await bot.sendMessage(chatId, t('analyzing', lang));
    try {
      const response = await sendToAI(getChronicPrompt(lang), session.messages.slice(-20));
      session.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);
      await sendLongMessage(chatId, response);
    } catch { await bot.sendMessage(chatId, t('error_general', lang)); }
    return;
  }

  // ── No section — default drug advisor ──
  if (!checkLimit(user)) return bot.sendMessage(chatId, t('limit_reached', lang), paymentMethodKeyboard(lang));
  await bot.sendMessage(chatId, t('analyzing', lang));
  try {
    const profile = await getUserProfile(userId);
    const response = await sendToAI(getDrugPrompt(lang), [{ role: 'user', content: text + buildProfileContext(profile) }]);
    await incrementUsage(userId, user.daily_count);
    await sendLongMessage(chatId, response);
    await bot.sendMessage(chatId, t('select_section', lang), mainMenuKeyboard(lang));
  } catch (err) { console.error(err.message); await bot.sendMessage(chatId, t('error_general', lang)); }
});

// ═══════════════════════════════════════════════════════════════════════
// 12. ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════

bot.on('polling_error', e => console.error('Polling:', e.message));
process.on('unhandledRejection', r => console.error('Unhandled:', r));
process.on('uncaughtException', e => console.error('Uncaught:', e));

console.log('🏥 MedAI v3.0 — Multilingual + Multi-Payment');
console.log('🌐 Languages: UZ, UZ-Cyr, RU, EN, KK, KY, TG');
console.log('💳 Payments: Telegram Pay, Payme, Click');
console.log('⏰', new Date().toLocaleString());
