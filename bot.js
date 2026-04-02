// ═══════════════════════════════════════════════════════════════
// MedAI Bot v3.2 — GUIDELINE TARJIMASI TUZATILGAN
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const client = new Anthropic();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const sessions = {};

// ═══════════════════════════════════════════════════════════════
// TILLAR
// ═══════════════════════════════════════════════════════════════

const T = {

  welcome: {
    uz: (name) => `🏥 *MedAI — Sun'iy Intellekt Tibbiy Maslahatchi*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Assalomu alaykum, ${name}! 👋

Men MedAI — Yevropa va Amerika tibbiyot guideline'lariga asoslangan sun'iy intellekt tibbiy yordamchisiman.

👨‍⚕️ *Shifokor Maslahatchisi* — Simptomlarni tahlil, differensial diagnoz
💊 *Dori Maslahatchisi* — Dori ma'lumotlari, o'zaro ta'sir
📋 *Surunkali Kasalliklar* — Diabet, gipertoniya, astma monitoring
🔬 *Diagnostika* — Tahlillar + Rentgen, MRT, KT, UZI

🆓 Bepul: kuniga 5 ta savol | 💎 Premium: cheksiz — 40,000 so'm/oy

⚠️ _Men shifokor emasman. Tavsiyalarim yo'naltiruvchi xarakterga ega._`,

    uz_cyr: (name) => `🏥 *МедАИ — Сунъий Интеллект Тиббий Маслаҳатчи*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Ассалому алайкум, ${name}! 👋

Мен МедАИ — Европа ва Америка тиббиёт гайдлайнларига асосланган тиббий ёрдамчиман.

👨‍⚕️ *Шифокор Маслаҳатчиси* 💊 *Дори Маслаҳатчиси*
📋 *Сурункали Касалликлар* 🔬 *Диагностика*

🆓 Бепул: кунига 5 та савол | 💎 Премиум: чексиз

⚠️ _Мен шифокор эмасман._`,

    ru: (name) => `🏥 *MedAI — Медицинский ИИ-консультант*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Здравствуйте, ${name}! 👋

Я MedAI — медицинский ИИ-помощник на основе европейских и американских клинических рекомендаций.

👨‍⚕️ *Консультант врача* 💊 *Консультант по лекарствам*
📋 *Хронические заболевания* 🔬 *Диагностика*

🆓 Бесплатно: 5 вопросов/день | 💎 Премиум: безлимит — 40,000 сум/мес

⚠️ _Я не врач. Мои рекомендации носят ознакомительный характер._`,

    en: (name) => `🏥 *MedAI — AI Medical Consultant*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello, ${name}! 👋

I'm MedAI — an AI medical assistant based on European and American clinical guidelines.

👨‍⚕️ *Doctor Advisor* 💊 *Drug Advisor*
📋 *Chronic Disease Monitor* 🔬 *Diagnostics*

🆓 Free: 5 questions/day | 💎 Premium: unlimited — 40,000 UZS/month

⚠️ _I am not a doctor. My advice is for informational purposes only._`,

    kk: (name) => `🏥 *MedAI — Жасанды Интеллект Медициналық Кеңесші*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Сәлеметсіз бе, ${name}! 👋

Мен MedAI — Еуропа мен Америка нұсқаулықтарына негізделген ЖИ медициналық көмекшімін.

👨‍⚕️ *Дәрігер* 💊 *Дәрі-дәрмек* 📋 *Созылмалы аурулар* 🔬 *Диагностика*

🆓 Тегін: күніне 5 сұрақ | 💎 Премиум: шексіз

⚠️ _Мен дәрігер емеспін._`,

    ky: (name) => `🏥 *MedAI — Жасалма Интеллект Медициналык Кеңешчи*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Саламатсызбы, ${name}! 👋

👨‍⚕️ *Дарыгер* 💊 *Дары* 📋 *Созулма оорулар* 🔬 *Диагностика*

🆓 Бекер: күнүнө 5 суроо | 💎 Премиум: чексиз

⚠️ _Мен дарыгер эмесмин._`,

    tg: (name) => `🏥 *MedAI — Маслиҳатгари тиббии зеҳни сунъӣ*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Салом, ${name}! 👋

👨‍⚕️ *Духтур* 💊 *Дору* 📋 *Бемориҳои музмин* 🔬 *Диагностика*

🆓 Ройгон: 5 савол/рӯз | 💎 Премиум: беҳад

⚠️ _Ман духтур нестам._`
  },

  choose_lang: {
    uz: '🌐 Tilni tanlang:', uz_cyr: '🌐 Тилни танланг:', ru: '🌐 Выберите язык:',
    en: '🌐 Choose language:', kk: '🌐 Тілді таңдаңыз:', ky: '🌐 Тилди тандаңыз:', tg: '🌐 Забонро интихоб кунед:'
  },
  lang_set: {
    uz: "✅ Til o'rnatildi: O'zbekcha (Lotin)", uz_cyr: '✅ Тил ўрнатилди: Ўзбекча (Кирил)',
    ru: '✅ Язык установлен: Русский', en: '✅ Language set: English',
    kk: '✅ Тіл орнатылды: Қазақша', ky: '✅ Тил орнотулду: Кыргызча', tg: '✅ Забон гузошта шуд: Тоҷикӣ'
  },
  btn_doctor: { uz: '👨‍⚕️ Shifokor', uz_cyr: '👨‍⚕️ Шифокор', ru: '👨‍⚕️ Врач', en: '👨‍⚕️ Doctor', kk: '👨‍⚕️ Дәрігер', ky: '👨‍⚕️ Дарыгер', tg: '👨‍⚕️ Духтур' },
  btn_drug: { uz: '💊 Dori', uz_cyr: '💊 Дори', ru: '💊 Лекарства', en: '💊 Drugs', kk: '💊 Дәрі', ky: '💊 Дары', tg: '💊 Дору' },
  btn_chronic: { uz: '📋 Surunkali', uz_cyr: '📋 Сурункали', ru: '📋 Хронические', en: '📋 Chronic', kk: '📋 Созылмалы', ky: '📋 Созулма', tg: '📋 Музмин' },
  btn_diagnostic: { uz: '🔬 Diagnostika', uz_cyr: '🔬 Диагностика', ru: '🔬 Диагностика', en: '🔬 Diagnostics', kk: '🔬 Диагностика', ky: '🔬 Диагностика', tg: '🔬 Диагностика' },
  btn_profile: { uz: '👤 Profil', uz_cyr: '👤 Профил', ru: '👤 Профиль', en: '👤 Profile', kk: '👤 Профиль', ky: '👤 Профиль', tg: '👤 Профил' },
  btn_history: { uz: '📊 Tarix', uz_cyr: '📊 Тарих', ru: '📊 История', en: '📊 History', kk: '📊 Тарих', ky: '📊 Тарых', tg: '📊 Таърих' },
  btn_premium: { uz: '💎 Premium', uz_cyr: '💎 Премиум', ru: '💎 Премиум', en: '💎 Premium', kk: '💎 Премиум', ky: '💎 Премиум', tg: '💎 Премиум' },
  btn_status: { uz: '📈 Status', uz_cyr: '📈 Статус', ru: '📈 Статус', en: '📈 Status', kk: '📈 Статус', ky: '📈 Статус', tg: '📈 Статус' },
  btn_lang: { uz: '🌐 Til', uz_cyr: '🌐 Тил', ru: '🌐 Язык', en: '🌐 Language', kk: '🌐 Тіл', ky: '🌐 Тил', tg: '🌐 Забон' },
  btn_main: { uz: '🏥 Menyu', uz_cyr: '🏥 Меню', ru: '🏥 Меню', en: '🏥 Menu', kk: '🏥 Мәзір', ky: '🏥 Меню', tg: '🏥 Меню' },
  btn_end: { uz: '🔚 Yakunlash', uz_cyr: '🔚 Якунлаш', ru: '🔚 Завершить', en: '🔚 End', kk: '🔚 Аяқтау', ky: '🔚 Аяктоо', tg: '🔚 Анҷом' },
  btn_new: { uz: '👨‍⚕️ Yangi', uz_cyr: '👨‍⚕️ Янги', ru: '👨‍⚕️ Новая', en: '👨‍⚕️ New', kk: '👨‍⚕️ Жаңа', ky: '👨‍⚕️ Жаңы', tg: '👨‍⚕️ Нав' },
  preparing: { uz: '⏳ Tayyorlanmoqda...', uz_cyr: '⏳ Тайёрланмоқда...', ru: '⏳ Подготовка...', en: '⏳ Preparing...', kk: '⏳ Дайындалуда...', ky: '⏳ Даярдалууда...', tg: '⏳ Омода мешавад...' },
  analyzing: { uz: '⏳ Tahlil qilinmoqda...', uz_cyr: '⏳ Таҳлил қилинмоқда...', ru: '⏳ Анализ...', en: '⏳ Analyzing...', kk: '⏳ Талдау...', ky: '⏳ Анализ...', tg: '⏳ Таҳлил...' },
  type_q: { uz: '💬 Savolingizni yozing:', uz_cyr: '💬 Саволингизни ёзинг:', ru: '💬 Напишите вопрос:', en: '💬 Type your question:', kk: '💬 Сұрағыңызды жазыңыз:', ky: '💬 Суроонузду жазыңыз:', tg: '💬 Саволро нависед:' },
  cont_end: { uz: '💬 Davom eting yoki yakunlang:', uz_cyr: '💬 Давом этинг:', ru: '💬 Продолжайте или завершите:', en: '💬 Continue or end:', kk: '💬 Жалғастырыңыз:', ky: '💬 Улантыңыз:', tg: '💬 Идома диҳед:' },
  ended: { uz: '✅ Yakunlandi. Natijani shifokorga ko\'rsating.', uz_cyr: '✅ Якунланди.', ru: '✅ Завершено. Покажите результат врачу.', en: '✅ Completed. Show results to your doctor.', kk: '✅ Аяқталды. Дәрігерге көрсетіңіз.', ky: '✅ Аяктады.', tg: '✅ Анҷом ёфт.' },
  sum_prep: { uz: '⏳ Xulosa tayyorlanmoqda...', uz_cyr: '⏳ Хулоса...', ru: '⏳ Подготовка заключения...', en: '⏳ Preparing summary...', kk: '⏳ Қорытынды...', ky: '⏳ Корутунду...', tg: '⏳ Хулоса...' },
  limit: { uz: '❌ Kunlik limit tugadi (5/5). 💎 Premium olish uchun tugmani bosing!', uz_cyr: '❌ Лимит тугади.', ru: '❌ Лимит исчерпан (5/5). 💎 Нажмите для премиума!', en: '❌ Daily limit reached (5/5). 💎 Press for premium!', kk: '❌ Лимит аяқталды.', ky: '❌ Лимит аяктады.', tg: '❌ Ҳудуд тамом шуд.' },
  error: { uz: '❌ Xatolik. Qaytadan urinib ko\'ring.', uz_cyr: '❌ Хатолик.', ru: '❌ Ошибка. Попробуйте снова.', en: '❌ Error. Try again.', kk: '❌ Қате.', ky: '❌ Ката.', tg: '❌ Хатогӣ.' },
  no_ses: { uz: 'Faol suhbat yo\'q.', uz_cyr: 'Фаол суҳбат йўқ.', ru: 'Нет активной сессии.', en: 'No active session.', kk: 'Белсенді сеанс жоқ.', ky: 'Сессия жок.', tg: 'Ҷаласа нест.' },
  select: { uz: 'Bo\'limni tanlang 👇', uz_cyr: 'Бўлимни танланг 👇', ru: 'Выберите раздел 👇', en: 'Select section 👇', kk: 'Бөлімді таңдаңыз 👇', ky: 'Бөлүмдү тандаңыз 👇', tg: 'Бахшро интихоб кунед 👇' },
  prem_info: { uz: '💎 Premium: 40,000 so\'m/oy\n✅ Cheksiz savollar\n\nTo\'lov usulini tanlang:', uz_cyr: '💎 Премиум: 40,000 сўм/ой', ru: '💎 Премиум: 40,000 сум/мес\n✅ Безлимит\n\nВыберите оплату:', en: '💎 Premium: 40,000 UZS/mo\n✅ Unlimited\n\nChoose payment:', kk: '💎 Премиум: 40,000 сум/ай', ky: '💎 Премиум: 40,000 сум/ай', tg: '💎 Премиум: 40,000 сум/моҳ' },
  pay_ok: { uz: (u) => `✅ Premium! Muddati: ${u} 🎉`, uz_cyr: (u) => `✅ Премиум! ${u} 🎉`, ru: (u) => `✅ Премиум до: ${u} 🎉`, en: (u) => `✅ Premium until: ${u} 🎉`, kk: (u) => `✅ Премиум: ${u} 🎉`, ky: (u) => `✅ Премиум: ${u} 🎉`, tg: (u) => `✅ Премиум то: ${u} 🎉` },
  diag_t: { uz: '🔬 Diagnostika — turini tanlang:', uz_cyr: '🔬 Диагностика:', ru: '🔬 Диагностика — выберите тип:', en: '🔬 Diagnostics — select type:', kk: '🔬 Диагностика:', ky: '🔬 Диагностика:', tg: '🔬 Диагностика:' },
  chr_t: { uz: '📋 Kasallikni tanlang:', uz_cyr: '📋 Касалликни танланг:', ru: '📋 Выберите заболевание:', en: '📋 Select condition:', kk: '📋 Ауруды таңдаңыз:', ky: '📋 Ооруну тандаңыз:', tg: '📋 Беморӣро интихоб кунед:' },
  send_lab: { uz: '📝 Natijalarni yozing yoki 📸 rasm yuboring:', uz_cyr: '📝 Ёзинг ёки расм юборинг:', ru: '📝 Напишите результаты или отправьте фото:', en: '📝 Type results or send photo:', kk: '📝 Жазыңыз немесе сурет жіберіңіз:', ky: '📝 Жазыңыз же сүрөт жөнөтүңүз:', tg: '📝 Нависед ё сурат фиристед:' },
  send_img: { uz: '📸 Rasmni yuboring:', uz_cyr: '📸 Расмни юборинг:', ru: '📸 Отправьте изображение:', en: '📸 Send image:', kk: '📸 Суретті жіберіңіз:', ky: '📸 Сүрөттү жөнөтүңүз:', tg: '📸 Суратро фиристед:' },
  img_wait: { uz: '⏳ Rasm tahlil qilinmoqda...', uz_cyr: '⏳ Расм таҳлил...', ru: '⏳ Анализ изображения...', en: '⏳ Analyzing image...', kk: '⏳ Сурет талдануда...', ky: '⏳ Сүрөт анализи...', tg: '⏳ Таҳлили сурат...' },
  again: { uz: '🔬 Yana tahlil', uz_cyr: '🔬 Яна', ru: '🔬 Ещё', en: '🔬 Again', kk: '🔬 Тағы', ky: '🔬 Дагы', tg: '🔬 Боз' },
  ask_doc: { uz: '👨‍⚕️ Shifokorga', uz_cyr: '👨‍⚕️ Шифокорга', ru: '👨‍⚕️ К врачу', en: '👨‍⚕️ Ask doctor', kk: '👨‍⚕️ Дәрігерге', ky: '👨‍⚕️ Дарыгерге', tg: '👨‍⚕️ Ба духтур' },
  log_d: { uz: '📝 Kiritish', uz_cyr: '📝 Киритиш', ru: '📝 Ввести', en: '📝 Enter', kk: '📝 Енгізу', ky: '📝 Киргизүү', tg: '📝 Ворид' },
  wk: { uz: '📊 Hafta', uz_cyr: '📊 Ҳафта', ru: '📊 Неделя', en: '📊 Week', kk: '📊 Апта', ky: '📊 Жума', tg: '📊 Ҳафта' },
  mo: { uz: '📈 Oy', uz_cyr: '📈 Ой', ru: '📈 Месяц', en: '📈 Month', kk: '📈 Ай', ky: '📈 Ай', tg: '📈 Моҳ' },
  stat: { uz: (s,c,u) => `👤 Tarif: ${s}\nSavollar: ${c}${u?'\nPremium: '+u:''}`, uz_cyr: (s,c,u) => `👤 Тариф: ${s}\nСаволлар: ${c}${u?'\nПремиум: '+u:''}`, ru: (s,c,u) => `👤 Тариф: ${s}\nВопросов: ${c}${u?'\nПремиум до: '+u:''}`, en: (s,c,u) => `👤 Plan: ${s}\nQuestions: ${c}${u?'\nPremium: '+u:''}`, kk: (s,c,u) => `👤 Тариф: ${s}\n${c}${u?'\n'+u:''}`, ky: (s,c,u) => `👤 ${s}\n${c}${u?'\n'+u:''}`, tg: (s,c,u) => `👤 ${s}\n${c}${u?'\n'+u:''}` },
  chr_enter: { uz: (d) => `📝 *${d}* — ko'rsatkichlarni yozing:`, uz_cyr: (d) => `📝 *${d}*:`, ru: (d) => `📝 *${d}* — введите показатели:`, en: (d) => `📝 *${d}* — enter readings:`, kk: (d) => `📝 *${d}*:`, ky: (d) => `📝 *${d}*:`, tg: (d) => `📝 *${d}*:` },
  emer: {
    uz: '🚨🚨🚨 SHOSHILINCH! DARHOL 103 GA QO\'NG\'IROQ QILING! 🚨🚨🚨',
    uz_cyr: '🚨🚨🚨 ШОШИЛИНЧ! ДАРҲОЛ 103 ГА ҚЎНҒИРОҚ ҚИЛИНГ! 🚨🚨🚨',
    ru: '🚨🚨🚨 ЭКСТРЕННО! НЕМЕДЛЕННО ЗВОНИТЕ 103! 🚨🚨🚨',
    en: '🚨🚨🚨 EMERGENCY! CALL 103 IMMEDIATELY! 🚨🚨🚨',
    kk: '🚨🚨🚨 ШҰҒЫЛ! 103-КЕ ҚОҢЫРАУ ШАЛЫҢЫЗ! 🚨🚨🚨',
    ky: '🚨🚨🚨 ШАШЫЛЫШ! 103-КӨ ЧАЛЫҢЫЗ! 🚨🚨🚨',
    tg: '🚨🚨🚨 ФАВҚУЛОДДА! БА 103 ЗАНГ ЗАНЕД! 🚨🚨🚨'
  }
};

