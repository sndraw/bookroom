import { AGENT_API_MAP } from "@/common/agent";
import AgentAPI, { AgentApiChatType } from "../api";

interface AgentInput {
    query: any;
    stream?: boolean,
    workspace?: string,
    timeout?: number,
}

class AgentTool {
    private config: any;
    public name = "agent_tool";
    public version = "1.0";
    public description = "API based on Agent | 智能接口 | 可以通过API对话与智能模型进行交互";
    public parameters = {
        type: "object",
        properties: {
            query: { type: "any", description: "交互内容" },
            stream: { type: "boolean", description: "是否流式返回结果" },
            workspace: { type: "string", description: "图谱空间" },
            timeout: { type: "number", description: "超时时间，单位为毫秒" },
        },
        required: ["query"],
    };
    public returns = {
        type: "object",
        properties: {
            content: {
                type: "array",
                items: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
            },
            isError: { type: "boolean" }
        },
        required: ["content", "isError"]
    };

    constructor(config: any) {
        const { description } = config || {}
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config || {};
    }
    async execute(params: AgentInput): Promise<any> {
        const { query, stream, timeout, workspace } = params;
        const { host, apiKey, code, parameters = {},userId } = this.config;
        const queryParams: AgentApiChatType = {
            query: query,// 查询内容，必填项
            stream: stream,// 是否流式返回结果，调用知识图谱时需要指定为true
            workspace: workspace,// 工作空间，调用知识图谱时需要指定工作空间
            timeout: timeout || 30000,// 超时时间，单位为毫秒
            userId: userId // 用户ID，用于记录用户操作日志
        }
        if (parameters?.params instanceof Object) {
            Object.assign(queryParams, parameters.params);
        }
        let data: any = null;
        try {
            switch (code) {
                case AGENT_API_MAP.agent_api.value:
                    data = await new AgentAPI({
                        host: host,
                        apiKey: apiKey,
                        code: code,
                    }).chat(queryParams);
                    break;
                default:
                    data = {
                        code: 404,
                        message: "API暂不支持。",
                    }
            }
        } catch (error: any) {
            data = {
                isError: true,
                code: 500,
                message: `服务器内部错误：${error?.message || '未知错误'}`,
            }
        }
        if (data && typeof data === 'object' && !data?.isError) {
            return {
                content: [{ type: "text", text: `${JSON.stringify(data || {}, null, 2)}` }],
                isError: false,
            };
        }
        return {
            content: [
                { type: "text", text: `${data?.message || data?.content || '未知错误'}` },
            ],
            isError: true,
        };
    }
}
export default AgentTool;