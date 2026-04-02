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
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════

const UI = {
  welcome: {
    uz: (n) => `🏥 *MedAI — Sun'iy Intellekt Tibbiy Maslahatchi*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAssalomu alaykum, ${n}! 👋\n\nMen MedAI — Yevropa va Amerika tibbiyot guideline'lariga asoslangan sun'iy intellekt tibbiy yordamchisiman.\n\n👨‍⚕️ *Shifokor Maslahatchisi* — Simptomlarni tahlil, differensial diagnoz\n💊 *Dori Maslahatchisi* — Dori ma'lumotlari, o'zaro ta'sir\n📋 *Surunkali Kasalliklar* — Diabet, gipertoniya monitoring\n🔬 *Diagnostika* — Tahlillar + Rentgen, MRT, KT, UZI\n\n🆓 Bepul: kuniga 5 ta savol\n💎 Premium: cheksiz — 40,000 so'm/oy\n\n⚠️ _Men shifokor emasman. Tavsiyalarim yo'naltiruvchi xarakterga ega._`,
    uz_cyr: (n) => `🏥 *МедАИ — Сунъий Интеллект Тиббий Маслаҳатчи*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nАссалому алайкум, ${n}! 👋\n\nМен МедАИ — Европа ва Америка тиббиёт гайдлайнларига асосланган тиббий ёрдамчиман.\n\n👨‍⚕️ *Шифокор Маслаҳатчиси*\n💊 *Дори Маслаҳатчиси*\n📋 *Сурункали Касалликлар*\n🔬 *Диагностика*\n\n🆓 Бепул: кунига 5 та савол\n💎 Премиум: чексиз — 40,000 сўм/ой\n\n⚠️ _Мен шифокор эмасман._`,
    ru: (n) => `🏥 *MedAI — Медицинский ИИ-консультант*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nЗдравствуйте, ${n}! 👋\n\nЯ MedAI — медицинский ИИ-помощник на основе европейских и американских клинических рекомендаций.\n\n👨‍⚕️ *Консультант врача*\n💊 *Консультант по лекарствам*\n📋 *Хронические заболевания*\n🔬 *Диагностика*\n\n🆓 Бесплатно: 5 вопросов/день\n💎 Премиум: безлимит — 40,000 сум/мес\n\n⚠️ _Я не врач. Мои рекомендации носят ознакомительный характер._`,
    en: (n) => `🏥 *MedAI — AI Medical Consultant*\n━━━���━━━━━━━━━━━━━━━━━━━━━━\n\nHello, ${n}! 👋\n\nI'm MedAI — an AI medical assistant based on European and American clinical guidelines.\n\n👨‍⚕️ *Doctor Advisor*\n💊 *Drug Advisor*\n📋 *Chronic Disease Monitor*\n🔬 *Diagnostics*\n\n🆓 Free: 5 questions/day\n💎 Premium: unlimited — 40,000 UZS/month\n\n⚠️ _I am not a doctor. My advice is for informational purposes only._`,
    kk: (n) => `🏥 *MedAI — ЖИ Медициналық Кеңесші*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nСәлеметсіз бе, ${n}! 👋\n\n👨‍⚕️ *Дәрігер* 💊 *Дәрі* 📋 *Созылмалы аурулар* 🔬 *Диагностика*\n\n🆓 Тегін: 5 сұрақ/күн | 💎 Премиум: шексіз\n\n⚠️ _Мен дәрігер емеспін._`,
    ky: (n) => `🏥 *MedAI — ЖИ Медициналык Кеңешчи*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nСаламатсызбы, ${n}! 👋\n\n👨‍⚕️ *Дарыгер* 💊 *Дары* 📋 *Созулма оорулар* 🔬 *Диагностика*\n\n🆓 Бекер: 5 суроо/күн | 💎 Премиум: чексиз\n\n⚠️ _Мен дарыгер эмесмин._`,
    tg: (n) => `🏥 *MedAI — Маслиҳатгари тиббии ЗС*\n━━━━━���━━━━━━━━━━━━━━━━━━━━\n\nСалом, ${n}! 👋\n\n👨‍⚕️ *Духтур* 💊 *Дору* 📋 *Бемориҳои музмин* 🔬 *Диагностика*\n\n🆓 Ройгон: 5 савол/рӯз | 💎 Премиум: беҳад\n\n⚠️ _Ман духтур нестам._`
  },
  chooseLang: { uz: '🌐 Tilni tanlang:', uz_cyr: '🌐 Тилни танланг:', ru: '🌐 Выберите язык:', en: '🌐 Choose language:', kk: '🌐 Тілді таңдаңыз:', ky: '🌐 Тилди тандаңыз:', tg: '🌐 Забонро интихоб кунед:' },
  langSet: { uz: "✅ Til: O'zbekcha (Lotin)", uz_cyr: '✅ Тил: Ўзбекча (Кирил)', ru: '✅ Язык: Русский', en: '✅ Language: English', kk: '✅ Тіл: Қазақша', ky: '✅ Тил: Кыргызча', tg: '✅ Забон: Тоҷикӣ' },
  doctor: { uz: '👨‍⚕️ Shifokor', uz_cyr: '👨‍⚕️ Шифокор', ru: '👨‍⚕️ Врач', en: '👨‍⚕️ Doctor', kk: '👨‍⚕️ Дәрігер', ky: '👨‍⚕️ Дарыгер', tg: '👨‍⚕️ Духтур' },
  drug: { uz: '💊 Dori', uz_cyr: '💊 Дори', ru: '💊 Лекарства', en: '💊 Drugs', kk: '💊 Дәрі', ky: '💊 Дары', tg: '💊 Дору' },
  chronic: { uz: '📋 Surunkali', uz_cyr: '📋 Сурункали', ru: '📋 Хронические', en: '📋 Chronic', kk: '📋 Созылмалы', ky: '📋 Созулма', tg: '📋 Музмин' },
  diag: { uz: '🔬 Diagnostika', uz_cyr: '🔬 Диагностика', ru: '🔬 Диагностика', en: '🔬 Diagnostics', kk: '🔬 Диагностика', ky: '🔬 Диагностика', tg: '🔬 Диагностика' },
  profile: { uz: '👤 Profil', uz_cyr: '👤 Профил', ru: '👤 Профиль', en: '👤 Profile', kk: '👤 Профиль', ky: '👤 Профиль', tg: '👤 Профил' },
  history: { uz: '📊 Tarix', uz_cyr: '📊 Тарих', ru: '📊 История', en: '📊 History', kk: '📊 Тарих', ky: '📊 Тарых', tg: '📊 Таърих' },
  premium: { uz: '💎 Premium', uz_cyr: '💎 Премиум', ru: '💎 Премиум', en: '💎 Premium', kk: '💎 Премиум', ky: '💎 Премиум', tg: '💎 Премиум' },
  status: { uz: '📈 Status', uz_cyr: '📈 Статус', ru: '📈 Статус', en: '📈 Status', kk: '📈 Статус', ky: '📈 Статус', tg: '📈 Статус' },
  lang: { uz: '🌐 Til', uz_cyr: '🌐 Тил', ru: '🌐 Язык', en: '🌐 Language', kk: '🌐 Тіл', ky: '🌐 Тил', tg: '🌐 Забон' },
  menu: { uz: '🏥 Menyu', uz_cyr: '🏥 Меню', ru: '🏥 Меню', en: '🏥 Menu', kk: '🏥 Мәзір', ky: '🏥 Меню', tg: '🏥 Меню' },
  end: { uz: '🔚 Yakunlash', uz_cyr: '🔚 Якунлаш', ru: '🔚 Завершить', en: '🔚 End', kk: '🔚 Аяқтау', ky: '🔚 Аяктоо', tg: '🔚 Анҷом' },
  newC: { uz: '👨‍⚕️ Yangi', uz_cyr: '👨‍⚕️ Янги', ru: '👨‍⚕️ Новая', en: '👨‍⚕️ New', kk: '👨‍⚕️ Жаңа', ky: '👨‍⚕️ Жаңы', tg: '👨‍⚕️ Нав' },
  wait: { uz: '⏳ Tayyorlanmoqda...', uz_cyr: '⏳ Тайёрланмоқда...', ru: '⏳ Подготовка...', en: '⏳ Preparing...', kk: '⏳ Дайындалуда...', ky: '⏳ Даярдалууда...', tg: '⏳ Омода мешавад...' },
  think: { uz: '⏳ Tahlil qilinmoqda...', uz_cyr: '⏳ Таҳлил...', ru: '⏳ Анализ...', en: '⏳ Analyzing...', kk: '⏳ Талдау...', ky: '⏳ Анализ...', tg: '⏳ Таҳлил...' },
  askQ: { uz: '💬 Savolingizni yozing:', uz_cyr: '💬 Ёзинг:', ru: '💬 Напишите вопрос:', en: '💬 Type your question:', kk: '💬 Жазыңыз:', ky: '💬 Жазыңыз:', tg: '💬 Нависед:' },
  contEnd: { uz: '💬 Davom eting yoki yakunlang:', uz_cyr: '💬 Давом этинг:', ru: '💬 Продолжайте или завершите:', en: '💬 Continue or end:', kk: '💬 Жалғастырыңыз:', ky: '💬 Улантыңыз:', tg: '💬 Идома диҳед:' },
  done: { uz: '✅ Yakunlandi. Natijani shifokorga ko\'rsating.', uz_cyr: '✅ Якунланди.', ru: '✅ Завершено. Покажите врачу.', en: '✅ Done. Show results to your doctor.', kk: '✅ Аяқталды.', ky: '✅ Аяктады.', tg: '✅ Анҷом ёфт.' },
  sumWait: { uz: '⏳ Xulosa...', uz_cyr: '⏳ Хулоса...', ru: '⏳ Заключение...', en: '⏳ Summary...', kk: '⏳ Қорытынды...', ky: '⏳ Корутунду...', tg: '⏳ Хулоса...' },
  noLim: { uz: '❌ Limit tugadi (5/5). 💎 Premium oling!', uz_cyr: '❌ Лимит тугади.', ru: '❌ Лимит исчерпан (5/5). 💎 Премиум!', en: '❌ Limit reached (5/5). 💎 Go Premium!', kk: '❌ Лимит аяқталды.', ky: '❌ Лимит аяктады.', tg: '❌ Ҳудуд тамом шуд.' },
  err: { uz: '❌ Xatolik. Qaytadan urinib ko\'ring.', uz_cyr: '❌ Хатолик.', ru: '❌ Ошибка. Попробуйте снова.', en: '❌ Error. Try again.', kk: '❌ Қате.', ky: '❌ Ката.', tg: '❌ Хатогӣ.' },
  noSes: { uz: 'Faol suhbat yo\'q.', uz_cyr: 'Фаол суҳбат йўқ.', ru: 'Нет активной сессии.', en: 'No active session.', kk: 'Сеанс жоқ.', ky: 'Сессия жок.', tg: 'Ҷаласа нест.' },
  pick: { uz: 'Bo\'limni tanlang 👇', uz_cyr: 'Танланг 👇', ru: 'Выберите раздел 👇', en: 'Select section 👇', kk: 'Таңдаңыз 👇', ky: 'Тандаңыз 👇', tg: 'Интихоб кунед 👇' },
  premInfo: { uz: '💎 Premium: 40,000 so\'m/oy\n✅ Cheksiz savollar\n\nTo\'lov usulini tanlang:', uz_cyr: '💎 Премиум: 40,000 сўм/ой', ru: '💎 Премиум: 40,000 сум/мес\n✅ Безлимит\n\nВыберите оплату:', en: '💎 Premium: 40,000 UZS/mo\n✅ Unlimited\n\nChoose payment:', kk: '💎 40,000 сум/ай', ky: '💎 40,000 сум/ай', tg: '💎 40,000 сум/моҳ' },
  payOk: { uz: (d) => `✅ Premium! Muddati: ${d} 🎉`, uz_cyr: (d) => `✅ Премиум! ${d} 🎉`, ru: (d) => `✅ Премиум до ${d} 🎉`, en: (d) => `✅ Premium until ${d} 🎉`, kk: (d) => `✅ Премиум: ${d} 🎉`, ky: (d) => `✅ ${d} 🎉`, tg: (d) => `✅ Премиум то ${d} 🎉` },
  diagT: { uz: '🔬 Tahlil turini tanlang:', uz_cyr: '🔬 Танланг:', ru: '🔬 Выберите тип:', en: '🔬 Select type:', kk: '🔬 Таңдаңыз:', ky: '🔬 Тандаңыз:', tg: '🔬 Интихоб кунед:' },
  chrT: { uz: '📋 Kasallikni tanlang:', uz_cyr: '📋 Танланг:', ru: '📋 Выберите заболевание:', en: '📋 Select condition:', kk: '📋 Таңдаңыз:', ky: '📋 Тандаңыз:', tg: '📋 Интихоб кунед:' },
  sendLab: { uz: '📝 Natijalarni yozing yoki 📸 rasm yuboring:', uz_cyr: '📝 Ёзинг ёки расм юборинг:', ru: '📝 Напишите или отправьте фото:', en: '📝 Type results or send photo:', kk: '📝 Жазыңыз/сурет:', ky: '📝 Жазыңыз/сүрөт:', tg: '📝 Нависед/сурат:' },
  sendImg: { uz: '📸 Rasmni yuboring:', uz_cyr: '📸 Юборинг:', ru: '📸 Отправьте изображение:', en: '📸 Send image:', kk: '📸 Жіберіңіз:', ky: '📸 Жөнөтүңүз:', tg: '📸 Фиристед:' },
  imgWait: { uz: '⏳ Rasm tahlil qilinmoqda...', uz_cyr: '⏳ Расм...', ru: '⏳ Анализ изображения...', en: '⏳ Analyzing image...', kk: '⏳ Сурет...', ky: '⏳ Сүрөт...', tg: '⏳ Сурат...' },
  more: { uz: '🔬 Yana', uz_cyr: '🔬 Яна', ru: '🔬 Ещё', en: '🔬 More', kk: '🔬 Тағы', ky: '🔬 Дагы', tg: '🔬 Боз' },
  toDoc: { uz: '👨‍⚕️ Shifokorga', uz_cyr: '👨‍⚕️ Шифокорга', ru: '👨‍⚕️ К врачу', en: '👨‍⚕️ To doctor', kk: '👨‍⚕️ Дәрігерге', ky: '👨‍⚕️ Дарыгерге', tg: '👨‍⚕️ Ба духтур' },
  logD: { uz: '📝 Kiritish', uz_cyr: '📝 Киритиш', ru: '📝 Ввести', en: '📝 Enter', kk: '📝 Енгізу', ky: '📝 Киргизүү', tg: '📝 Ворид' },
  wkR: { uz: '📊 Hafta', uz_cyr: '📊 Ҳафта', ru: '📊 Неделя', en: '📊 Week', kk: '📊 Апта', ky: '📊 Жума', tg: '📊 Ҳафта' },
  moR: { uz: '📈 Oy', uz_cyr: '📈 Ой', ru: '📈 Месяц', en: '📈 Month', kk: '📈 Ай', ky: '📈 Ай', tg: '📈 Моҳ' },
  statT: { uz: (s, c, u) => `👤 Tarif: ${s} | Savollar: ${c}${u ? '\nPremium: ' + u : ''}`, uz_cyr: (s, c, u) => `👤 ${s} | ${c}${u ? '\n' + u : ''}`, ru: (s, c, u) => `👤 Тариф: ${s} | Вопросов: ${c}${u ? '\nПремиум до: ' + u : ''}`, en: (s, c, u) => `👤 Plan: ${s} | Questions: ${c}${u ? '\nPremium: ' + u : ''}`, kk: (s, c, u) => `👤 ${s} | ${c}${u ? '\n' + u : ''}`, ky: (s, c, u) => `👤 ${s} | ${c}${u ? '\n' + u : ''}`, tg: (s, c, u) => `👤 ${s} | ${c}${u ? '\n' + u : ''}` },
  chrEnt: { uz: (d) => `📝 *${d}* — ko'rsatkichlarni yozing:`, uz_cyr: (d) => `📝 *${d}*:`, ru: (d) => `📝 *${d}* — введите показатели:`, en: (d) => `📝 *${d}* — enter readings:`, kk: (d) => `📝 *${d}*:`, ky: (d) => `📝 *${d}*:`, tg: (d) => `📝 *${d}*:` },
  emer: { uz: '🚨🚨🚨 SHOSHILINCH! DARHOL 103 GA QO\'NG\'IROQ QILING! 🚨🚨🚨', uz_cyr: '🚨 ДАРҲОЛ 103! 🚨', ru: '🚨🚨🚨 СРОЧНО! ЗВОНИТЕ 103! 🚨🚨🚨', en: '🚨🚨🚨 EMERGENCY! CALL 103! 🚨🚨🚨', kk: '🚨 103-КЕ ШАЛЫҢЫЗ! 🚨', ky: '🚨 103-КӨ ЧАЛЫҢЫЗ! 🚨', tg: '🚨 БА 103 ЗАНГ ЗАНЕД! 🚨' }
};

