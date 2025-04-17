import OpenAI from "openai";
import { createPrompt } from "./../prompt/tool_call";
import { ChatCompletionAudioParam, ChatCompletionCreateParams, ChatCompletionTool } from "openai/resources/chat/completions";
import { Tool } from "./../tool/typings";
import { createAssistantMessage, createSystemMessage, createToolMessage, createUserMessage, handleHistoryMessages, MessageArray } from "./../message";
import Think from "./think";
import { convertMessagesToVLModelInput } from "@/SDK/openai/convert";
import { formatAudioData, saveAudioToFile } from "@/utils/streamHelper";
class ToolCallApi {
    private readonly openai: OpenAI;
    private readonly think: Think;

    constructor(ops: any, think: Think) {
        const { apiKey, host, limitSeconds = 30 } = ops;
        this.think = think;
        this.think.log("初始化智能助手", "\n\n")
        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: host,
            timeout: Number(limitSeconds) * 1000,
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
                maxTokens = 4096,
                audioParams,
                userId
            } = params

            const modalities: ("text" | "audio")[] = ["text"];
            const audio: ChatCompletionAudioParam = { voice: "Chelsie", format: "wav" };
            if (audioParams?.output) {
                modalities.push("audio")
            }
            if (audioParams?.voice) {
                audio.voice = audioParams.voice;
            }
            if (audioParams?.format) {
                audio.format = audioParams.format;
            }

