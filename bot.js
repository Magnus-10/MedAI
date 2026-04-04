require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const client = new Anthropic();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ==================== TIL SOZLAMALARI ====================

const LANGUAGES = {
  uz: { name: "O'zbekcha (Lotin)", flag: '🇺🇿', code: 'uz' },
  uz_cyrl: { name: 'Ўзбекча (Кирилл)', flag: '🇺🇿', code: 'uz_cyrl' },
  ru: { name: 'Русский', flag: '🇷🇺', code: 'ru' },
  en: { name: 'English', flag: '🇬🇧', code: 'en' },
  kk: { name: 'Қазақша', flag: '🇰🇿', code: 'kk' },
  ky: { name: 'Кыргызча', flag: '🇰🇬', code: 'ky' },
  tg: { name: 'Тоҷикӣ', flag: '🇹🇯', code: 'tg' }
};

// ==================== BARCHA TILLAR UCHUN TO'LIQ TARJIMALAR ====================

const TRANSLATIONS = {
  // ==================== O'ZBEKCHA (LOTIN) ====================
  uz: {
    welcome: (name) => `Salom ${name}! 👋

Men MedAI — professional tibbiy AI yordamchiman.

🏥 *Xizmatlarimiz:*

💊 *Dori maslahatchisi* — /dori
Dorilar haqida to'liq ma'lumot, yon ta'sirlar, dozalash, analoglar

👨‍⚕️ *Shifokor maslahatchisi* — /shifokor
Simptomlar tahlili, kasalliklar haqida ma'lumot (Yevropa va Amerika guidelinelari asosida)

🩺 *Surunkali kasalliklar* — /surunkali
Diabet, gipertoniya, astma va boshqa kasalliklarni nazorat qilish

🔬 *Diagnostika* — /diagnostika
Qon, siydik, gormon tahlillari, rentgen, MRT, UZI natijalarini tahlil qilish

⚠️ *Eslatma:* Mening javoblarim shifokor maslahatini almashtirmaydi!

🆓 Bepul tarif: kuniga 5 ta savol
💎 Premium: cheksiz savol — 40,000 so'm/oy

🌐 Tilni o'zgartirish: /til
📖 Yordam: /help`,

    choose_lang: '🌐 Tilni tanlang:',
    lang_changed: "✅ Til o'zgartirildi: O'zbekcha (Lotin) 🇺🇿",
    
    premium_info: `💎 *Premium tarif*

✅ Cheksiz savollar
✅ Tezkor javob
✅ Barcha bo'limlar
✅ Rasm tahlili
✅ Tarixni saqlash

💳 *Narx:* 40,000 so'm/oy

To'lov usulini tanlang:`,

    status_text: (isPremium, count, premiumUntil) => {
      const status = isPremium ? '💎 Premium' : '🆓 Bepul';
      const c = isPremium ? 'Cheksiz' : `${count}/5`;
      let text = `👤 *Sizning holatingiz:*

📋 Tarif: ${status}
📊 Bugungi savollar: ${c}`;
      if (isPremium && premiumUntil) {
        const date = new Date(premiumUntil).toLocaleDateString('uz-UZ');
        text += `\n📅 Premium muddati: ${date}`;
      }
      return text;
    },

    user_not_found: '❌ Foydalanuvchi topilmadi! /start bosing.',
    limit_reached: `❌ Kunlik bepul limitingiz tugadi (5/5).

💎 Cheksiz savollar uchun Premium sotib oling!
👉 /premium`,
    loading: '⏳ Javob tayyorlanmoqda...',
    error: '❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.',
    
    payment_success: `✅ To'lov muvaffaqiyatli qabul qilindi!

💎 Siz endi Premium foydalanuvchisiz!
📅 Muddati: 1 oy

Cheksiz savollar bilan foydalaning! 🎉`,

    // Menyu tugmalari
    menu_dori: '💊 Dori maslahatchisi',
    menu_shifokor: '👨‍⚕️ Shifokor maslahatchisi',
    menu_surunkali: '🩺 Surunkali kasalliklar',
    menu_diagnostika: '🔬 Diagnostika',
    menu_back: '🏠 Bosh menyu',
    menu_lang: '🌐 Til',
    menu_premium: '💎 Premium',
    menu_help: '📖 Yordam',

    // Bo'lim tavsiflari
    section_dori: `💊 *DORI MASLAHATCHISI*

Quyidagilar haqida so'rashingiz mumkin:

• 💊 Dori haqida to'liq ma'lumot
• ⚠️ Yon ta'sirlar va ogohlantirushlar
• 📏 Dozalash (yosh bo'yicha)
• 🔄 Dorilar o'zaro ta'siri
• 💊 Analog dorilar
• 🤰 Homiladorlikda qo'llash
• 📋 Qo'llash ko'rsatmalari va qarshi ko'rsatmalar

✏️ *Dori nomini yoki savolingizni yozing:*`,

    section_shifokor: `👨‍⚕️ *SHIFOKOR MASLAHATCHISI*

⚕️ *Yevropa va Amerika guidelinelari asosida*
(AHA, ADA, ESC, NICE, WHO, GINA, GOLD va boshqalar)

Quyidagilar haqida so'rashingiz mumkin:

• 🔍 Simptomlarni tahlil qilish
• 📋 Kasallik haqida ma'lumot
• 💊 Davolash usullari
• 🛡️ Profilaktika
• 🚨 Qachon shifokorga murojaat qilish kerak
• 🏥 Qaysi mutaxassisga borish kerak

⚠️ *Muhim:* Bu taxminiy tahlildir. Aniq tashxis uchun shifokorga murojaat qiling!

✏️ *Simptomlaringizni batafsil yozing:*`,

    section_surunkali: `🩺 *SURUNKALI KASALLIKLAR NAZORATI*

Quyidagi kasalliklarni nazorat qilishda yordam beraman:

• 🩸 *Diabet* (1-tur, 2-tur) — ADA 2024
• ❤️ *Gipertoniya* — AHA/ACC 2023
• 🌬️ *Astma* — GINA 2024
• 🫁 *XOAB/COPD* — GOLD 2024
• 💔 *Yurak yetishmovchiligi* — ESC 2023
• 🫘 *Buyrak kasalliklari* — KDIGO 2024
• ⚡ *Epilepsiya*
• 🦴 *Revmatoid artrit* — ACR/EULAR

✏️ *Kasalligingiz nomini yoki holatni yozing:*`,

    section_diagnostika: `🔬 *TASVIRIY DIAGNOSTIKA*

Quyidagi tahlillarni tahlil qila olaman:

📋 *Laboratoriya:*
• Qon umumiy tahlili (CBC)
• Bioximik qon tahlili
• Siydik tahlili
• Gormon tahlillari (tireoid, jinsiy)
• Lipid profili
• Koagulogramma
• Jigar/buyrak funktsiyasi
• Tumor markerlari

🏥 *Tasviriy tekshiruvlar:*
• Rentgen tavsifi
• MRT/KT tavsifi
• UZI tavsifi
• EKG tavsifi

📸 *Rasm yuborishingiz ham mumkin!*

✏️ *Analiz natijalaringizni yozing yoki rasmini yuboring:*`,

    help_text: `📖 *MedAI YORDAM*

*Buyruqlar:*
/start — Botni boshlash
/dori — 💊 Dori maslahatchisi
/shifokor — 👨‍⚕️ Shifokor maslahatchisi
/surunkali — 🩺 Surunkali kasalliklar
/diagnostika — 🔬 Diagnostika
/premium — 💎 Premium sotib olish
/status — 👤 Holatingizni ko'rish
/til — 🌐 Tilni o'zgartirish
/help — 📖 Yordam

*Qo'shimcha:*
• Rasm yuborib tahlil qildirish mumkin
• Har bir bo'limda suhbat davom etadi
• Premium — cheksiz savollar

⚠️ *Ogohlantirish:*
Bu bot shifokor maslahatini almashtirmaydi!`,

    image_only: '📸 Hozircha faqat rasm fayllarini (JPG, PNG) tahlil qila olaman.',
    send_image_hint: '📸 Rasm yuboring yoki matn yozing',
    
    disclaimer: `

⚠️ *MUHIM OGOHLANTIRISH:*
Bu ma'lumot shifokor maslahatini almashtirmaydi! Aniq tashxis va davolash uchun malakali shifokorga murojaat qiling.`
  },

  // ==================== O'ZBEKCHA (KIRILL) ====================
  uz_cyrl: {
    welcome: (name) => `Салом ${name}! 👋

Мен MedAI — профессионал тиббий AI ёрдамчиман.

🏥 *Хизматларимиз:*

💊 *Дори маслаҳатчиси* — /dori
Дорилар ҳақида тўлиқ маълумот, ён таъсирлар, дозалаш, аналоглар

👨‍⚕️ *Шифокор маслаҳатчиси* — /shifokor
Симптомлар таҳлили, касалликлар ҳақида маълумот (Европа ва Америка гайдлайнлари асосида)

🩺 *Сурункали касалликлар* — /surunkali
Диабет, гипертония, астма ва бошқа касалликларни назорат қилиш

🔬 *Диагностика* — /diagnostika
Қон, сийдик, гормон таҳлиллари, рентген, МРТ, УЗИ натижаларини таҳлил қилиш

⚠️ *Эслатма:* Менинг жавобларим шифокор маслаҳатини алмаштирмайди!

🆓 Бепул тариф: кунига 5 та савол
💎 Премиум: чексиз савол — 40,000 сўм/ой

🌐 Тилни ўзгартириш: /til
📖 Ёрдам: /help`,

    choose_lang: '🌐 Тилни танланг:',
    lang_changed: '✅ Тил ўзгартирилди: Ўзбекча (Кирилл) 🇺🇿',
    
    premium_info: `💎 *Премиум тариф*

✅ Чексиз саволлар
✅ Тезкор жавоб
✅ Барча бўлимлар
✅ Расм таҳлили
✅ Тарихни сақлаш

💳 *Нарх:* 40,000 сўм/ой

Тўлов усулини танланг:`,

    status_text: (isPremium, count, premiumUntil) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Бепул';
      const c = isPremium ? 'Чексиз' : `${count}/5`;
      let text = `👤 *Сизнинг ҳолатингиз:*

📋 Тариф: ${status}
📊 Бугунги саволлар: ${c}`;
      if (isPremium && premiumUntil) {
        const date = new Date(premiumUntil).toLocaleDateString('uz-UZ');
        text += `\n📅 Премиум муддати: ${date}`;
      }
      return text;
    },

    user_not_found: '❌ Фойдаланувчи топилмади! /start босинг.',
    limit_reached: `❌ Кунлик бепул лимитингиз тугади (5/5).

💎 Чексиз саволлар учун Премиум сотиб олинг!
👉 /premium`,
    loading: '⏳ Жавоб тайёрланмоқда...',
    error: '❌ Хатолик юз берди. Илтимос, қайтадан уриниб кўринг.',
    
    payment_success: `✅ Тўлов муваффақиятли қабул қилинди!

💎 Сиз энди Премиум фойдаланувчисиз!
📅 Муддати: 1 ой

Чексиз саволлар билан фойдаланинг! 🎉`,

    menu_dori: '💊 Дори маслаҳатчиси',
    menu_shifokor: '👨‍⚕️ Шифокор маслаҳатчиси',
    menu_surunkali: '🩺 Сурункали касалликлар',
    menu_diagnostika: '🔬 Диагностика',
    menu_back: '🏠 Бош меню',
    menu_lang: '🌐 Тил',
    menu_premium: '💎 Премиум',
    menu_help: '📖 Ёрдам',

    section_dori: `💊 *ДОРИ МАСЛАҲАТЧИСИ*

Қуйидагилар ҳақида сўрашингиз мумкин:

• 💊 Дори ҳақида тўлиқ маълумот
• ⚠️ Ён таъсирлар ва огоҳлантиришлар
• 📏 Дозалаш (ёш бўйича)
• 🔄 Дорилар ўзаро таъсири
• 💊 Аналог дорилар
• 🤰 Ҳомиладорликда қўллаш
• 📋 Қўллаш кўрсатмалари ва қарши кўрсатмалар

✏️ *Дори номини ёки саволингизни ёзинг:*`,

    section_shifokor: `👨‍⚕️ *ШИФОКОР МАСЛАҲАТЧИСИ*

⚕️ *Европа ва Америка гайдлайнлари асосида*
(AHA, ADA, ESC, NICE, WHO, GINA, GOLD ва бошқалар)

Қуйидагилар ҳақида сўрашингиз мумкин:

• 🔍 Симптомларни таҳлил қилиш
• 📋 Касаллик ҳақида маълумот
• 💊 Даволаш усуллари
• 🛡️ Профилактика
• 🚨 Қачон шифокорга мурожаат қилиш керак
• 🏥 Қайси мутахассисга бориш керак

⚠️ *Муҳим:* Бу тахминий таҳлилдир. Аниқ ташхис учун шифокорга мурожаат қилинг!

✏️ *Симптомларингизни батафсил ёзинг:*`,

    section_surunkali: `🩺 *СУРУНКАЛИ КАСАЛЛИКЛАР НАЗОРАТИ*

Қуйидаги касалликларни назорат қилишда ёрдам бераман:

• 🩸 *Диабет* (1-тур, 2-тур) — ADA 2024
• ❤️ *Гипертония* — AHA/ACC 2023
• 🌬️ *Астма* — GINA 2024
• 🫁 *ХОАБ/COPD* — GOLD 2024
• 💔 *Юрак етишмовчилиги* — ESC 2023
• 🫘 *Буйрак касалликлари* — KDIGO 2024
• ⚡ *Эпилепсия*
• 🦴 *Ревматоид артрит* — ACR/EULAR

✏️ *Касаллигингиз номини ёки ҳолатни ёзинг:*`,

    section_diagnostika: `🔬 *ТАСВИРИЙ ДИАГНОСТИКА*

Қуйидаги таҳлилларни таҳлил қила оламан:

📋 *Лаборатория:*
• Қон умумий таҳлили (CBC)
• Биокимёвий қон таҳлили
• Сийдик таҳлили
• Гормон таҳлиллари (тиреоид, жинсий)
• Липид профили
• Коагулограмма
• Жигар/буйрак функцияси
• Тумор маркерлари

🏥 *Тасвирий текширувлар:*
• Рентген тавсифи
• МРТ/КТ тавсифи
• УЗИ тавсифи
• ЭКГ тавсифи

📸 *Расм юборишингиз ҳам мумкин!*

✏️ *Анализ натижаларингизни ёзинг ёки расмини юборинг:*`,

    help_text: `📖 *MedAI ЁРДАМ*

*Буйруқлар:*
/start — Ботни бошлаш
/dori — 💊 Дори маслаҳатчиси
/shifokor — 👨‍⚕️ Шифокор маслаҳатчиси
/surunkali — 🩺 Сурункали касалликлар
/diagnostika — 🔬 Диагностика
/premium — 💎 Премиум сотиб олиш
/status — 👤 Ҳолатингизни кўриш
/til — 🌐 Тилни ўзгартириш
/help — 📖 Ёрдам

⚠️ *Огоҳлантириш:*
Бу бот шифокор маслаҳатини алмаштирмайди!`,

    image_only: '📸 Ҳозирча фақат расм файлларини (JPG, PNG) таҳлил қила оламан.',
    send_image_hint: '📸 Расм юборинг ёки матн ёзинг',
    
    disclaimer: `

⚠️ *МУҲИМ ОГОҲЛАНТИРИШ:*
Бу маълумот шифокор маслаҳатини алмаштирмайди! Аниқ ташхис ва даволаш учун малакали шифокорга мурожаат қилинг.`
  },

  // ==================== РУССКИЙ ====================
  ru: {
    welcome: (name) => `Здравствуйт��, ${name}! 👋

Я MedAI — профессиональный медицинский AI-помощник.

🏥 *Наши услуги:*

💊 *Консультант по лекарствам* — /dori
Полная информация о препаратах, побочные эффекты, дозировка, аналоги

👨‍⚕️ *Консультант врача* — /shifokor
Анализ симптомов, информация о заболеваниях (на основе европейских и американских гайдлайнов)

🩺 *Хронические заболевания* — /surunkali
Контроль диабета, гипертонии, астмы и других заболеваний

🔬 *Диагностика* — /diagnostika
Анализ результатов анализов крови, мочи, гормонов, рентгена, МРТ, УЗИ

⚠️ *Предупреждение:* Мои ответы не заменяют консультацию врача!

🆓 Бесплатный тариф: 5 вопросов в день
💎 Премиум: безлимитные вопросы — 40,000 сум/мес

🌐 Сменить язык: /til
📖 Помощь: /help`,

    choose_lang: '🌐 Выберите язык:',
    lang_changed: '✅ Язык изменён: Русский ��🇺',
    
    premium_info: `💎 *Премиум тариф*

✅ Безлимитные вопросы
✅ Быстрые ответы
✅ Все разделы
✅ Анализ изображений
✅ Сохранение истории

💳 *Цена:* 40,000 сум/мес

Выберите способ оплаты:`,

    status_text: (isPremium, count, premiumUntil) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Бесплатный';
      const c = isPremium ? 'Безлимит' : `${count}/5`;
      let text = `👤 *Ваш статус:*

📋 Тариф: ${status}
📊 Вопросов сегодня: ${c}`;
      if (isPremium && premiumUntil) {
        const date = new Date(premiumUntil).toLocaleDateString('ru-RU');
        text += `\n📅 Премиум до: ${date}`;
      }
      return text;
    },

    user_not_found: '❌ Пользователь не найден! Нажмите /start.',
    limit_reached: `❌ Ваш бесплатный лимит исчерпан (5/5).

💎 Для безлимитных вопросов приобретите Премиум!
👉 /premium`,
    loading: '⏳ Готовлю ответ...',
    error: '❌ Произошла ошибка. Пожалуйста, попробуйте ещё раз.',
    
    payment_success: `✅ Оплата успешно принята!

💎 Вы теперь Премиум пользователь!
📅 Срок: 1 месяц

Пользуйтесь безлимитными вопросами! 🎉`,

    menu_dori: '💊 Лекарства',
    menu_shifokor: '👨‍⚕️ Врач-консультант',
    menu_surunkali: '🩺 Хронические болезни',
    menu_diagnostika: '🔬 Диагностика',
    menu_back: '🏠 Главное меню',
    menu_lang: '🌐 Язык',
    menu_premium: '💎 Премиум',
    menu_help: '📖 Помощь',

    section_dori: `💊 *КОНСУЛЬТАНТ ПО ЛЕКАРСТВАМ*

Вы можете спросить о:

• 💊 Полная информация о препарате
• ⚠️ Побочные эффекты и предупреждения
• 📏 Дозировка (по возрасту)
• 🔄 Взаимодействие лекарств
• 💊 Аналоги препаратов
• 🤰 Применение при беременности
• 📋 Показания и противопоказания

✏️ *Напишите название лекарства или ваш вопрос:*`,

    section_shifokor: `👨‍⚕️ *КОНСУЛЬТАНТ ВРАЧА*

⚕️ *На основе европейских и американских гайдлайнов*
(AHA, ADA, ESC, NICE, WHO, GINA, GOLD и др.)

Вы можете спросить о:

• 🔍 Анализ симптомов
• 📋 Информация о заболевании
• 💊 Методы лечения
• 🛡️ Профилактика
• 🚨 Когда обратиться к врачу
• 🏥 К какому специалисту идти

⚠️ *Важно:* Это предварительный анализ. Для точного диагноза обратитесь к врачу!

✏️ *Опишите подробно ваши симптомы:*`,

    section_surunkali: `🩺 *КОНТРОЛЬ ХРОНИЧЕСКИХ ЗАБОЛЕВАНИЙ*

Помогу с контролем следующих заболеваний:

• 🩸 *Диабет* (1 и 2 тип) — ADA 2024
• ❤️ *Гипертония* — AHA/ACC 2023
• 🌬️ *Астма* — GINA 2024
• 🫁 *ХОБЛ/COPD* — GOLD 2024
• 💔 *Сердечная недостаточность* — ESC 2023
• 🫘 *Заболевания почек* — KDIGO 2024
• ⚡ *Эпилепсия*
• 🦴 *Ревматоидный артрит* — ACR/EULAR

✏️ *Напишите название заболевания или ваше состояние:*`,

    section_diagnostika: `🔬 *ДИАГНОСТИКА*

Могу проанализировать:

📋 *Лабораторные анализы:*
• Общий анализ крови (ОАК/CBC)
• Биохимический анализ крови
• Анализ мочи
• Гормональные анализы (щитовидка, половые)
• Липидный профиль
• Коагулограмма
• Функция печени/почек
• Онкомаркеры

🏥 *Визуальные исследования:*
• Описание рентгена
• Описание МРТ/КТ
• Описание УЗИ
• Описание ЭКГ

📸 *Можете также отправить фото результатов!*

✏️ *Напишите результаты анализов или отправьте фото:*`,

    help_text: `📖 *MedAI ПОМОЩЬ*

*Команды:*
/start — Запуск бота
/dori — 💊 Консультант по лекарствам
/shifokor — 👨‍⚕️ Консультант врача
/surunkali — 🩺 Хронические заболевания
/diagnostika — 🔬 Диагностика
/premium — 💎 Купить Премиум
/status — 👤 Ваш статус
/til — 🌐 Сменить язык
/help — 📖 Помощь

⚠️ *Предупреждение:*
Этот бот не заменяет консультацию врача!`,

    image_only: '📸 Пока могу анализировать только изображения (JPG, PNG).',
    send_image_hint: '📸 Отправьте фото или напишите текст',
    
    disclaimer: `

⚠️ *ВАЖНОЕ ПРЕДУПРЕЖДЕНИЕ:*
Эта информация не заменяет консультацию врача! Для точного диагноза и лечения обратитесь к квалифицированному специалисту.`
  },

  // ==================== ENGLISH ====================
  en: {
    welcome: (name) => `Hello ${name}! 👋

I'm MedAI — a professional medical AI assistant.

🏥 *Our Services:*

💊 *Drug Consultant* — /dori
Complete medication information, side effects, dosing, alternatives

👨‍⚕️ *Doctor Consultant* — /shifokor
Symptom analysis, disease information (based on European and American guidelines)

🩺 *Chronic Disease Management* — /surunkali
Monitoring diabetes, hypertension, asthma and other conditions

🔬 *Diagnostics* — /diagnostika
Analysis of blood tests, urine tests, hormones, X-ray, MRI, ultrasound results

⚠️ *Disclaimer:* My responses do not replace professional medical advice!

🆓 Free plan: 5 questions per day
💎 Premium: unlimited questions — 40,000 UZS/month

🌐 Change language: /til
📖 Help: /help`,

    choose_lang: '🌐 Choose language:',
    lang_changed: '✅ Language changed: English 🇬🇧',
    
    premium_info: `💎 *Premium Plan*

✅ Unlimited questions
✅ Fast responses
✅ All sections
✅ Image analysis
✅ History saving

💳 *Price:* 40,000 UZS/month

Select payment method:`,

    status_text: (isPremium, count, premiumUntil) => {
      const status = isPremium ? '💎 Premium' : '🆓 Free';
      const c = isPremium ? 'Unlimited' : `${count}/5`;
      let text = `👤 *Your Status:*

📋 Plan: ${status}
📊 Today's questions: ${c}`;
      if (isPremium && premiumUntil) {
        const date = new Date(premiumUntil).toLocaleDateString('en-US');
        text += `\n📅 Premium until: ${date}`;
      }
      return text;
    },

    user_not_found: '❌ User not found! Press /start.',
    limit_reached: `❌ Your daily free limit is reached (5/5).

💎 Get Premium for unlimited questions!
👉 /premium`,
    loading: '⏳ Preparing response...',
    error: '❌ An error occurred. Please try again.',
    
    payment_success: `✅ Payment successfully received!

💎 You are now a Premium user!
📅 Duration: 1 month

Enjoy unlimited questions! 🎉`,

    menu_dori: '💊 Drug Consultant',
    menu_shifokor: '👨‍⚕️ Doctor Consultant',
    menu_surunkali: '🩺 Chronic Diseases',
    menu_diagnostika: '🔬 Diagnostics',
    menu_back: '🏠 Main Menu',
    menu_lang: '🌐 Language',
    menu_premium: '💎 Premium',
    menu_help: '📖 Help',

    section_dori: `💊 *DRUG CONSULTANT*

You can ask about:

• 💊 Complete drug information
• ⚠️ Side effects and warnings
• 📏 Dosing (by age)
• 🔄 Drug interactions
• 💊 Generic alternatives
• 🤰 Use during pregnancy
• 📋 Indications and contraindications

✏️ *Enter the drug name or your question:*`,

    section_shifokor: `👨‍⚕️ *DOCTOR CONSULTANT*

⚕️ *Based on European and American Guidelines*
(AHA, ADA, ESC, NICE, WHO, GINA, GOLD, etc.)

You can ask about:

• 🔍 Symptom analysis
• 📋 Disease information
• 💊 Treatment methods
• 🛡️ Prevention
• 🚨 When to see a doctor
• 🏥 Which specialist to visit

⚠️ *Important:* This is a preliminary analysis. Consult a doctor for accurate diagnosis!

✏️ *Describe your symptoms in detail:*`,

    section_surunkali: `🩺 *CHRONIC DISEASE MANAGEMENT*

I can help manage the following conditions:

• 🩸 *Diabetes* (Type 1, Type 2) — ADA 2024
• ❤️ *Hypertension* — AHA/ACC 2023
• 🌬️ *Asthma* — GINA 2024
• 🫁 *COPD* — GOLD 2024
• 💔 *Heart Failure* — ESC 2023
• 🫘 *Kidney Disease* — KDIGO 2024
• ⚡ *Epilepsy*
• 🦴 *Rheumatoid Arthritis* — ACR/EULAR

✏️ *Enter the disease name or your condition:*`,

    section_diagnostika: `🔬 *DIAGNOSTICS*

I can analyze:

📋 *Laboratory Tests:*
• Complete Blood Count (CBC)
• Comprehensive Metabolic Panel
• Urinalysis
• Hormone tests (thyroid, reproductive)
• Lipid profile
• Coagulation panel
• Liver/kidney function tests
• Tumor markers

🏥 *Imaging Studies:*
• X-ray descriptions
• MRI/CT descriptions
• Ultrasound descriptions
• ECG descriptions

📸 *You can also send photos of your results!*

✏️ *Enter your test results or send a photo:*`,

    help_text: `📖 *MedAI HELP*

*Commands:*
/start — Start the bot
/dori — 💊 Drug Consultant
/shifokor — 👨‍⚕️ Doctor Consultant
/surunkali — 🩺 Chronic Diseases
/diagnostika — 🔬 Diagnostics
/premium — 💎 Buy Premium
/status — 👤 Your status
/til — 🌐 Change language
/help — 📖 Help

⚠️ *Warning:*
This bot does not replace professional medical advice!`,

    image_only: '📸 Currently I can only analyze image files (JPG, PNG).',
    send_image_hint: '📸 Send a photo or type your message',
    
    disclaimer: `

⚠️ *IMPORTANT DISCLAIMER:*
This information does not replace professional medical advice! Consult a qualified physician for accurate diagnosis and treatment.`
  },

  // ==================== ҚАЗАҚША ====================
  kk: {
    welcome: (name) => `Сәлем ${name}! 👋

Мен MedAI — кәсіби медициналық AI көмекшімін.

🏥 *Қызметтерім��з:*

💊 *Дәрі кеңесшісі* — /dori
Дәрі-дәрмектер туралы толық ақпарат, жанама әсерлер, дозалау, аналогтар

👨‍⚕️ *Дәрігер кеңесшісі* — /shifokor
Симптомдарды талдау, аурулар туралы ақпарат (Еуропа және Америка гайдлайндары негізінде)

🩺 *Созылмалы аурулар* — /surunkali
Қант диабеті, гипертония, астма және басқа ауруларды бақылау

🔬 *Диагностика* — /diagnostika
Қан, зәр, гормон талдаулары, рентген, МРТ, УДЗ нәтижелерін талдау

⚠️ *Ескерту:* Менің жауаптарым дәрігер кеңесін алмастырмайды!

🆓 Тегін тариф: күніне 5 сұрақ
💎 Премиум: шексіз сұрақ — 40,000 сум/ай

🌐 Тілді өзгерту: /til
📖 Көмек: /help`,

    choose_lang: '🌐 Тілді таңдаңыз:',
    lang_changed: '✅ Тіл өзгертілді: Қазақша 🇰🇿',
    
    premium_info: `💎 *Премиум тариф*

✅ Шексіз сұрақтар
✅ Жылдам жауап
✅ Барлық бөлімдер
✅ Сурет талдау
✅ Тарихты сақтау

💳 *Бағасы:* 40,000 сум/ай

Төлем тәсілін таңдаңыз:`,

    status_text: (isPremium, count, premiumUntil) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Тегін';
      const c = isPremium ? 'Шексіз' : `${count}/5`;
      let text = `👤 *Сіздің мәртебеңіз:*

📋 Тариф: ${status}
📊 Бүгінгі сұрақтар: ${c}`;
      if (isPremium && premiumUntil) {
        const date = new Date(premiumUntil).toLocaleDateString('kk-KZ');
        text += `\n📅 Премиум мерзімі: ${date}`;
      }
      return text;
    },

    user_not_found: '❌ Қолданушы табылмады! /start басыңыз.',
    limit_reached: `❌ Күнделікті тегін лимитіңіз таусылды (5/5).

💎 Шексіз сұрақтар үшін Премиум сатып алыңыз!
👉 /premium`,
    loading: '⏳ Жауап дайындалуда...',
    error: '❌ Қате орын алды. Қайта көріңіз.',
    
    payment_success: `✅ Төлем сәтті қабылданды!

💎 Сіз енді Премиум қолданушысыз!
📅 Мерзімі: 1 ай

Шексіз сұрақтармен пайдаланыңыз! 🎉`,

    menu_dori: '💊 Дәрі кеңесшісі',
    menu_shifokor: '👨‍⚕️ Дәрігер кеңесшісі',
    menu_surunkali: '🩺 Созылмалы аурулар',
    menu_diagnostika: '🔬 Диагностика',
    menu_back: '🏠 Бас мәзір',
    menu_lang: '🌐 Тіл',
    menu_premium: '💎 Премиум',
    menu_help: '📖 Көмек',

    section_dori: `💊 *ДӘРІ КЕҢЕСШІСІ*

Сіз мыналар туралы сұрай аласыз:

• 💊 Дәрі туралы толық ақпарат
• ⚠️ Жанама әсерлер мен ескертулер
• 📏 Дозалау (жас бойынша)
• 🔄 Дәрілер өзара әсері
• 💊 Аналог дәрілер
• 🤰 Жүктілікте қолдану
• 📋 Қолдану көрсетілімдері мен қарсы көрсетілімдер

✏️ *Дәрі атын немесе сұрағыңызды жазыңыз:*`,

    section_shifokor: `👨‍⚕️ *ДӘРІГЕР КЕҢЕСШІСІ*

⚕️ *Еуропа және Америка гайдлайндары негізінде*
(AHA, ADA, ESC, NICE, WHO, GINA, GOLD және т.б.)

Сіз мыналар туралы сұрай аласыз:

• 🔍 Симптомдарды талдау
• 📋 Ауру туралы ақпарат
• 💊 Емдеу әдістері
• 🛡️ Алдын алу
• 🚨 Қашан дәрігерге бару керек
• 🏥 Қай маманға бару керек

⚠️ *Маңызды:* Бұл алдын ала талдау. Нақты диагноз үшін дәрігерге хабарласыңыз!

✏️ *Симптомдарыңызды егжей-тегжейлі жазыңыз:*`,

    section_surunkali: `🩺 *СОЗЫЛМАЛЫ АУРУЛАР БАҚЫЛАУЫ*

Келесі ауруларды бақылауға көмектесемін:

• 🩸 *Қант диабеті* (1-тип, 2-тип) — ADA 2024
• ❤️ *Гипертония* — AHA/ACC 2023
• 🌬️ *Астма* — GINA 2024
• 🫁 *СОЗО/COPD* — GOLD 2024
• 💔 *Жүрек жеткіліксіздігі* — ESC 2023
• 🫘 *Бүйрек аурулары* — KDIGO 2024
• ⚡ *Эпилепсия*
• 🦴 *Ревматоидты артрит* — ACR/EULAR

✏️ *Ауру атын немесе жағдайыңызды жазыңыз:*`,

    section_diagnostika: `🔬 *ДИАГНОСТИКА*

Келесі талдауларды талдай аламын:

📋 *Зертханалық талдаулар:*
• Жалпы қан талдауы (ЖҚТ/CBC)
• Биохимиялық қан талдауы
• Зәр талдауы
• Гормон талдаулары (қалқанша, жыныс)
• Липид профилі
• Коагулограмма
• Бауыр/бүйрек қызметі
• Ісік маркерлері

🏥 *Бейнелеу зерттеулері:*
• Рентген сипаттамасы
• МРТ/КТ сипаттамасы
• УДЗ сипаттамасы
• ЭКГ сипаттамасы

📸 *Нәтижелердің суретін де жіберуге болады!*

✏️ *Талдау нәтижелерін жазыңыз немесе сурет жіберіңіз:*`,

    help_text: `📖 *MedAI КӨМЕК*

*Командалар:*
/start — Ботты бастау
/dori — 💊 Дәрі кеңесшісі
/shifokor — 👨‍⚕️ Дәрігер кеңесшісі
/surunkali — 🩺 Созылмалы аурулар
/diagnostika — 🔬 Диагностика
/premium — 💎 Премиум сатып алу
/status — 👤 Сіздің мәртебеңіз
/til — 🌐 Тілді өзгерту
/help — 📖 Көмек

⚠️ *Ескерту:*
Бұл бот дәрігер кеңесін алмастырмайды!`,

    image_only: '📸 Қазір тек сурет файлдарын (JPG, PNG) талдай аламын.',
    send_image_hint: '📸 Сурет жіберіңіз немесе мәтін жазыңыз',
    
    disclaimer: `

⚠️ *МАҢЫЗДЫ ЕСКЕРТУ:*
Бұл ақпарат дәрігер кеңесін алмастырмайды! Нақты диагноз және емдеу үшін білікті маманға хабарласыңыз.`
  },

  // ==================== КЫРГЫЗЧА ====================
  ky: {
    welcome: (name) => `Салам ${name}! 👋

Мен MedAI — кесипкөй медициналык AI жардамчымын.

🏥 *Кызматтарыбыз:*

💊 *Дары кеңешчиси* — /dori
Дарылар жөнүндө толук маалымат, терс таасирлер, дозалоо, аналогдор

👨‍⚕️ *Доктор кеңешчиси* — /shifokor
Симптомдорду талдоо, оорулар жөнүндө маалымат (Европа жана Америка гайдлайндары боюнча)

🩺 *Созулма оорулар* — /surunkali
Диабет, гипертония, астма жана башка ооруларды көзөмөлдөө

🔬 *Диагностика* — /diagnostika
Кан, заар, гормон анализдери, рентген, МРТ, УЗИ жыйынтыктарын талдоо

⚠️ *Эскертүү:* Менин жоопторум доктордун кеңешин алмаштырбайт!

🆓 Акысыз тариф: күнүнө 5 суроо
💎 Премиум: чексиз суроо — 40,000 сум/ай

🌐 Тилди өзгөртүү: /til
📖 Жардам: /help`,

    choose_lang: '🌐 Тилди тандаңыз:',
    lang_changed: '✅ Тил өзгөртүлдү: Кыргызча 🇰🇬',
    
    premium_info: `💎 *Премиум тариф*

✅ Чексиз суроолор
✅ Тез жооп
✅ Бардык бөлүмдөр
✅ Сүрөт талдоо
✅ Тарыхты сактоо

💳 *Баасы:* 40,000 сум/ай

Төлөм ыкмасын тандаңыз:`,

    status_text: (isPremium, count, premiumUntil) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Акысыз';
      const c = isPremium ? 'Чексиз' : `${count}/5`;
      let text = `👤 *Сиздин абалыңыз:*

📋 Тариф: ${status}
📊 Бүгүнкү суроолор: ${c}`;
      if (isPremium && premiumUntil) {
        const date = new Date(premiumUntil).toLocaleDateString('ky-KG');
        text += `\n📅 Премиум мөөнөтү: ${date}`;
      }
      return text;
    },

    user_not_found: '❌ Колдонуучу табылган жок! /start басыңыз.',
    limit_reached: `❌ Күнүмдүк акысыз лимитиңиз түгөндү (5/5).

💎 Чексиз суроолор үчүн Премиум сатып алыңыз!
👉 /premium`,
    loading: '⏳ Жооп даярдалууда...',
    error: '❌ Ката кетти. Кайра аракет кылыңыз.',
    
    payment_success: `✅ Төлөм ийгиликтүү кабыл алынды!

💎 Сиз эми Премиум колдонуучусуз!
📅 Мөөнөтү: 1 ай

Чексиз суроолор менен колдонуңуз! 🎉`,

    menu_dori: '💊 Дары кеңешчиси',
    menu_shifokor: '👨‍⚕️ Доктор кеңешчиси',
    menu_surunkali: '🩺 Созулма оорулар',
    menu_diagnostika: '🔬 Диагностика',
    menu_back: '🏠 Башкы меню',
    menu_lang: '🌐 Тил',
    menu_premium: '💎 Премиум',
    menu_help: '📖 Жардам',

    section_dori: `💊 *ДАРЫ КЕҢЕШЧИСИ*

Сиз төмөнкүлөр жөнүндө сурай аласыз:

• 💊 Дары жөнүндө толук маалымат
• ⚠️ Терс таасирлер жана эскертүүлөр
• 📏 Дозалоо (жаш боюнча)
• 🔄 Дарылардын өз ара таасири
• 💊 Аналог дарылар
• 🤰 Кош бойлуулукта колдонуу
• 📋 Колдонуу көрсөтмөлөрү жана каршы көрсөтмөлөр

✏️ *Дары атын же суроону жазыңыз:*`,

    section_shifokor: `👨‍⚕️ *ДОКТОР КЕҢЕШЧИСИ*

⚕️ *Европа жана Америка гайдлайндары боюнча*
(AHA, ADA, ESC, NICE, WHO, GINA, GOLD ж.б.)

Сиз төмөнкүлөр жөнүндө сурай аласыз:

• 🔍 Симптомдорду талдоо
• 📋 Оору жөнүндө маалымат
• 💊 Дарылоо ыкмалары
• 🛡️ Алдын алуу
• 🚨 Качан доктурга барыш керек
• 🏥 Кайсы адиске барыш керек

⚠️ *Маанилүү:* Бул алдын ала талдоо. Так диагноз үчүн доктурга кайрылыңыз!

✏️ *Симптомдоруңузду толук жазыңыз:*`,

    section_surunkali: `🩺 *СОЗУЛМА ООРУЛАР КӨЗӨМӨЛҮ*

Төмөнкү ооруларды көзөмөлдөөгө жардам берем:

• 🩸 *Диабет* (1-тип, 2-тип) — ADA 2024
• ❤️ *Гипертония* — AHA/ACC 2023
• 🌬️ *Астма* — GINA 2024
• 🫁 *ӨССО/COPD* — GOLD 2024
• 💔 *Жүрөк жетишсиздиги* — ESC 2023
• 🫘 *Бөйрөк оорулары* — KDIGO 2024
• ⚡ *Эпилепсия*
• 🦴 *Ревматоиддик артрит* — ACR/EULAR

✏️ *Оору атын же абалыңызды жазыңыз:*`,

    section_diagnostika: `🔬 *ДИАГНОСТИКА*

Төмөнкү анализдерди талдай алам:

📋 *Лабораториялык анализдер:*
• Жалпы кан анализи (ЖКА/CBC)
• Биохимиялык кан анализи
• Заар анализи
• Гормон анализдери (калканча, жыныс)
• Липид профили
• Коагулограмма
• Боор/бөйрөк функциясы
• Шиш маркерлери

🏥 *Сүрөт изилдөөлөрү:*
• Рентген сүрөттөмөсү
• МРТ/КТ сүрөттөмөсү
• УЗИ сүрөттөмөсү
• ЭКГ сүрөттөмөсү

📸 *Жыйынтыктардын сүрөтүн да жөнөтсөңүз болот!*

✏️ *Анализ жыйынтыктарын жазыңыз же сүрөт жөнөтүңүз:*`,

    help_text: `📖 *MedAI ЖАРДАМ*

*Буйруктар:*
/start — Ботту баштоо
/dori — 💊 Дары кеңешчиси
/shifokor — 👨‍⚕️ Доктор кеңешчиси
/surunkali — 🩺 Созулма оорулар
/diagnostika — 🔬 Диагностика
/premium — 💎 Премиум сатып алуу
/status — 👤 Сиздин абалыңыз
/til — 🌐 Тилди өзгөртүү
/help — 📖 Жардам

⚠️ *Эскертүү:*
Бул бот доктордун кеңешин алмаштырбайт!`,

    image_only: '📸 Азыр сүрөт файлдарын гана (JPG, PNG) талдай алам.',
    send_image_hint: '📸 Сүрөт жөнөтүңүз же текст жазыңыз',
    
    disclaimer: `

⚠️ *МААНИЛҮҮ ЭСКЕРТҮҮ:*
Бул маалымат доктордун кеңешин алмаштырбайт! Так диагноз жана дарылоо үчүн квалификациялуу адиске кайрылыңыз.`
  },

  // ==================== ТОҶИКӢ ====================
  tg: {
    welcome: (name) => `Салом ${name}! 👋

Ман MedAI — ёрдамчии тиббии AI касбиям.

🏥 *Хизматҳои мо:*

💊 *Маслиҳатчии дору* — /dori
Маълумоти пурра дар бораи доруҳо, таъсирҳои ҷонибӣ, дозанокӣ, аналогҳо

👨‍⚕️ *Маслиҳатчии духтур* — /shifokor
Таҳлили аломатҳо, маълумот дар бораи беморӣ (дар асоси гайдлайнҳои Аврупо ва Амрико)

🩺 *Беморҳои музмин* — /surunkali
Назорати диабет, гипертония, астма ва беморҳои дигар

🔬 *Ташхис* — /diagnostika
Таҳлили хун, пешоб, гормонҳо, рентген, МРТ, УЗИ

⚠️ *Огоҳӣ:* Ҷавобҳои ман маслиҳати духтурро иваз намекунанд!

🆓 Тарифи ройгон: 5 савол дар рӯз
💎 Премиум: саволҳои беохир — 40,000 сум/моҳ

🌐 Иваз кардани забон: /til
📖 Кӯмак: /help`,

    choose_lang: '🌐 Забонро интихоб кунед:',
    lang_changed: '✅ Забон иваз шуд: Тоҷикӣ 🇹🇯',
    
    premium_info: `💎 *Тарифи Премиум*

✅ Саволҳои беохир
✅ Ҷавоби тез
✅ Ҳамаи бахшҳо
✅ Таҳлили сурат
✅ Нигоҳдории таърих

💳 *Нарх:* 40,000 сум/моҳ

Усули пардохтро интихоб кунед:`,

    status_text: (isPremium, count, premiumUntil) => {
      const status = isPremium ? '💎 Премиум' : '🆓 Ройгон';
      const c = isPremium ? 'Беохир' : `${count}/5`;
      let text = `👤 *Вазъияти шумо:*

📋 Тариф: ${status}
📊 Саволҳои имрӯза: ${c}`;
      if (isPremium && premiumUntil) {
        const date = new Date(premiumUntil).toLocaleDateString('tg-TJ');
        text += `\n📅 Мӯҳлати Премиум: ${date}`;
      }
      return text;
    },

    user_not_found: '❌ Корбар ёфт нашуд! /start -ро пахш кунед.',
    limit_reached: `❌ Маҳдудияти ройгони рӯзона ба охир расид (5/5).

💎 Барои саволҳои беохир Премиум харед!
👉 /premium`,
    loading: '⏳ Ҷавоб тайёр мешавад...',
    error: '❌ Хатогӣ рух дод. Лутфан дубора кӯшиш кунед.',
    
    payment_success: `✅ Пардохт бо муваффақият қабул шуд!

💎 Шумо акнун корбари Премиум ҳастед!
📅 Мӯҳлат: 1 моҳ

Бо саволҳои беохир истифода баред! 🎉`,

    menu_dori: '💊 Маслиҳатчии дору',
    menu_shifokor: '👨‍⚕️ Маслиҳатчии духтур',
    menu_surunkali: '🩺 Беморҳои музмин',
    menu_diagnostika: '🔬 Ташхис',
    menu_back: '🏠 Менюи асосӣ',
    menu_lang: '🌐 Забон',
    menu_premium: '💎 Премиум',
    menu_help: '📖 Кӯмак',

    section_dori: `💊 *МАСЛИҲАТЧИИ ДОРУ*

Шумо метавонед дар бораи инҳо пурсед:

• 💊 Маълумоти пурра дар бораи дору
• ⚠️ Таъсирҳои ҷонибӣ ва огоҳиҳо
• 📏 Дозанокӣ (аз рӯи синну сол)
• 🔄 Таъсири мутақобилаи доруҳо
• 💊 Доруҳои аналог
• 🤰 Истифода дар давраи ҳомиладорӣ
• 📋 Нишондиҳандаҳо ва зидднишондиҳандаҳо

✏️ *Номи дору ё саволи худро нависед:*`,

    section_shifokor: `👨‍⚕️ *МАСЛИҲАТЧИИ ДУХТУР*

⚕️ *Дар асоси гайдлайнҳои Аврупо ва Амрико*
(AHA, ADA, ESC, NICE, WHO, GINA, GOLD ва ғ.)

Шумо метавонед дар бораи инҳо пурсед:

• 🔍 Таҳлили аломатҳо
• 📋 Маълумот дар бораи беморӣ
• 💊 Усулҳои табобат
• 🛡️ Пешгирӣ
• 🚨 Кай бояд ба духтур муроҷиат кард
• 🏥 Ба кадом мутахассис бояд рафт

⚠️ *Муҳим:* Ин таҳлили пешакӣ аст. Барои ташхиси дақиқ ба духтур муроҷиат кунед!

✏️ *Аломатҳои худро муфассал нависед:*`,

    section_surunkali: `🩺 *НАЗОРАТИ БЕМОРҲОИ МУЗМИН*

Дар назорати беморҳои зерин кӯмак мерасонам:

• 🩸 *Диабет* (навъи 1, навъи 2) — ADA 2024
• ❤️ *Гипертония* — AHA/ACC 2023
• 🌬️ *Астма* — GINA 2024
• 🫁 *БМОО/COPD* — GOLD 2024
• 💔 *Норасоии дил* — ESC 2023
• 🫘 *Беморҳои гурда* — KDIGO 2024
• ⚡ *Эпилепсия*
• 🦴 *Артрити ревматоидӣ* — ACR/EULAR

✏️ *Номи беморӣ ё ҳолати худро нависед:*`,

    section_diagnostika: `🔬 *ТАШХИС*

Метавонам таҳлилҳои зеринро таҳлил кунам:

📋 *Таҳлилҳои лабораторӣ:*
• Таҳлили умумии хун (ТУХ/CBC)
• Таҳлили биохимиявии хун
• Таҳлили пешоб
• Таҳлилҳои гормонӣ (тироид, ҷинсӣ)
• Профили липид
• Коагулограмма
• Функсияи ҷигар/гурда
• Маркерҳои саратон

🏥 *Тасвирҳо:*
• Тавсифи рентген
• Тавсифи МРТ/КТ
• Тавсифи УЗИ
• Тавсифи ЭКГ

📸 *Сурати натиҷаҳоро низ фиристода метавонед!*

✏️ *Натиҷаи таҳлилҳоро нависед ё сурат фиристед:*`,

    help_text: `📖 *MedAI КӮМАК*

*Фармонҳо:*
/start — Оғоз кардани бот
/dori — 💊 Маслиҳатчии дору
/shifokor — 👨‍⚕️ Маслиҳатчии духтур
/surunkali — 🩺 Беморҳои музмин
/diagnostika — 🔬 Ташхис
/premium — 💎 Харидани Премиум
/status — 👤 Вазъияти шумо
/til — 🌐 Иваз кардани забон
/help — 📖 Кӯмак

⚠️ *Огоҳӣ:*
Ин бот маслиҳати духтурро иваз намекунад!`,

    image_only: '📸 Ҳозир танҳо файлҳои сурат (JPG, PNG)-ро таҳлил карда метавонам.',
    send_image_hint: '📸 Сурат фиристед ё матн нависед',
    
    disclaimer: `

⚠️ *ОГОҲИИ МУҲИМ:*
Ин маълумот маслиҳати духтурро иваз намекунад! Барои ташхис ва табобати дақиқ ба мутахассиси ботаҷриба муроҷиат кунед.`
  }
};

