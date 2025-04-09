import { SEARCH_API_MAP } from "@/common/search";
import CustomSearchApi from "@/SDK/search/custom_search";
import TavilyApi from "@/SDK/search/tavily";
interface SearchInput {
    query: string;
    timeout?: number,
}


class SearchTool {
    private config: any;
    public name = "search_tool";
    public version = "1.0";
    public description = "Search internet information | 搜索互联网信息";
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

    constructor(config: any) {
        const { name, description } = config || {}
        if (name) {
            this.name = `${this.name}_${name}`;
        }
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config || {};
    }
    async execute(params: SearchInput): Promise<any> {
        const { query, timeout } = params;
        const { host, apiKey, code, parameters } = this.config;
        const queryParams = {
            query: query, // 查询内容
            paramKey: parameters?.paramKey || "", // 可选参数，需要根据实际情况
            max_results: Number(parameters?.max_results || 10), // 最大返回结果数
            timeout: Number(timeout || 30000), // 超时时间，单位为毫秒
        }
        let data: any = null;
        switch (code) {
            case SEARCH_API_MAP.tavily.value:
                data = await new TavilyApi({
                    host: host,
                    apiKey: apiKey,
                }).search(queryParams);
                break;
            case SEARCH_API_MAP.custom.value:
                data = await new CustomSearchApi({
                    host: host,
                    apiKey: apiKey,
                }).search(queryParams);
                break;
            default:
                data = {
                    ifError: true,
                    code: 404,
                    message: "API暂不支持。",
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
export default SearchTool;