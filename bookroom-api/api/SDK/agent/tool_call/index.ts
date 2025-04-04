import OpenAI from "openai";
import { createPrompt } from "./../prompt/tool_call";
import { ChatCompletionCreateParams, ChatCompletionTool } from "openai/resources/chat/completions";
import { Tool } from "./../tool/typings";
import { createAssistantMessage, createSystemMessage, createToolMessage, createUserMessage, MessageArray } from "./../message";
import Think from "./think";
import { convertMessagesToVLModelInput } from "@/SDK/openai/convert";

class ToolCallApi {
    private readonly openai: any;
    private readonly think: Think;

    constructor(ops: any, think: Think) {
        const { apiKey, host } = ops;
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
                userId
            } = params
            // 定义新的消息列表
            const newMessageList = await convertMessagesToVLModelInput({
                messages,
                userId
            });

            const chatParams: ChatCompletionCreateParams = {
                model: model,
                messages: newMessageList || [],
                tool_choice: "auto", // 让模型自动选择调用哪个工具
                stream: is_stream,
                stream_options: is_stream ? { include_usage: true } : undefined,
                temperature: temperature,
                top_p: top_p,
                n: 1,
                max_tokens: max_tokens,
                modalities: ["text", "audio"],
                audio: { "voice": "Chelsie", "format": "wav" },
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
        console.log(`[ToolCallApi] 开始处理工具调用，数量: ${toolCalls?.length || 0}`);
        if (!toolCalls || toolCalls.length === 0) {
            console.log(`[ToolCallApi] 没有工具调用需要处理`);
            return null;
        }
        
        // 处理每个工具调用
        const toolCallsPromises = toolCalls.map(async (toolCall: any) => {
            if (!toolCall?.id) {
                console.log(`[ToolCallApi] 无效的工具调用，缺少ID`);
                return null;
            }
            
            try {
                const functionName = toolCall.function.name;
                const toolCallId = toolCall.id;
                console.log(`[ToolCallApi] 处理工具调用: ${functionName}, ID: ${toolCallId}`);
                
                // 判定是否是JSON格式的参数
                let functionArgs = {}
                try {
                    functionArgs = JSON.parse(toolCall.function.arguments);
                    console.log(`[ToolCallApi] 工具参数解析成功:`, functionArgs);
                } catch (error) {
                    console.error(`[ToolCallApi] 工具参数解析失败:`, error);
                    return { 
                        name: functionName, 
                        content: [{ type: "text", text: "工具参数格式错误！" }], 
                        tool_call_id: toolCallId, 
                        isError: true 
                    };
                }
                
                // 查找匹配的工具
                const selectedTool = tools.find(tool => tool.name === functionName);
                if (selectedTool) {
                    try {
                        this.think.log("执行工具中：", functionName, "\n\n");
                        console.log(`[ToolCallApi] 开始执行工具: ${functionName}`);
                        console.log(`[ToolCallApi] 工具参数详情: ${JSON.stringify(functionArgs, null, 2)}`);
                        const result = await selectedTool.execute(functionArgs);
                        this.think.log("执行工具完成：", functionName, "\n\n");
                        console.log(`[ToolCallApi] 工具执行完成: ${functionName}, 结果类型: ${typeof result}, 是否为null或undefined: ${result == null}`);
                        
                        if (result) {
                            console.log(`[ToolCallApi] 结果属性: ${Object.keys(result).join(', ')}`);
                            console.log(`[ToolCallApi] 结果内容类型: ${typeof result.content}, 是数组: ${Array.isArray(result.content)}`);
                            
                            if (Array.isArray(result.content)) {
                                console.log(`[ToolCallApi] 内容数组长度: ${result.content.length}`);
                                if (result.content.length > 0) {
                                    console.log(`[ToolCallApi] 第一个内容项类型: ${typeof result.content[0]}`);
                                    if (typeof result.content[0] === 'object') {
                                        console.log(`[ToolCallApi] 第一个内容项属性: ${Object.keys(result.content[0]).join(', ')}`);
                                    }
                                }
                            }
                        }
                        
                        // 确保结果有内容
                        if (!result || !result.content) {
                            console.error(`[ToolCallApi] 工具${functionName}返回空结果，完整结果: ${JSON.stringify(result)}`);
                            this.think.log(`工具${functionName}返回结果为空，尝试使用默认内容。`, "\n\n");
                            // 提供默认响应而不是空结果
                            return { 
                                name: functionName, 
                                content: [{ type: "text", text: `工具${functionName}未返回有效结果，请尝试其他查询或工具。` }], 
                                tool_call_id: toolCallId, 
                                isError: true 
                            };
                        }
                        
                        this.think.log('工具调用结果：', result, "\n\n");
                        return { 
                            name: functionName, 
                            content: result?.content, 
                            tool_call_id: toolCallId, 
                            isError: result?.isError 
                        }
                    } catch (error: any) {
                        console.error(`[ToolCallApi] 执行工具 ${functionName} 出错:`, error);
                        console.error(`[ToolCallApi] 错误堆栈:`, error.stack);
                        this.think.log(`执行工具 ${functionName} 时出错：`, error, "\n\n");
                        return { 
                            name: functionName, 
                            content: [{ type: "text", text: `执行工具 ${functionName} 时出错: ${error.message || '未知错误'}` }], 
                            tool_call_id: toolCallId, 
                            isError: true 
                        };
                    }
                } else {
                    console.log(`[ToolCallApi] 未找到匹配的工具: ${functionName}`);
                    return { 
                        name: functionName, 
                        content: [{ type: "text", text: `未找到匹配的工具: ${functionName}` }], 
                        tool_call_id: toolCallId, 
                        isError: true 
                    };
                }
            } catch (error: any) {
                console.error(`[ToolCallApi] 处理工具调用出错:`, error);
                console.error(`[ToolCallApi] 错误堆栈:`, error.stack);
                this.think.log(`执行工具${toolCall?.function?.name || "未知"}时出错：`, error?.message, "\n\n");
                return { 
                    name: toolCall?.function?.name || "未知工具", 
                    content: [{ type: "text", text: `执行工具时出错: ${error.message || '未知错误'}` }], 
                    tool_call_id: toolCall?.id || null, 
                    isError: true 
                };
            }
        });
        
        // 汇总结果并返回
        const results = await Promise.all(toolCallsPromises);
        console.log(`[ToolCallApi] 完成处理所有工具调用，结果数量: ${results.length}, 成功数量: ${results.filter(r => r && !r.isError).length}`);
        console.log(`[ToolCallApi] 结果详情: ${JSON.stringify(results)}`);
        return results.filter(r => r !== null);
    }
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

