import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  ToolMessage,
  BaseMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";

import * as dotenv from "dotenv";
dotenv.config();
// import { createInterface } from "readline";
import { adderTool, attOverallTool, attDetailedTool } from "./tools/tools.js";
import { getMcpLangChainTools } from "./tools/mcpTools/wrapper.js";
import { Context } from "telegraf";
import { sanitizeMarkdown } from "./utilities/sanitize.js";
import { DynamicStructuredTool } from "@langchain/core/tools.js";

// dotenv.config();

// Initialize the model
// const model = new ChatOpenAI({
//   model: "google/gemini-2.0-flash-exp:free",
//   temperature: 0.8,
//   streaming: true,
//   configuration: {
//     baseURL: "https://openrouter.ai/api/v1",
//   },
// });

const model = new ChatGoogleGenerativeAI({
  temperature: 0.7,
  model: "gemini-2.0-flash",
});

// Bind tools to the model
const mcpTools = await getMcpLangChainTools(); // <-- fetch remote tools
const tools = [adderTool, attOverallTool, attDetailedTool, ...mcpTools];
// Bind tools to the model using the same array
const modelWithTools = model.bindTools(tools);

const toolMap: { [key: string]: DynamicStructuredTool } = {};

tools.forEach((tool) => {
  toolMap[tool.name] = tool;
});

// System message that will always be included
const systemMessage = new SystemMessage(
  `You are a helpful AI assistant with humor, 
  responding in a Telegram chat. Keep responses very concise, 
  like short chat messages, structured and engaging. 
  Use formatting , add wit, stay professional. 
  Include links when relevant. 
  Don't brag about unnecessary things too much.
  you can rspond in another language but keep scipt to engish like (em chestunnav)
  Current date and time: ${new Date().toISOString()}`
);

// Chat memory - keep last 5 messages (10 total including responses)
let chatHistory: Map<number, BaseMessage[]>;

// Function to manage chat history (keep last 5 exchanges)
function updateChatHistory(newMessages: BaseMessage[], chatId: number) {
  let curruntHistory = chatHistory.get(chatId) || [];
  curruntHistory.push(...newMessages);

  // Keep only the last 10 messages (5 exchanges)
  if (curruntHistory.length > 10) {
    curruntHistory = curruntHistory.slice(-10);
  }

  // After slicing, check if the first message is a ToolMessage and remove it to maintain order
  if (curruntHistory.length > 0 && curruntHistory[0] instanceof ToolMessage) {
    console.log("\n\n\ntriggered\n\n\n");
    curruntHistory.shift();
  }
}

// Function to process user input and get AI response
export async function processMessage(
  userInput: string,
  chatId: number,
  ctx: Context
): Promise<void> {
  // Add user message to history

  if (!chatHistory) {
    chatHistory = new Map();
  }
  if (!chatHistory.get(chatId)) {
    chatHistory.set(chatId, []);
  }

  const message = await ctx.reply("🤖");

  const userMessage = new HumanMessage(userInput);
  // Always include system message at the beginning
  const currentMessages = [
    systemMessage,
    ...(chatHistory.get(chatId) ?? []),
    userMessage,
  ];

  let combinedText = "";
  // Get initial response from model
  const response = await modelWithTools.stream(currentMessages);

  const aiMessage = new AIMessage(combinedText);

  // Check if the model made tool calls

  for await (const chunk of response) {
    // console.log("Chunk received:", chunk);
    if (chunk.tool_calls && chunk.tool_calls.length > 0) {
      if (chunk.content) {
        const contentString =
          typeof chunk.content === "string" ? chunk.content : "";

        if (contentString) {
          combinedText += contentString;
        }
        aiMessage.content += contentString;
      }

      aiMessage.tool_calls = chunk.tool_calls;

      const toolMsg: ToolMessage = new ToolMessage({
        tool_call_id: "",
        content: "",
        name: "",
      });
      for (const toolCall of chunk.tool_calls) {
        const toolStatus = `\n${toolCall.name}  ...⚙️`;

        combinedText += toolStatus;
        await ctx.telegram.editMessageText(
          chatId,
          message.message_id,
          undefined,
          sanitizeMarkdown(combinedText),
          {
            parse_mode: "Markdown",
          }
        );

        const toolResult = await toolMap[toolCall.name].invoke(toolCall.args);

        toolMsg.name = toolCall.name;
        toolMsg.tool_call_id = toolCall.id || "";
        toolMsg.content = toolResult;

        combinedText = combinedText.replace(
          toolStatus,
          `\n${toolCall.name} ...✅️\n\n`
        );
        console.log(combinedText);

        await ctx.telegram.editMessageText(
          chatId,
          message.message_id,
          undefined,
          sanitizeMarkdown(combinedText),
          {
            parse_mode: "Markdown",
          }
        );
      }

      const finalResponce = await modelWithTools.stream([
        ...currentMessages,
        aiMessage,
        toolMsg,
      ]);

      const aiMessageFinal = new AIMessage("");
      for await (const chunk of finalResponce) {
        if (chunk.content) {
          const contentString =
            typeof chunk.content === "string" ?
              chunk.content
            : JSON.stringify(chunk.content);
          combinedText += contentString;

          aiMessageFinal.content += contentString;
          await ctx.telegram.editMessageText(
            chatId,
            message.message_id,
            undefined,
            sanitizeMarkdown(combinedText),
            {
              parse_mode: "Markdown",
            }
          );
        }
      }
      console.log([...currentMessages, aiMessage, toolMsg!, aiMessageFinal]);
      updateChatHistory(
        [userMessage, aiMessage, toolMsg!, aiMessageFinal],
        chatId
      );
    } else {
      const aiMessage = new AIMessage("");
      if (chunk.content) {
        const contentString =
          typeof chunk.content === "string" ?
            chunk.content
          : JSON.stringify(chunk.content);
        combinedText += contentString;

        aiMessage.content += contentString;
      }

      await ctx.telegram.editMessageText(
        chatId,
        message.message_id,
        undefined,
        sanitizeMarkdown(combinedText),
        {
          parse_mode: "Markdown",
        }
      );
      updateChatHistory([userMessage, aiMessage], chatId);
    }
  }
}
// // Create readline interface for chat
// const rl = createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// // Main chat loop
// console.log("🤖 AI Assistant ready! Type 'exit' to quit.");

// function startChat() {
//   rl.question("You: ", async (input: string) => {
//     if (input.toLowerCase() === "exit") {
//       console.log("👋 Goodbye!");
//       rl.close();
//       return;
//     }

//     try {
//       const response = await processMessage(input);
//       console.log(`🤖 AI: ${response}\n`);
//     } catch (error) {
//       console.log(
//         "❌ Sorry, there was an error processing your message. Please try again.\n"
//       );
//     }

//     startChat(); // Continue the chat loop
//   });
// }

// // Start the chat
// startChat();