// ==================== SYSTEM PROMPTLAR ====================

function getSystemPrompt(section, lang) {
  const langInstructions = {
    uz: `MUHIM: Faqat O'zbek tilida (LOTIN alifbosida) javob bering!
Barcha tibbiy terminlarni o'zbek tiliga tarjima qiling, qavsda inglizcha asl terminni ham ko'rsating.
Masalan: "Yuqori qon bosimi (Hypertension)", "Qandli diabet (Diabetes Mellitus)", "Yurak xurujи (Myocardial Infarction)".
Murakkab terminlarni oddiy tilda tushuntiring.`,

    uz_cyrl: `МУҲИМ: Фақат Ўзбек тилида (КИРИЛЛ алифбосида) жавоб беринг!
Барча тиббий терминларни ўзбек тилига таржима қилинг, қавсда инглизча асл терминни ҳам кўрсатинг.
Масалан: "Юқори қон босими (Hypertension)", "Қандли диабет (Diabetes Mellitus)".
Мураккаб терминларни оддий тилда тушунтиринг.`,

    ru: `ВАЖНО: Отвечайте ТОЛЬКО на русском языке!
Все медицинские термины переводите на русский, в скобках указывайте оригинальный английский термин.
Например: "Повышенное артериальное давление (Hypertension)", "Сахарный диабет (Diabetes Mellitus)", "Инфаркт миокарда (Myocardial Infarction)".
Объясняйте сложные термины простым языком.`,

    en: `IMPORTANT: Respond ONLY in English!
Use standard medical terminology with clear explanations for patients.
For complex terms, provide simple explanations in parentheses.
Example: "Hypertension (high blood pressure)", "Myocardial Infarction (heart attack)".`,

    kk: `МАҢЫЗДЫ: Тек ҚАЗАҚ тілінде жауап беріңіз!
Барлық медициналық терминдерді қазақ тіліне аударыңыз, жақша ішінде ағылшынша түпнұсқа терминді де көрсетіңіз.
Мысалы: "Қан қысымының жоғарылауы (Hypertension)", "Қант диабеті (Diabetes Mellitus)".
Күрделі терминдерді қарапайым тілде түсіндіріңіз.`,

    ky: `МААНИЛҮҮ: Жооп КЫРГЫЗ тилинде гана болсун!
Бардык медициналык терминдерди кыргыз тилине которуңуз, кашаада англисче түпнуска терминди да көрсөтүңүз.
Мисалы: "Кан басымынын жогорулашы (Hypertension)", "Кант диабети (Diabetes Mellitus)".
Татаал терминдерди жөнөкөй тилде түшүндүрүңүз.`,

    tg: `МУҲИМ: Танҳо ба забони ТОҶИКӢ ҷавоб диҳед!
Ҳамаи истилоҳоти тиббиро ба забони тоҷикӣ тарҷума кунед, дар қавс истилоҳи англисиро низ нишон диҳ��д.
Масалан: "Баландшавии фишори хун (Hypertension)", "Диабети қанд (Diabetes Mellitus)".
Истилоҳоти мураккабро бо забони оддӣ шарҳ диҳед.`
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
- O'z-o'zini davolashga undamang
- Retseptli dorilar haqida faqat umumiy ma'lumot bering, tavsiya qilmang`,

    shifokor: `Siz MedAI — yuqori malakali shifokor-maslahatchi AI tizimisiz.

${langInstruction}

SIZ QUYIDAGI XALQARO GUIDELINELAR ASOSIDA ISHLAYSIZ:

KARDIOVASKULYAR:
- AHA/ACC (American Heart Association / American College of Cardiology)
- ESC (European Society of Cardiology)

ENDOKRINOLOGIYA:
- ADA (American Diabetes Association) — diabet
- ATA (American Thyroid Association) — qalqonsimon bez

PULMONOLOGIYA:
- GINA (Global Initiative for Asthma) — astma
- GOLD (Global Initiative for COPD) — XOAB/COPD
- ATS (American Thoracic Society)

GASTROENTEROLOGIYA:
- ACG (American College of Gastroenterology)
- AASLD (American Association for the Study of Liver Diseases)

NEFROLOGIYA:
- KDIGO (Kidney Disease: Improving Global Outcomes)

REVMATOLOGIYA:
- ACR (American College of Rheumatology)
- EULAR (European League Against Rheumatism)

NEVROLOGIYA:
- AAN (American Academy of Neurology)

INFEKTSION KASALLIKLAR:
- IDSA (Infectious Diseases Society of America)
- WHO (World Health Organization)

ONKOLOGIYA:
- NCCN (National Comprehensive Cancer Network)

UMUMIY AMALIYOT:
- NICE (National Institute for Health and Care Excellence)
- USPSTF (US Preventive Services Task Force)

AKUSHERLIK-GINEKOLOGIYA:
- ACOG (American College of Obstetricians and Gynecologists)

PEDIATRIYA:
- AAP (American Academy of Pediatrics)

SIMPTOMLARNI TAHLIL QILISH TARTIBI:

1. **ANAMNEZ YIG'ISH:**
   - Asosiy shikoyat (Chief Complaint)
   - Hozirgi kasallik tarixi (History of Present Illness — HPI):
     * OLDPORST: Onset, Location, Duration, Character, Aggravating factors, Relieving factors, Severity, Timing
   - O'tgan kasalliklar tarixi (Past Medical History)
   - Dorilar (Current Medications)
   - Allergiyalar (Allergies)
   - Oilaviy anamnez (Family History)
   - Ijtimoiy anamnez (Social History — chekish, alkogol, kasbiy xavflar)
   - Sistem bo'yicha so'rov (Review of Systems)

2. **DIFFERENTSIAL DIAGNOZ:**
   - Eng ehtimoliy diagnozlarni sanab chiqing (3-5 ta)
   - Har birining ehtimollik darajasini foizda ko'rsating
   - Har bir diagnoz uchun asosiy mezonlar
   - "Red flags" — xavfli alomatlarni ALOHIDA TA'KIDLANG

3. **TEKSHIRUVLAR TAKLIFI:**
   - Laboratoriya tekshiruvlari
   - Instrumental tekshiruvlar
   - Tekshiruvlarning sabablari

4. **DASTLABKI TAVSIYALAR:**
   - Hayot tarzi tavsiyalari
   - OTC (retseptsiz) dorilar
   - Retseptli dorilarni FAQAT SHIFOKOR YOZISHI MUMKIN deb yozing

5. **QACHON SHOSHILINCH YORDAM KERAK:**
   - 🚨 DARHOL tez yordam chaqirish kerak bo'lgan alomatlar
   - ⚠️ 24 soat ichida shifokorga murojaat
   - 📅 Rejalashtirilgan murojaat

6. **QAYSI MUTAXASSISGA MUROJAAT QILISH:**
   - Umumiy amaliyot shifokori / Terapevt
   - Tor mutaxassis (aniq ko'rsating)

MUHIM QOIDALAR:
- HECH QACHON aniq tashxis qo'ymang — faqat "taxminiy" yoki "ehtimoliy diagnoz" deng
- Har doim professional shifokorga murojaat qilishni tavsiya qiling
- Guideline manbasini ko'rsating (masalan: "ADA 2024 Standards of Care bo'yicha...")
- Javob oxirida har doim disclaimer yozing
- O'z-o'zini davolashga UNDAMANG`,

    surunkali: `Siz MedAI — surunkali (muzmin) kasalliklarni nazorat qilish bo'yicha AI mutaxassisisiz.

${langInstruction}

SIZ QUYIDAGI KASALLIKLARNI NAZORAT QILISHDA YORDAM BERASIZ:

1. **DIABET (Diabetes Mellitus)** — ADA 2024 Standards of Care
   - HbA1c maqsadlari (odatda <7%, individuallashtirilgan)
   - Qon qandi monitoringi (FBG <7 mmol/L, PPG <10 mmol/L)
   - Dorilar: Metformin, SGLT2i, GLP-1RA, DPP-4i, Insulin
   - Asoratlar skriningi: Retinopathy, Nefropathy, Neyropatiya, Diabetik oyoq
   - Ovqatlanish va jismoniy faollik
   - Gipoglikemiya belgilari va boshqarish

2. **GIPERTONIYA (Hypertension)** — AHA/ACC 2023, ESC 2023
   - Qon bosimi maqsadlari (<130/80 mmHg ko'p hollarda)
   - Dorilar: ACEi, ARB, CCB, Thiazide diuretiklar, Beta-blokerlar
   - DASH dieta, tuz cheklash (<5g/kun)
   - Uy sharoitida monitoring
   - Gipertenziv kriz belgilari

3. **ASTMA** — GINA 2024
   - Astma nazorat testi (ACT score)
   - Inhaler texnikasi
   - Step therapy (1-5 bosqich)
   - Triggerlardan qochish
   - Action plan

4. **XOAB/COPD** — GOLD 2024
   - ABCD baholash / GOLD 2024 yangi klassifikatsiya
   - Bronxodilatatorlar, ICS
   - Oksigen terapiyasi ko'rsatmalari
   - Pulmonar reabilitatsiya
   - Exacerbation oldini olish

5. **YURAK YETISHMOVCHILIGI (Heart Failure)** — AHA/ACC, ESC 2023
   - HFrEF vs HFpEF vs HFmrEF
   - GDMT: ACEi/ARB/ARNI, Beta-bloker, MRA, SGLT2i
   - Diuretiklar
   - Kundalik vazn nazorati
   - Suyuqlik va tuz cheklash
   - Decompensation belgilari

6. **BUYRAK KASALLIKLARI (CKD)** — KDIGO 2024
   - GFR va albuminuriya bo'yicha staging
   - Qon bosimi nazorati
   - Proteinuriya kamaytirish
   - Nefrotoksik dorilardan qochish
   - Dieta: oqsil, kaliy, fosfor

NAZORAT TARTIBI:
1. Kasallik holatini so'rang
2. Dorilarni muntazam qabul qilayotganligini tekshiring
3. Yon ta'sirlar haqida so'rang
4. Oxirgi laboratoriya natijalarini so'rang
5. Navbatdagi tekshiruvni eslatib turing
6. Hayot tarzi tavsiyalarini bering
7. Ogohlantirish belgilarini tushuntiring`,

    diagnostika: `Siz MedAI — laboratoriya va tasviriy diagnostika natijalari bo'yicha AI tahlilchisisiz.

${langInstruction}

SIZ QUYIDAGI TAHLILLARNI INTERPRET QILA OLASIZ:

📋 **QON UMUMIY TAHLILI (CBC):**
- WBC: 4.0-11.0 × 10⁹/L
- RBC: E 4.5-5.5, A 3.8-5.1 × 10¹²/L
- Hemoglobin: E 130-170, A 120-150 g/L
- Hematokrit: E 40-54%, A 36-48%
- MCV: 80-100 fL
- MCH: 27-33 pg
- MCHC: 320-360 g/L
- PLT: 150-400 × 10⁹/L
- ESR: E 1-10, A 2-15 mm/soat
- RDW: 11.5-14.5%

📋 **BIOXIMIK TAHLIL:**
- Glyukoza (och): 3.9-6.1 mmol/L
- HbA1c: <5.7% (normal), 5.7-6.4% (prediabet), ≥6.5% (diabet)
- Kreatinin: E 74-110, A 44-80 μmol/L
- Urea: 2.8-7.2 mmol/L
- GFR: >90 mL/min/1.73m²
- ALT: E <41, A <33 U/L
- AST: E <40, A <32 U/L
- Bilirubin umumiy: 3.4-20.5 μmol/L
- Albumin: 35-50 g/L
- Natriy: 136-145 mmol/L
- Kaliy: 3.5-5.1 mmol/L
- Kaltsiy: 2.15-2.55 mmol/L

📋 **LIPID PROFILI:**
- Umumiy xolesterin: <5.2 mmol/L
- LDL: <3.4 mmol/L (xavf bo'lsa <2.6 yoki <1.8)
- HDL: E >1.0, A >1.3 mmol/L
- Triglitseridlar: <1.7 mmol/L

📋 **KOAGULOGRAMMA:**
- INR: 0.8-1.2 (varfarin: 2.0-3.0)
- APTT: 25-35 sek
- Fibrinogen: 2-4 g/L
- D-dimer: <0.5 mg/L

📋 **TIREOID GORMONLARI:**
- TSH: 0.27-4.2 mIU/L
- FT4: 12-22 pmol/L
- FT3: 3.1-6.8 pmol/L
- Anti-TPO: <34 IU/mL

📋 **SIYDIK TAHLILI:**
- Zichlik: 1.005-1.030
- pH: 5.0-7.0
- Oqsil, glyukoza: salbiy
- Eritrositlar: 0-2
- Leykositlar: E 0-3, A 0-6

📋 **TUMOR MARKERLARI:**
- PSA: <4.0 ng/mL
- CEA: <5.0 ng/mL
- CA 19-9: <37 U/mL
- CA 125: <35 U/mL
- AFP: <10 ng/mL

TAHLIL QILISH TARTIBI:
1. Har bir ko'rsatkichni normal diapazoni bilan solishtiring
2. Normadan chetga chiqqanlarni ⬆️ (yuqori) yoki ⬇️ (past) belgilang
3. Har bir og'ish uchun mumkin bo'lgan sabablarni sanang
4. Ko'rsatkichlar orasidagi bog'liqlikni tahlil qiling
5. Qo'shimcha tekshiruvlar taklif qiling
6. Qaysi mutaxassisga murojaat kerakligini ayting

MUHIM:
- Siz TASHXIS QO'YMAYSIZ, faqat natijalarni interpret qilasiz
- Kritik qiymatlarni darhol ta'kidlang
- "Bu tahlil shifokorning klinik bahosi bilan birgalikda ko'rib chiqilishi kerak" deb yozing`
  };

  return prompts[section] || prompts.shifokor;
}

