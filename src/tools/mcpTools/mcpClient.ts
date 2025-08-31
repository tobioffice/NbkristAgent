import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";

interface McpServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

const MCP_SERVERS: McpServerConfig[] = [
  {
    name: "pdf-generator",
    command: "node",
    args: ["/home/murali/Documents/MCP Servers/MDXPDF-MCP/dist/index.js"],
  },
  {
    name: "searxng",
    command: "node",
    args: ["/home/murali/Documents/MCP Servers/mcp-searxng/dist/index.js"],
    env: {
      SEARXNG_URL: "http://140.245.238.66",
    },
  },
];

const allTools: any[] = [];

export async function initMcp(): Promise<{
  tools: any[];
}> {
  if (allTools.length > 0) {
    return { tools: allTools };
  }

  allTools.length = 0; // Clear the existing array

  for (const serverConfig of MCP_SERVERS) {
    try {
      const transport = new StdioClientTransport({
        command: serverConfig.command,
        args: serverConfig.args,
        env: serverConfig.env,
      });

      const client = new Client(
        {
          name: `local-wrapper-${serverConfig.name}`,
          version: "0.1.0",
        },
        {
          capabilities: {},
        }
      );

      await client.connect(transport);

      // List available tools for this server
      const toolsResponse = await client.request(
        { method: "tools/list" },
        ListToolsResultSchema
      );

      // Prefix tool names with server name to avoid conflicts
      const prefixedTools = toolsResponse.tools.map((tool) => ({
        ...tool,
        name: `${serverConfig.name}_${tool.name}`,
        originalName: tool.name,
        serverName: serverConfig.name,
        client: client,
        transport: transport,
      }));

      allTools.push(...prefixedTools);

      console.log(`Connected to MCP server: ${serverConfig.name}`);
    } catch (error) {
      console.error(
        `Failed to connect to MCP server ${serverConfig.name}:`,
        error
      );
    }
  }

  return { tools: allTools };
}

export async function shutdownMcp() {
  try {
    for (const tool of allTools) {
      try {
        await tool.transport.close();
        console.log(`Closed connection to ${tool.serverName}`);
      } catch (error) {
        console.error(`Error closing connection to ${tool.serverName}:`, error);
      }
    }
  } catch (error) {
    console.error("Error during MCP shutdown:", error);
  }
}

// const { tools } = await initMcp();

// console.log("Available MCP Tools:");
// tools.forEach((tool) => {
//   console.log(
//     `[${tool.serverName}] ${tool.originalName}: ${
//       tool.description || tool.client
//     }`
//   );
//   if (tool.inputSchema?.properties) {
//     console.log("  Parameters:", Object.keys(tool.inputSchema.properties));
//   }
// });
