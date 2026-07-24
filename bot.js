require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `👋 Welcome to RtTapBot!

🚀 Tap to Earn শুরু হয়েছে।
👆 Tap করে পয়েন্ট অর্জন করুন।
👥 বন্ধুদের Invite করুন।
🎁 Daily Bonus নিন।`
  );
});

console.log("RtTapBot Started...");