    /**
     * 工具调用循环
     * @param params 参数
     * @param messages 对话历史
     * @param tools 工具列表
     * @returns 对话结果
     */
    private async loopToolCalls(params: any, messages: MessageArray, tools: Tool[] = []) {
        const is_stream = params?.is_stream;
        const countObj = {
            step: 0,
            content: "",
            finished: false,
        }
        while (countObj.step < 5 && !countObj.finished) {
            countObj.step += 1;
            console.log(`\n[ToolCallApi] 开始第 ${countObj.step} 轮工具调用`);
            
            // 查看当前工具列表
            console.log(`[ToolCallApi] 可用工具列表: ${tools.map(t => t.name).join(', ')}`);
            
            // 调用LLM
            console.log(`[ToolCallApi] 调用LLM模型: ${params.model}`);
            
            const response = await this.handleChatCompletion(messages, {
                ...params,
                tools: tools
            });
            
            // 非流式输出
            if (!is_stream) {
                console.log(`[ToolCallApi] 非流式响应：`, response ? '有响应' : '无响应');
                
                // 检查响应有效性
                if (!response?.choices || !response?.choices.length) {
                    console.error(`[ToolCallApi] 模型响应无效，没有choices数组`);
                    this.think.output("模型响应异常，请稍后再试。");
                    countObj.finished = true;
                    countObj.content = "回复失败，请稍后再试！";
                    break;
                }
                
                const messageInfo = response.choices[0]?.message;
                console.log(`[ToolCallApi] 模型响应message类型: ${typeof messageInfo}`);
                
                const content = messageInfo?.content || "";
                
                // 如果达到最大步数，直接返回内容
                if (countObj.step >= 5) {
                    console.log(`[ToolCallApi] 达到最大步数(5)`);
                    
                    // 特殊处理第5轮没有内容的情况 - 保留此核心兜底逻辑
                    if (!content || content.trim() === '') {
                        console.log(`[ToolCallApi] 第5轮内容为空，尝试从历史消息提取内容`);
                        
                        // 尝试从消息历史中提取最后一个工具调用结果
                        const lastToolMessage = messages
                            .filter(m => m.role === 'tool')
                            .pop();
                            
                        if (lastToolMessage && lastToolMessage.content) {
                            console.log(`[ToolCallApi] 使用最后一个工具调用的内容`);
                            countObj.content = typeof lastToolMessage.content === 'string' 
                                ? lastToolMessage.content 
                                : JSON.stringify(lastToolMessage.content);
                        } else {
                            console.log(`[ToolCallApi] 无法从历史消息中提取内容，使用默认内容`);
                            countObj.content = "很抱歉，无法获取更多信息。请尝试修改您的问题，或使用其他关键词搜索。";
                        }
                    } else {
                        countObj.content = content;
                    }
                    
                    countObj.finished = true;
                    this.think.output(countObj.content);
                    break;
                }
                
                // 如果没有工具调用，直接返回内容
                if (!messageInfo?.tool_calls || messageInfo?.tool_calls.length === 0) {
                    console.log(`[ToolCallApi] 模型直接回复，未调用工具`);
                    
                    // 处理空内容情况 - 保留此核心逻辑
                    if (!content || content.trim() === '') {
                        console.log(`[ToolCallApi] 模型回复内容为空，使用默认内容`);
                        countObj.content = "很抱歉，模型未能生成有效回复。请尝试修改您的问题，或使用其他关键词。";
                    } else {
                        countObj.content = content;
                    }
                    
                    countObj.finished = true;
                    this.think.output(countObj.content);
                    break;
                }
                
                // 记录工具调用信息
                console.log(`[ToolCallApi] 模型生成了工具调用，数量: ${messageInfo.tool_calls.length}`);
                messageInfo.tool_calls.forEach((call: any, idx: number) => {
                    try {
                        const args = JSON.parse(call.function?.arguments || '{}');
                        console.log(`[ToolCallApi] 工具调用[${idx}]: ${call.function?.name}, 参数: ${JSON.stringify(args)}`);
                    } catch (e) {
                        console.error(`[ToolCallApi] 解析工具调用参数出错:`, e);
                    }
                });
                
                // 开始进行工具调用
                console.log(`[ToolCallApi] 开始执行工具调用处理`);
                const toolCallResults = await this.handleToolCalls(messageInfo?.tool_calls, tools);
                console.log(`[ToolCallApi] 工具调用处理完成，结果数量: ${toolCallResults ? toolCallResults.length : 0}`);
                
                // 工具调用结果有效性检查
                if (!toolCallResults || toolCallResults.length === 0) {
                    console.error(`[ToolCallApi] 工具调用结果为空，可能原因: 执行失败或结果被过滤`);
                    this.think.output("工具调用失败，请稍后再试。");
                    countObj.finished = true;
                    countObj.content = "很抱歉，工具调用未返回结果。请稍后再试或修改搜索关键词。";
                    break;
                }
                
                // 检查每个工具调用结果的有效性
                console.log(`[ToolCallApi] 检查工具调用结果有效性`);
                const hasValidResults = toolCallResults.every((result, idx) => {
                    const isValid = result && result.content && 
                        (Array.isArray(result.content) ? result.content.length > 0 : result.content);
                    if (!isValid) {
                        console.error(`[ToolCallApi] 发现无效的工具调用结果[${idx}]`);
                    }
                    return isValid;
                });
                
                if (!hasValidResults) {
                    console.error(`[ToolCallApi] 存在无效的工具调用结果，可能导致内容为空`);
                    this.think.output("获取搜索结果失败，请稍后再试或修改搜索关键词。");
                    // 尝试直接将有效结果作为内容返回，避免空内容
                    const validResults = toolCallResults
                        .filter(r => r && r.content)
                        .map(r => {
                            if (Array.isArray(r.content) && r.content[0]?.text) {
                                return r.content[0].text;
                            } else if (typeof r.content === 'string') {
                                return r.content;
                            } else {
                                return String(r.content);
                            }
                        })
                        .join("\n\n");
                    
                    if (validResults) {
                        console.log(`[ToolCallApi] 合并有效结果作为内容返回`);
                        countObj.content = validResults;
                        this.think.output(validResults);
                    } else {
                        console.log(`[ToolCallApi] 没有有效结果可用，返回默认错误消息`);
                        countObj.content = "未能获取有效的搜索结果，请尝试使用不同的关键词，或稍后再试。";
                    }
                    countObj.finished = true;
                    break;
                }
                
                // 将工具调用的结果添加到消息列表
                const toolCallMessages = toolCallResults.map((result: any) => {
                    // 检查并格式化content
                    let contentText = "";
                    if (Array.isArray(result.content) && result.content.length > 0) {
                        if (typeof result.content[0] === 'object' && result.content[0].text) {
                            contentText = result.content[0].text;
                        } else {
                            contentText = String(result.content[0]);
                        }
                    } else if (result.content) {
                        contentText = String(result.content);
                    }
                    
                    return createToolMessage({
                        content: contentText,
                        name: result.name,
                        tool_call_id: result.tool_call_id
                    });
                });
                
                if (toolCallMessages.length > 0) {
                    console.log(`[ToolCallApi] 添加工具调用消息到历史`);
                    messages.push(createAssistantMessage({
                        tool_calls: messageInfo?.tool_calls
                    }));
                    messages.push(...toolCallMessages);
                } else {
                    console.error(`[ToolCallApi] 工具调用消息数量为0，可能导致对话中断`);
                }
            }
        }
        
        // 保留此核心兜底逻辑
        if (!countObj.content) {
            console.error(`[ToolCallApi] 警告: 返回内容为空! 使用默认回复`);
            countObj.content = "很抱歉，我无法获取相关信息。请尝试修改问题，或使用其他关键词搜索。";
        }
        
        return {
            content: countObj.content
        };
    }