// ==================== FOYDALANUVCHI SESSIYALARI ====================

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

// ==================== SUPABASE FOYDALANUVCHI ====================

async function getUser(userId, firstName, username) {
  try {
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      await supabase.from('users').insert({
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

    // Til sessiyaga yuklash
    if (user.language) {
      getUserSession(userId).lang = user.language;
    }

    // Premium muddati tekshirish
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

    // Kunlik limit reset
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

// ==================== KLAVIATURA ====================

function getMainMenuKeyboard(userId) {
  const t = getT(userId);
  return {
    reply_markup: {
      keyboard: [
        [{ text: t.menu_dori }, { text: t.menu_shifokor }],
        [{ text: t.menu_surunkali }, { text: t.menu_diagnostika }],
        [{ text: t.menu_back }, { text: t.menu_lang }]
      ],
      resize_keyboard: true
    }
  };
}

function getLanguageKeyboard() {
  const buttons = Object.entries(LANGUAGES).map(([code, lang]) => {
    return [{ text: `${lang.flag} ${lang.name}`, callback_data: `lang_${code}` }];
  });
  return { reply_markup: { inline_keyboard: buttons } };
}

function getPaymentKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💳 Click — 40,000 so'm", callback_data: 'pay_click' }],
        [{ text: "💳 Payme — 40,000 so'm", callback_data: 'pay_payme' }]
      ]
    }
  };
}

