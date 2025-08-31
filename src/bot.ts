import * as dotenv from "dotenv";
dotenv.config();

import { processMessage } from "./agent.js";
import { Telegraf } from "telegraf";

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new Telegraf(token);

// Function to sanitize markdown for Telegram
function sanitizeMarkdown(text: string): string {
  // Use a regular expression to find and fix unclosed bold tags
  // This pattern matches a `*` followed by a space, which is likely a bullet point
  // or a mistaken start of a bold tag. We will replace it with a simple bullet.
  text = text.replace(/(^|\n|\s)\*([^\*\s][^\*]*?)\s*$/gm, "$1• $2");

  // Find and replace bold tags (`*...*` or `**...**`) that are not properly closed
  // This finds a single asterisk not followed immediately by another asterisk or a space,
  // and replaces it with a simple bullet point.
  text = text.replace(/(?<!\*)\*(?!\*)/g, "•");

  // Ensure that all bold tags are correctly formed with double asterisks `**`
  // This will correct single asterisks that were meant for bolding but were mistyped.
  text = text.replace(/\*\*(.*?)\*\*/g, "*$1*");

  // Convert `*` bullet points at the start of a line to `•`
  text = text.replace(/^\s*\*\s+/gm, "• ");

  return text;
}

bot.on("message", async (ctx) => {
  try {
    const chatId = ctx.chat?.id;
    const messageText = ctx.text || "nothing";
    const messageToSend = await processMessage(messageText, chatId);

    // First try with minimal sanitization
    const sanitizedMessage = sanitizeMarkdown(messageToSend);

    // console.log("Sanitized Message:", sanitizedMessage);

    ctx.reply(sanitizedMessage, {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true },
    });
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