function tx(key, lang) {
  var obj = UI[key];
  if (!obj) return '';
  return obj[lang] || obj['uz'] || '';
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS — KUCHLI GUIDELINE TARJIMA
// ═══════════════════════════════════════════════════════════════

function langRules(lang) {
  if (lang === 'uz') return `
=== MAJBURIY TIL QOIDALARI ===
SEN FAQAT O'ZBEK TILIDA LOTIN YOZUVIDA JAVOB BERASAN.

HAR BIR tibbiy terminni ALBATTA quyidagi formatda yoz:
O'zbekcha tarjima (Inglizcha asl nomi) — qisqa tushuntirish

MISOLLAR (aynan shunday yoz):
- "Yurak yetishmovchiligi (Heart Failure) — yurak mushagining qonni yetarlicha haydash qobiliyatining pasayishi"
- "Miokard infarkti (Myocardial Infarction) — yurak mushagiga qon oqimining to'satdan to'xtashi"
- "Elektrokardiogramma (EKG/ECG) — yurak elektrik faoliyatini yozib olish tekshiruvi"
- "Qon bosimi (Blood Pressure) — qon tomirlaridagi bosim ko'rsatkichi"

HAR BIR guideline nomini ALBATTA quyidagicha yoz:
- "AHA/ACC (Amerika Yurak Assotsiatsiyasi / Amerika Kardiologiya Kolleji — American Heart Association / American College of Cardiology) tavsiyasiga ko'ra..."
- "ADA (Amerika Diabet Assotsiatsiyasi — American Diabetes Association) standartlariga ko'ra..."
- "GOLD (Surunkali obstruktiv o'pka kasalligi bo'yicha global tashabbusi — Global Initiative for Chronic Obstructive Lung Disease) tavsiyasiga ko'ra..."
- "ESC (Yevropa Kardiologiya Jamiyati — European Society of Cardiology) ko'rsatmalariga ko'ra..."
- "KDIGO (Buyrak kasalliklarida global natijalarni yaxshilash tashkiloti — Kidney Disease Improving Global Outcomes) bo'yicha..."

HAR BIR dori guruhi nomini ALBATTA quyidagicha yoz:
- "Angiotenzin konvertaz fermenti inhibitorlari (ACE inhibitors — iAPF) — qon bosimni pasaytiradigan dorilar guruhi"
- "Beta-adrenoblokerlar (Beta-blockers) — yurak urish tezligini sekinlashtiradigan dorilar"
- "Proton pompasi inhibitorlari (PPI — Proton Pump Inhibitors) — oshqozon kislotasini kamaytiradigan dorilar"

HAR BIR laboratoriya ko'rsatkichi nomini ALBATTA:
- "Gemoglobin (Hemoglobin, Hb) — qondagi kislorod tashuvchi oqsil"
- "Eritrotsitlar cho'kish tezligi (EChT / ESR — Erythrocyte Sedimentation Rate) — yallig'lanish ko'rsatkichi"
- "Glikozilangan gemoglobin (HbA1c — Glycated Hemoglobin) — oxirgi 3 oydagi o'rtacha qand darajasi"

QISQARTMALARNI BIRINCHI MARTA ISHLATGANDA ALBATTA TO'LIQ YOZ.
BU QOIDALARNI BUZISH TA'QIQLANGAN.`;

  if (lang === 'uz_cyr') return `
=== МАЖБУРИЙ ТИЛ ҚОИДАЛАРИ ===
СЕН ФАҚАТ ЎЗБЕК ТИЛИДА КИРИЛ ЁЗУВИДА ЖАВОБ БЕРАСАН.

Ҳар бир тиббий терминни: Ўзбекча (English) — тушунтириш форматда ёз.
Масалан: "Юрак етишмовчилиги (Heart Failure) — юрак мушагининг қонни етарлича ҳайдаш қобилиятининг пасайиши"

Гайдлайнлар: "AHA/ACC (Америка Юрак Ассоциацияси — American Heart Association) тавсиясига кўра..."
Дори гуруҳлари: "Ангиотензин конвертаз фермент ингибиторлари (ACE inhibitors) — қон босимни пасайтирувчи дорилар"
Лаборатория: "Гемоглобин (Hemoglobin, Hb) — қондаги кислород ташувчи оқсил"

БАРЧА ҚИСҚАРТМАЛАРНИ БИРИНЧИ МАРТА ТЎЛИҚ ЁЗ.`;

  if (lang === 'ru') return `
=== ОБЯЗАТЕЛЬНЫЕ ЯЗЫКОВЫЕ ПРАВИЛА ===
ОТВЕЧАЙ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.

КАЖДЫЙ медицинский термин пиши так:
Русское название (English) — краткое пояснение

ПРИМЕРЫ (пиши именно так):
- "Сердечная недостаточность (Heart Failure) — состояние, при котором сердце не может эффективно перекачивать кровь"
- "Инфаркт миокарда (Myocardial Infarction) — острое нарушение кровоснабжения сердечной мышцы"
- "Электрокардиограмма (ЭКГ/ECG) — запись электрической активности сердца"
- "Артериальное давление (Blood Pressure) — давление крови в сосудах"

КАЖДЫЙ гайдлайн пиши так:
- "Согласно рекомендациям AHA/ACC (Американская ассоциация сердца / Американский колледж кардиологии — American Heart Association / American College of Cardiology)..."
- "По стандартам ADA (Американская диабетическая ассоциация — American Diabetes Association)..."
- "Согласно GOLD (Глобальная инициатива по ХОБЛ — Global Initiative for Chronic Obstructive Lung Disease)..."

КАЖДУЮ группу препаратов пиши так:
- "Ингибиторы ангиотензинпревращающего фермента (иАПФ / ACE inhibitors) — группа препаратов для снижения давления"
- "Бета-адреноблокаторы (Beta-blockers) — препараты, замедляющие сердечный ритм"
- "Ингибиторы протонной помпы (ИПП / PPI — Proton Pump Inhibitors) — препараты для снижения кислотности желудка"

ВСЕ аббревиатуры при первом упоминании расшифровывай ПОЛНОСТЬЮ на русском и английском.
НАРУШЕНИЕ ЭТИХ ПРАВИЛ ЗАПРЕЩЕНО.`;

  if (lang === 'en') return `
=== MANDATORY LANGUAGE RULES ===
Respond ENTIRELY in English.
For every medical term, provide a brief layperson explanation:
- "Heart Failure — a condition where the heart cannot pump blood effectively"
- "Myocardial Infarction (MI) — commonly known as a heart attack"
- "ACE inhibitors (Angiotensin-Converting Enzyme inhibitors) — medications that lower blood pressure by relaxing blood vessels"
Spell out ALL abbreviations on first use.
Reference guidelines with full names: "According to AHA/ACC (American Heart Association / American College of Cardiology) guidelines..."`;

  if (lang === 'kk') return `
=== МІНДЕТТІ ТІЛ ЕРЕЖЕЛЕРІ ===
ТІКЕЛЕЙ ҚАЗАҚ ТІЛІНДЕ КИРИЛ ЖАЗУЫМЕН ЖАУАП БЕР.
Әрбір медициналық термин: Қазақша (English) — түсіндірме.
Мысалы: "Жүрек жеткіліксіздігі (Heart Failure) — жүректің қанды тиімді айдай алмау жағдайы"
Нұсқаулықтар: "AHA/ACC (Америка Жүрек Қауымдастығы — American Heart Association) нұсқаулығына сәйкес..."
Дәрі топтары: "Ангиотензин айналдырушы фермент тежегіштері (ACE inhibitors) — қан қысымын төмендететін дәрілер"
Барлық қысқартуларды бірінші рет толық жаз.`;

  if (lang === 'ky') return `
=== МИЛДЕТТҮҮ ТИЛ ЭРЕЖЕЛЕРИ ===
КЫРГЫЗ ТИЛИНДЕ КИРИЛ ЖАЗУУСУ МЕНЕН ЖООП БЕР.
Ар бир медициналык термин: Кыргызча (English) — түшүндүрмө.
Мисалы: "Жүрөк жетишсиздиги (Heart Failure) — жүрөктүн канды натыйжалуу айдай албаган абалы"
Колдонмолор: "AHA/ACC (Америка Жүрөк Ассоциациясы — American Heart Association) колдонмосуна ылайык..."
Дары топтору: "Ангиотензин айландыргыч фермент ингибиторлору (ACE inhibitors) — кан басымын төмөндөтүүчү дарылар"
Бардык кыскартууларды биринчи жолу толук жаз.`;

  if (lang === 'tg') return `
=== ҚОИДАҲОИ ҲАТМИИ ЗАБОН ===
ТАНҲО БА ЗАБОНИ ТОҶИКӢ БО ХАТТИ КИРИЛӢ ҶАВОБ ДЕҲ.
Ҳар як истилоҳи тиббӣ: Тоҷикӣ (English) — шарҳ.
Масалан: "Норасоии дил (Heart Failure) — ҳолате ки дил хунро самаранок кашида наметавонад"
Дастурномаҳо: "Мувофиқи тавсияҳои AHA/ACC (Ассотсиатсияи Дили Амрико — American Heart Association)..."
Гурӯҳҳои дору: "Ингибиторҳои ферменти табдилдиҳандаи ангиотензин (ACE inhibitors) — доруҳои паст кунандаи фишори хун"
Ҳамаи ихтисороҳоро бори аввал пурра нависед.`;

  return langRules('uz');
}

function doctorPrompt(lang) {
  return `You are MedAI Doctor Advisor — an advanced AI clinical decision support system providing evidence-based medical guidance.

${langRules(lang)}

=== CLINICAL GUIDELINES DATABASE ===
You MUST reference these and ALWAYS translate their names per the language rules above:

Cardiology: AHA/ACC, ESC, JNC 8, CHEST
Endocrinology: ADA, EASD, Endocrine Society, ATA/ETA, AACE
Pulmonology: GOLD, GINA, ATS/ERS, BTS
Gastroenterology: ACG, AGA, AASLD, EASL, Rome IV
Nephrology: KDIGO, KDOQI
Rheumatology: ACR, EULAR
Neurology: AAN, EAN, ICHD-3
Infectious: IDSA, CDC, WHO, ESCMID
Oncology: NCCN, ESMO, ACS, ASCO
Urology: AUA, EAU
Dermatology: AAD, EADV
Psychiatry: APA, NICE, WFSBP, CANMAT
OB/GYN: ACOG, RCOG, FIGO
Pediatrics: AAP, ESPID, ESPGHAN
General: UpToDate, Cochrane, BMJ Best Practice, DynaMed, NICE, SIGN

=== CONSULTATION METHOD ===
Phase 1: Take history using SOCRATES + PMH + Medications + Allergies + Family + Social history. Ask 1-2 questions at a time. Minimum 4-5 exchanges before analysis.

Phase 2: After sufficient data provide:
- Differential diagnosis with probability % and specific guideline reference (translated)
- Risk level: 🔴 HIGH (call 103) / 🟡 MEDIUM (see doctor 24-48h) / 🟢 LOW (scheduled visit)
- Clinical scoring systems where applicable (explain each in patient language)
- "Can't miss" dangerous diagnoses to exclude

Phase 3: Recommendations:
- Non-pharmacological measures
- Pharmacological: drug CLASS only (never specific drug name + dose as prescription)
- Specialist referral with urgency
- Follow-up plan and timeline
- Red flags requiring emergency care

=== EMERGENCY DETECTION ===
If patient describes: chest pain + dyspnea, stroke signs, severe bleeding, anaphylaxis, suicidal ideation, seizure > 5 min, severe trauma — IMMEDIATELY flag as emergency, instruct to call 103.

=== STRICT RULES ===
1. NEVER prescribe specific drugs with specific doses
2. ALWAYS reference guideline WITH full translated name
3. ALWAYS show differential diagnosis with probabilities
4. ALWAYS assign risk level with emoji
5. ALWAYS translate EVERY medical term per language rules
6. ALWAYS end responses with disclaimer about being AI
7. NEVER claim to be a doctor
8. Start FIRST response with AI disclaimer in patient language
9. ALWAYS spell out abbreviations on first use`;
}

function drugPrompt(lang) {
  return `You are MedAI Drug Advisor — AI pharmaceutical consultation system based on FDA, EMA, WHO guidelines.

${langRules(lang)}

=== SOURCES ===
FDA Drug Labels, EMA SmPC, WHO Essential Medicines, BNF, Lexicomp, Micromedex, Stockley's Drug Interactions, Beers Criteria (AGS), PharmGKB

=== CAPABILITIES ===
1. Drug information: mechanism of action, pharmacokinetics
2. Interactions: drug-drug, drug-food, drug-herb (severity: 🔴 Contraindicated, 🟠 Serious, 🟡 Moderate, 🟢 Minor)
3. Side effects: common (>10%), uncommon (1-10%), rare (<1%), serious
4. Contraindications: absolute and relative
5. Pregnancy/Lactation: FDA categories or PLLR
6. Geriatric/Pediatric considerations
7. Renal/Hepatic dose adjustment guidance
8. Therapeutic drug monitoring

=== STRICT RULES ===
1. NEVER prescribe — only provide information about asked drugs
2. ALWAYS recommend consulting doctor before any medication changes
3. ALWAYS check and mention interactions between listed medications
4. ALWAYS ask about allergies and pregnancy/breastfeeding status
5. ALWAYS translate every medical and pharmacological term per language rules above
6. ALWAYS spell out abbreviations on first use`;
}

function chronicPrompt(lang) {
  return `You are MedAI Chronic Disease Monitor — AI monitoring system for chronic diseases based on international guidelines.

${langRules(lang)}

=== SUPPORTED CONDITIONS & GUIDELINES ===
Diabetes T1/T2: ADA, EASD, AACE
Hypertension: AHA/ACC, ESC/ESH
Heart Failure: AHA/ACC, ESC
COPD: GOLD
Asthma: GINA
CKD: KDIGO
RA: ACR, EULAR
Thyroid: ATA, ETA
Epilepsy: ILAE, AAN
Depression: APA, NICE, CANMAT

=== MONITORING ===
Track daily parameters, compare to guideline targets, identify trends.

=== ALERTS ===
🔴 CRITICAL: Immediate medical attention needed (call 103)
🟡 WARNING: See doctor within 24-48 hours
🟢 NORMAL: Continue current plan

=== RULES ===
1. NEVER change medication doses — only remind what doctor prescribed
2. ALWAYS flag critical values immediately
3. ALWAYS track trends over time
4. Be encouraging and supportive
5. ALWAYS translate every term per language rules above`;
}

function diagPrompt(lang) {
  return `You are MedAI Diagnostic Analyzer — AI system for analyzing laboratory results and medical imaging.

${langRules(lang)}

=== LABORATORY ANALYSIS ===
CBC, BMP/CMP, LFT, Lipid Panel, Coagulation, Thyroid, Diabetes markers (glucose, HbA1c, insulin), Hormones, Tumor markers, Inflammatory/Autoimmune, Cardiac markers, Iron studies, Urinalysis, Vitamins/Minerals.

Always use age-and-sex-specific reference ranges.

=== IMAGING ANALYSIS ===
X-ray, CT, MRI, Ultrasound — identify normal anatomy, abnormal findings, suggest differentials.

=== METHOD ===
1. Compare each value to reference range
2. Categorize abnormality severity (mild/moderate/severe)
3. Look for patterns (e.g., microcytic anemia pattern)
4. Correlate related findings
5. Suggest possible causes
6. Recommend follow-up tests

=== RULES ===
1. ALWAYS use age/sex-specific reference ranges
2. ALWAYS identify critical values requiring immediate action
3. NEVER make definitive diagnosis — only suggest possibilities
4. ALWAYS state this is preliminary AI analysis
5. ALWAYS recommend professional interpretation
6. ALWAYS translate every term and lab name per language rules above`;
}

// ═══════════════════════════════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════════════════════════════

async function getUser(uid, fn, un) {
  try {
    let { data: u } = await supabase.from('users').select('*').eq('id', uid).single();
    if (!u) {
      await supabase.from('users').insert({ id: uid, first_name: fn || 'User', username: un || null, language: 'uz' });
      let { data: n } = await supabase.from('users').select('*').eq('id', uid).single();
      u = n;
    }
    if (!u) return null;
    var td = new Date().toISOString().split('T')[0];
    if (u.last_reset !== td) {
      await supabase.from('users').update({ daily_count: 0, last_reset: td }).eq('id', uid);
      u.daily_count = 0;
    }
    if (u.is_premium && u.premium_until && new Date(u.premium_until) < new Date()) {
      await supabase.from('users').update({ is_premium: false }).eq('id', uid);
      u.is_premium = false;
    }
    return u;
  } catch (e) {
    console.error('getUser:', e.message);
    return null;
  }
}

async function getLang(uid) {
  try {
    var { data, error } = await supabase.from('users').select('language').eq('id', uid).single();
    if (error || !data || !data.language) return 'uz';
    return data.language;
  } catch (e) {
    return 'uz';
  }
}

async function setLang(uid, lang) {
  try {
    var { data } = await supabase.from('users').select('id').eq('id', uid).single();
    if (!data) {
      await supabase.from('users').insert({ id: uid, language: lang });
    } else {
      await supabase.from('users').update({ language: lang }).eq('id', uid);
    }
    return true;
  } catch (e) {
    console.error('setLang:', e.message);
    return false;
  }
}

async function getProfile(uid) {
  try {
    var { data } = await supabase.from('users').select('age,gender,weight,height,blood_type,allergies,chronic_diseases,current_medications').eq('id', uid).single();
    return data || {};
  } catch (e) {
    return {};
  }
}

async function updField(uid, f, v) {
  try {
    await supabase.from('users').update({ [f]: v }).eq('id', uid);
    return true;
  } catch (e) {
    return false;
  }
}

async function incUse(uid, c) {
  await supabase.from('users').update({ daily_count: c + 1 }).eq('id', uid);
}

async function saveCon(uid, sec, msgs, sum, spec) {
  try {
    await supabase.from('consultations').insert({ user_id: uid, section: sec, status: 'completed', messages: msgs, summary: sum ? sum.substring(0, 5000) : null, specialty: spec, completed_at: new Date().toISOString() });
  } catch (e) {
    console.error('saveCon:', e.message);
  }
}

async function saveChrLog(uid, dis, dt, fb, al) {
  try {
    await supabase.from('chronic_logs').insert({ user_id: uid, disease: dis, data: dt, ai_feedback: fb, alert_level: al });
  } catch (e) {
    console.error('saveChrLog:', e.message);
  }
}

async function getChrLogs(uid, dis, days) {
  try {
    var since = new Date();
    since.setDate(since.getDate() - days);
    var { data } = await supabase.from('chronic_logs').select('*').eq('user_id', uid).eq('disease', dis).gte('created_at', since.toISOString()).order('created_at', { ascending: true });
    return data || [];
  } catch (e) {
    return [];
  }
}

async function saveMedRec(uid, tp, ti, dt, fi, an) {
  try {
    await supabase.from('medical_records').insert({ user_id: uid, record_type: tp, title: ti, data: dt, file_id: fi, ai_analysis: an });
  } catch (e) {
    console.error('saveMedRec:', e.message);
  }
}

async function getHist(uid) {
  try {
    var { data } = await supabase.from('consultations').select('id,section,summary,created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(10);
    return data || [];
  } catch (e) {
    return [];
  }
}

async function savePay(uid, prov, amt, st, txid) {
  try {
    await supabase.from('payments').insert({ user_id: uid, provider: prov, amount: amt, status: st, transaction_id: txid });
  } catch (e) {
    console.error('savePay:', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// SESSION & HELPERS
// ═══════════════════════════════════════════════════════════════

function getS(uid) {
  if (!sessions[uid]) {
    sessions[uid] = { sec: null, msgs: [], spec: null, chrDis: null, chrKey: null, dType: null, dSub: null, pEdit: null, aw: null, cnt: 0 };
  }
  return sessions[uid];
}

function clrS(uid) {
  sessions[uid] = { sec: null, msgs: [], spec: null, chrDis: null, chrKey: null, dType: null, dSub: null, pEdit: null, aw: null, cnt: 0 };
}

async function callAI(sys, msgs, mt) {
  var r = await client.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: mt || 8192, temperature: 0.3, system: sys, messages: msgs });
  return r.content[0].text;
}

async function callAIImg(sys, msgs, b64, mime) {
  var last = msgs[msgs.length - 1];
  var prev = msgs.slice(0, -1);
  var im = { role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mime || 'image/jpeg', data: b64 } }, { type: 'text', text: last ? last.content : 'Analyze this medical image.' }] };
  var r = await client.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: 8192, temperature: 0.2, system: sys, messages: prev.concat([im]) });
  return r.content[0].text;
}

