const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require('express');

// ==========================================
// ১. কনফিগারেশন (আপনার টোকেন এখানে বসানো হয়েছে)
// ==========================================
const BOT_TOKEN = '8692279106:AAEFsBmbTimfeU0O0NvrQzM5tkvmQVaGyeU';

// নিচের 'YOUR_MONGO_URI_HERE' লেখাটি মুছে আপনার MongoDB লিঙ্ক বসাবেন (যদি ডাটাবেস ব্যবহার করতে চান)
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGO_URI_HERE';

// ==========================================
// ২. মঙ্গোডিবি (MongoDB) কানেকশন
// ==========================================
if (MONGO_URI !== 'YOUR_MONGO_URI_HERE') {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ MongoDB Database Connected Successfully!'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err));
} else {
    console.warn('⚠️ MONGO_URI দেওয়া নেই! ডাটাবেস ছাড়া বোট রান হচ্ছে।');
}

const userSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    name: String,
    points: { type: Number, default: 0 }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// ==========================================
// ৩. টেলিগ্রাম বোট সেটআপ
// ==========================================
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// এররগুলো যেন সার্ভার ক্র্যাশ না করে তার ব্যবস্থা
bot.on('polling_error', (error) => {
    console.error('⚠️ Polling Error:', error.message);
});

// /start কমান্ড
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'User';

    if (MONGO_URI !== 'YOUR_MONGO_URI_HERE') {
        try {
            let user = await User.findOne({ userId: chatId });
            if (!user) {
                user = new User({ userId: chatId, name: firstName, points: 0 });
                await user.save();
            }
        } catch (err) {
            console.error('Database save error:', err.message);
        }
    }

    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🎮 Tap to Earn (+1 Point)', callback_data: 'tap' }],
                [
                    { text: '💰 Balance', callback_data: 'balance' },
                    { text: '🎁 Daily Bonus', callback_data: 'bonus' }
                ],
                [{ text: '👥 Invite Friends', callback_data: 'referral' }]
            ]
        }
    };

    bot.sendMessage(chatId, `👋 Welcome ${firstName} to RtTapBot!\n\nনিচের বাটনগুলো চেপে পয়েন্ট আয় করুন:`, opts);
});

// বাটন ক্লিক হ্যান্ডলার
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    let user = null;
    if (MONGO_URI !== 'YOUR_MONGO_URI_HERE') {
        try {
            user = await User.findOne({ userId: chatId });
        } catch (err) {
            console.error('Database find error:', err.message);
        }
    }

    if (data === 'tap') {
        let pts = 1;
        if (user) {
            user.points += 1;
            await user.save();
            pts = user.points;
        }
        bot.answerCallbackQuery(query.id, { text: `🚀 +1 Point! Total: ${pts}` });
    }
    else if (data === 'balance') {
        const pts = user ? user.points : 0;
        bot.sendMessage(chatId, `💰 আপনার ব্যালেন্স: ${pts} পয়েন্ট`);
    }
    else if (data === 'bonus') {
        bot.sendMessage(chatId, `🎁 আপনি আজকের বোনাস পেয়ে গেছেন!`);
    }
    else if (data === 'referral') {
        bot.sendMessage(chatId, `🔗 আপনার রেফারাল লিঙ্ক: https://t.me/Tap_Tap_earn_bot?start=${chatId}`);
    }
});

console.log('🚀 RtTapBot is Starting...');

// ==========================================
// ৪. Render-এর জন্য ওয়েব সার্ভার
// ==========================================
const app = express();
app.get('/', (req, res) => res.send('RtTapBot is alive and running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Web server is running on port ${PORT}`);
});
      