// ==================== /start ====================

bot.onText(/\/start/, async (msg) => {
  const name = msg.from.first_name;
  const userId = msg.from.id;
  await getUser(userId, name, msg.from.username);

  const session = getUserSession(userId);
  session.section = null;
  session.conversationHistory = [];

  const t = getT(userId);
  await bot.sendMessage(msg.chat.id, t.welcome(name), {
    parse_mode: 'Markdown',
    ...getMainMenuKeyboard(userId)
  });
});

// ==================== /til ====================

bot.onText(/\/til/, (msg) => {
  const t = getT(msg.from.id);
  bot.sendMessage(msg.chat.id, t.choose_lang, getLanguageKeyboard());
});

// ==================== /premium ====================

bot.onText(/\/premium/, (msg) => {
  const t = getT(msg.from.id);
  bot.sendMessage(msg.chat.id, t.premium_info, {
    parse_mode: 'Markdown',
    ...getPaymentKeyboard()
  });
});

// ==================== /status ====================

bot.onText(/\/status/, async (msg) => {
  const userId = msg.from.id;
  const t = getT(userId);
  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  if (!user) {
    bot.sendMessage(msg.chat.id, t.user_not_found);
    return;
  }
  bot.sendMessage(msg.chat.id, t.status_text(user.is_premium, user.daily_count, user.premium_until), {
    parse_mode: 'Markdown'
  });
});