async function sendLong(cid, text) {
  var mx = 4096;
  if (text.length <= mx) {
    try { await bot.sendMessage(cid, text, { parse_mode: 'Markdown' }); } catch (e) { try { await bot.sendMessage(cid, text); } catch (e2) { for (var i = 0; i < text.length; i += mx) { await bot.sendMessage(cid, text.substring(i, i + mx)); } } }
  } else {
    var chunks = [];
    var rem = text;
    while (rem.length > 0) {
      if (rem.length <= mx) { chunks.push(rem); break; }
      var idx = rem.lastIndexOf('\n\n', mx);
      if (idx < mx / 2) idx = rem.lastIndexOf('\n', mx);
      if (idx < mx / 2) idx = mx;
      chunks.push(rem.substring(0, idx));
      rem = rem.substring(idx).trim();
    }
    for (var j = 0; j < chunks.length; j++) {
      try { await bot.sendMessage(cid, chunks[j], { parse_mode: 'Markdown' }); } catch (e) { await bot.sendMessage(cid, chunks[j]); }
    }
  }
}

function profCtx(p) {
  if (!p) return '';
  var a = [];
  if (p.age) a.push('Age: ' + p.age);
  if (p.gender) a.push('Gender: ' + p.gender);
  if (p.weight) a.push('Weight: ' + p.weight + 'kg');
  if (p.height) a.push('Height: ' + p.height + 'cm');
  if (p.blood_type) a.push('Blood: ' + p.blood_type);
  if (p.allergies) a.push('Allergies: ' + p.allergies);
  if (p.chronic_diseases) a.push('Chronic: ' + p.chronic_diseases);
  if (p.current_medications) a.push('Meds: ' + p.current_medications);
  if (a.length === 0) return '';
  return '\n\nPatient profile:\n' + a.join('\n');
}

