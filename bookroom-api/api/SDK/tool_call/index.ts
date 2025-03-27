import OpenAI from "openai";
import { createPrompt } from "../mcp/prompt/tool_call";
import { ChatCompletionTool } from "openai/resources/chat/completions";
import { Tool } from "../mcp/tool/typings";

class ToolCallApi {
    private readonly openai: any;
    private readonly platformId: string = "";

    constructor(ops: any) {
        const { apiKey, host, id } = ops;
        if (!id) throw new Error("缺少平台ID");

        if (id) {
            this.platformId = id;
        }
        console.log("初始化OpenAI客户端", host)
        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: host,
            timeout: 30000,
            maxRetries: 2
        });
    }

    async questionChat(params: any, tools: Tool[] = []) {
        try {
            const {
                model,
                prompt,
                query,
                is_stream,
                temperature = 0.7,
                top_p = 0.8,
                max_tokens = 4096,
                userId
            } = params
            // 将tools注册到 OpenAI 客户端
            const mTools: ChatCompletionTool[] = tools.map((tool) => {
                return {
                    name: tool.name,
                    type: 'function',
                    function: {
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.parameters,
                        returns: tool.returns,
                    },
                }
            });
            const formattedPrompt = createPrompt(tools,prompt);
            console.log("Agent提示词：",formattedPrompt);
            const messages = [
                {
                    role: 'system',
                    content: [
                        {
                            type: "text",
                            text: createPrompt(tools,prompt),
                        }
                    ]
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: query,
                        }
                    ],
                },
            ];
            const getResponse = async (messages: any[], is_stream: boolean = false) => {
                try {
                    const response = await this.openai.chat.completions.create({
                        model: model,
                        messages: messages,
                        tools: mTools, // 注册工具
                        tool_choice: "auto", // 让模型自动选择调用哪个工具
                        stream: is_stream,
                        stream_options: is_stream ? { include_usage: true } : undefined,
                        temperature: temperature,
                        top_p: top_p,
                        n: 1,
                        max_tokens: max_tokens,
                        modalities: ["text"],
                    });
                    return response;
                } catch (error: any) {
                    console.error("模型调用时出错:", error);
                    throw new Error(error?.message || "模型调用时出错！");
                }
            };


            const handleToolCalls = async (message: any, messages: any[], tools: any[]) => {
                if (!message?.tool_calls) return;
                const newMessages = [
                    ...messages,
                ]
                const toolCallsPromises = message.tool_calls.map(async (toolCall: any) => {
                    const functionName = toolCall.function.name;
                    const toolCallId = toolCall.id;
                    const functionArgs = JSON.parse(toolCall.function.arguments);
                    const selectedTool = tools.find(tool => tool.name === functionName);
                    if (selectedTool) {
                        try {
                            console.log("执行工具:", functionName);
                            const result = await selectedTool.execute(functionArgs);
                            return { content: result?.content, isError: result?.isError, tool_call_id: toolCallId }
                        } catch (error: any) {
                            console.error(`执行工具 ${functionName} 时出错:`, error);
                            return { content: `执行工具 ${functionName} 时出错`, isError: true, tool_call_id: toolCallId };
                        }
                    } else {
                        return { content: "未找到匹配的工具！", isError: true, tool_call_id: toolCallId };
                    }
                });

                const results = await Promise.all(toolCallsPromises);
                results.forEach(result => {
                    newMessages.push({ role: "tool", content: result?.content, tool_call_id: result?.tool_call_id });
                });
                return newMessages
            };


            // 第一步：发送用户问题和工具定义
            const response = await getResponse(messages);
            const message = response?.choices?.[0]?.message;
            // 第二步：处理模型返回的消息
            if (message?.tool_calls) {
                const newMessages = await handleToolCalls(message, messages, tools);
                const finalResponse = await getResponse(newMessages || [], is_stream);
                if (is_stream) {
                    return finalResponse;
                }
                return finalResponse?.choices?.[0]?.message?.content;
            }
            // 如果没有工具调用，直接返回模型的回复
            return { content: message?.content, isError: false };
            // 
        } catch (error: any) {
            console.error("处理工具调用时出错:", error);
            return { content: error?.message || "处理工具调用时出错！", isError: true };
        }
    }
}
export default ToolCallApi;