// ==================== /help ====================

bot.onText(/\/help/, (msg) => {
  const t = getT(msg.from.id);
  bot.sendMessage(msg.chat.id, t.help_text, {
    parse_mode: 'Markdown',
    ...getMainMenuKeyboard(msg.from.id)
  });
});

// ==================== BO'LIM KOMANDALARI ====================

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

// ==================== CALLBACK QUERY ====================

bot.on('callback_query', async (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const data = query.data;

  // TIL TANLASH
  if (data.startsWith('lang_')) {
    const langCode = data.replace('lang_', '');
    const session = getUserSession(userId);
    session.lang = langCode;

    await supabase
      .from('users')
      .update({ language: langCode })
      .eq('id', userId);

    const t = TRANSLATIONS[langCode] || TRANSLATIONS.uz;
    bot.answerCallbackQuery(query.id, { text: '✅' });
    bot.sendMessage(chatId, t.lang_changed, {
      parse_mode: 'Markdown',
      ...getMainMenuKeyboard(userId)
    });
    return;
  }

  // CLICK TO'LOV
  if (data === 'pay_click') {
    try {
      await bot.sendInvoice(
        chatId,
        'MedAI Premium',
        'Cheksiz tibbiy savollar — 1 oy',
        'premium_click',
        process.env.PAYMENT_TOKEN_CLICK,
        'UZS',
        [{ label: 'Premium 1 oy', amount: 4000000 }]
      );
    } catch (err) {
      console.log('Click xato:', err.message);
    }
    bot.answerCallbackQuery(query.id);
    return;
  }

  // PAYME TO'LOV
  if (data === 'pay_payme') {
    try {
      await bot.sendInvoice(
        chatId,
        'MedAI Premium',
        'Cheksiz tibbiy savollar — 1 oy',
        'premium_payme',
        process.env.PAYMENT_TOKEN_PAYME,
        'UZS',
        [{ label: 'Premium 1 oy', amount: 4000000 }]
      );
    } catch (err) {
      console.log('Payme xato:', err.message);
    }
    bot.answerCallbackQuery(query.id);
    return;
  }

  bot.answerCallbackQuery(query.id);
});

