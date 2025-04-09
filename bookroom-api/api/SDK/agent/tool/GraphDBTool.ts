import { AI_GRAPH_MODE_ENUM } from "@/common/ai";
import LightragAPI from "@/SDK/lightrag";

interface SearchInput {
    query: string;
    timeout?: number;
}

class GraphDBTool {
    private config: any;
    private workspace?: string; // 工作空间路径
    public name = "graph_db_tool";
    public version = "1.0";
    public description = "Search knowledge graph | 查询知识图谱";
    public parameters = {
        type: "object",
        properties: {
            query: { type: "string", description: "搜索内容" },
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

    constructor(config: any, workspace?: string) {
        const { name, description } = config || {}
        if (name) {
            this.name = `${this.name}_${name}`;
        }
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config || {};
        this.workspace = workspace; // 设置工作空间路径
    }
    async execute(params: SearchInput): Promise<any> {
        const { query, timeout } = params;
        const queryParams = {
            query: query, // 查询内容
            stream: false, // 是否流式返回结果
            mode: AI_GRAPH_MODE_ENUM.HYBRID, // 查询模式
            top_k: 10, // 返回的候选词数量
            only_need_context: true, // 是否只返回上下文信息
            only_need_prompt: false, // 是否只返回提示信息
            timeout: Number(timeout || 30000), // 超时时间，单位为毫秒
        };
        const res = await new LightragAPI(this.config).graphChat(queryParams, this.workspace)
        const data = res?.response || res || '';
        if (typeof data === 'object' && data !== null) {
            return {
                content: [{ type: "text", text: `查询知识图谱结果：${JSON.stringify(data, null, 2)}` }],
                isError: false,
            };
        }
        if (typeof data === 'string' && data !== '') {
            return {
                content: [{ type: "text", text: `查询知识图谱结果：${data}` }],
                isError: false,
            };
        }
        return {
            content: [
                { type: "text", text: `查询知识图谱失败` },
            ],
            isError: true,
        };
    }
}
export default GraphDBTool;