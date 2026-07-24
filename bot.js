require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const mongoose = require("mongoose");

// ------------------- [ ১. MongoDB Database Connection ] -------------------
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB Database Connected Successfully!"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// ইউজারের ডাটাবেজ স্কিমা (User Schema)
const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  name: String,
  points: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

// ------------------- [ ২. Telegram Bot Instance ] -------------------
const bot = new TelegramBot('8692279106:AAHsmtw5uE1IIHHlDSjDbya7T8f6ACl8iL4', { polling: true });

// ------------------- [ ৩. Telegram Commands & Buttons ] -------------------
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;

  try {
    let user = await User.findOne({ userId: chatId });
    if (!user) {
      user = new User({ userId: chatId, name: firstName, points: 0 });
      await user.save();
    }

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎮 Tap to Earn (+1 Point)", callback_data: "tap" }],
          [
            { text: "💰 Balance", callback_data: "balance" },
            { text: "🎁 Daily Bonus", callback_data: "bonus" },
          ],
          [{ text: "👥 Invite Friends", callback_data: "referral" }],
        ],
      },
    };

    bot.sendMessage(
      chatId,
      `👋 Welcome ${firstName} to RtTapBot!\n\nনিচের বাটনগুলো দিয়ে আপনার কাজ শুরু করুন:`,
      opts
    );
  } catch (error) {
    console.error("Error in /start:", error);
  }
});

// ------------------- [ ৪. Click Handler with Database Sync ] -------------------
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    let user = await User.findOne({ userId: chatId });

    if (!user) {
      user = new User({ userId: chatId, name: query.from.first_name, points: 0 });
      await user.save();
    }

    if (data === "tap") {
      user.points += 1;
      await user.save();
      bot.answerCallbackQuery(query.id, { text: `🎉 +1 Point! Total: ${user.points}` });
    } else if (data === "balance") {
      bot.sendMessage(chatId, `💰 আপনার বর্তমান ব্যালেন্স: ${user.points} পয়েন্ট`);
    } else if (data === "bonus") {
      bot.sendMessage(chatId, "🎁 আজকের ডেলি বোনাস সেভ করা হয়েছে!");
    } else if (data === "referral") {
      bot.sendMessage(
        chatId,
        `👥 আপনার রেফারেল লিংক: https://t.me/Tap_Tap_earn_bot?start=${chatId}`
      );
    }
  } catch (error) {
    console.error("Callback Error:", error);
  }
});

console.log("RtTapBot Started...");

// ------------------- [ ৫. Express Web Server (Render Support) ] -------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot & Database are running alive!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
    