// ==================== TO'LOV ====================

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

  bot.sendMessage(msg.chat.id, t.payment_success, {
    parse_mode: 'Markdown',
    ...getMainMenuKeyboard(userId)
  });
});

// ==================== ASOSIY XABAR HANDLER ====================

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  if (msg.successful_payment) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const session = getUserSession(userId);
  const t = getT(userId);
  const text = msg.text.trim();

  // MENYU TUGMALARI - Barcha tillardan tekshirish
  const menuMappings = {};
  Object.keys(TRANSLATIONS).forEach(lang => {
    const tr = TRANSLATIONS[lang];
    menuMappings[tr.menu_dori] = 'dori';
    menuMappings[tr.menu_shifokor] = 'shifokor';
    menuMappings[tr.menu_surunkali] = 'surunkali';
    menuMappings[tr.menu_diagnostika] = 'diagnostika';
    menuMappings[tr.menu_back] = 'back';
    menuMappings[tr.menu_lang] = 'lang';
  });

  if (menuMappings[text]) {
    const action = menuMappings[text];

    if (action === 'back') {
      session.section = null;
      session.conversationHistory = [];
      bot.sendMessage(chatId, t.welcome(msg.from.first_name), {
        parse_mode: 'Markdown',
        ...getMainMenuKeyboard(userId)
      });
      return;
    }

    if (action === 'lang') {
      bot.sendMessage(chatId, t.choose_lang, getLanguageKeyboard());
      return;
    }

    // Bo'lim tanlash
    session.section = action;
    session.conversationHistory = [];
    const sectionTexts = {
      dori: t.section_dori,
      shifokor: t.section_shifokor,
      surunkali: t.section_surunkali,
      diagnostika: t.section_diagnostika
    };
    bot.sendMessage(chatId, sectionTexts[action], {
      parse_mode: 'Markdown',
      ...getMainMenuKeyboard(userId)
    });
    return;
  }

  // FOYDALANUVCHI TEKSHIRISH
  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  if (!user) {
    bot.sendMessage(chatId, t.user_not_found);
    return;
  }

  // LIMIT TEKSHIRISH
  if (!user.is_premium && user.daily_count >= 5) {
    bot.sendMessage(chatId, t.limit_reached, { parse_mode: 'Markdown' });
    return;
  }

  // LIMIT YANGILASH
  await supabase
    .from('users')
    .update({ daily_count: user.daily_count + 1 })
    .eq('id', user.id);

  // DEFAULT BO'LIM
  if (!session.section) {
    session.section = 'shifokor';
  }

  // LOADING
  const loadingMsg = await bot.sendMessage(chatId, t.loading);

  try {
    session.conversationHistory.push({ role: 'user', content: text });

    if (session.conversationHistory.length > 20) {
      session.conversationHistory = session.conversationHistory.slice(-20);
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: getSystemPrompt(session.section, session.lang),
      messages: session.conversationHistory
    });

    const aiResponse = response.content[0].text;

    session.conversationHistory.push({ role: 'assistant', content: aiResponse });

    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) {}

    // JAVOBNI YUBORISH
    await sendLongMessage(chatId, aiResponse, userId);

    // TARIXGA SAQLASH
    try {
      await supabase.from('chat_history').insert({
        user_id: userId,
        section: session.section,
        user_message: text,
        ai_response: aiResponse,
        language: session.lang
      });
    } catch (e) {}

  } catch (error) {
    console.log('AI xato:', error.message);
    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) {}
    bot.sendMessage(chatId, t.error, getMainMenuKeyboard(userId));
  }
});

