import * as dotenv from "dotenv";
dotenv.config();

import { processMessage } from "./agent.js";
import { Telegraf } from "telegraf";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new Telegraf(token);

bot.on("message", async (ctx) => {
  try {
    const chatId = ctx.chat?.id;
    const messageText = ctx.text || "nothing";
    await processMessage(messageText, chatId, ctx);
  } catch (error) {
    console.error("Error processing message:", error);

    try {
      await ctx.reply(
        "Sorry, I encountered an error processing your request. Please try again later."
      );
    } catch (replyError) {
      console.error("Error sending error message:", replyError);
    }
  }
});

// Add error handling for the bot itself
bot.catch((err, ctx) => {
  console.error("Bot error:", err);
  console.error("Update that caused the error:", ctx.update);
});

bot.launch();
console.log("Bot started...");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
