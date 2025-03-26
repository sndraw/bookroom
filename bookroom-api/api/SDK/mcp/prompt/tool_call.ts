import { Tool } from "@/SDK/mcp/tool/typings";


export const createPrompt = (tools: Tool[]) => {
  const toolDescriptions = tools.map((tool) => `${tool.name}: ${tool.description}.`).join("\n");
  return `
你是一个智能助手，可以根据用户的问题选择合适的工具来回答。
以下是可用工具的列表：
${toolDescriptions}
`
}