function isEmergency(text) {
  var low = text.toLowerCase();
  var words = ['hushimdan ketdim', 'nafas ololmayapman', 'qon ketayapti', 'yuzim qiyshaydi', 'zaharlandim', "o'zimni o'ldirmoqchiman", 'haroratim 40', 'tutqanoq', 'anafilaksiya', 'потерял сознание', 'не могу дышать', 'кровотечение', 'сильная боль в груди', 'отравился', 'хочу покончить', 'температура 40', 'lost consciousness', 'cannot breathe', 'severe bleeding', 'poisoned', 'suicidal', 'seizure'];
  for (var i = 0; i < words.length; i++) {
    if (low.indexOf(words[i]) !== -1) return true;
  }
  return false;
}

function findSpec(text) {
  var low = text.toLowerCase();
  var map = { cardiology: ['yurak', 'сердц', 'heart', 'qon bosim', 'давлен', 'pressure'], endocrinology: ['qand', 'diabet', 'сахар', 'diabetes', 'gormon', 'гормон', 'thyroid'], pulmonology: ['nafas', "yo'tal", 'кашель', 'cough', 'astma', 'asthma', 'lung'], gastroenterology: ['oshqozon', 'желуд', 'stomach', 'jigar', 'печен', 'liver'], neurology: ["bosh og'rig", 'головн', 'headache', 'migren', 'migraine'], nephrology: ['buyrak', 'почк', 'kidney'], psychiatry: ['depressiya', 'депресси', 'depression', 'uyqu', 'сон', 'sleep'] };
  for (var sp in map) {
    for (var j = 0; j < map[sp].length; j++) {
      if (low.indexOf(map[sp][j]) !== -1) return sp;
    }
  }
  return null;
}