function t(key, lang) { const tr = T[key]; if (!tr) return key; return tr[lang || 'uz'] || tr['uz'] || key; }

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS — KUCHAYTIRILGAN GUIDELINE TARJIMA
// ═══════════════════════════════════════════════════════════════

function getLangBlock(lang) {
  const blocks = {

uz: `
=== MAJBURIY TIL QOIDALARI (BUZISH MUMKIN EMAS) ===

SEN FAQAT O'ZBEK TILIDA (LOTIN YOZUVIDA) JAVOB BERASAN. BOSHQA TILDA JAVOB BERISH TA'QIQLANGAN.

TIBBIY TERMINLARNI TARJIMA QILISH QOIDALARI:

1. HAR BIR tibbiy termin ALBATTA o'zbekcha tarjimasi + (inglizcha asl nomi) formatida bo'lishi SHART:
   ✅ TO'G'RI: "Yurak yetishmovchiligi (Heart Failure)"
   ❌ NOTO'G'RI: "Heart Failure"

2. HAR BIR guideline nomi ALBATTA o'zbekcha izohi bilan bo'lishi SHART:
   ✅ TO'G'RI: "AHA/ACC (Amerika Yurak Assotsiatsiyasi / Amerika Kardiologiya Kolleji) tavsiyasiga ko'ra"
   ❌ NOTO'G'RI: "AHA/ACC guideline bo'yicha"

3. HAR BIR dori guruhi nomi ALBATTA o'zbekcha + (inglizcha) formatda:
   ✅ TO'G'RI: "Angiotenzin konvertaz fermenti inhibitorlari (ACE inhibitors) — bu qon bosimni pasaytiruvchi dorilar guruhi"
   ❌ NOTO'G'RI: "ACE inhibitors"

4. HAR BIR kasallik nomi ALBATTA o'zbekcha + (inglizcha):
   ✅ TO'G'RI: "Miokard infarkti (Myocardial Infarction) — yurak mushagi qon bilan ta'minlanmasligi"
   ❌ NOTO'G'RI: "Myocardial Infarction"

5. HAR BIR tekshiruv nomi ALBATTA o'zbekcha + (inglizcha):
   ✅ TO'G'RI: "Elektrokardiogramma (EKG/ECG) — yurak elektrik faoliyatini tekshirish"
   ❌ NOTO'G'RI: "EKG qiling"

6. HAR BIR klinik skor ALBATTA o'zbekcha izohi bilan:
   ✅ TO'G'RI: "CHA₂DS₂-VASc skori (qon ivishini baholash shkalasi) — bu atriyum fibrillyatsiyasida insult xavfini aniqlash uchun ishlatiladigan ball tizimi"
   ❌ NOTO'G'RI: "CHA₂DS₂-VASc score"

7. Qisqartmalarni HAR DOIM birinchi marta to'liq yozing:
   ✅ TO'G'RI: "ECHT (Eritrotsitlar cho'kish tezligi, ESR - Erythrocyte Sedimentation Rate)"
   ❌ NOTO'G'RI: "ESR"

MISOL JAVOB:
"AHA/ACC (Amerika Yurak Assotsiatsiyasi / Amerika Kardiologiya Kolleji) ning 2023-yilgi yurak yetishmovchiligi (Heart Failure — yurak mushagining qonni yetarlicha haydash qobiliyatini yo'qotishi) bo'yicha tavsiyalariga ko'ra, chiqarish fraktsiyasi pasaygan yurak yetishmovchiligi (HFrEF — Heart Failure with Reduced Ejection Fraction) da davolashning birinchi bosqichi sifatida quyidagi dori guruhlari tavsiya etiladi:

• RAAS inhibitorlari (Renin-Angiotenzin-Aldosteron Tizimi inhibitorlari) — bu qon bosimni pasaytirib, yurakka tushadigan yukni kamaytiradigan dorilar guruhi
• Beta-adrenoblokerlar (Beta-blockers) — yurak urish tezligini sekinlashtirib, yurak ishini yengillashtiruvchi dorilar
• Mineralokortikoid retseptor antagonistlari (MRA — Mineralocorticoid Receptor Antagonists) — ortiqcha suyuqlikni chiqarishga yordam beruvchi dorilar
• SGLT2 inhibitorlari (Natriy-glyukoza ko'chirish oqsili 2 inhibitorlari — Sodium-Glucose Co-Transporter 2 inhibitors) — dastlab diabet dorisi, ammo yurak yetishmovchiligida ham samarali ekanligi isbotlangan"
`,

uz_cyr: `
=== МАЖБУРИЙ ТИЛ ҚОИДАЛАРИ ===
СЕН ФАҚАТ ЎЗБЕК ТИЛИДА КИРИЛ ЁЗУВИДА ЖАВОБ БЕРАСАН.
Ҳар бир тиббий термин: Ўзбекча (English) форматда. Масалан: "Юрак етишмовчилиги (Heart Failure)"
Ҳар бир гайдлайн: "AHA/ACC (Америка Юрак Ассоциацияси) тавсиясига кўра..."
Ҳар бир дори гуруҳи: "Ангиотензин конвертаз фермент ингибиторлари (ACE inhibitors) — қон босимни пасайтирувчи дорилар"
`,

ru: `
=== ОБЯЗАТЕЛЬНЫЕ ЯЗЫКОВЫЕ ПРАВИЛА (НАРУШЕНИЕ ЗАПРЕЩЕНО) ===

ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ. Ответы на других языках ЗАПРЕЩЕНЫ.

ПРАВИЛА ПЕРЕВОДА МЕДИЦИНСКИХ ТЕРМИНОВ:

1. КАЖДЫЙ медицинский термин ОБЯЗАТЕЛЬНО на русском + (английский оригинал):
   ✅ ПРАВИЛЬНО: "Сердечная недостаточность (Heart Failure)"
   ❌ НЕПРАВИЛЬНО: "Heart Failure"

2. КАЖДОЕ название гайдлайна с русским пояснением:
   ✅ ПРАВИЛЬНО: "Согласно рекомендациям AHA/ACC (Американская ассоциация сердца / Американский колледж кардиологии)..."
   ❌ НЕПРАВИЛЬНО: "По AHA/ACC..."

3. КАЖДАЯ группа препаратов на русском + (английский):
   ✅ ПРАВИЛЬНО: "Ингибиторы ангиотензинпревращающего фермента (ACE inhibitors / иАПФ) — группа препаратов, снижающих артериальное давление"
   ❌ НЕПРАВИЛЬНО: "ACE inhibitors"

4. КАЖДОЕ заболевание на русском + (английский):
   ✅ ПРАВИЛЬНО: "Инфаркт миокарда (Myocardial Infarction) — острое нарушение кровоснабжения сердечной мышцы"

5. КАЖДОЕ обследование на русском + (английский):
   ✅ ПРАВИЛЬНО: "Электрокардиограмма (ЭКГ/ECG) — исследование электрической активности сердца"

6. ВСЕ аббревиатуры при первом упоминании расшифровывать полностью на русском.
`,

en: `
=== MANDATORY LANGUAGE RULES ===
Respond ENTIRELY in English. Use standard medical terminology.
For complex terms, provide layperson explanations:
✅ "Heart Failure (a condition where the heart cannot pump blood effectively enough to meet the body's needs)"
✅ "ACE inhibitors (Angiotensin-Converting Enzyme inhibitors — a class of medications that lower blood pressure by relaxing blood vessels)"
Always spell out abbreviations on first use.
`,

kk: `
=== МІНДЕТТІ ТІЛ ЕРЕЖЕЛЕРІ ===
ТІКЕЛЕЙ ҚАЗАҚ ТІЛІНДЕ (КИРИЛ ЖАЗУЫМЕН) ЖАУАП БЕР.
Әрбір медициналық термин: Қазақша (English). Мысалы: "Жүрек жеткіліксіздігі (Heart Failure)"
Әрбір нұсқаулық: "AHA/ACC (Америка Жүрек Қауымдастығы) нұсқаулығына сәйкес..."
Әрбір дәрі тобы: "Ангиотензин айналдырушы фермент тежегіштері (ACE inhibitors) — қан қысымын төмендететін дәрілер тобы"
Барлық қысқартуларды толық жаз.
`,

ky: `
=== МИЛДЕТТҮҮ ТИЛ ЭРЕЖЕЛЕРИ ===
КЫРГЫЗ ТИЛИНДЕ (КИРИЛ ЖАЗУУСУ МЕНЕН) ЖООП БЕР.
Ар бир медициналык термин: Кыргызча (English). Мисалы: "Жүрөк жетишсиздиги (Heart Failure)"
Ар бир колдонмо: "AHA/ACC (Америка Жүрөк Ассоциациясы) колдонмосуна ылайык..."
Ар бир дары тобу: "Ангиотензин айландыргыч фермент ингибиторлору (ACE inhibitors)"
`,

tg: `
=== ҚОИДАҲОИ ҲАТМИИ ЗАБОН ===
ТАНҲО БА ЗАБОНИ ТОҶИКӢ (ХАТТИ КИРИЛӢ) ҶАВОБ ДЕҲ.
Ҳар як истилоҳи тиббӣ: Тоҷикӣ (English). Масалан: "Норасоии дил (Heart Failure)"
Ҳар як дастурнома: "Мувофиқи тавсияҳои AHA/ACC (Ассотсиатсияи Дили Амрико)..."
Ҳар як гурӯҳи дору: "Ингибиторҳои ферменти табдилдиҳандаи ангиотензин (ACE inhibitors)"
`
  };
  return blocks[lang] || blocks['uz'];
}

