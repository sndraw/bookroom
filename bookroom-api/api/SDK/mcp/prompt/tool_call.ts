import { Tool } from "@/SDK/mcp/tool/typings";


export const createPrompt = (tools: Tool[], prompt?: string) => {
  const toolDescriptions = tools.map((tool) => `${tool.name}: ${tool.description}`).join("\n");
  let formattedPrompt = `你是一个智能助手，可以根据用户的指令和自己的理解，选择合适的工具帮你完成任务。\n\n` +
    `你有以下工具可供使用：\n` +
    `${toolDescriptions}\n`;
  if (prompt) {
    formattedPrompt += `\n\n${prompt}`;
  }
  return formattedPrompt;
}