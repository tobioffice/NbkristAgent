import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { initMcp } from "./mcpClient.ts";

// Convert a JSON Schema (simple) to a zod schema (minimal fallback)
function jsonSchemaToZod(schema: any): any {
  if (!schema || schema.type !== "object" || !schema.properties) {
    return z.any();
  }
  const shape: Record<string, any> = {};

  for (const [k, v] of Object.entries<any>(schema.properties)) {
    let zt: any;
    switch (v.type) {
      case "string":
        zt = z.string();
        break;
      case "number":
      case "integer":
        zt = z.number();
        break;
      case "boolean":
        zt = z.boolean();
        break;
      case "array":
        zt = z.array(z.any());
        break;
      case "object":
        zt = z.any();
        break;
      default:
        zt = z.any();
    }
    if (v.description) zt = zt.describe(v.description);
    shape[k] = zt;
  }

  return z.object(shape);
}

export async function getMcpLangChainTools() {
  const { tools } = await initMcp();

  return tools.map((tool) => {
    const schema = jsonSchemaToZod(tool.inputSchema);

    return new DynamicStructuredTool({
      name: tool.name,
      description: tool.description || `MCP tool ${tool.name}`,
      schema,
      func: async (args: { [x: string]: unknown }) => {
        if (!tool.client) {
          throw new Error(`No client found for tool: ${tool.name}`);
        }

        const call = await tool.client.callTool({
          name: tool.originalName,
          arguments: args,
        });

        // call.content is an array of content parts; flatten text/plain
        const text = (Array.isArray(call.content) ? call.content : [])
          .map((part: any) => {
            if ("text" in part && part.text) return part.text;
            return JSON.stringify(part);
          })
          .join("\n");
        return text;
      },
    });
  });
}