// ==================== RASM HANDLER ====================

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
    bot.sendMessage(chatId, t.limit_reached, { parse_mode: 'Markdown' });
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
    const photo = msg.photo[msg.photo.length - 1];
    const file = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const fetch = (await import('node-fetch')).default;
    const imageResponse = await fetch(fileUrl);
    const imageBuffer = await imageResponse.buffer();
    const base64Image = imageBuffer.toString('base64');

    const mediaType = file.file_path.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const caption = msg.caption || '';

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
              text: caption || 'Bu rasmni tahlil qiling. Agar tibbiy tasvir yoki analiz natijasi bo\'lsa, batafsil interpret qiling.'
            }
          ]
        }
      ]
    });

    const aiResponse = response.content[0].text;

    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) {}

    await sendLongMessage(chatId, aiResponse, userId);

  } catch (error) {
    console.log('Rasm xato:', error.message);
    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) {}
    bot.sendMessage(chatId, t.error, getMainMenuKeyboard(userId));
  }
});

// ==================== UZUN XABAR YUBORISH ====================

async function sendLongMessage(chatId, text, userId) {
  const maxLength = 4000;

  if (text.length <= maxLength) {
    await bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...getMainMenuKeyboard(userId)
    }).catch(async () => {
      await bot.sendMessage(chatId, text, getMainMenuKeyboard(userId));
    });
    return;
  }

  const parts = [];
  let remaining = text;

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
    const isLast = i === parts.length - 1;
    const opts = isLast ? getMainMenuKeyboard(userId) : {};

    await bot.sendMessage(chatId, parts[i], {
      parse_mode: 'Markdown',
      ...opts
    }).catch(async () => {
      await bot.sendMessage(chatId, parts[i], opts);
    });
  }
}

// ==================== XATO HANDLER ====================

bot.on('polling_error', (error) => {
  console.log('Polling xato:', error.code);
});

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Rejection:', reason);
});

// ==================== START ====================

console.log('═══════════════════════════════════════════');
console.log('✅ MedAI Bot ishga tushdi!');
console.log('═══════════════════════════════════════════');
console.log('📋 Bo\'limlar: Dori | Shifokor | Surunkali | Diagnostika');
console.log('🌐 Tillar: UZ (Lotin) | UZ (Кирилл) | RU | EN | KK | KY | TG');
console.log('💳 To\'lov: Click + Payme');
console.log('═══════════════════════════════════════════');