function getDoctorPrompt(lang) {
  return `You are MedAI Doctor Advisor — an advanced AI clinical decision support system.

${getLangBlock(lang)}

=== CLINICAL GUIDELINES (you MUST reference these and translate their names) ===
Cardiology: AHA/ACC, ESC, JNC 8
Endocrinology: ADA, EASD, Endocrine Society, ATA/ETA
Pulmonology: GOLD, GINA, ATS/ERS
Gastroenterology: ACG, AGA, AASLD, EASL, Rome IV
Nephrology: KDIGO
Rheumatology: ACR, EULAR
Neurology: AAN, EAN, ICHD-3
Infectious: IDSA, CDC, WHO
Oncology: NCCN, ESMO, ACS
Urology: AUA, EAU
Dermatology: AAD, EADV
Psychiatry: APA, NICE, WFSBP, CANMAT
OB/GYN: ACOG, RCOG, FIGO
Pediatrics: AAP, ESPID
General: UpToDate, Cochrane, BMJ Best Practice, DynaMed

=== CONSULTATION METHOD ===
Phase 1: History (SOCRATES + PMH + Meds + Allergies + FH + SH). Ask 1-2 questions at a time conversationally. Minimum 4-5 exchanges.
Phase 2: After enough data — differential diagnosis with %, risk (🔴🟡🟢), clinical scores, can't-miss diagnoses, investigations.
Phase 3: Non-pharm + pharm (drug CLASS only, never specific drug+dose) + referral + follow-up + red flags.

=== EMERGENCY ===
Chest pain+dyspnea, stroke signs, severe bleeding, anaphylaxis, suicidal ideation, seizure>5min → IMMEDIATELY flag, call 103.

=== CRITICAL RULES ===
1. NEVER prescribe specific drugs with doses — only drug CLASSES
2. ALWAYS cite guideline name WITH full translation in patient language
3. ALWAYS show differential diagnosis
4. ALWAYS assign risk level 🔴🟡🟢
5. ALWAYS translate EVERY medical term
6. ALWAYS end with disclaimer
7. NEVER say you are a doctor
8. Start first response with disclaimer about being AI`;
}

