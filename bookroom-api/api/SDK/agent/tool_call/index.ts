import OpenAI from "openai";
import { createPrompt } from "./../prompt/tool_call";
import { ChatCompletionCreateParams, ChatCompletionTool } from "openai/resources/chat/completions";
import { Tool } from "./../tool/typings";
import { createAssistantMessage, createSystemMessage, createToolMessage, createUserMessage, MessageArray } from "./../message";
import Think from "./think";
import { convertMessagesToVLModelInput } from "@/SDK/openai/convert";
import { formatAudioData } from "@/utils/streamHelper";

class ToolCallApi {
    private readonly openai: any;
    private readonly think: Think;
    private readonly ENGINE_REGEX = /["']engine["']\s*:\s*["']([^"']*)["']/;
    private readonly QUERY_REGEX = /["']query["']\s*:\s*["']([^"']*)["']/;

    constructor(ops: any, think: Think) {
        const { apiKey, host, limitSeconds = 30 } = ops;
        this.think = think;
        this.think.log("初始化OpenAI客户端", host, "\n\n")
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
                userId
            } = params
            const chatParams: ChatCompletionCreateParams = {
                model: model,
                messages: messages || [],
                stream: is_stream,
                temperature: temperature,
                top_p: top_p,
                n: 1,
                max_tokens: maxTokens,
                modalities: ["text", "audio"],
                audio: { "voice": "Chelsie", "format": "wav" },
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
                chatParams.tool_choice="auto"; // 让模型自动选择调用哪个工具
                chatParams.stream_options = is_stream ? { include_usage: true } : undefined;
                chatParams.tools = mTools; // 传递工具列表给模型
            }
            // 调用 OpenAI API 进行对话生成
            this.think.log("开始调用模型：", model, "\n\n");
            const response = await this.openai.chat.completions.create(chatParams);
            this.think.log('调用模型成功！', "\n\n")
            return response;
        } catch (error: any) {
            // **** 增强错误日志 ****
            console.error("[ToolCallApi] handleChatCompletion 捕获到错误:", error);
            // 尝试记录更详细的错误信息 (例如 AxiosError 的 response)
            if (error.response) {
                console.error("[ToolCallApi] 错误响应状态:", error.response.status);
                console.error("[ToolCallApi] 错误响应数据:", error.response.data);
            } else {
                 console.error("[ToolCallApi] 错误对象无 response 属性:", error.message);
            }
            // **** 日志结束 ****
            this.think.log("模型调用时出错：", error.message || error, "\n\n"); // 使用 error.message
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
                
                // 记录原始工具调用参数
                const logPreview = toolCall.function.arguments && toolCall.function.arguments.length > 50 
                    ? `${toolCall.function.arguments.substring(0, 47)}...` 
                    : toolCall.function.arguments;
                console.log(`[ToolCallApi] 工具调用原始参数: >>> ${logPreview} <<<`);
                console.log(`[ToolCallApi] 工具调用参数类型: ${typeof toolCall.function.arguments}`);
                
                // 为time_tool特殊处理
                if (functionName === 'time_tool' && (!toolCall.function.arguments || toolCall.function.arguments.trim() === '')) {
                    console.log(`[ToolCallApi] 为time_tool设置空参数对象`);
                    toolCall.function.arguments = '{}';
                }
                
                // 判定是否是JSON格式的参数
                let functionArgs = {}
                try {
                    functionArgs = JSON.parse(toolCall.function.arguments || '{}');
                    console.log(`[ToolCallApi] 工具参数解析成功:`, functionArgs);
                } catch (error) {
                    console.error(`[ToolCallApi] 工具参数解析失败:`, error);
                    
                    // 针对time_tool的特殊兼容处理
                    if (functionName === 'time_tool') {
                        console.log(`[ToolCallApi] time_tool使用空参数对象`);
                        functionArgs = {};
                    } else {
                        console.error(`[ToolCallApi] 解析失败的参数内容:`, toolCall.function.arguments);
                        return { 
                            name: functionName, 
                            content: [{ type: "text", text: "工具参数格式错误！" }], 
                            tool_call_id: toolCallId, 
                            isError: true 
                        };
                    }
                }
                
                // 查找匹配的工具
                const selectedTool = tools.find(tool => tool.name === functionName);
                if (selectedTool) {
                    try {
                        // 工具开始日志（也放入 think 标签内）
                        this.think.log(`\n*开始执行工具: ${functionName}*\n`);
                        console.log(`[ToolCallApi] 开始执行工具: ${functionName}`);
                        console.log(`[ToolCallApi] 工具参数详情: ${JSON.stringify(functionArgs, null, 2)}`);
                        const result = await selectedTool.execute(functionArgs);
                        // 工具结束日志，并闭合 <think> 标签
                        this.think.log(`\n*工具 ${functionName} 执行完成*\n</think>\n`);
                        console.log(`[ToolCallApi] 工具执行完成: ${functionName}, 结果类型: ${typeof result}, 是否为 null 或 undefined: ${result == null}`);
                        
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
        
        // 增加日志，帮助调试
        console.log(`[ToolCallApi] 处理流式工具调用，当前列表长度: ${toolCallList.length}, 新增数量: ${messageToolCalls.length}`);
        if (messageToolCalls.length > 0) {
            console.log(`[ToolCallApi] 新增工具调用样例: ${JSON.stringify(messageToolCalls[0])}`);
        }
        
        // 记录相同ID的完整参数，用于收集流式输出
        const paramChunks: Record<string, string[]> = {};
        
        // 收集所有工具ID
        const allIds = new Set<string>();
        // 记录当前正在处理的工具ID
        let currentToolId = '';
        
        // 首先收集所有工具ID
        for (const call of toolCallList) {
            if (call?.id) {
                allIds.add(call.id);
            }
        }
        
        for (const item of messageToolCalls) {
            if (item?.id) {
                allIds.add(item.id);
                currentToolId = item.id;
            }
        }
        
        // 如果工具ID列表非空，使用第一个ID作为默认ID
        if (allIds.size > 0) {
            currentToolId = currentToolId || Array.from(allIds)[0];
        }
        
        // 确保参数收集数组存在
        if (currentToolId && !paramChunks[currentToolId]) {
            paramChunks[currentToolId] = [];
        }
        
        // 处理新消息
        messageToolCalls.forEach((item: any) => {
            // 如果id存在，则更新已有的工具列表中对应id的项，否则追加到末尾
            if (item?.id) {
                const toolCall = toolCallList.find(tool => tool.id === item.id);
                if (!toolCall) {
                    console.log(`[ToolCallApi] 添加新工具调用: ${item.id}`);
                    // 初始化参数收集数组
                    if (!paramChunks[item.id]) {
                        paramChunks[item.id] = [];
                    }
                    
                    if (item.function?.arguments) {
                        paramChunks[item.id].push(item.function.arguments);
                    }
                    toolCallList.push(item);
                } else {
                    if (toolCall?.function) {
                        // 收集参数片段
                        if (!paramChunks[item.id]) {
                            paramChunks[item.id] = [];
                        }
                        if (item.function?.arguments) {
                            paramChunks[item.id].push(item.function.arguments);
                        }
                        
                        if (!toolCall?.function?.arguments) {
                            toolCall.function.arguments = '';
                        }
                        // 记录参数合并情况
                        const oldLength = toolCall.function.arguments.length;
                        toolCall.function.arguments += item.function.arguments || '';
                        console.log(`[ToolCallApi] 合并工具参数: ID=${item.id}, 旧长度=${oldLength}, 新增=${(item.function.arguments || '').length}, 合并后=${toolCall.function.arguments.length}`);
                    }
                }
                // 更新当前工具ID
                currentToolId = item.id;
                return;
            }
            
            // 关键修改：没有ID的片段也应该关联到当前工具ID
            if (item?.function?.arguments && currentToolId) {
                // 关联到当前工具ID
                console.log(`[ToolCallApi] 关联无ID参数片段到工具: ${currentToolId}`);
                
                // 添加到参数收集数组
                if (!paramChunks[currentToolId]) {
                    paramChunks[currentToolId] = [];
                }
                paramChunks[currentToolId].push(item.function.arguments);
                
                // 同时更新工具调用参数
                const toolCall = toolCallList.find(tool => tool.id === currentToolId);
                if (toolCall?.function) {
                    if (!toolCall.function.arguments) {
                        toolCall.function.arguments = '';
                    }
                    const oldLength = toolCall.function.arguments.length;
                    toolCall.function.arguments += item.function.arguments;
                    console.log(`[ToolCallApi] 合并无ID参数片段: targetID=${currentToolId}, 旧长度=${oldLength}, 新增=${item.function.arguments.length}, 合并后=${toolCall.function.arguments.length}`);
                }
                return;
            }
            
            // 处理按index的情况 (保持原逻辑)
            if ((item?.index || item?.index === 0) && item?.function?.arguments) {
                const toolCall = toolCallList.find(tool => tool.index === item.index);
                if (toolCall?.function) {
                    if (!toolCall?.function?.arguments) {
                        toolCall.function.arguments = '';
                    }
                    const oldLength = toolCall.function.arguments.length;
                    toolCall.function.arguments += item.function.arguments;
                    console.log(`[ToolCallApi] 合并工具参数(按index): index=${item.index}, 旧长度=${oldLength}, 新增=${item.function.arguments.length}, 合并后=${toolCall.function.arguments.length}`);
                }
            }
        });
        
        // 返回前尝试检查参数完整性，并适时修复
        for (const tool of toolCallList) {
            if (tool?.function?.arguments) {
                // 检查JSON是否完整
                if (!this.checkJsonCompleteness(tool.function.arguments)) {
                    const chunks = paramChunks[tool.id] || [];
                    console.log(`[ToolCallApi] JSON不完整，已收集${chunks.length}个数据块`);
                    
                    if (chunks.length > 0) {
                        // 尝试重建完整参数
                        console.log(`[ToolCallApi] 尝试重建完整参数，块数=${chunks.length}`);
                        const combinedArgs = chunks.join('');
                        // 限制日志输出长度，避免输出过长的字符串
                        const logPreview = combinedArgs.length > 50 
                            ? `${combinedArgs.substring(0, 47)}...`
                            : combinedArgs;
                        console.log(`[ToolCallApi] 所有块合并后: ${logPreview}`);
                        
                        // 执行修复
                        tool.function.arguments = combinedArgs;
                        if (!this.checkJsonCompleteness(combinedArgs)) {
                            console.log(`[ToolCallApi] 合并后仍不完整，尝试修复`);
                            this.ensureCompleteArguments(tool);
                        }
                    } else {
                        console.log(`[ToolCallApi] 无可用数据块，尝试直接修复`);
                        this.ensureCompleteArguments(tool);
                    }
                }
            }
        }
        
        return toolCallList;
    }

    // 新增：检查JSON字符串是否完整
    private checkJsonCompleteness(jsonStr: string) {
        try {
            JSON.parse(jsonStr);
            console.log(`[ToolCallApi] JSON参数完整性检查通过，长度=${jsonStr.length}`);
            return true;
        } catch (e) {
            console.log(`[ToolCallApi] JSON参数不完整，长度=${jsonStr.length}, 内容="${jsonStr.substring(0, 20)}..."`);
            return false;
        }
    }

    // 新增：确保工具调用参数完整
    private ensureCompleteArguments(toolCall: any) {
        if (!toolCall?.function?.arguments) {
            // 如果参数为空，根据工具类型设置默认值
            console.log(`[ToolCallApi] 工具调用参数为空，设置默认值`);
            if (toolCall.function.name === 'time_tool') {
                toolCall.function.arguments = '{}';
            } else if (toolCall.function.name === 'search_tool') {
                toolCall.function.arguments = '{"engine": "Tavily", "query": "最新上映电影"}';
            } else {
                toolCall.function.arguments = '{}';
            }
            return;
        }
        
        const args = toolCall.function.arguments;
        // 如果能成功解析JSON就返回
        try {
            JSON.parse(args);
            console.log(`[ToolCallApi] 参数已完整，无需修复`);
            return;
        } catch (e) {
            // 参数不完整，检查是否可以补全
            console.log(`[ToolCallApi] 尝试修复不完整的工具参数: ${args}`);
            
            // 根据工具类型选择不同的修复策略
            if (toolCall.function.name === 'time_tool') {
                // time_tool通常不需要特定参数
                console.log(`[ToolCallApi] 修复time_tool参数为空对象`);
                toolCall.function.arguments = '{}';
            } else if (toolCall.function.name === 'search_tool') {
                // 尝试提取现有的参数
                let engine = '';
                let query = '';
                
                // 使用预编译的正则表达式提取参数
                const engineMatch = this.ENGINE_REGEX.exec(args);
                if (engineMatch && engineMatch[1]) {
                    engine = engineMatch[1];
                    console.log(`[ToolCallApi] 从参数中提取到engine: ${engine}`);
                }
                
                // 使用预编译的正则表达式提取参数
                const queryMatch = this.QUERY_REGEX.exec(args);
                if (queryMatch && queryMatch[1]) {
                    query = queryMatch[1];
                    console.log(`[ToolCallApi] 从参数中提取到query: ${query}`);
                }
                
                // 优先使用提取的值，否则使用默认值
                engine = engine || 'Tavily';
                query = query || '最新上映电影';
                
                // 重建一个完整的JSON对象
                const fixedArgs = `{"engine": "${engine}", "query": "${query}"}`;
                toolCall.function.arguments = fixedArgs;
                
                console.log(`[ToolCallApi] 重建的完整参数: ${fixedArgs}`);
            } else {
                // 其他工具的通用修复逻辑
                console.log(`[ToolCallApi] 处理未知工具类型 ${toolCall.function.name} 的参数`);
                
                // 如果参数为空或仅包含无效内容，使用空对象
                if (!args || args.trim() === '' || args.trim() === '{}') {
                    toolCall.function.arguments = '{}';
                    console.log(`[ToolCallApi] 设置空参数对象 {}`);
                    return;
                }
                
                // 如果参数以{开头并以}结尾，但中间内容无效，尝试修复
                if (args.trim().startsWith('{') && args.trim().endsWith('}')) {
                    try {
                        // 尝试提取键值对并重建JSON
                        const cleanedArgs = args.replace(/(\w+)\s*[:=]\s*(['"]?)([^,"'{}]*)(['"]?)/g, '"$1":"$3"');
                        const jsonAttempt = `{${cleanedArgs.substring(1, cleanedArgs.length - 1)}}`;
                        JSON.parse(jsonAttempt);
                        toolCall.function.arguments = jsonAttempt;
                        console.log(`[ToolCallApi] 修复JSON成功: ${jsonAttempt}`);
                        return;
                    } catch (parseError) {
                        // 修复失败，使用空对象
                        console.log(`[ToolCallApi] JSON修复失败，使用空对象`);
                        toolCall.function.arguments = '{}';
                    }
                } else {
                    // 不是JSON格式，使用空对象
                    toolCall.function.arguments = '{}';
                    console.log(`[ToolCallApi] 无法识别的参数格式，使用空对象 {}`);
                }
            }
            
            // 验证修复后的参数
            try {
                JSON.parse(toolCall.function.arguments);
                console.log(`[ToolCallApi] 参数修复成功，解析通过`);
            } catch (err) {
                console.log(`[ToolCallApi] 参数修复失败，回退到空对象`);
                // 最后的补救措施：使用空对象
                toolCall.function.arguments = '{}';
            }
        }
    }

    // 循环处理工具调用
    async loopToolCalls(params: any, messages: MessageArray, tools: Tool[]) {
        const { is_stream, limitSteps = 5 } = params;
        const countObj = {
            step: 0,
            content: '',
            finished: false
        };
        
        while (!countObj.finished) {
            if (countObj.step >= limitSteps) {
                countObj.finished = true;
                this.think.output('步骤超出限制，终止循环。', "\n\n");
                this.think.output("当前步骤：", countObj.step, "\n\n");
                
                break;
            }
            countObj.step++;
            // 使用 Markdown 格式化步骤日志，并用 <think> 包裹，确保 --- 前后有空行
            this.think.log(`\n\n---\n\n<think>\n**步骤 ${countObj.step}**\n`); 
            const response = await this.handleChatCompletion(messages, {
                ...params,
                tools: tools
            });
            let toolCalls: any[] = [];
            let content = "";

            // 只保留简化版的模型响应日志
            if (response?.choices && response.choices.length > 0 && response.choices[0]?.message?.tool_calls) {
                console.log(`[ToolCallApi] 工具调用数量: ${response.choices[0].message.tool_calls.length}`);
            }

            // 如果是流式输出
            if (is_stream && (response?.itr || response?.iterator)) {
                let accumulatedContent = ""; // 新增：用于累积流式内容
                let receivedToolCalls = false; // 新增：标记是否收到工具调用

                for await (const chunk of response) {
                    if (chunk?.choices && chunk.choices.length > 0) {
                        const message = chunk.choices[0]?.delta;
                        if (message?.tool_calls) {
                            toolCalls = await this.getStreamToolCallList(toolCalls, message.tool_calls);
                            this.think.log(message?.content || '');
                            receivedToolCalls = true; // 标记收到了工具调用
                            // 如果工具调用和内容混合，也累积内容
                            if (message.content) {
                                accumulatedContent += message.content;
                                // 内容仍在 think.output 中分块输出
                            }
                        } else {
                            if (chunk.choices[0]?.finish_reason === 'tool_calls') {
                                this.think.log(message?.content || '');
                             } else {
                                 if (chunk?.choices?.[0].delta?.audio) {
                                     const audioData = formatAudioData(chunk?.choices[0]?.delta?.audio);
                                     audioData && this.think.output(audioData);
                                 }
                                 // 累积内容
                                 if (message?.content) {
                                     accumulatedContent += message.content;
                                     // 内容仍在 think.output 中分块输出
                                     this.think.output(message.content); 
                                 }
                             }
                         }
                     }
                 }

                // Minimal Change: If no tool calls received after stream, finalize and return
                if (!receivedToolCalls) {
                    const finalDirectAnswer = accumulatedContent.trim();
                    this.think.finalAnswer(finalDirectAnswer);
                    return { finalAnswer: finalDirectAnswer }; // Return early
                }
                // Continue processing if tool calls were received
             } else {
                 // 如果没有工具调用，直接返回内容
                 if (!toolCalls || toolCalls.length === 0) {
                     if (!content || content.trim() === '') {
                         // **** 修改点：使用 finalAnswer 并直接返回 ****
                         const errorMessage = "很抱歉，模型未能生成有效回复。请尝试修改您的问题，或使用其他关键词。";
                         this.think.finalAnswer(errorMessage); // 使用 finalAnswer 输出错误
                         return { finalAnswer: errorMessage }; // 直接返回错误信息
                     } else {
                         // **** 修改点：使用 finalAnswer 并直接返回 ****
                         // LLM 提供了直接答案，将其视为最终答案
                         this.think.finalAnswer(content); // 使用 finalAnswer 输出
                         return { finalAnswer: content }; // 直接返回最终答案，跳过后续总结
                     }
                 }
             }
            
            // 如果有工具调用，则处理工具调用 (这部分逻辑保持不变)
            if (toolCalls && toolCalls.length > 0) {
                messages.push(createAssistantMessage({
                    content: "",
                    tool_calls: [
                        ...toolCalls
                    ]
                }));
                const results = await this.handleToolCalls(toolCalls, tools);
                
                // 处理工具调用结果有效性
                if (!results || results.length === 0) {
                    console.error(`[ToolCallApi] 工具调用结果为空，可能原因: 执行失败或结果被过滤`);
                    this.think.output("工具调用失败，请稍后再试。");
                    countObj.finished = true;
                    countObj.content = "很抱歉，工具调用未返回结果。请稍后再试或修改搜索关键词。";
                    break;
                }
                
                // 检查每个工具调用结果的有效性
                console.log(`[ToolCallApi] 检查工具调用结果有效性`);
                const hasValidResults = results.every((result, idx) => {
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
                    const validResults = results
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
                
                // 处理工具调用结果并添加到消息中
                results?.forEach(result => {
                    if (result) {
                        messages.push(createToolMessage(result));
                    }
                });
            }
        }
        
        // --- 开始阶段二逻辑 ---
        console.log(`[ToolCallApi] Agent 循环结束，开始生成最终答案`);
        let finalAnswer = "未能生成最终答案。"; // 默认值以防出错

        try {
            // 1. 准备最终总结的提示
            const finalPrompt = `请总结以上对话内容。`;

            // 2. 构造发送给 LLM 的消息列表 (系统提示 + 历史)
            const finalMessages = [
                createSystemMessage({ content: finalPrompt }), 
                ...messages 
            ];

            // 3. 调用 LLM 进行最终总结 (不使用工具)
            console.log(`[ToolCallApi] 调用 LLM进行最终总结 (流式)...`);
            const finalResponseStream = await this.handleChatCompletion(finalMessages, {
                 model: params.model || 'gpt-3.5-turbo', 
                temperature: 0.5,
                maxTokens: params.maxTokens || 1024,
                is_stream: true, 
                tools: []
            });

            // 4. 提取最终答案 (处理流式响应)
            let accumulatedFinalAnswer = "";
            if (finalResponseStream?.itr || finalResponseStream?.iterator) { 
                for await (const chunk of finalResponseStream) {
                    if (chunk?.choices && chunk.choices.length > 0) {
                        const contentPart = chunk.choices[0]?.delta?.content;
                        if (contentPart) {
                            accumulatedFinalAnswer += contentPart;
                        }
                    }
                }
                if (accumulatedFinalAnswer.trim()) {
                    finalAnswer = accumulatedFinalAnswer.trim();
                    console.log(`[ToolCallApi] LLM 最终总结生成成功 (来自流)`);
                } else {
                    console.error(`[ToolCallApi] LLM 最终总结流未生成有效内容。`);
                    finalAnswer = "抱歉，在为您总结最终答案时遇到了问题。模型流未返回有效内容。";
                }
            } else {
                 console.error(`[ToolCallApi] LLM 最终总结调用未返回有效的流对象。响应:`, JSON.stringify(finalResponseStream));
                 finalAnswer = "抱歉，在为您总结最终答案时遇到了问题。响应格式不正确。";
            }

        } catch (error: any) {
            console.error(`[ToolCallApi] 生成最终答案时出错:`, error);
            finalAnswer = `抱歉，处理您的请求时发生错误: ${error.message}`;
        }

        // 5. 使用 think.finalAnswer 输出
        console.log(`[ToolCallApi] 使用 think.finalAnswer 输出最终结果`);
        this.think.finalAnswer(finalAnswer);

        // 6. 修改返回值 (返回包含最终答案的对象)
        return { finalAnswer: finalAnswer };
        // --- 结束阶段二逻辑 ---
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
        
        // 定义消息列表
        let messages: MessageArray = []
        try {
            const formattedPrompt = createPrompt({ tools, prompt });
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
            // 定义新的消息列表
            messages = await convertMessagesToVLModelInput({
                messages,
                userId
            });
             this.think.log("————————————————————————————————————", "\n\n")
             // 将初始日志包裹在 <think> 标签内
             this.think.log(`<think>\nAgent提示词：\n\n${formattedPrompt}\n`);
             this.think.log("————————————————————————————————————", "\n\n")
             this.think.log("用户问题：", "\n\n");
             this.think.log("```JSON\n\n", query, "\n\n", "```\n</think>\n"); // 结束 think 标签
             // 循环工具调用
             console.log(`[ToolCallApi] 开始工具调用循环流程`);
             const result = await this.loopToolCalls(params, messages, tools);
             console.log(`[ToolCallApi] 工具调用循环完成, finalAnswer:`, result?.finalAnswer ? '有内容' : '无内容');
            
            // 修改点 5: 调整成功返回 (现在由 think.finalAnswer 处理，这里无需返回内容)
            console.log(`[ToolCallApi] questionChat 成功完成`);
            return { isError: false }; // 成功时仅表示无错误

        } catch (e: any) {
            const errorMsg = e?.response?.data?.message || e?.message || e;
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

