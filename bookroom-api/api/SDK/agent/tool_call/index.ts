import OpenAI from "openai";
import { createPrompt } from "./../prompt/tool_call";
import { ChatCompletionCreateParams, ChatCompletionTool } from "openai/resources/chat/completions";
import { Tool } from "./../tool/typings";
import { createAssistantMessage, createSystemMessage, createToolMessage, createUserMessage, MessageArray } from "./../message";
import Think from "./think";

class ToolCallApi {
    private readonly openai: any;
    private readonly platformId: string = "";
    private readonly think: Think;

    constructor(ops: any, think: Think) {
        const { apiKey, host, id } = ops;
        if (!id) throw new Error("缺少平台ID");

        if (id) {
            this.platformId = id;
        }
        this.think = think;
        this.think.log("初始化OpenAI客户端", host, "\n\n")
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
            this.think.log("开始调用模型：", model, "\n\n");
            const response = await this.openai.chat.completions.create(chatParams);
            this.think.log('调用模型成功！', "\n\n")
            return response;
        } catch (error: any) {
            this.think.log("模型调用时出错:", error, "\n\n");
            throw new Error(error?.message || "模型调用时出错！");
        }
    };

    // 调用工具调用的处理函数
    async handleToolCalls(toolCalls: any[], tools: any[]) {
        if (!toolCalls) return null;
        // 处理每个工具调用
        const toolCallsPromises = toolCalls.map(async (toolCall: any) => {
            const functionName = toolCall.function.name;
            const toolCallId = toolCall.id;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            const selectedTool = tools.find(tool => tool.name === functionName);
            if (selectedTool) {
                try {
                    this.think.log("执行工具中：", functionName, "\n\n");
                    const result = await selectedTool.execute(functionArgs);
                    this.think.log("执行工具完成：", functionName, "\n\n");
                    this.think.log('工具调用结果：', result, "\n\n");
                    return { name: functionName, content: result?.content, tool_call_id: toolCallId, isError: result?.isError }
                } catch (error: any) {
                    this.think.log(`执行工具 ${functionName} 时出错：`, error, "\n\n");
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
            content: ''
        };
        while (!countObj.finished) {
            countObj.step++;
            this.think.log('当前步骤：', countObj.step, "\n\n")
            const response = await this.handleChatCompletion(messages, {
                ...params,
                tools: tools
            });
            let toolCalls: any[] = [];
            let content = "";
            // 如果是流式输出
            if (params?.is_stream && (response?.itr || response?.iterator)) {
                for await (const chunk of response) {
                    if (chunk?.choices && chunk?.choices.length > 0) {
                        const message = chunk.choices[0]?.delta;
                        if (message?.tool_calls) {
                            toolCalls = [...toolCalls, ...message.tool_calls];
                        }
                        this.think.log(message?.content);
                        content += message?.content || '';
                    }
                }
                this.think.log("\n\n");
            } else {
                const message = response?.choices?.[0]?.message;
                toolCalls = message?.tool_calls;
                content = message?.content || '';
                this.think.log(message?.content, "\n\n");
            }
            if (toolCalls && toolCalls.length > 0) {
                // 创建一个新的消息，包含原始内容和工具调用
                messages.push(createAssistantMessage({
                    content: "",
                    tool_calls: [
                        ...toolCalls
                    ]
                }));
                const results = await this.handleToolCalls(toolCalls, tools);
                // 处理工具调用结果并添加到消息中
                results?.forEach(result => {
                    return messages.push(createToolMessage(result));
                });
            } else {
                this.think.log("</search>", "\n\n");
                this.think.log(content)
                countObj.finished = true;
            }
            countObj.content = content;
        }
        return countObj
    }

    // 问题对话
    async questionChat(params: any, options: any = {}) {
        // 参数解析
        const {
            prompt,
            query,
            userId
        } = params
        // 工具和响应解析
        const { tools = [] } = options;
        const messages: MessageArray = []
        this.think.log("<search>", "\n\n")
        try {
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
            this.think.log("————————————————————————————————————", "\n\n")
            this.think.log("Agent提示词：", "\n\n");
            this.think.log(formattedPrompt, "\n\n");
            this.think.log("————————————————————————————————————", "\n\n")
            this.think.log("用户问题：", "\n\n");
            this.think.log(query, "\n\n");
            // 循环工具调用
            const result: any = await this.loopToolCalls(params, messages, tools);
            // this.think.log("————————————————————————————————————")
            // this.think.log("Agent回复：")
            // this.think.log(result);
            // this.think.log(result?.content);
            if (!result?.content) {
                return {
                    content: "回复失败，请稍后再试！",
                    isError: true,
                }
            }
            // 将结果添加到messages数组中
            messages.push(createAssistantMessage({
                content: result.content,
            }))
            // 返回结果
            return {
                finished: true,
                content: result.content,
                isError: false
            }
        } catch (error: any) {
            this.think.log("</search>", "\n\n")
            const errorMsg = error?.message || "未知错误";
            this.think.log("处理问题时出错:", errorMsg, "\n\n");
            messages.push(createAssistantMessage({
                content: errorMsg,
            }));
            return {
                finished: true,
                content: errorMsg,
                isError: true
            };
        }
        // finally {
        //     this.think.log("————————————————————————————————————")
        //     this.think.log("最终消息列表：")
        //     this.think.log(messages);
        // }
    }
}
export default ToolCallApi;
