import * as dotenv from "dotenv";
dotenv.config();

import { processMessage } from "./agent.js";
import { Telegraf } from "telegraf";
import {
  isRegistered,
  register,
  updateApiKey,
} from "./db/agentKeyStore.model.js";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new Telegraf(token);

export const cachedRegisteredUsers = new Set<number>();

bot.command("setapikey", async (ctx) => {
  const chatId = ctx.chat?.id;
  const input = ctx.message.text;
  const parts = input.split(" ");

  if (parts.length !== 2) {
    await ctx.reply(
      "Usage: /setapikey YOUR_API_KEY\nPlease provide exactly one API key.",
    );
    return;
  }

  const apiKey = parts[1].trim();

  if (apiKey.length === 0) {
    await ctx.reply("API key cannot be empty. Please provide a valid API key.");
    return;
  }

  await updateApiKey(chatId, apiKey);
  await ctx.reply("Your API key has been set successfully!");
});

bot.on("message", async (ctx) => {
  try {
    const chatId = ctx.chat?.id;

    console.log("Received message from chatId:", chatId);

    let isRegisteredUser: boolean;

    if (!cachedRegisteredUsers.has(chatId)) {
      isRegisteredUser = await isRegistered(chatId);
      if (isRegisteredUser) {
        cachedRegisteredUsers.add(chatId);
        isRegisteredUser = true;
      } else isRegisteredUser = false;
    } else isRegisteredUser = true;

    if (!isRegisteredUser) {
      console.log("Registering new user with chatId:", chatId);
      await register(chatId);
      console.log("Registered new user with chatId:", chatId);
      await ctx.reply(
        "Welcome! It looks like you're a new user. Please set your API key using /setapikey command to get started.",
      );
      return;
    }

    const messageText = ctx.text || "nothing";
    await processMessage(messageText, chatId, ctx);
  } catch (error) {
    console.error("Error processing message:", error);

    try {
      await ctx.reply(
        "Sorry, I encountered an error processing your request. Please try again later.",
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
