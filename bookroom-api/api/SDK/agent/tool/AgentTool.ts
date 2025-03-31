import { AGENT_API_MAP } from "@/common/agent";
import AgentAPI from "../api";

interface AgentInput {
    query: string;
}

class AgentTool {
    private config: any;
    public name = "agent_tool";
    public version = "1.0";
    public description = "API based on Agent | 智能接口 | 可以通过API对话与智能模型进行交互";
    public parameters = {
        type: "object",
        properties: {
            query: { type: "string" },
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
        const { description } = config;
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config;
    }
    async execute(params: AgentInput): Promise<any> {
        const { query } = params;
        const { host, apiKey, code, parameters = {} } = this.config;
        const queryParams = {
            query: query
        }
        if (parameters?.params && typeof parameters.params === 'object') {
            Object.assign(queryParams, parameters.params);
        }
        let data: any = null;
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
        if (data && typeof data === 'object' && !data?.isError) {
            return {
                content: [{ type: "text", text: `${JSON.stringify(data || {})}` }],
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