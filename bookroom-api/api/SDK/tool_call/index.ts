import OpenAI from "openai";
import { createPrompt } from "../mcp/prompt/tool_call";
import { ChatCompletionCreateParams, ChatCompletionTool } from "openai/resources/chat/completions";
import { Tool } from "../mcp/tool/typings";
import { createAssistantMessage, createSystemMessage, createToolMessage, createUserMessage, MessageArray } from "../mcp/message";

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
    // 获取模型对话响应
    async handleChatCompletion(messages: any[], params: any) {
        try {
            const {
                model,
                tools,
                is_stream,
                temperature = 0.7,
                top_p = 0.8,
                max_tokens = 4096,
            } = params
            const chatParams: ChatCompletionCreateParams = {
                model: model,
                messages: messages,
                tool_choice: "auto", // 让模型自动选择调用哪个工具
                stream: is_stream,
                stream_options: is_stream ? { include_usage: true } : undefined,
                temperature: temperature,
                top_p: top_p,
                n: 1,
                max_tokens: max_tokens,
                modalities: ["text"],
            }
            if (tools) {
                // 将tools注册到 OpenAI 客户端
                const mTools: ChatCompletionTool[] = tools.map((tool: Tool) => {
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
                chatParams.tools = mTools;
            }
            // 调用 OpenAI API 进行对话生成
            console.log("开始调用模型：", model);
            const response = await this.openai.chat.completions.create(chatParams);
            console.log('调用模型成功！')
            return response;
        } catch (error: any) {
            console.error("模型调用时出错:", error);
            throw new Error(error?.message || "模型调用时出错！");
        }
    };

    // 调用工具调用的处理函数
    async handleToolCalls(message: any, messages: any[], tools: any[]) {
        if (!message?.tool_calls) return null;
        // 处理每个工具调用
        const toolCallsPromises = message.tool_calls.map(async (toolCall: any) => {
            const functionName = toolCall.function.name;
            const toolCallId = toolCall.id;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            const selectedTool = tools.find(tool => tool.name === functionName);
            if (selectedTool) {
                try {
                    console.log("执行工具中:", functionName);
                    const result = await selectedTool.execute(functionArgs);
                    console.log("执行工具完成:", functionName);
                    return { name: functionName, content: result?.content, tool_call_id: toolCallId, isError: result?.isError }
                } catch (error: any) {
                    console.error(`执行工具 ${functionName} 时出错:`, error);
                    return { name: functionName, content: `执行工具 ${functionName} 时出错`, tool_call_id: toolCallId, isError: true };
                }
            }
            return { name: functionName, content: "未找到匹配的工具！", tool_call_id: toolCallId, isError: true };
        });
        // 汇总结果并返回
        const results = await Promise.all(toolCallsPromises);
        return results;
    };
    // 循环处理工具调用
    async loopToolCalls(params: any, messages: MessageArray, tools: Tool[]) {
        const countObj = {
            finished: false,
            step: 0,
            message: null
        };
        while (!countObj.finished) {
            countObj.step++;
            console.log('当前步骤:', countObj.step)
            const response = await this.handleChatCompletion(messages, {
                ...params,
                tools: tools,
                is_stream: false
            });
            const message = response?.choices?.[0]?.message;
            if (message?.tool_calls) {
                // 创建一个新的消息，包含原始内容和工具调用
                messages.push(createAssistantMessage({
                    content: message?.content,
                    tool_calls: [
                        ...message?.tool_calls
                    ]
                }));
                const results = await this.handleToolCalls(message, messages, tools);
                // 处理工具调用结果并添加到消息中
                results?.forEach(result => {
                    messages.push(createToolMessage(result));
                });
            } else {
                countObj.finished = true;
            }
            countObj.message = message;
        }
        return countObj
    }

    // 问题对话
    async questionChat(params: any, tools: Tool[] = []) {
        const messages: MessageArray = [];
        try {
            const {
                prompt,
                query,
                is_stream,
                userId
            } = params

            const formattedPrompt = createPrompt(tools, prompt);

            // 添加系统消息到messages数组
            messages.push(createSystemMessage({
                content: [
                    {
                        type: "text",
                        text: formattedPrompt,
                    }
                ]
            }));
            // 添加用户消息到messages数组
            messages.push(createUserMessage({
                content: [
                    {
                        type: "text",
                        text: query,
                    }
                ]
            }));
            console.log("————————————————————————————————————")
            console.log("Agent提示词：");
            console.log(formattedPrompt);
            console.log("————————————————————————————————————")
            console.log("用户问题：");
            console.log(query);
            // 循环工具调用
            const result: any = await this.loopToolCalls(params, messages, tools);
            console.log("————————————————————————————————————")
            console.log("Agent回复：")
            console.log(result);

            if (!result?.message?.content) {
                return {
                    content: "回复失败，请稍后再试！",
                    isError: true,
                }
            }
            // 将结果添加到messages数组中
            messages.push(createAssistantMessage({
                content: result.message.content,
            }))
            // 返回结果
            return {
                content: result?.message?.content,
                isError: false,
            }
        } catch (error: any) {
            console.error("处理问题时出错:", error);
            messages.push(createAssistantMessage({
                content: error?.message || "理问题时出错！",
            }));
            return { content: error?.message || "处理问题时出错！", isError: true };
        }
        // finally {
        //     console.log("————————————————————————————————————")
        //     console.log("最终消息列表：")
        //     console.log(messages);
        // }
    }
}
export default ToolCallApi;