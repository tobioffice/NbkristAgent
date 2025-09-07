import { Message } from "telegraf/types";
import type { Context } from "telegraf";

export function sanitizeMarkdown(text: string): string {
  // Replace double asterisks `**` with single `*` for Telegram compatibility
  text = text.replace(/\*\*(.*?)\*\*/g, "*$1*");

  // Now, process the text to replace only unpaired `*` with `•`
  let result = "";
  let inBold = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "*") {
      if (!inBold) {
        // Check if this is the start of a bold sequence
        // Look ahead for the closing `*`
        let j = i + 1;
        let foundClosing = false;
        while (j < text.length && text[j] !== "\n") {
          if (text[j] === "*") {
            foundClosing = true;
            break;
          }
          j++;
        }
        if (foundClosing) {
          // It's paired, keep it
          result += "*";
          inBold = true;
        } else {
          // Unpaired, replace with bullet
          result += "•";
        }
      } else {
        // End of bold
        result += "*";
        inBold = false;
      }
    } else {
      result += text[i];
    }
  }

  // Convert `*` bullet points at the start of a line to `•`
  result = result.replace(/^\s*\*\s+/gm, "• ");

  return result;
}

export const editTelegramMessage = async (
  ctx: Context,
  messageId: number,
  newText: string,
) => {
  const message = await ctx.telegram.editMessageText(
    ctx.chat?.id,
    messageId,
    undefined,
    sanitizeMarkdown(newText),
    {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true },
    },
  );

  if (message === true) {
    throw new Error("Failed to edit message");
  }

  return message as Message.TextMessage;
};