    // 问题对话
    async questionChat(params: any, options: any = {}) {
        console.log("[ToolCallApi] 开始问答聊天流程");
        
        // 详细记录工具配置
        if (options.tools && options.tools.length > 0) {
            console.log(`[ToolCallApi] 工具详情: ${options.tools.map((t: any) => t.name).join(', ')}`);
        }
        
        // 参数解析
        const {
            prompt,
            query,
            historyMessages,
            isMemory,
            userId
        } = params
        // 工具和响应解析
        const { tools = [] } = options;
        console.log(`[ToolCallApi] 使用工具数量: ${tools.length}`);
        
        const messages: MessageArray = []
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
            // 如果是记忆模式，添加历史消息到messages数组
            if (isMemory && historyMessages) {
                console.log(`[ToolCallApi] 添加历史消息: ${historyMessages.length} 条`);
                messages.push(...historyMessages);
            }
            // 添加用户消息到messages数组
            messages.push(createUserMessage({
                ...query
            }));
            this.think.log("————————————————————————————————————", "\n\n")
            this.think.log("Agent提示词：", "\n\n");
            this.think.log(formattedPrompt, "\n\n");
            this.think.log("————————————————————————————————————", "\n\n")
            this.think.log("用户问题：", "\n\n");
            this.think.log(query, "\n\n");
            // 循环工具调用
            console.log(`[ToolCallApi] 开始工具调用循环流程`);
            const result: any = await this.loopToolCalls(params, messages, tools);
            console.log(`[ToolCallApi] 工具调用循环完成, 内容:`, result?.content ? '有内容' : '无内容');
            
            // 检查结果内容 - 保留此核心兜底逻辑
            if (!result?.content) {
                console.error(`[ToolCallApi] 错误: 结果内容为空`);
                // 直接输出错误信息到think，让用户看到
                const friendlyMessage = "对不起，我没有找到足够的相关信息。可能是因为：\n1. 搜索服务暂时无法访问\n2. 没有找到足够新鲜的相关内容\n\n您可以尝试：\n- 使用不同的关键词\n- 精简询问\n- 询问其他问题";
                this.think.output(friendlyMessage);
                return {
                    content: friendlyMessage,
                    isError: false,
                }
            } else if (result.content.includes("我没有找到") || result.content.includes("没有搜索到") || result.content.includes("无法获取")) {
                // 如果内容中包含表示未找到信息的关键词，也返回友好提示
                const enhancedMessage = result.content + "\n\n您可以尝试：\n- 使用不同的关键词\n- 精简询问\n- 询问其他问题";
                this.think.output(enhancedMessage);
                return {
                    content: enhancedMessage,
                    isError: false,
                }
            }
            
            // 将结果添加到messages数组中
            messages.push(createAssistantMessage({
                content: result.content,
            }))
            
            console.log(`[ToolCallApi] 回复成功，返回结果`);
            // 返回结果
            return {
                finished: true,
                content: result.content,
                isError: false
            }
        } catch (error: any) {
            const errorMsg = error?.message || "未知错误";
            console.error(`[ToolCallApi] 处理问题出错:`, errorMsg);
            this.think.output("处理问题时出错:", errorMsg, "\n\n");
            messages.push(createAssistantMessage({
                content: errorMsg,
            }));
            return {
                finished: true,
                content: errorMsg,
                isError: true
            };
        }
    }
}
export default ToolCallApi;

