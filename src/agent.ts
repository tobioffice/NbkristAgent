// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import {
  HumanMessage,
  ToolMessage,
  BaseMessage,
  SystemMessage,
} from "@langchain/core/messages";

import * as dotenv from "dotenv";
dotenv.config();
import { adderTool, attOverallTool, attDetailedTool } from "./tools/tools.js";
import { getMcpLangChainTools } from "./tools/mcpTools/wrapper.js";
import { Context } from "telegraf";
import { DynamicStructuredTool } from "@langchain/core/tools.js";

import { editTelegramMessage, sanitizeMarkdown } from "./utilities/sanitize.js";

// Initialize the model
// const model = new ChatOpenAI({
//   model: "meta-llama/llama-3.3-8b-instruct:free",
//   temperature: 0.8,
//   streaming: true,
//   configuration: {
//     baseURL: "https://openrouter.ai/api/v1",
//   },
// });

const model = new ChatOllama({
  model: "hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:latest", // Default value
  temperature: 0,
  maxRetries: 2,
  // other params...
});

// const model = new ChatGoogleGenerativeAI({
//   temperature: 0.7,
//   model: "gemini-2.0-flash",
// });

// Bind tools to the model
const mcpTools = await getMcpLangChainTools(); // <-- fetch remote tools
const tools = [adderTool, attOverallTool, attDetailedTool, ...mcpTools];
const modelWithTools = model.bindTools(tools);

const toolMap: { [key: string]: DynamicStructuredTool } = {};
tools.forEach((tool) => {
  toolMap[tool.name] = tool;
});

const systemMessage = new SystemMessage(
  `You are a helpful AI assistant with humor, 
  responding in a Telegram chat. Keep responses very concise, 
  like short chat messages, structured and engaging. 
  Use formatting , add wit, stay professional. 
  Include links when relevant. 
  Don't brag about unnecessary things too much.
  Use tools for the best of your ability.
  Always use the search tool to verify and get the latest information about current events, sports results, or any time-sensitive queries like tournament winners.
  Current date and time: ${new Date().toISOString()}`,
);

// Chat memory - keep last 5 messages (10 total including responses)
const chatHistory = new Map<number, BaseMessage[]>();

function updateChatHistory(newMessages: BaseMessage[], chatId: number) {
  let currentHistory = chatHistory.get(chatId) || [];
  currentHistory.push(...newMessages);

  if (currentHistory.length > 10) {
    currentHistory = currentHistory.slice(-10);
  }

  if (currentHistory.length > 0 && currentHistory[0] instanceof ToolMessage) {
    console.log("\n\n\ntriggered\n\n\n");
    currentHistory.shift();
  }
}

export async function processMessage(
  userInput: string,
  chatId: number,
  ctx: Context,
): Promise<void> {
  if (!chatHistory.has(chatId)) {
    chatHistory.set(chatId, []);
  }

  const message = await ctx.reply("🤖", {
    parse_mode: "Markdown",
  });

  const userMessage = new HumanMessage(userInput);
  updateChatHistory([userMessage], chatId);

  while (true) {
    const response = await modelWithTools.invoke([
      systemMessage,
      ...(chatHistory.get(chatId) || []),
    ]);

    updateChatHistory([response], chatId);

    if (response.tool_calls && response.tool_calls.length > 0) {
      if (
        response.content &&
        typeof response.content === "string" &&
        (response.content.trim() !== "" || response.content.trim() !== "\n")
      ) {
        await editTelegramMessage(
          ctx,
          message.message_id,
          sanitizeMarkdown(response.content),
        );
      }
      for (const toolCall of response.tool_calls) {
        await editTelegramMessage(
          ctx,
          message.message_id,
          sanitizeMarkdown(`\`${toolCall.name}\`` + " in progress..."),
        );
        const tool = toolMap[toolCall.name];
        const toolResponse = await tool.invoke(toolCall.args);
        const toolMessage = new ToolMessage({
          name: toolCall.name,
          tool_call_id: toolCall.id || "",
          content: toolResponse,
        });

        updateChatHistory([toolMessage], chatId);
        await editTelegramMessage(
          ctx,
          message.message_id,
          sanitizeMarkdown(`\`${toolCall.name}\` done.`),
        );
      }
    } else {
      if (response.content && typeof response.content === "string") {
        await editTelegramMessage(
          ctx,
          message.message_id,
          sanitizeMarkdown(response.content),
        );
      }
      break;
    }
  }
}