function getDrugPrompt(lang) {
  return `You are MedAI Drug Advisor — AI pharmaceutical consultation system.

${getLangBlock(lang)}

Sources: FDA, EMA, WHO Essential Medicines, BNF, Lexicomp, Micromedex, Stockley's, Beers Criteria

Capabilities: Drug info (MOA, pharmacokinetics), interactions (🔴🟠🟡🟢), side effects, contraindications, pregnancy/lactation (FDA categories), geriatric/pediatric, renal/hepatic adjustments.

RULES: NEVER prescribe. ALWAYS recommend doctor. ALWAYS check interactions. ALWAYS ask about allergies and pregnancy. ALWAYS translate every term per language rules above.`;
}

function getChronicPrompt(lang) {
  return `You are MedAI Chronic Disease Monitor — AI monitoring system.

${getLangBlock(lang)}

Supported: Diabetes T1/T2, Hypertension, Heart Failure, COPD, Asthma, CKD, RA, Thyroid, Epilepsy, Depression
Guidelines: ADA, AHA/ACC, ESC, GOLD, GINA, KDIGO, ACR/EULAR, ATA/ETA, ILAE, APA/NICE

Alerts: 🔴 CRITICAL (call 103), 🟡 WARNING (doctor 24-48h), 🟢 NORMAL

RULES: Never change meds. Always flag critical values. Track trends. Be encouraging. ALWAYS translate every term per language rules above.`;
}

function getDiagnosticPrompt(lang) {
  return `You are MedAI Diagnostic Analyzer — AI for lab results and medical images.

${getLangBlock(lang)}

Lab: CBC, BMP/CMP, LFT, Lipids, Coagulation, Thyroid, Diabetes, Hormones, Tumor markers, Autoimmune, Cardiac, Iron, Urinalysis, Vitamins.
Imaging: X-ray, CT, MRI, Ultrasound.

Method: Compare to age/sex-specific ranges, categorize severity, pattern recognition, correlate, suggest differentials, recommend follow-up.

RULES: Always use age/sex ranges. Always identify critical values. Never definitive diagnosis. ALWAYS translate every term per language rules above. Always state this is preliminary AI analysis.`;
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARDS
// ═══════════════════════════════════════════════════════════════

function langKB() {
  return { reply_markup: { inline_keyboard: [
    [{ text: "🇺🇿 O'zbekcha (Lotin)", callback_data: 'lang_uz' }, { text: '🇺🇿 Ўзбекча (Кирил)', callback_data: 'lang_uz_cyr' }],
    [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }, { text: '🇬🇧 English', callback_data: 'lang_en' }],
    [{ text: '🇰🇿 Қазақша', callback_data: 'lang_kk' }, { text: '🇰🇬 Кыргызча', callback_data: 'lang_ky' }],
    [{ text: '🇹🇯 Тоҷикӣ', callback_data: 'lang_tg' }]
  ]}};
}

