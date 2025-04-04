import { Tool } from "./../tool/typings";

export interface PromptOptions {
  tools: Tool[];
  prompt?: string;
  errorLimit?: number;
}

export const createPrompt = (options: PromptOptions) => {
  const { tools, prompt = "", errorLimit = 5 } = options;
  const toolDescriptions = tools.map((tool) => `${tool.name}: ${tool.description}`).join("\n");
  let formattedPrompt = `你是一个智能助手，可以根据用户的指令和自己的理解，选择合适的工具帮你完成任务。\n\n` +
    `你有以下工具可供使用：\n` +
    `${toolDescriptions}\n\n` + 
    `如果你不确定如何处理某个任务，可以询问用户寻求帮助。\n\n` +
    `如果某个工具连续返回错误信息或者无法完成任务，最高限制为${errorLimit}次尝试，超过次数后不再尝试该工具并提示用户该工具可能存在问题。\n`
  if (prompt) {
    formattedPrompt += `\n\n${prompt}\n`;
  }
  return formattedPrompt;
}