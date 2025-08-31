# NbkristAgent 🤖

A powerful AI-powered Telegram bot built with TypeScript, LangChain, and Google Gemini, featuring tool integration and MCP (Model Context Protocol) support.

## 🚀 Features

- **Conversational AI**: Powered by Google Gemini 2.0 Flash for natural, engaging conversations
- **Tool Integration**: Built-in tools for attendance tracking and calculations
- **MCP Support**: Extensible architecture with Model Context Protocol for connecting to external tools
- **Chat History**: Maintains context with the last 5 message exchanges
- **Telegram Integration**: Seamless bot experience on Telegram with markdown formatting
- **Error Handling**: Robust error handling and graceful degradation

## 🛠️ Built-in Tools

### Attendance Tools

- **Overall Attendance**: Get attendance percentage for students
- **Detailed Attendance**: Retrieve comprehensive attendance information including subject-wise breakdown

### MCP Tools

The bot can be extended with external MCP servers:

- **PDF Generator**: Generate PDFs from markdown content
- **SearXNG Search**: Web search capabilities with privacy-focused SearXNG

## 📋 Prerequisites

- Node.js (ES2022+ support)
- pnpm package manager
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Google AI API Key (for Gemini model)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd NbkristAgent
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   GOOGLE_API_KEY=your_google_ai_api_key_here
   ```

4. **Configure MCP Servers** (Optional)
   Update the MCP server paths in `src/tools/mcpTools/mcpClient.ts`:
   ```typescript
   const MCP_SERVERS: McpServerConfig[] = [
     {
       name: "pdf-generator",
       command: "node",
       args: ["/path/to/your/pdf-generator-mcp-server/dist/index.js"],
     },
     {
       name: "searxng",
       command: "node",
       args: ["/path/to/your/searxng-mcp-server/dist/index.js"],
       env: {
         SEARXNG_URL: "http://your-searxng-instance-url",
       },
     },
   ];
   ```

## 🚀 Usage

1. **Start the bot**

   ```bash
   pnpm start
   ```

2. **Interact on Telegram**
   - Find your bot on Telegram
   - Send messages and the AI will respond
   - Use tools by mentioning relevant keywords (e.g., "attendance for roll number 123")

## 🏗️ Architecture

### Core Components

- **`src/agent.ts`**: Main AI agent with LangChain integration, tool binding, and conversation management
- **`src/bot.ts`**: Telegram bot implementation with message handling and markdown sanitization
- **`src/tools/tools.ts`**: Built-in tools for attendance and calculations
- **`src/tools/mcpTools/`**: MCP integration for external tool connectivity

### Key Features

- **Chat Memory**: Maintains last 10 messages (5 exchanges) for context
- **Tool Execution**: Automatic tool calling with loading indicators
- **Response Formatting**: Telegram-compatible markdown with proper sanitization
- **Multi-language Support**: Can respond in other languages while keeping script in English

## 🔧 Development

### Project Structure

```
NbkristAgent/
├── src/
│   ├── agent.ts          # Main AI agent logic
│   ├── bot.ts           # Telegram bot implementation
│   └── tools/
│       ├── tools.ts     # Built-in tools
│       └── mcpTools/    # MCP integration
│           ├── mcpClient.ts
│           └── wrapper.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Tools

1. **Built-in Tools**: Add to `src/tools/tools.ts`

   ```typescript
   export const yourTool = new DynamicStructuredTool({
     name: "your_tool_name",
     description: "Description of your tool",
     schema: z.object({
       param: z.string().describe("Parameter description"),
     }),
     func: async (input) => {
       // Your tool logic here
       return "Tool result";
     },
   });
   ```

2. **MCP Tools**: Configure in `src/tools/mcpTools/mcpClient.ts`

### Scripts

- `pnpm test`: Run tests (currently placeholder)
- `pnpm start`: Start the bot (add this to package.json scripts)

## 📦 Dependencies

### Core Dependencies

- **@langchain/core**: LangChain core functionality
- **@langchain/google-genai**: Google Gemini integration
- **@langchain/mcp-adapters**: MCP adapter for LangChain
- **@modelcontextprotocol/sdk**: MCP SDK
- **telegraf**: Telegram bot framework
- **zod**: Schema validation

### Development Dependencies

- **@types/node**: Node.js type definitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License

## 🙏 Acknowledgments

- Built with [LangChain](https://www.langchain.com/)
- Powered by [Google Gemini](https://ai.google.dev/)
- Telegram integration via [Telegraf](https://telegraf.js.org/)
- MCP support through [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Note**: This bot is designed for educational and demonstration purposes. Ensure compliance with Telegram's terms of service and API usage guidelines.