function mainKB(l) {
  return { reply_markup: { inline_keyboard: [
    [{ text: t('btn_doctor',l), callback_data: 'sec_doc' }],
    [{ text: t('btn_drug',l), callback_data: 'sec_drug' }],
    [{ text: t('btn_chronic',l), callback_data: 'sec_chr' }],
    [{ text: t('btn_diagnostic',l), callback_data: 'sec_diag' }],
    [{ text: t('btn_profile',l), callback_data: 'prof' }, { text: t('btn_history',l), callback_data: 'hist' }],
    [{ text: t('btn_premium',l), callback_data: 'prem' }, { text: t('btn_status',l), callback_data: 'stat' }],
    [{ text: t('btn_lang',l), callback_data: 'ch_lang' }]
  ]}};
}
function payKB(l) { return { reply_markup: { inline_keyboard: [
  [{ text: '💳 Telegram Pay', callback_data: 'pay_tg' }],
  [{ text: '📱 Payme', callback_data: 'pay_pm' }],
  [{ text: '📱 Click', callback_data: 'pay_cl' }],
  [{ text: t('btn_main',l), callback_data: 'mm' }]
]}}; }
function sesKB(sec,l) { return { reply_markup: { inline_keyboard: [[{ text: t('btn_end',l), callback_data: `end_${sec}` }],[{ text: t('btn_main',l), callback_data: 'fmm' }]] }}; }
function diagKB(l) { return { reply_markup: { inline_keyboard: [
  [{ text: '🩸 Qon/Blood', callback_data: 'dl_blood' },{ text: '💧 Siydik/Urine', callback_data: 'dl_urine' }],
  [{ text: '🧬 Gormon', callback_data: 'dl_hormone' },{ text: '📝 Boshqa', callback_data: 'dl_other' }],
  [{ text: '🫁 Rentgen', callback_data: 'di_xray' },{ text: '🧲 MRT', callback_data: 'di_mri' }],
  [{ text: '💻 KT/CT', callback_data: 'di_ct' },{ text: '📡 UZI', callback_data: 'di_us' }],
  [{ text: t('btn_main',l), callback_data: 'mm' }]
]}}; }
function chrKB(l) { return { reply_markup: { inline_keyboard: [
  [{ text: '🩸 Diabet T2', callback_data: 'c_dt2' },{ text: '💉 Diabet T1', callback_data: 'c_dt1' }],
  [{ text: '🫀 Gipertoniya', callback_data: 'c_htn' },{ text: '❤️ HF', callback_data: 'c_hf' }],
  [{ text: '🫁 COPD', callback_data: 'c_copd' },{ text: '🌬 Astma', callback_data: 'c_ast' }],
  [{ text: '🫘 CKD', callback_data: 'c_ckd' },{ text: '🦴 RA', callback_data: 'c_ra' }],
  [{ text: '🦋 Hypo', callback_data: 'c_hypo' },{ text: '⚡ Hyper', callback_data: 'c_hypr' }],
  [{ text: '🧠 Epilepsy', callback_data: 'c_epi' },{ text: '😔 Depression', callback_data: 'c_dep' }],
  [{ text: t('btn_main',l), callback_data: 'mm' }]
]}}; }
function chrActKB(dk,l) { return { reply_markup: { inline_keyboard: [
  [{ text: t('log_d',l), callback_data: `cl_${dk}` }],
  [{ text: t('wk',l), callback_data: `cr_w_${dk}` },{ text: t('mo',l), callback_data: `cr_m_${dk}` }],
  [{ text: t('btn_end',l), callback_data: 'end_chr' }],
  [{ text: t('btn_main',l), callback_data: 'fmm' }]
]}}; }
function aftDiagKB(l) { return { reply_markup: { inline_keyboard: [
  [{ text: t('again',l), callback_data: 'sec_diag' }],
  [{ text: t('ask_doc',l), callback_data: 'sec_doc' }],
  [{ text: t('btn_main',l), callback_data: 'mm' }]
]}}; }

// ═══════════════════════════════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════════════════════════════

async function getUser(uid, fn, un) {
  try {
    let { data: u } = await supabase.from('users').select('*').eq('id', uid).single();
    if (!u) {
      await supabase.from('users').insert({ id: uid, first_name: fn||'User', username: un||null, language: 'uz' });
      const { data: n } = await supabase.from('users').select('*').eq('id', uid).single();
      u = n;
    }
    if (!u) return null;
    const td = new Date().toISOString().split('T')[0];
    if (u.last_reset !== td) { await supabase.from('users').update({ daily_count: 0, last_reset: td }).eq('id', uid); u.daily_count = 0; }
    if (u.is_premium && u.premium_until && new Date(u.premium_until) < new Date()) { await supabase.from('users').update({ is_premium: false }).eq('id', uid); u.is_premium = false; }
    return u;
  } catch (e) { console.error('getUser:', e.message); return null; }
}
async function getLang(uid) { try { const { data, error } = await supabase.from('users').select('language').eq('id', uid).single(); if (error||!data||!data.language) return 'uz'; return data.language; } catch { return 'uz'; } }
async function setLang(uid, lang) { try { const { data } = await supabase.from('users').select('id').eq('id', uid).single(); if (!data) { await supabase.from('users').insert({ id: uid, language: lang }); } else { await supabase.from('users').update({ language: lang }).eq('id', uid); } return true; } catch (e) { console.error('setLang:', e.message); return false; } }
async function getProf(uid) { try { const { data } = await supabase.from('users').select('age,gender,weight,height,blood_type,allergies,chronic_diseases,current_medications').eq('id', uid).single(); return data||{}; } catch { return {}; } }
async function updField(uid, f, v) { try { await supabase.from('users').update({ [f]: v }).eq('id', uid); return true; } catch { return false; } }
async function incUse(uid, c) { await supabase.from('users').update({ daily_count: c + 1 }).eq('id', uid); }
async function saveCon(uid, sec, msgs, sum, spec) { try { await supabase.from('consultations').insert({ user_id: uid, section: sec, status: 'completed', messages: msgs, summary: sum?.substring(0, 5000), specialty: spec, completed_at: new Date().toISOString() }); } catch {} }
async function saveChrLog(uid, dis, data, fb, al) { try { await supabase.from('chronic_logs').insert({ user_id: uid, disease: dis, data, ai_feedback: fb, alert_level: al }); } catch {} }
async function getChrLogs(uid, dis, days) { try { const s = new Date(); s.setDate(s.getDate() - days); const { data } = await supabase.from('chronic_logs').select('*').eq('user_id', uid).eq('disease', dis).gte('created_at', s.toISOString()).order('created_at', { ascending: true }); return data||[]; } catch { return []; } }
async function saveMedRec(uid, tp, ti, dt, fi, an) { try { await supabase.from('medical_records').insert({ user_id: uid, record_type: tp, title: ti, data: dt, file_id: fi, ai_analysis: an }); } catch {} }
async function getHist(uid) { try { const { data } = await supabase.from('consultations').select('id,section,summary,created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(10); return data||[]; } catch { return []; } }
async function savePay(uid, prov, amt, st, tx) { try { await supabase.from('payments').insert({ user_id: uid, provider: prov, amount: amt, status: st, transaction_id: tx }); } catch {} }

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function getS(uid) { if (!sessions[uid]) sessions[uid] = { sec: null, msgs: [], spec: null, chrDis: null, chrKey: null, dType: null, dSub: null, pEdit: null, await: null, cnt: 0 }; return sessions[uid]; }
function clrS(uid) { sessions[uid] = { sec: null, msgs: [], spec: null, chrDis: null, chrKey: null, dType: null, dSub: null, pEdit: null, await: null, cnt: 0 }; }

async function ai(sys, msgs, mt) { const r = await client.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: mt||8192, temperature: 0.3, system: sys, messages: msgs }); return r.content[0].text; }
async function aiImg(sys, msgs, b64, mime) { const last = msgs[msgs.length-1]; const prev = msgs.slice(0,-1); const im = { role:'user', content:[{ type:'image', source:{ type:'base64', media_type:mime||'image/jpeg', data:b64 }},{ type:'text', text:last?.content||'Analyze' }]}; const r = await client.messages.create({ model:'claude-sonnet-4-20250514', max_tokens:8192, temperature:0.2, system:sys, messages:[...prev,im] }); return r.content[0].text; }

async function sLong(cid, txt) {
  const mx = 4096;
  if (txt.length <= mx) { try { await bot.sendMessage(cid, txt, { parse_mode: 'Markdown' }); } catch { try { await bot.sendMessage(cid, txt); } catch { for (let i=0;i<txt.length;i+=mx) await bot.sendMessage(cid, txt.substring(i,i+mx)); } } }
  else { const ch=[]; let r=txt; while(r.length>0) { if(r.length<=mx){ch.push(r);break;} let i=r.lastIndexOf('\n\n',mx); if(i<mx/2)i=r.lastIndexOf('\n',mx); if(i<mx/2)i=mx; ch.push(r.substring(0,i)); r=r.substring(i).trim(); } for(const c of ch) { try{await bot.sendMessage(cid,c,{parse_mode:'Markdown'});}catch{await bot.sendMessage(cid,c);} } }
}

function pCtx(p) { if(!p)return''; const a=[]; if(p.age)a.push(`Age:${p.age}`); if(p.gender)a.push(`Gender:${p.gender}`); if(p.weight)a.push(`Weight:${p.weight}kg`); if(p.height)a.push(`Height:${p.height}cm`); if(p.blood_type)a.push(`Blood:${p.blood_type}`); if(p.allergies)a.push(`Allergies:${p.allergies}`); if(p.chronic_diseases)a.push(`Chronic:${p.chronic_diseases}`); if(p.current_medications)a.push(`Meds:${p.current_medications}`); return a.length?'\n\nPatient:\n'+a.join('\n'):''; }
function chkEm(txt) { const l=txt.toLowerCase(); return['hushimdan ketdim','nafas ololmayapman','qon ketayapti','yuzim qiyshaydi','zaharlandim','o\'zimni o\'ldirmoqchiman','haroratim 40','tutqanoq','anafilaksiya','потерял сознание','не могу дышать','кров��течение','сильная боль в груди','отрав��лся','хочу покончить','температура 40','lost consciousness','cannot breathe','severe bleeding','poisoned','suicidal','seizure'].some(p=>l.includes(p)); }
function detSpec(txt) { const l=txt.toLowerCase(); const m={cardiology:['yurak','сердц','heart','qon bosim','давлен','pressure'],endocrinology:['qand','diabet','сахар','diabetes','gormon','гормон','thyroid'],pulmonology:['nafas','yo\'tal','кашель','cough','astma','asthma','lung'],gastroenterology:['oshqozon','желуд','stomach','jigar','печен','liver'],neurology:['bosh og\'rig','головн','headache','migren','migraine'],nephrology:['buyrak','почк','kidney'],psychiatry:['depressiya','депресси','depression','uyqu','сон','sleep']}; for(const[s,kw]of Object.entries(m)){for(const k of kw){if(l.includes(k))return s;}} return null; }
async function dlF(fid) { const f=await bot.getFile(fid); const url=`https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${f.file_path}`; return new Promise((res,rej)=>{https.get(url,r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));r.on('error',rej);}).on('error',rej);}); }
function chkLim(u) { return u.is_premium || u.daily_count < 5; }

