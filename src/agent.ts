import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ChatOpenAI } from "@langchain/openai";
import {
  HumanMessage,
  ToolMessage,
  BaseMessage,
  SystemMessage,
} from "@langchain/core/messages";

import * as dotenv from "dotenv";
dotenv.config();
// import { createInterface } from "readline";
import { adderTool, attOverallTool, attDetailedTool } from "./tools/tools.js";
import { getMcpLangChainTools } from "./tools/mcpTools/wrapper.js";

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
  chatId: number
): Promise<string> {
  // Add user message to history

  if (!chatHistory) {
    chatHistory = new Map();
  }
  if (!chatHistory.get(chatId)) {
    chatHistory.set(chatId, []);
  }

  const userMessage = new HumanMessage(userInput);
  // Always include system message at the beginning
  const currentMessages = [
    systemMessage,
    ...(chatHistory.get(chatId) ?? []),
    userMessage,
  ];

  // Get initial response from model
  const response = await modelWithTools.invoke(currentMessages);

  // Check if the model made tool calls

  if (response.tool_calls && response.tool_calls.length > 0) {
    let toolResponce: string = "";
    const toolMessages = [];

    // Create tool map from the array
    const toolMap = Object.fromEntries(tools.map((tool) => [tool.name, tool]));

    // Execute each tool call
    for (const toolCall of response.tool_calls) {
      const tool = toolMap[toolCall.name];
      if (!tool) {
        throw new Error(`Tool ${toolCall.name} not found`);
      }

      toolResponce += `\`${toolCall.name}...\` ⚙\n`;
      // Show loading state
      process.stdout.write(`🔄 ${toolCall.name}...`);

      const toolResult = await tool.invoke(toolCall.args);

      // Clear the line and show completion
      process.stdout.write(`\r✅ ${toolCall.name} completed\n\n`);

      toolMessages.push(
        new ToolMessage({
          tool_call_id: toolCall.id || "",
          content: toolResult,
          name: toolCall.name, // Add the tool name here
        })
      );
    }

    // Get final response with tool results
    const finalMessages = [...currentMessages, response, ...toolMessages];

    // console.log("finalMessages:\n", finalMessages, "\n");

    const finalResponse = await modelWithTools.invoke(finalMessages);

    // Update chat history with user message, tool response, tool messages, and final response
    updateChatHistory(
      [userMessage, response, ...toolMessages, finalResponse],
      chatId
    );

    return toolResponce + "\n" + (finalResponse.content as string);
  } else {
    // No tool calls, just update history with user message and response
    updateChatHistory([userMessage, response], chatId);
    // console.log(response);
    // console.log("\n\n\n\nChat History:", chatHistory);

    return response.content as string;
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
