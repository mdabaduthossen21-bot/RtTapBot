require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `👋 Welcome to RtTapBot!

🚀 Tap to Earn শুরু হয়েছে!
👆 Tap করে পয়েন্ট অর্জন করুন।
👥 বন্ধুদের Invite করুন।
🎁 Daily Bonus নিন!`
  );
});

console.log("RtTapBot Started...");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is running alive!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