// ═══════════════════════════════════════════════════════════════
// CORE
// ═══════════════════════════════════════════════════════════════

async function startSec(cid, uid, sec) {
  const u = await getUser(uid); const l = u?.language||'uz';
  if (!u) return bot.sendMessage(cid, t('error',l));
  if (!chkLim(u)) return bot.sendMessage(cid, t('limit',l), payKB(l));
  clrS(uid); const s = getS(uid); s.sec = sec;
  const p = await getProf(uid); const ctx = pCtx(p);
  s.msgs.push({ role:'user', content: sec==='doctor' ? `New consultation.${ctx}` : `New drug consultation.${ctx}` });
  await bot.sendMessage(cid, t('preparing',l));
  try {
    const pr = sec==='doctor' ? getDoctorPrompt(l) : getDrugPrompt(l);
    const r = await ai(pr, s.msgs); s.msgs.push({ role:'assistant', content:r }); s.cnt++;
    await incUse(uid, u.daily_count); await sLong(cid, r);
    await bot.sendMessage(cid, t('type_q',l), sesKB(sec,l));
  } catch(e) { console.error(e.message); await bot.sendMessage(cid, t('error',l), mainKB(l)); clrS(uid); }
}

async function endSes(cid, uid) {
  const l = await getLang(uid); const s = getS(uid);
  if (!s.sec || s.msgs.length<2) { clrS(uid); return bot.sendMessage(cid, t('no_ses',l), mainKB(l)); }
  await bot.sendMessage(cid, t('sum_prep',l));
  const pf = {doctor:getDoctorPrompt,drug:getDrugPrompt,chronic:getChronicPrompt,diagnostic:getDiagnosticPrompt};
  const fn = (pf[s.sec]||getDoctorPrompt)(l);
  s.msgs.push({ role:'user', content:'End consultation. Summary, differentials, tests, urgency, next steps, guidelines. Translate ALL terms per language rules.' });
  try {
    const sm = await ai(fn, s.msgs); await saveCon(uid, s.sec, s.msgs, sm, s.spec);
    await sLong(cid, sm);
    await bot.sendMessage(cid, t('ended',l), { reply_markup:{ inline_keyboard:[[{ text:t('btn_main',l), callback_data:'mm' }],[{ text:t('btn_new',l), callback_data:'sec_doc' }]] }});
  } catch(e) { console.error(e.message); await bot.sendMessage(cid, t('error',l), mainKB(l)); }
  clrS(uid);
}

async function showProf(cid, uid) {
  const l = await getLang(uid); const p = await getProf(uid);
  const { data:u } = await supabase.from('users').select('first_name').eq('id',uid).single();
  const e='❌'; const txt=`👤 *${u?.first_name||'?'}*\n🎂 ${p.age||e} ⚧ ${p.gender||e}\n⚖️ ${p.weight?p.weight+'kg':e} 📏 ${p.height?p.height+'cm':e}\n🩸 ${p.blood_type||e}\n⚠️ ${p.allergies||e}\n🏥 ${p.chronic_diseases||e}\n💊 ${p.current_medications||e}`;
  await bot.sendMessage(cid, txt, { parse_mode:'Markdown', reply_markup:{ inline_keyboard:[
    [{ text:'🎂',callback_data:'pe_age' },{ text:'⚧',callback_data:'pe_gender' },{ text:'⚖️',callback_data:'pe_weight' },{ text:'📏',callback_data:'pe_height' }],
    [{ text:'🩸',callback_data:'pe_blood' },{ text:'⚠️',callback_data:'pe_allergy' },{ text:'🏥',callback_data:'pe_chronic' },{ text:'💊',callback_data:'pe_meds' }],
    [{ text:t('btn_main',l),callback_data:'mm' }]
  ]}});
}

async function showHist(cid, uid) {
  const l = await getLang(uid); const h = await getHist(uid);
  if(!h.length) return bot.sendMessage(cid,'📊 —',mainKB(l));
  const em={doctor:'👨‍⚕️',drug:'💊',chronic:'📋',diagnostic:'🔬'};
  let txt='📊\n\n'; for(const i of h){const d=new Date(i.created_at).toLocaleDateString();txt+=`${em[i.section]||'📄'} ${i.section} — ${d}\n${(i.summary||'').substring(0,80)}...\n\n`;}
  await bot.sendMessage(cid, txt, { parse_mode:'Markdown', ...mainKB(l) });
}

// ═══════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════

bot.onText(/\/start/, async (m) => { await getUser(m.from.id,m.from.first_name,m.from.username); clrS(m.from.id); const l=await getLang(m.from.id); const fn=T.welcome[l]||T.welcome.uz; await bot.sendMessage(m.chat.id,fn(m.from.first_name),{parse_mode:'Markdown',...mainKB(l)}); });
bot.onText(/\/lang/, async (m) => { await getUser(m.from.id,m.from.first_name,m.from.username); const l=await getLang(m.from.id); await bot.sendMessage(m.chat.id,t('choose_lang',l),langKB()); });
bot.onText(/\/menu/, async (m) => { clrS(m.from.id); const l=await getLang(m.from.id); await bot.sendMessage(m.chat.id,t('select',l),{parse_mode:'Markdown',...mainKB(l)}); });
bot.onText(/\/doctor/, async (m) => { await startSec(m.chat.id,m.from.id,'doctor'); });
bot.onText(/\/drug/, async (m) => { await startSec(m.chat.id,m.from.id,'drug'); });
bot.onText(/\/chronic/, async (m) => { clrS(m.from.id); const l=await getLang(m.from.id); await bot.sendMessage(m.chat.id,t('chr_t',l),{parse_mode:'Markdown',...chrKB(l)}); });
bot.onText(/\/diagnostic/, async (m) => { clrS(m.from.id); const l=await getLang(m.from.id); await bot.sendMessage(m.chat.id,t('diag_t',l),{parse_mode:'Markdown',...diagKB(l)}); });
bot.onText(/\/premium/, async (m) => { const l=await getLang(m.from.id); await bot.sendMessage(m.chat.id,t('prem_info',l),{parse_mode:'Markdown',...payKB(l)}); });
bot.onText(/\/status/, async (m) => { const u=await getUser(m.from.id,m.from.first_name,m.from.username); const l=u?.language||'uz'; if(!u)return; const st=u.is_premium?'💎':'🆓'; const cn=u.is_premium?'∞':`${u.daily_count}/5`; const un=u.premium_until?new Date(u.premium_until).toLocaleDateString():null; const fn=T.stat[l]||T.stat.uz; await bot.sendMessage(m.chat.id,fn(st,cn,un),{parse_mode:'Markdown',...mainKB(l)}); });
bot.onText(/\/end/, async (m) => { const s=getS(m.from.id); if(s.sec)await endSes(m.chat.id,m.from.id); else{const l=await getLang(m.from.id);await bot.sendMessage(m.chat.id,t('no_ses',l),mainKB(l));} });
bot.onText(/\/profile/, async (m) => { await showProf(m.chat.id,m.from.id); });
bot.onText(/\/history/, async (m) => { await showHist(m.chat.id,m.from.id); });
bot.onText(/\/help/, async (m) => { const l=await getLang(m.from.id); await bot.sendMessage(m.chat.id,'ℹ️ /start /menu /doctor /drug /chronic /diagnostic /profile /history /end /premium /status /lang',mainKB(l)); });

// ═══════════════════════════════════════════════════════════════
// CALLBACK HANDLER
// ═══════════════════════════════════════════════════════════════

