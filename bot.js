require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const client = new Anthropic();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
        .insert({ id: userId, first_name: firstName, username: username });

      const { data: newUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      user = newUser;
    }

    if (!user) return null;

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

bot.onText(/\/start/, async (msg) => {
  const name = msg.from.first_name;
  await getUser(msg.from.id, name, msg.from.username);
  bot.sendMessage(msg.chat.id,
    `Salom ${name}! 👋\n\nMen MedAI — dori va kasalliklar haqida maslahat beruvchi AI yordamchiman.\n\n⚠️ Eslatma: Mening javoblarim shifokor maslahatini almashtirmaydi!\n\n🆓 Bepul tarif: kuniga 5 ta savol\n💎 Premium: cheksiz savol — 40,000 so'm/oy\n\nSavolingizni yozing:`
  );
});

bot.onText(/\/premium/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `💎 Premium tarif:\n\n✅ Cheksiz savollar\n✅ Tezkor javob\n✅ Dori tarixini saqlash\n\n💳 Narx: 40,000 so'm/oy\n\nTo'lov qilish uchun quyidagi tugmani bosing:`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: "💳 40,000 so'm to'lash", callback_data: 'buy_premium' }
        ]]
      }
    }
  );
});

bot.onText(/\/status/, async (msg) => {
  try {
    const user = await getUser(msg.from.id, msg.from.first_name, msg.from.username);
    if (!user) {
      bot.sendMessage(msg.chat.id, '❌ Foydalanuvchi topilmadi!');
      return;
    }
    const status = user.is_premium ? '💎 Premium' : '🆓 Bepul';
    const count = user.is_premium ? 'Cheksiz' : `${user.daily_count}/5`;
    bot.sendMessage(msg.chat.id,
      `👤 Sizning holatingiz:\n\nTarif: ${status}\nBugungi savollar: ${count}`
    );
  } catch (err) {
    console.log('Status xato:', err.message);
    bot.sendMessage(msg.chat.id, '❌ Xatolik: ' + err.message);
  }
});

bot.on('callback_query', async (query) => {
  if (query.data === 'buy_premium') {
    bot.sendInvoice(
      query.message.chat.id,
      'MedAI Premium',
      'Cheksiz tibbiy savollar — 1 oy',
      'premium_1month',
      process.env.PAYMENT_TOKEN,
      'UZS',
      [{ label: 'Premium 1 oy', amount: 4000000 }]
    );
  }
});

bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('successful_payment', async (msg) => {
  const userId = msg.from.id;
  const premiumUntil = new Date();
  premiumUntil.setMonth(premiumUntil.getMonth() + 1);

  await supabase
    .from('users')
    .update({
      is_premium: true,
      premium_until: premiumUntil.toISOString()
    })
    .eq('id', userId);

  bot.sendMessage(msg.chat.id,
    `✅ To'lov muvaffaqiyatli!\n\n💎 Siz endi Premium foydalanuvchisiz!\nMuddati: 1 oy\n\nCheksiz savollar bilan foydalaning! 🎉`
  );
});

bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const user = await getUser(msg.from.id, msg.from.first_name, msg.from.username);

  if (!user) {
    bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Qaytadan /start bosing.');
    return;
  }

  if (!user.is_premium && user.daily_count >= 5) {
    bot.sendMessage(chatId,
      `❌ Kunlik bepul limitingiz tugadi (5/5).\n\n💎 Premium olish uchun /premium buyrug'ini bosing!`
    );
    return;
  }

  await supabase
    .from('users')
    .update({ daily_count: user.daily_count + 1 })
    .eq('id', user.id);

  bot.sendMessage(chatId, '⏳ Javob tayyorlanmoqda...');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `Siz MedAI — O'zbekiston uchun tibbiy maslahat beruvchi AI yordamchisiz. 
      Faqat o'zbek tilida javob bering. 
      Dori-darmonlar, kasalliklar, simptomlar haqida aniq va tushunarli ma'lumot bering.
      Har doim oxirida: "Bu ma'lumot shifokor maslahatini almashtirmaydi!" deb yozing.`,
      messages: [{ role: 'user', content: msg.text }]
    });

    bot.sendMessage(chatId, response.content[0].text);
  } catch (error) {
    console.log('AI xato:', error.message);
    bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  }
});

console.log('MedAI bot ishga tushdi! ✅');