async function dlFile(fid) {
  var f = await bot.getFile(fid);
  var url = 'https://api.telegram.org/file/bot' + process.env.TELEGRAM_BOT_TOKEN + '/' + f.file_path;
  return new Promise(function (resolve, reject) {
    https.get(url, function (res) {
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () { resolve(Buffer.concat(chunks)); });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function hasLimit(u) {
  return u.is_premium || u.daily_count < 5;
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARDS
// ═══════════════════════════════════════════════════════════════

function langKB() {
  return { reply_markup: { inline_keyboard: [[{ text: "🇺🇿 O'zbekcha (Lotin)", callback_data: 'lang_uz' }, { text: '🇺🇿 Ўзбекча (Кирил)', callback_data: 'lang_uz_cyr' }], [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }, { text: '🇬🇧 English', callback_data: 'lang_en' }], [{ text: '🇰🇿 Қазақша', callback_data: 'lang_kk' }, { text: '🇰🇬 Кыргызча', callback_data: 'lang_ky' }], [{ text: '🇹🇯 Тоҷикӣ', callback_data: 'lang_tg' }]] } };
}

function mainKB(l) {
  return { reply_markup: { inline_keyboard: [[{ text: tx('doctor', l), callback_data: 'go_doc' }], [{ text: tx('drug', l), callback_data: 'go_drug' }], [{ text: tx('chronic', l), callback_data: 'go_chr' }], [{ text: tx('diag', l), callback_data: 'go_diag' }], [{ text: tx('profile', l), callback_data: 'prof' }, { text: tx('history', l), callback_data: 'hist' }], [{ text: tx('premium', l), callback_data: 'prem' }, { text: tx('status', l), callback_data: 'stat' }], [{ text: tx('lang', l), callback_data: 'ch_lang' }]] } };
}

function payKB(l) {
  return { reply_markup: { inline_keyboard: [[{ text: '💳 Telegram Pay', callback_data: 'pay_tg' }], [{ text: '📱 Payme', callback_data: 'pay_pm' }], [{ text: '📱 Click', callback_data: 'pay_cl' }], [{ text: tx('menu', l), callback_data: 'mm' }]] } };
}

function sesKB(sec, l) {
  return { reply_markup: { inline_keyboard: [[{ text: tx('end', l), callback_data: 'end_' + sec }], [{ text: tx('menu', l), callback_data: 'fmm' }]] } };
}

function diagKB(l) {
  return { reply_markup: { inline_keyboard: [[{ text: '🩸 Blood/Qon', callback_data: 'dl_blood' }, { text: '💧 Urine/Siydik', callback_data: 'dl_urine' }], [{ text: '🧬 Hormone/Gormon', callback_data: 'dl_hormone' }, { text: '📝 Other/Boshqa', callback_data: 'dl_other' }], [{ text: '🫁 X-ray', callback_data: 'di_xray' }, { text: '🧲 MRI', callback_data: 'di_mri' }], [{ text: '💻 CT', callback_data: 'di_ct' }, { text: '📡 US/UZI', callback_data: 'di_us' }], [{ text: tx('menu', l), callback_data: 'mm' }]] } };
}

function chrKB(l) {
  return { reply_markup: { inline_keyboard: [[{ text: '🩸 Diabet T2', callback_data: 'c_dt2' }, { text: '💉 Diabet T1', callback_data: 'c_dt1' }], [{ text: '🫀 Hypertension', callback_data: 'c_htn' }, { text: '❤️ Heart Failure', callback_data: 'c_hf' }], [{ text: '🫁 COPD', callback_data: 'c_copd' }, { text: '🌬 Asthma', callback_data: 'c_ast' }], [{ text: '🫘 CKD', callback_data: 'c_ckd' }, { text: '🦴 RA', callback_data: 'c_ra' }], [{ text: '🦋 Hypothyroid', callback_data: 'c_hypo' }, { text: '⚡ Hyperthyroid', callback_data: 'c_hypr' }], [{ text: '🧠 Epilepsy', callback_data: 'c_epi' }, { text: '😔 Depression', callback_data: 'c_dep' }], [{ text: tx('menu', l), callback_data: 'mm' }]] } };
}

function chrActKB(dk, l) {
  return { reply_markup: { inline_keyboard: [[{ text: tx('logD', l), callback_data: 'cl_' + dk }], [{ text: tx('wkR', l), callback_data: 'crw_' + dk }, { text: tx('moR', l), callback_data: 'crm_' + dk }], [{ text: tx('end', l), callback_data: 'end_chr' }], [{ text: tx('menu', l), callback_data: 'fmm' }]] } };
}

function aftDiagKB(l) {
  return { reply_markup: { inline_keyboard: [[{ text: tx('more', l), callback_data: 'go_diag' }], [{ text: tx('toDoc', l), callback_data: 'go_doc' }], [{ text: tx('menu', l), callback_data: 'mm' }]] } };
}

// ═══════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function startSection(cid, uid, sec) {
  var u = await getUser(uid);
  var l = u ? u.language || 'uz' : 'uz';
  if (!u) return bot.sendMessage(cid, tx('err', l));
  if (!hasLimit(u)) return bot.sendMessage(cid, tx('noLim', l), payKB(l));

  clrS(uid);
  var s = getS(uid);
  s.sec = sec;

  var p = await getProfile(uid);
  var ctx = profCtx(p);
  var startMsg = sec === 'doctor' ? 'New consultation started. Patient is greeting.' + ctx : 'New drug consultation started.' + ctx;
  s.msgs.push({ role: 'user', content: startMsg });

  await bot.sendMessage(cid, tx('wait', l));

  try {
    var prompt = sec === 'doctor' ? doctorPrompt(l) : drugPrompt(l);
    var response = await callAI(prompt, s.msgs);
    s.msgs.push({ role: 'assistant', content: response });
    s.cnt = s.cnt + 1;
    await incUse(uid, u.daily_count);
    await sendLong(cid, response);
    await bot.sendMessage(cid, tx('askQ', l), sesKB(sec, l));
  } catch (e) {
    console.error('startSection:', e.message);
    await bot.sendMessage(cid, tx('err', l), mainKB(l));
    clrS(uid);
  }
}

async function endSession(cid, uid) {
  var l = await getLang(uid);
  var s = getS(uid);
  if (!s.sec || s.msgs.length < 2) {
    clrS(uid);
    return bot.sendMessage(cid, tx('noSes', l), mainKB(l));
  }

  await bot.sendMessage(cid, tx('sumWait', l));

  var promptMap = { doctor: doctorPrompt, drug: drugPrompt, chronic: chronicPrompt, diagnostic: diagPrompt };
  var promptFn = promptMap[s.sec] || doctorPrompt;
  var sysPrompt = promptFn(l);

  s.msgs.push({ role: 'user', content: 'End consultation now. Provide: 1) Full summary 2) Differential diagnoses 3) Recommended tests 4) Urgency level 5) Next steps 6) All guidelines used. Remember to translate EVERY medical term per the language rules.' });

  try {
    var summary = await callAI(sysPrompt, s.msgs);
    await saveCon(uid, s.sec, s.msgs, summary, s.spec);
    await sendLong(cid, summary);
    await bot.sendMessage(cid, tx('done', l), { reply_markup: { inline_keyboard: [[{ text: tx('menu', l), callback_data: 'mm' }], [{ text: tx('newC', l), callback_data: 'go_doc' }]] } });
  } catch (e) {
    console.error('endSession:', e.message);
    await bot.sendMessage(cid, tx('err', l), mainKB(l));
  }

  clrS(uid);
}

async function showProfile(cid, uid) {
  var l = await getLang(uid);
  var p = await getProfile(uid);
  var result = await supabase.from('users').select('first_name').eq('id', uid).single();
  var u = result.data;
  var e = '❌';
  var text = '👤 *' + (u ? u.first_name : '?') + '*\n\n🎂 ' + (p.age || e) + '  ⚧ ' + (p.gender || e) + '\n⚖️ ' + (p.weight ? p.weight + 'kg' : e) + '  📏 ' + (p.height ? p.height + 'cm' : e) + '\n🩸 ' + (p.blood_type || e) + '\n⚠️ ' + (p.allergies || e) + '\n🏥 ' + (p.chronic_diseases || e) + '\n💊 ' + (p.current_medications || e);

  await bot.sendMessage(cid, text, { parse_mode: 'Markdown', reply_markup: { inline_keyboard: [[{ text: '🎂', callback_data: 'pe_age' }, { text: '⚧', callback_data: 'pe_gender' }, { text: '⚖️', callback_data: 'pe_weight' }, { text: '📏', callback_data: 'pe_height' }], [{ text: '🩸', callback_data: 'pe_blood' }, { text: '⚠️', callback_data: 'pe_allergy' }, { text: '🏥', callback_data: 'pe_chronic' }, { text: '💊', callback_data: 'pe_meds' }], [{ text: tx('menu', l), callback_data: 'mm' }]] } });
}

async function showHistory(cid, uid) {
  var l = await getLang(uid);
  var h = await getHist(uid);
  if (!h.length) return bot.sendMessage(cid, '📊 —', mainKB(l));

  var emojis = { doctor: '👨‍⚕️', drug: '💊', chronic: '📋', diagnostic: '🔬' };
  var text = '📊\n\n';
  for (var i = 0; i < h.length; i++) {
    var d = new Date(h[i].created_at).toLocaleDateString();
    var sum = h[i].summary ? h[i].summary.substring(0, 80) + '...' : '';
    text = text + (emojis[h[i].section] || '📄') + ' ' + h[i].section + ' — ' + d + '\n' + sum + '\n\n';
  }
  await bot.sendMessage(cid, text, { parse_mode: 'Markdown', ...mainKB(l) });
}

// ═══════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════

bot.onText(/\/start/, async function (msg) {
  await getUser(msg.from.id, msg.from.first_name, msg.from.username);
  clrS(msg.from.id);
  var l = await getLang(msg.from.id);
  var fn = UI.welcome[l] || UI.welcome.uz;
  await bot.sendMessage(msg.chat.id, fn(msg.from.first_name), { parse_mode: 'Markdown', ...mainKB(l) });
});

bot.onText(/\/lang/, async function (msg) {
  await getUser(msg.from.id, msg.from.first_name, msg.from.username);
  var l = await getLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, tx('chooseLang', l), langKB());
});

bot.onText(/\/menu/, async function (msg) {
  clrS(msg.from.id);
  var l = await getLang(msg.from.id);
  await bot.sendMessage(msg.chat.id, tx('pick', l), { parse_mode: 'Markdown', ...mainKB(l) });
});

bot.onText(/\/doctor/, async function (msg) { await startSection(msg.chat.id, msg.from.id, 'doctor'); });
bot.onText(/\/drug/, async function (msg) { await startSection(msg.chat.id, msg.from.id, 'drug'); });
bot.onText(/\/chronic/, async function (msg) { clrS(msg.from.id); var l = await getLang(msg.from.id); await bot.sendMessage(msg.chat.id, tx('chrT', l), { parse_mode: 'Markdown', ...chrKB(l) }); });
bot.onText(/\/diagnostic/, async function (msg) { clrS(msg.from.id); var l = await getLang(msg.from.id); await bot.sendMessage(msg.chat.id, tx('diagT', l), { parse_mode: 'Markdown', ...diagKB(l) }); });
bot.onText(/\/premium/, async function (msg) { var l = await getLang(msg.from.id); await bot.sendMessage(msg.chat.id, tx('premInfo', l), { parse_mode: 'Markdown', ...payKB(l) }); });

bot.onText(/\/status/, async function (msg) {
  var u = await getUser(msg.from.id, msg.from.first_name, msg.from.username);
  var l = u ? u.language || 'uz' : 'uz';
  if (!u) return;
  var st = u.is_premium ? '💎' : '🆓';
  var cn = u.is_premium ? '∞' : u.daily_count + '/5';
  var un = u.premium_until ? new Date(u.premium_until).toLocaleDateString() : null;
  var fn = UI.statT[l] || UI.statT.uz;
  await bot.sendMessage(msg.chat.id, fn(st, cn, un), { parse_mode: 'Markdown', ...mainKB(l) });
});

bot.onText(/\/end/, async function (msg) {
  var s = getS(msg.from.id);
  if (s.sec) { await endSession(msg.chat.id, msg.from.id); }
  else { var l = await getLang(msg.from.id); await bot.sendMessage(msg.chat.id, tx('noSes', l), mainKB(l)); }
});

bot.onText(/\/profile/, async function (msg) { await showProfile(msg.chat.id, msg.from.id); });
bot.onText(/\/history/, async function (msg) { await showHistory(msg.chat.id, msg.from.id); });
bot.onText(/\/help/, async function (msg) { var l = await getLang(msg.from.id); await bot.sendMessage(msg.chat.id, 'ℹ️ /start /menu /doctor /drug /chronic /diagnostic /profile /history /end /premium /status /lang', mainKB(l)); });

// ═══════════════════════════════════════════════════════════════
// CALLBACK HANDLER
// ═══════════════════════════════════════════════════════════════

bot.on('callback_query', async function (query) {
  var cid = query.message.chat.id;
  var uid = query.from.id;
  var d = query.data;

  await bot.answerCallbackQuery(query.id);
  await getUser(uid, query.from.first_name, query.from.username);

  // TIL
  if (d === 'ch_lang') {
    var cl = await getLang(uid);
    return bot.sendMessage(cid, tx('chooseLang', cl), langKB());
  }

  if (d.startsWith('lang_')) {
    var newLang = d.replace('lang_', '');
    var ok = await setLang(uid, newLang);
    if (ok) {
      await bot.sendMessage(cid, tx('langSet', newLang));
      var wfn = UI.welcome[newLang] || UI.welcome.uz;
      await bot.sendMessage(cid, wfn(query.from.first_name), { parse_mode: 'Markdown', ...mainKB(newLang) });
    } else {
      await bot.sendMessage(cid, '❌', langKB());
    }
    return;
  }

  var l = await getLang(uid);

  // MENYU
  if (d === 'mm' || d === 'fmm') {
    if (d === 'fmm') { var ss = getS(uid); if (ss.sec && ss.msgs.length > 2) await saveCon(uid, ss.sec, ss.msgs, null, ss.spec); }
    clrS(uid);
    return bot.sendMessage(cid, tx('pick', l), { parse_mode: 'Markdown', ...mainKB(l) });
  }
  if (d === 'ignore') return;

  // BO'LIMLAR
  if (d === 'go_doc') return startSection(cid, uid, 'doctor');
  if (d === 'go_drug') return startSection(cid, uid, 'drug');
  if (d === 'go_chr') { clrS(uid); return bot.sendMessage(cid, tx('chrT', l), { parse_mode: 'Markdown', ...chrKB(l) }); }
  if (d === 'go_diag') { clrS(uid); return bot.sendMessage(cid, tx('diagT', l), { parse_mode: 'Markdown', ...diagKB(l) }); }
  if (d.startsWith('end_')) return endSession(cid, uid);

  // PREMIUM
  if (d === 'prem') return bot.sendMessage(cid, tx('premInfo', l), { parse_mode: 'Markdown', ...payKB(l) });
  if (d === 'pay_tg') { try { return bot.sendInvoice(cid, 'MedAI Premium', '1 month', 'prem1', process.env.PAYMENT_TOKEN, 'UZS', [{ label: 'Premium', amount: 4000000 }]); } catch (e) { return bot.sendMessage(cid, '💳 ❌', payKB(l)); } }
  if (d === 'pay_pm') { var pmUrl = 'https://checkout.paycom.uz/' + Buffer.from(JSON.stringify({ m: process.env.PAYME_MERCHANT_ID || 'ID', ac: { user_id: uid }, a: 4000000 })).toString('base64'); await savePay(uid, 'payme', 4000000, 'pending', null); return bot.sendMessage(cid, '📱 Payme: 40,000', { reply_markup: { inline_keyboard: [[{ text: '📱 Payme', url: pmUrl }], [{ text: '✅', callback_data: 'pc_pm' }], [{ text: tx('menu', l), callback_data: 'mm' }]] } }); }
  if (d === 'pay_cl') { var clUrl = 'https://my.click.uz/services/pay?service_id=' + (process.env.CLICK_SERVICE_ID || 'ID') + '&merchant_id=' + (process.env.CLICK_MERCHANT_ID || 'ID') + '&amount=40000&transaction_param=' + uid; await savePay(uid, 'click', 4000000, 'pending', null); return bot.sendMessage(cid, '📱 Click: 40,000', { reply_markup: { inline_keyboard: [[{ text: '📱 Click', url: clUrl }], [{ text: '✅', callback_data: 'pc_cl' }], [{ text: tx('menu', l), callback_data: 'mm' }]] } }); }
  if (d === 'pc_pm' || d === 'pc_cl') { var prov = d === 'pc_pm' ? 'Payme' : 'Click'; var adm = process.env.ADMIN_ID; if (adm) await bot.sendMessage(adm, '💳 ' + prov + '\nUser: ' + uid + '\n40,000', { reply_markup: { inline_keyboard: [[{ text: '✅', callback_data: 'aok_' + uid }, { text: '❌', callback_data: 'ano_' + uid }]] } }); return bot.sendMessage(cid, '⏳', mainKB(l)); }
  if (d.startsWith('aok_')) { var tid = parseInt(d.replace('aok_', '')); var until = new Date(); until.setMonth(until.getMonth() + 1); await supabase.from('users').update({ is_premium: true, premium_until: until.toISOString() }).eq('id', tid); await savePay(tid, 'manual', 4000000, 'completed', 'a' + Date.now()); var tl = await getLang(tid); var pf = UI.payOk[tl] || UI.payOk.uz; await bot.sendMessage(tid, pf(until.toLocaleDateString()), mainKB(tl)); return bot.sendMessage(cid, '✅ ' + tid); }
  if (d.startsWith('ano_')) { var tid2 = parseInt(d.replace('ano_', '')); await bot.sendMessage(tid2, '❌'); return bot.sendMessage(cid, '❌ ' + tid2); }

  // STATUS PROFILE HISTORY
  if (d === 'stat') { var u = await getUser(uid); var st = u && u.is_premium ? '💎' : '🆓'; var cn = u && u.is_premium ? '∞' : (u ? u.daily_count : 0) + '/5'; var un = u && u.premium_until ? new Date(u.premium_until).toLocaleDateString() : null; var sfn = UI.statT[l] || UI.statT.uz; return bot.sendMessage(cid, sfn(st, cn, un), { parse_mode: 'Markdown', ...mainKB(l) }); }
  if (d === 'prof') return showProfile(cid, uid);
  if (d === 'hist') return showHistory(cid, uid);

  // PROFIL EDIT
  if (d.startsWith('pe_')) {
    var f = d.replace('pe_', '');
    var s = getS(uid);
    if (f === 'gender') return bot.sendMessage(cid, '⚧', { reply_markup: { inline_keyboard: [[{ text: '👨 Erkak', callback_data: 'pg_erkak' }, { text: '👩 Ayol', callback_data: 'pg_ayol' }]] } });
    if (f === 'blood') return bot.sendMessage(cid, '🩸', { reply_markup: { inline_keyboard: [[{ text: 'O+', callback_data: 'pb_O+' }, { text: 'O-', callback_data: 'pb_O-' }], [{ text: 'A+', callback_data: 'pb_A+' }, { text: 'A-', callback_data: 'pb_A-' }], [{ text: 'B+', callback_data: 'pb_B+' }, { text: 'B-', callback_data: 'pb_B-' }], [{ text: 'AB+', callback_data: 'pb_AB+' }, { text: 'AB-', callback_data: 'pb_AB-' }]] } });
    s.pEdit = f;
    s.sec = null;
    var prompts = { age: '🎂 (1-150):', weight: '⚖️ (kg):', height: '📏 (cm):', allergy: '⚠️:', chronic: '🏥:', meds: '💊:' };
    return bot.sendMessage(cid, prompts[f] || '?');
  }
  if (d.startsWith('pg_')) { await updField(uid, 'gender', d.replace('pg_', '')); return bot.sendMessage(cid, '✅', mainKB(l)); }
  if (d.startsWith('pb_')) { await updField(uid, 'blood_type', d.replace('pb_', '')); return bot.sendMessage(cid, '✅', mainKB(l)); }

  // CHRONIC SELECT
  var diseaseMap = { c_dt2: 'Diabetes T2', c_dt1: 'Diabetes T1', c_htn: 'Hypertension', c_hf: 'Heart Failure', c_copd: 'COPD', c_ast: 'Asthma', c_ckd: 'CKD', c_ra: 'RA', c_hypo: 'Hypothyroidism', c_hypr: 'Hyperthyroidism', c_epi: 'Epilepsy', c_dep: 'Depression' };
  if (diseaseMap[d]) {
    var u2 = await getUser(uid);
    if (!u2 || !hasLimit(u2)) return bot.sendMessage(cid, tx('noLim', l), payKB(l));
    clrS(uid);
    var s2 = getS(uid);
    s2.sec = 'chronic';
    s2.chrDis = diseaseMap[d];
    s2.chrKey = d;
    var p2 = await getProfile(uid);
    s2.msgs.push({ role: 'user', content: 'Start monitoring for ' + diseaseMap[d] + '.' + profCtx(p2) + ' Set up monitoring plan with daily parameters, targets, alert thresholds, schedule, and lifestyle advice.' });
    await bot.sendMessage(cid, tx('wait', l));
    try {
      var r2 = await callAI(chronicPrompt(l), s2.msgs);
      s2.msgs.push({ role: 'assistant', content: r2 });
      await incUse(uid, u2.daily_count);
      await sendLong(cid, r2);
      await bot.sendMessage(cid, '✅', chrActKB(d, l));
    } catch (e) {
      console.error(e.message);
      await bot.sendMessage(cid, tx('err', l), mainKB(l));
      clrS(uid);
    }
    return;
  }

  // CHRONIC LOG
  if (d.startsWith('cl_')) {
    var s3 = getS(uid);
    if (!s3.chrDis) return bot.sendMessage(cid, tx('err', l), chrKB(l));
    s3.aw = 'chr_data';
    var efn = UI.chrEnt[l] || UI.chrEnt.uz;
    return bot.sendMessage(cid, efn(s3.chrDis), { parse_mode: 'Markdown' });
  }

  // CHRONIC REPORT
  if (d.startsWith('crw_') || d.startsWith('crm_')) {
    var s4 = getS(uid);
    if (!s4.chrDis) return;
    var u3 = await getUser(uid);
    if (!u3 || !hasLimit(u3)) return bot.sendMessage(cid, tx('noLim', l));
    var period = d.startsWith('crw_') ? 'weekly' : 'monthly';
    var days = period === 'weekly' ? 7 : 30;
    await bot.sendMessage(cid, tx('wait', l));
    var logs = await getChrLogs(uid, s4.chrDis, days);
    if (!logs.length) return bot.sendMessage(cid, '📊 —', chrActKB(s4.chrKey, l));
    s4.msgs.push({ role: 'user', content: period + ' report for ' + s4.chrDis + '.\nData: ' + JSON.stringify(logs) });
    try {
      var r3 = await callAI(chronicPrompt(l), s4.msgs);
      s4.msgs.push({ role: 'assistant', content: r3 });
      await incUse(uid, u3.daily_count);
      await sendLong(cid, r3);
    } catch (e) {
      await bot.sendMessage(cid, tx('err', l));
    }
    return;
  }

  // DIAGNOSTIKA
  if (d.startsWith('dl_') || d.startsWith('di_')) {
    clrS(uid);
    var s5 = getS(uid);
    s5.sec = 'diagnostic';
    if (d.startsWith('dl_')) {
      s5.dType = 'lab';
      s5.dSub = d.replace('dl_', '');
      s5.aw = 'lab';
      return bot.sendMessage(cid, tx('sendLab', l));
    }
    s5.dType = 'img';
    s5.dSub = d.replace('di_', '');
    s5.aw = 'img';
    return bot.sendMessage(cid, tx('sendImg', l));
  }
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT TELEGRAM
// ═══════════════════════════════════════════════════════════════

bot.on('pre_checkout_query', function (q) { bot.answerPreCheckoutQuery(q.id, true); });

bot.on('successful_payment', async function (msg) {
  var uid = msg.from.id;
  var l = await getLang(uid);
  var until = new Date();
  until.setMonth(until.getMonth() + 1);
  await supabase.from('users').update({ is_premium: true, premium_until: until.toISOString() }).eq('id', uid);
  await savePay(uid, 'telegram', 4000000, 'completed', msg.successful_payment ? msg.successful_payment.telegram_payment_charge_id : null);
  var fn = UI.payOk[l] || UI.payOk.uz;
  await bot.sendMessage(msg.chat.id, fn(until.toLocaleDateString()), mainKB(l));
});

// ═══════════════════════════════════════════════════════════════
// PHOTO HANDLER
// ═══════════════════════════════════════════════════════════════

bot.on('photo', async function (msg) {
  var cid = msg.chat.id;
  var uid = msg.from.id;
  var u = await getUser(uid, msg.from.first_name, msg.from.username);
  var l = u ? u.language || 'uz' : 'uz';
  var s = getS(uid);

  if (!u) return bot.sendMessage(cid, tx('err', l));
  if (!hasLimit(u)) return bot.sendMessage(cid, tx('noLim', l), payKB(l));

  if (s.sec === 'diagnostic' || s.aw === 'lab' || s.aw === 'img') {
    if (!s.sec) s.sec = 'diagnostic';
    await bot.sendMessage(cid, tx('imgWait', l));

    try {
      var photo = msg.photo[msg.photo.length - 1];
      var buf = await dlFile(photo.file_id);
      var b64 = buf.toString('base64');
      var p = await getProfile(uid);
      var cap = msg.caption || '';

      var typeNames = { xray: 'X-ray', mri: 'MRI', ct: 'CT', us: 'Ultrasound', blood: 'Blood test', urine: 'Urine test', hormone: 'Hormone test', other: 'Document' };
      var typeName = typeNames[s.dSub] || 'Medical image';

      var promptText;
      if (s.dType === 'lab' || s.aw === 'lab') {
        promptText = 'This is a ' + typeName + ' result sheet. Read ALL values from the image, compare each with normal reference ranges, provide detailed analysis with pattern recognition.' + profCtx(p) + (cap ? '\nPatient note: ' + cap : '');
      } else {
        promptText = 'Analyze this ' + typeName + ' image. Identify anatomical structures, describe all normal and abnormal findings, provide differential diagnoses.' + profCtx(p) + (cap ? '\nClinical info: ' + cap : '');
      }

      var response = await callAIImg(diagPrompt(l), [{ role: 'user', content: promptText }], b64);
      await incUse(uid, u.daily_count);
      await saveMedRec(uid, s.dType || 'unknown', typeName, { caption: cap, subType: s.dSub }, photo.file_id, response);
      await sendLong(cid, response);
      clrS(uid);
      await bot.sendMessage(cid, '—', aftDiagKB(l));
    } catch (e) {
      console.error('photo:', e.message);
      await bot.sendMessage(cid, tx('err', l));
      clrS(uid);
    }
    return;
  }

  await bot.sendMessage(cid, tx('diagT', l), { parse_mode: 'Markdown', ...diagKB(l) });
});

// ═══════════════════════════════════════════════════════════════
// MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════

bot.on('message', async function (msg) {
  if (!msg.text) return;
  if (msg.text.startsWith('/')) return;
  if (msg.successful_payment) return;

  var cid = msg.chat.id;
  var uid = msg.from.id;
  var text = msg.text.trim();
  var u = await getUser(uid, msg.from.first_name, msg.from.username);
  var l = u ? u.language || 'uz' : 'uz';
  var s = getS(uid);

  if (!u) return bot.sendMessage(cid, tx('err', l));

  // PROFIL EDIT
  if (s.pEdit) {
    var field = s.pEdit;
    var dbField;
    var value;

    if (field === 'age') {
      var age = parseInt(text);
      if (!age || age < 1 || age > 150) return bot.sendMessage(cid, '❌ 1-150');
      dbField = 'age';
      value = age;
    } else if (field === 'weight') {
      var w = parseFloat(text);
      if (!w || w < 1) return bot.sendMessage(cid, '❌');
      dbField = 'weight';
      value = w;
    } else if (field === 'height') {
      var h = parseFloat(text);
      if (!h || h < 30) return bot.sendMessage(cid, '❌');
      dbField = 'height';
      value = h;
    } else if (field === 'allergy') {
      dbField = 'allergies';
      value = text;
    } else if (field === 'chronic') {
      dbField = 'chronic_diseases';
      value = text;
    } else if (field === 'meds') {
      dbField = 'current_medications';
      value = text;
    } else {
      s.pEdit = null;
      return;
    }

    await updField(uid, dbField, value);
    s.pEdit = null;
    return bot.sendMessage(cid, '✅', mainKB(l));
  }

  // CHRONIC DATA
  if (s.aw === 'chr_data' && s.sec === 'chronic' && s.chrDis) {
    if (!hasLimit(u)) return bot.sendMessage(cid, tx('noLim', l), payKB(l));
    await bot.sendMessage(cid, tx('think', l));
    s.aw = null;

    var logs = await getChrLogs(uid, s.chrDis, 7);
    var logInfo = logs.length > 0 ? 'Last 7 days data: ' + JSON.stringify(logs.map(function (x) { return { date: x.created_at, data: x.data }; })) : 'This is the first entry.';

    s.msgs.push({ role: 'user', content: 'Disease: ' + s.chrDis + '\nToday\'s data entered by patient:\n' + text + '\n\n' + logInfo + '\n\nAnalyze: are values normal? What is the trend? Any alerts needed? Provide recommendations.' });

    try {
      var response = await callAI(chronicPrompt(l), s.msgs.slice(-20));
      s.msgs.push({ role: 'assistant', content: response });
      await incUse(uid, u.daily_count);

      var alertLevel = 'normal';
      if (response.indexOf('🔴') !== -1) alertLevel = 'critical';
      else if (response.indexOf('🟡') !== -1) alertLevel = 'warning';

      await saveChrLog(uid, s.chrDis, { raw: text }, response, alertLevel);
      await sendLong(cid, response);
      await bot.sendMessage(cid, '—', chrActKB(s.chrKey, l));
    } catch (e) {
      console.error(e.message);
      await bot.sendMessage(cid, tx('err', l));
    }
    return;
  }

  // DIAG LAB TEXT
  if (s.aw === 'lab' && s.sec === 'diagnostic') {
    if (!hasLimit(u)) return bot.sendMessage(cid, tx('noLim', l), payKB(l));
    await bot.sendMessage(cid, tx('think', l));
    s.aw = null;

    var profile = await getProfile(uid);
    var labMsgs = [{ role: 'user', content: 'Analyze these laboratory results in detail. Compare each value to age/sex-specific reference ranges. Identify patterns. Suggest possible causes and follow-up tests.' + profCtx(profile) + '\n\nRESULTS:\n' + text }];

    try {
      var response2 = await callAI(diagPrompt(l), labMsgs);
      await incUse(uid, u.daily_count);
      await saveMedRec(uid, 'lab', s.dSub || 'lab', { raw: text }, null, response2);
      await sendLong(cid, response2);
      clrS(uid);
      await bot.sendMessage(cid, '—', aftDiagKB(l));
    } catch (e) {
      console.error(e.message);
      await bot.sendMessage(cid, tx('err', l));
      clrS(uid);
    }
    return;
  }

  // IMAGE AWAITING — user sent text instead of image
  if (s.aw === 'img') {
    s.diagCaption = text;
    return bot.sendMessage(cid, '✅ ' + tx('sendImg', l));
  }

  // ACTIVE DOCTOR / DRUG SESSION
  if (s.sec === 'doctor' || s.sec === 'drug') {
    if (!hasLimit(u)) return bot.sendMessage(cid, tx('noLim', l), payKB(l));

    if (isEmergency(text)) {
      await bot.sendMessage(cid, tx('emer', l));
    }

    if (!s.spec) {
      var detected = findSpec(text);
      if (detected) s.spec = detected;
    }

    s.msgs.push({ role: 'user', content: text });
    s.cnt = s.cnt + 1;

    await bot.sendMessage(cid, tx('think', l));

    var promptFn = s.sec === 'doctor' ? doctorPrompt : drugPrompt;

    try {
      var response3 = await callAI(promptFn(l), s.msgs.slice(-20));
      s.msgs.push({ role: 'assistant', content: response3 });
      await incUse(uid, u.daily_count);
      await sendLong(cid, response3);
      await bot.sendMessage(cid, tx('contEnd', l), sesKB(s.sec, l));
    } catch (e) {
      console.error(e.message);
      await bot.sendMessage(cid, tx('err', l));
    }
    return;
  }

  // CHRONIC FREE MESSAGE
  if (s.sec === 'chronic' && s.chrDis) {
    if (!hasLimit(u)) return bot.sendMessage(cid, tx('noLim', l), payKB(l));
    s.msgs.push({ role: 'user', content: text });
    await bot.sendMessage(cid, tx('think', l));
    try {
      var response4 = await callAI(chronicPrompt(l), s.msgs.slice(-20));
      s.msgs.push({ role: 'assistant', content: response4 });
      await incUse(uid, u.daily_count);
      await sendLong(cid, response4);
    } catch (e) {
      await bot.sendMessage(cid, tx('err', l));
    }
    return;
  }

  // DEFAULT — no section selected
  if (!hasLimit(u)) return bot.sendMessage(cid, tx('noLim', l), payKB(l));
  await bot.sendMessage(cid, tx('think', l));
  try {
    var profile2 = await getProfile(uid);
    var response5 = await callAI(drugPrompt(l), [{ role: 'user', content: text + profCtx(profile2) }]);
    await incUse(uid, u.daily_count);
    await sendLong(cid, response5);
    await bot.sendMessage(cid, tx('pick', l), mainKB(l));
  } catch (e) {
    console.error(e.message);
    await bot.sendMessage(cid, tx('err', l));
  }
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

bot.on('polling_error', function (e) { console.error('Poll:', e.message); });
process.on('unhandledRejection', function (r) { console.error('Unhandled:', r); });
process.on('uncaughtException', function (e) { console.error('Uncaught:', e); });

// ═══════════════════════════════════════════════════════════════
console.log('🏥 MedAI v3.2 ishga tushdi!');
console.log('🌐 UZ | UZ-Cyr | RU | EN | KK | KY | TG');
console.log('💳 Telegram | Payme | Click');
console.log('📖 Guideline translation: ENABLED');
console.log('⏰', new Date().toLocaleString());