bot.on('callback_query', async (q) => {
  const cid=q.message.chat.id, uid=q.from.id, d=q.data;
  await bot.answerCallbackQuery(q.id);
  await getUser(uid, q.from.first_name, q.from.username);

  // TIL
  if (d==='ch_lang') { const l=await getLang(uid); return bot.sendMessage(cid,t('choose_lang',l),langKB()); }
  if (d.startsWith('lang_')) {
    const nl=d.replace('lang_','');
    const ok=await setLang(uid,nl);
    if(ok) { await bot.sendMessage(cid,t('lang_set',nl)); const fn=T.welcome[nl]||T.welcome.uz; await bot.sendMessage(cid,fn(q.from.first_name),{parse_mode:'Markdown',...mainKB(nl)}); }
    else await bot.sendMessage(cid,'❌',langKB());
    return;
  }

  const l=await getLang(uid);

  // MENYU
  if(d==='mm'||d==='fmm'){if(d==='fmm'){const s=getS(uid);if(s.sec&&s.msgs.length>2)await saveCon(uid,s.sec,s.msgs,null,s.spec);}clrS(uid);return bot.sendMessage(cid,t('select',l),{parse_mode:'Markdown',...mainKB(l)});}
  if(d==='ignore')return;

  // BO'LIMLAR
  if(d==='sec_doc')return startSec(cid,uid,'doctor');
  if(d==='sec_drug')return startSec(cid,uid,'drug');
  if(d==='sec_chr'){clrS(uid);return bot.sendMessage(cid,t('chr_t',l),{parse_mode:'Markdown',...chrKB(l)});}
  if(d==='sec_diag'){clrS(uid);return bot.sendMessage(cid,t('diag_t',l),{parse_mode:'Markdown',...diagKB(l)});}
  if(d.startsWith('end_'))return endSes(cid,uid);

  // PREMIUM
  if(d==='prem')return bot.sendMessage(cid,t('prem_info',l),{parse_mode:'Markdown',...payKB(l)});
  if(d==='pay_tg'){try{return bot.sendInvoice(cid,'MedAI Premium','Premium 1 month','prem1',process.env.PAYMENT_TOKEN,'UZS',[{label:'Premium',amount:4000000}]);}catch{return bot.sendMessage(cid,'💳 ❌',payKB(l));}}
  if(d==='pay_pm'){const url=`https://checkout.paycom.uz/${Buffer.from(JSON.stringify({m:process.env.PAYME_MERCHANT_ID||'ID',ac:{user_id:uid},a:4000000})).toString('base64')}`;await savePay(uid,'payme',4000000,'pending',null);return bot.sendMessage(cid,'�� Payme: 40,000',{reply_markup:{inline_keyboard:[[{text:'📱 Payme',url}],[{text:'✅',callback_data:'pc_pm'}],[{text:t('btn_main',l),callback_data:'mm'}]]}});}
  if(d==='pay_cl'){const url=`https://my.click.uz/services/pay?service_id=${process.env.CLICK_SERVICE_ID||'ID'}&merchant_id=${process.env.CLICK_MERCHANT_ID||'ID'}&amount=40000&transaction_param=${uid}`;await savePay(uid,'click',4000000,'pending',null);return bot.sendMessage(cid,'📱 Click: 40,000',{reply_markup:{inline_keyboard:[[{text:'📱 Click',url}],[{text:'✅',callback_data:'pc_cl'}],[{text:t('btn_main',l),callback_data:'mm'}]]}});}
  if(d==='pc_pm'||d==='pc_cl'){const pr=d.includes('pm')?'Payme':'Click';const adm=process.env.ADMIN_ID;if(adm)await bot.sendMessage(adm,`💳 ${pr}\nUser:${uid}\n40k`,{reply_markup:{inline_keyboard:[[{text:'✅',callback_data:`aok_${uid}`},{text:'❌',callback_data:`ano_${uid}`}]]}});return bot.sendMessage(cid,'⏳',mainKB(l));}
  if(d.startsWith('aok_')){const tid=parseInt(d.replace('aok_',''));const un=new Date();un.setMonth(un.getMonth()+1);await supabase.from('users').update({is_premium:true,premium_until:un.toISOString()}).eq('id',tid);await savePay(tid,'manual',4000000,'completed',`a${Date.now()}`);const tl=await getLang(tid);const fn=T.pay_ok[tl]||T.pay_ok.uz;await bot.sendMessage(tid,fn(un.toLocaleDateString()),mainKB(tl));return bot.sendMessage(cid,`✅ ${tid}`);}
  if(d.startsWith('ano_')){const tid=parseInt(d.replace('ano_',''));await bot.sendMessage(tid,'❌');return bot.sendMessage(cid,`❌ ${tid}`);}

  // STATUS, PROFILE, HISTORY
  if(d==='stat'){const u=await getUser(uid);const st=u?.is_premium?'💎':'🆓';const cn=u?.is_premium?'∞':`${u?.daily_count||0}/5`;const un=u?.premium_until?new Date(u.premium_until).toLocaleDateString():null;const fn=T.stat[l]||T.stat.uz;return bot.sendMessage(cid,fn(st,cn,un),{parse_mode:'Markdown',...mainKB(l)});}
  if(d==='prof')return showProf(cid,uid);
  if(d==='hist')return showHist(cid,uid);

  // PROFIL TAHRIRLASH
  if(d.startsWith('pe_')){const f=d.replace('pe_','');const s=getS(uid);
    if(f==='gender')return bot.sendMessage(cid,'⚧',{reply_markup:{inline_keyboard:[[{text:'👨 Erkak',callback_data:'pg_erkak'},{text:'👩 Ayol',callback_data:'pg_ayol'}]]}});
    if(f==='blood')return bot.sendMessage(cid,'🩸',{reply_markup:{inline_keyboard:[[{text:'O+',callback_data:'pb_O+'},{text:'O-',callback_data:'pb_O-'}],[{text:'A+',callback_data:'pb_A+'},{text:'A-',callback_data:'pb_A-'}],[{text:'B+',callback_data:'pb_B+'},{text:'B-',callback_data:'pb_B-'}],[{text:'AB+',callback_data:'pb_AB+'},{text:'AB-',callback_data:'pb_AB-'}]]}});
    s.pEdit=f;s.sec=null;const pr={age:'🎂 (1-150):',weight:'⚖️ (kg):',height:'📏 (cm):',allergy:'⚠️:',chronic:'🏥:',meds:'💊:'};return bot.sendMessage(cid,pr[f]||'?');
  }
  if(d.startsWith('pg_')){await updField(uid,'gender',d.replace('pg_',''));return bot.sendMessage(cid,'✅',mainKB(l));}
  if(d.startsWith('pb_')){await updField(uid,'blood_type',d.replace('pb_',''));return bot.sendMessage(cid,'✅',mainKB(l));}

  // SURUNKALI
  const dm={c_dt2:'Diabetes T2',c_dt1:'Diabetes T1',c_htn:'Hypertension',c_hf:'Heart Failure',c_copd:'COPD',c_ast:'Asthma',c_ckd:'CKD',c_ra:'RA',c_hypo:'Hypothyroidism',c_hypr:'Hyperthyroidism',c_epi:'Epilepsy',c_dep:'Depression'};
  if(dm[d]){const u=await getUser(uid);if(!u||!chkLim(u))return bot.sendMessage(cid,t('limit',l),payKB(l));clrS(uid);const s=getS(uid);s.sec='chronic';s.chrDis=dm[d];s.chrKey=d;const p=await getProf(uid);s.msgs.push({role:'user',content:`Start monitoring ${dm[d]}.${pCtx(p)} Set up plan.`});await bot.sendMessage(cid,t('preparing',l));try{const r=await ai(getChronicPrompt(l),s.msgs);s.msgs.push({role:'assistant',content:r});await incUse(uid,u.daily_count);await sLong(cid,r);await bot.sendMessage(cid,'✅',chrActKB(d,l));}catch(e){console.error(e.message);await bot.sendMessage(cid,t('error',l),mainKB(l));clrS(uid);}return;}
  if(d.startsWith('cl_')){const s=getS(uid);if(!s.chrDis)return bot.sendMessage(cid,t('error',l),chrKB(l));s.await='chr_data';const fn=T.chr_enter[l]||T.chr_enter.uz;return bot.sendMessage(cid,fn(s.chrDis),{parse_mode:'Markdown'});}
  if(d.startsWith('cr_')){const s=getS(uid);if(!s.chrDis)return;const u=await getUser(uid);if(!u||!chkLim(u))return bot.sendMessage(cid,t('limit',l));const per=d.includes('_w_')?'weekly':'monthly';const days=per==='weekly'?7:30;await bot.sendMessage(cid,t('preparing',l));const logs=await getChrLogs(uid,s.chrDis,days);if(!logs.length)return bot.sendMessage(cid,'📊 —',chrActKB(s.chrKey,l));s.msgs.push({role:'user',content:`${per} report ${s.chrDis}.\n${JSON.stringify(logs)}`});try{const r=await ai(getChronicPrompt(l),s.msgs);s.msgs.push({role:'assistant',content:r});await incUse(uid,u.daily_count);await sLong(cid,r);}catch{await bot.sendMessage(cid,t('error',l));}return;}

  // DIAGNOSTIKA
  if(d.startsWith('dl_')||d.startsWith('di_')){clrS(uid);const s=getS(uid);s.sec='diagnostic';if(d.startsWith('dl_')){s.dType='lab';s.dSub=d.replace('dl_','');s.await='lab';return bot.sendMessage(cid,t('send_lab',l));}s.dType='img';s.dSub=d.replace('di_','');s.await='img';return bot.sendMessage(cid,t('send_img',l));}
});