            const chatParams: ChatCompletionCreateParams = {
                model: model,
                messages: messages || [],
                stream: is_stream,
                temperature: temperature,
                top_p: top_p,
                n: 1,
                max_tokens: maxTokens,
                modalities: modalities,
                audio: audio,
                user: userId
            }
            if (tools && tools.length > 0) {
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
                chatParams.tool_choice = "auto"; // 让模型自动选择调用哪个工具
                chatParams.stream_options = is_stream ? { include_usage: true } : undefined;
                chatParams.tools = mTools; // 传递工具列表给模型
            }
            // 调用 OpenAI API 进行对话生成
            this.think.log("开始调用模型：", model, "\n\n");
            const response = await this.openai.chat.completions.create(chatParams);
            this.think.log("调用模型成功：", model, "\n\n")
            return response;
        } catch (error: any) {
            this.think.log("模型调用时出错：", error, "\n\n");
            throw new Error(error?.message || "模型调用时出错！");
        }
    };

    // 调用工具调用的处理函数
    async handleToolCalls(toolCalls: any[], tools: any[]) {
        if (!toolCalls) return null;
        // 处理每个工具调用
        const toolCallsPromises = toolCalls.map(async (toolCall: any) => {
            if (!toolCall?.id) return null;
            try {
                const functionName = toolCall.function.name;
                const toolCallId = toolCall.id;
                // 判定是否是JSON格式的参数
                let functionArgs = {}
                try {
                    functionArgs = JSON.parse(toolCall.function.arguments);
                } catch {
                    return { name: functionName, content: "工具参数格式错误！", tool_call_id: toolCallId, isError: true };
                }
                const selectedTool = tools.find(tool => tool.name === functionName);
                if (selectedTool) {
                    try {
                        this.think.log("执行工具中：", functionName, "\n\n");
                        const result = await selectedTool.execute(functionArgs);
                        this.think.log("执行工具完成：", functionName, "\n\n");
                        this.think.log('工具调用结果：', "\n\n");
                        this.think.log("```JSON\n\n", result?.content, "\n\n```", "\n\n");
                        return { name: functionName, content: result?.content, tool_call_id: toolCallId, isError: result?.isError }
                    } catch (error: any) {
                        this.think.log(`执行工具 ${functionName} 时出错：`, error, "\n\n");
                        return { name: functionName, content: `执行工具 ${functionName} 时出错`, tool_call_id: toolCallId, isError: true };
                    }
                }
                return { name: functionName, content: "未找到匹配的工具！", tool_call_id: toolCallId, isError: true };

            } catch (error: any) {
                this.think.log(`执行工具${toolCall?.function?.name}时出错：`, error?.message, "\n\n");
                return { name: toolCall?.function?.name || "未知工具", content: `执行工具时出错`, tool_call_id: toolCall?.id || null, isError: true };
            }
        });
        // 汇总结果并返回
        const results = await Promise.all(toolCallsPromises);
        return results;
    };
    // 兼容流式输出工具调用的指令
    async getStreamToolCallList(toolCalls: any[], messageToolCalls: any[]) {
        const toolCallList: any[] = [
            ...toolCalls
        ];
        messageToolCalls.forEach((item: any) => {
            // 如果id存在，则更新已有的工具列表中对应id的项，否则追加到末尾
            if (item?.id) {
                const toolCall = toolCallList.find(tool => tool.id === item.id);
                if (!toolCall) {
                    toolCallList.push(item);
                } else {
                    if (toolCall?.function) {
                        if (!toolCall?.function?.arguments) {
                            toolCall.function.arguments = '';
                        }
                        toolCall.function.arguments += item.function.arguments;
                    }
                }
                return;
            }
            // 如果item.index存在或者为0
            if ((item?.index || item?.index === 0) && item?.function?.arguments) {
                const toolCall = toolCallList.find(tool => tool.index === item.index);
                if (toolCall?.function) {
                    if (!toolCall?.function?.arguments) {
                        toolCall.function.arguments = '';
                    }
                    toolCall.function.arguments += item.function.arguments;
                }
                return;
            }
        })
        return toolCallList;
    }

    // 循环处理工具调用
    async loopToolCalls(params: any, messages: MessageArray, tools: Tool[]) {
        const { userId, is_stream, limitSteps = 5 } = params;
        const countObj = {
            finished: false,
            step: 0,
            content: '',
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
        };
        while (!countObj.finished) {
            if (countObj.step >= limitSteps) {
                countObj.finished = true;
                this.think.output("限制步骤：", limitSteps, " | ", "当前步骤：", countObj.step + 1, "\n\n");
                this.think.output('步骤超出限制，终止循环。', "\n\n");
                if (countObj?.content) {
                    this.think.output('当前内容：', "\n\n");
                    this.think.output("\`", countObj.content, "\`\n\n");
                }
                break;
            }
            countObj.step++;
            this.think.log('\-\-\-', "\n\n")
            this.think.log('当前步骤：', countObj.step, "\n\n")
            const response: any = await this.handleChatCompletion(messages, {
                ...params,
                tools: tools
            });
            let toolCalls: any[] = [];
            let content = "";
            let audioBuffer = "";
            // 如果是流式输出
            if (is_stream && (response?.itr || response?.iterator)) {
                for await (const chunk of response) {
                    if (chunk?.usage) {
                        const { completion_tokens, prompt_tokens, total_tokens } = chunk.usage;
                        countObj.prompt_tokens += prompt_tokens;
                        countObj.completion_tokens += completion_tokens;
                        countObj.total_tokens += total_tokens;
                    }
                    if (chunk?.choices && chunk?.choices.length > 0) {
                        const message = chunk.choices[0]?.delta;
                        if (message?.tool_calls) {
                            toolCalls = await this.getStreamToolCallList(toolCalls, message.tool_calls);
                            this.think.log(message?.content || '');
                        } else {
                            if (chunk.choices[0]?.finish_reason === 'tool_calls') {
                                this.think.log(message?.content || '');
                            } else {
                                if (chunk?.choices?.[0].delta?.audio) {
                                    const audioData = formatAudioData(chunk?.choices[0]?.delta?.audio);
                                    // 如果是对象
                                    if (audioData?.transcript) {
                                        content += audioData?.transcript;
                                        audioData?.transcript && this.think.output(audioData.transcript);
                                    }
                                    if (audioData?.data) {
                                        audioBuffer += audioData.data;
                                    }
                                }
                                message?.content && this.think.output(message?.content || '');
                            }
                        }
                        content += message?.content || '';
                    }
                }
            } else {
                if (response?.usage) {
                    const { completion_tokens, prompt_tokens, total_tokens } = response.usage;
                    countObj.prompt_tokens += prompt_tokens;
                    countObj.completion_tokens += completion_tokens;
                    countObj.total_tokens += total_tokens;
                }
                const message = response?.choices?.[0]?.message;
                toolCalls = message?.tool_calls;
                if (message?.tool_calls) {
                    this.think.log(message?.content || '');
                } else {
                    if (response.choices[0]?.finish_reason === 'tool_calls') {
                        this.think.log(message?.content || '');
                    } else {
                        message?.content && this.think.output(message?.content || '');
                    }
                }
                content = message?.content || '';
            }
            // 如果已经处理完所有工具调用，设置 finished 为 true
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
                    if (result) {
                        messages.push(createToolMessage(result));
                    }
                });
            } else {
                countObj.finished = true;
            }
            if (audioBuffer) {
                const formatedStr = await saveAudioToFile(audioBuffer, {
                    userId: userId
                });

                if (formatedStr) {
                    content += formatedStr;
                    this.think.output(formatedStr)
                }
            }
            countObj.content = content;
            // 终止循环
            if (countObj.finished) {
                break;
            }
        }
        return countObj
    }


    // 问题对话
    async questionChat(params: any, options: any = {}) {
        // 参数解析
        const {
            prompt,
            query,
            isMemory,
            isConvertFile,
            userId
        } = params
        // 工具和响应解析
        const { tools = [] } = options;
        // 输出结果
        let result: any = null;
        // 定义消息列表
        let messages: MessageArray = []
        // 记录开始时间
        const startTime = new Date().getTime();

        try {
            // 创建格式化的提示信息
            const formattedPrompt = createPrompt({
                tools,
                prompt,
                errorLimit: 5,
            });
            // 添加系统消息到messages数组
            messages.push(createSystemMessage({
                content: [
                    {
                        type: "text",
                        text: formattedPrompt,
                    }
                ]
            }));
            const { historyMessages, ...chatParams } = params || {}
            // 如果是记忆模式，添加历史消息到messages数组
            if (isMemory && historyMessages?.length > 0) {
                const newMessages = handleHistoryMessages(historyMessages, { query });
                messages.push(...newMessages);
            }
            // 添加用户消息到messages数组
            messages.push(createUserMessage({
                ...query
            }));

            // 定义新的消息列表
            messages = await convertMessagesToVLModelInput({
                messages,
                userId,
                isConvertFile,
                noSearch: true,
                noThink: true,
                noUsage: true
            });
            this.think.log("\-\-\-", "\n\n")
            this.think.log("Agent提示词：", "\n\n");
            this.think.log(formattedPrompt, "\n\n");
            this.think.log("\-\-\-", "\n\n")
            this.think.log("用户问题：", "\n\n");
            this.think.log("```JSON\n\n", query, "\n\n", "```\n\n");

            // 循环工具调用
            result = await this.loopToolCalls(chatParams, messages, tools);
            // this.think.log("\-\-\-")
            // this.think.log("Agent回复：", "\n\n")
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
            const errorMsg = error?.message || "未知错误";
            this.think.output("处理问题时出错：", errorMsg, "\n\n");
            messages.push(createAssistantMessage({
                content: errorMsg,
            }));
            return {
                finished: true,
                content: errorMsg,
                isError: true
            };
        }
        finally {
            const endTime = new Date().getTime();
            const usage = {
                step: result?.step || "-",
                startTime,
                endTime,
                prompt_tokens: result?.prompt_tokens || "-",
                completion_tokens: result?.completion_tokens || "-",
                total_tokens: result?.total_tokens || "-",
            };
            this.think.usage(usage);
            // logger.info(`ToolCallApi: ${JSON.stringify(this.think.getHistory())}`);
            // this.think.log("最终消息列表：")
            // this.think.log(messages);
        }
    }
}
export default ToolCallApi;
