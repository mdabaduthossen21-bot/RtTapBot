require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

// ------------------- [ ১. টেলিগ্রাম কমান্ড ও বাটন ] -------------------
bot.onText(/\/start/, (msg) => {
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎮 Tap to Earn", callback_data: "tap" }],
        [
          { text: "💰 Balance", callback_data: "balance" },
          { text: "🎁 Daily Bonus", callback_data: "bonus" }
        ],
        [{ text: "👥 Invite Friends", callback_data: "referral" }]
      ]
    }
  };

  bot.sendMessage(
    msg.chat.id,
    `👋 Welcome to RtTapBot!\n\nনিচের বাটনগুলো দিয়ে আপনার কাজ শুরু করুন:`,
    opts
  );
});

// ------------------- [ ২. বাটনের ক্লিক হ্যান্ডলার ] -------------------
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;

  if (query.data === "tap") {
    bot.answerCallbackQuery(query.id, { text: "🎉 +1 Point earned!" });
  } else if (query.data === "balance") {
    bot.sendMessage(chatId, "💰 আপনার বর্তমান ব্যালেন্স: ১০০ পয়েন্ট");
  } else if (query.data === "bonus") {
    bot.sendMessage(chatId, "🎁 আজকের ডেলি বোনাস পেয়ে গেছেন!");
  } else if (query.data === "referral") {
    bot.sendMessage(chatId, "👥 আপনার রেফারেল লিংক: https://t.me/Tap_Tap_earn_bot?start=12345");
  }
});

console.log("RtTapBot Started...");

// ------------------- [ ৩. Express Web Server (Render Port Fix) ] -------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is running alive!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
  