// ═══════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════

bot.on('pre_checkout_query', q => bot.answerPreCheckoutQuery(q.id, true));
bot.on('successful_payment', async (m) => { const uid=m.from.id;const l=await getLang(uid);const un=new Date();un.setMonth(un.getMonth()+1);await supabase.from('users').update({is_premium:true,premium_until:un.toISOString()}).eq('id',uid);await savePay(uid,'telegram',4000000,'completed',m.successful_payment?.telegram_payment_charge_id);const fn=T.pay_ok[l]||T.pay_ok.uz;await bot.sendMessage(m.chat.id,fn(un.toLocaleDateString()),mainKB(l)); });

// ═══════════════════════════════════════════════════════════════
// PHOTO
// ═══════════════════════════════════════════════════════════════

bot.on('photo', async (m) => {
  const cid=m.chat.id,uid=m.from.id;const u=await getUser(uid,m.from.first_name,m.from.username);const l=u?.language||'uz';const s=getS(uid);
  if(!u)return bot.sendMessage(cid,t('error',l));if(!chkLim(u))return bot.sendMessage(cid,t('limit',l),payKB(l));
  if(s.sec==='diagnostic'||s.await==='lab'||s.await==='img'){if(!s.sec)s.sec='diagnostic';await bot.sendMessage(cid,t('img_wait',l));
    try{const ph=m.photo[m.photo.length-1];const buf=await dlF(ph.file_id);const b64=buf.toString('base64');const p=await getProf(uid);const cap=m.caption||'';const tn={xray:'X-ray',mri:'MRI',ct:'CT',us:'Ultrasound',blood:'Blood test',urine:'Urine test',hormone:'Hormone test',other:'Document'};const nm=tn[s.dSub]||'Image';
      const pr=(s.dType==='lab'||s.await==='lab')?`Read ${nm} results, compare ranges, analyze.${pCtx(p)}\n${cap}`:`Analyze ${nm}. Findings, differentials.${pCtx(p)}\n${cap}`;
      const r=await aiImg(getDiagnosticPrompt(l),[{role:'user',content:pr}],b64);await incUse(uid,u.daily_count);await saveMedRec(uid,s.dType||'?',nm,{cap,sub:s.dSub},ph.file_id,r);await sLong(cid,r);clrS(uid);await bot.sendMessage(cid,'—',aftDiagKB(l));
    }catch(e){console.error(e.message);await bot.sendMessage(cid,t('error',l));clrS(uid);}return;}
  await bot.sendMessage(cid,t('diag_t',l),{parse_mode:'Markdown',...diagKB(l)});
});

// ═══════════════════════════════════════════════════════════════
// MESSAGE
// ═══════════════════════════════════════════════════════════════

bot.on('message', async (m) => {
  if(!m.text||m.text.startsWith('/')||m.successful_payment)return;
  const cid=m.chat.id,uid=m.from.id,txt=m.text.trim();const u=await getUser(uid,m.from.first_name,m.from.username);const l=u?.language||'uz';const s=getS(uid);
  if(!u)return bot.sendMessage(cid,t('error',l));

  // PROFIL
  if(s.pEdit){const f=s.pEdit;let df,v;switch(f){case'age':{const n=parseInt(txt);if(!n||n<1||n>150)return bot.sendMessage(cid,'❌ 1-150');df='age';v=n;break;}case'weight':{const n=parseFloat(txt);if(!n||n<1)return bot.sendMessage(cid,'❌');df='weight';v=n;break;}case'height':{const n=parseFloat(txt);if(!n||n<30)return bot.sendMessage(cid,'❌');df='height';v=n;break;}case'allergy':df='allergies';v=txt;break;case'chronic':df='chronic_diseases';v=txt;break;case'meds':df='current_medications';v=txt;break;default:s.pEdit=null;return;}await updField(uid,df,v);s.pEdit=null;return bot.sendMessage(cid,'✅',mainKB(l));}

  // CHRONIC DATA
  if(s.await==='chr_data'&&s.sec==='chronic'&&s.chrDis){if(!chkLim(u))return bot.sendMessage(cid,t('limit',l),payKB(l));await bot.sendMessage(cid,t('analyzing',l));s.await=null;const logs=await getChrLogs(uid,s.chrDis,7);s.msgs.push({role:'user',content:`Disease:${s.chrDis}\nToday:${txt}\n${logs.length?'Last7d:'+JSON.stringify(logs.map(x=>({d:x.created_at,v:x.data}))):'First.'}\nAnalyze.`});try{const r=await ai(getChronicPrompt(l),s.msgs.slice(-20));s.msgs.push({role:'assistant',content:r});await incUse(uid,u.daily_count);let al='normal';if(r.includes('🔴'))al='critical';else if(r.includes('🟡'))al='warning';await saveChrLog(uid,s.chrDis,{raw:txt},r,al);await sLong(cid,r);await bot.sendMessage(cid,'—',chrActKB(s.chrKey,l));}catch(e){console.error(e.message);await bot.sendMessage(cid,t('error',l));}return;}

  // DIAG LAB TEXT
  if(s.await==='lab'&&s.sec==='diagnostic'){if(!chkLim(u))return bot.sendMessage(cid,t('limit',l),payKB(l));await bot.sendMessage(cid,t('analyzing',l));s.await=null;const p=await getProf(uid);try{const r=await ai(getDiagnosticPrompt(l),[{role:'user',content:`Analyze:${pCtx(p)}\n\n${txt}`}]);await incUse(uid,u.daily_count);await saveMedRec(uid,'lab',s.dSub||'lab',{raw:txt},null,r);await sLong(cid,r);clrS(uid);await bot.sendMessage(cid,'—',aftDiagKB(l));}catch(e){console.error(e.message);await bot.sendMessage(cid,t('error',l));clrS(uid);}return;}

  // IMG AWAIT
  if(s.await==='img'){s.diagCap=txt;return bot.sendMessage(cid,`✅ ${t('send_img',l)}`);}

  // ACTIVE DOCTOR/DRUG
  if(s.sec==='doctor'||s.sec==='drug'){if(!chkLim(u))return bot.sendMessage(cid,t('limit',l),payKB(l));if(chkEm(txt))await bot.sendMessage(cid,t('emer',l));if(!s.spec){const d=detSpec(txt);if(d)s.spec=d;}s.msgs.push({role:'user',content:txt});s.cnt++;await bot.sendMessage(cid,t('analyzing',l));const fn=s.sec==='doctor'?getDoctorPrompt:getDrugPrompt;try{const r=await ai(fn(l),s.msgs.slice(-20));s.msgs.push({role:'assistant',content:r});await incUse(uid,u.daily_count);await sLong(cid,r);await bot.sendMessage(cid,t('cont_end',l),sesKB(s.sec,l));}catch(e){console.error(e.message);await bot.sendMessage(cid,t('error',l));}return;}

  // CHRONIC FREE
  if(s.sec==='chronic'&&s.chrDis){if(!chkLim(u))return bot.sendMessage(cid,t('limit',l),payKB(l));s.msgs.push({role:'user',content:txt});await bot.sendMessage(cid,t('analyzing',l));try{const r=await ai(getChronicPrompt(l),s.msgs.slice(-20));s.msgs.push({role:'assistant',content:r});await incUse(uid,u.daily_count);await sLong(cid,r);}catch{await bot.sendMessage(cid,t('error',l));}return;}

  // DEFAULT
  if(!chkLim(u))return bot.sendMessage(cid,t('limit',l),payKB(l));await bot.sendMessage(cid,t('analyzing',l));try{const p=await getProf(uid);const r=await ai(getDrugPrompt(l),[{role:'user',content:txt+pCtx(p)}]);await incUse(uid,u.daily_count);await sLong(cid,r);await bot.sendMessage(cid,t('select',l),mainKB(l));}catch(e){console.error(e.message);await bot.sendMessage(cid,t('error',l));}
});

// ═══════════════════════════════════════════════════════════════
bot.on('polling_error', e => console.error('Poll:', e.message));
process.on('unhandledRejection', r => console.error('Unhandled:', r));
process.on('uncaughtException', e => console.error('Uncaught:', e));

console.log('🏥 MedAI v3.2 — Guideline Translation Fixed');
console.log('🌐 UZ | UZ-Cyr | RU | EN | KK | KY | TG');
console.log('💳 Telegram Pay | Payme | Click');
console.log('⏰', new Date().toLocaleString());
