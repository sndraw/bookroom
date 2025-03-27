import TavilyAPI from "@/SDK/tavily";

interface SearchInput {
    query: string;
}

class SearchTool {
    private config: any;
    public name = "search_tool";
    public version = "1.0";
    public description = "Search internet information | 搜索互联网信息";
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
        this.config = config;
    }
    async execute(params: SearchInput): Promise<any> {
        const { query } = params;
        const { host, apiKey, parameters } = this.config;
        const queryParams = {
            query: query, // 查询内容
            max_results: Number(parameters?.max_results || 10), // 最大返回结果数
        }

        const res = await new TavilyAPI({
            host: host,
            apiKey: apiKey,
        }).search(queryParams);
        const data: any = res?.results
        if (typeof data === 'object' && data !== null) {
            return {
                content: [{ type: "text", text: `搜索互联网结果：${JSON.stringify(data)}` }],
                isError: false,
            };
        }
        return {
            content: [
                { type: "text", text: `搜索互联网失败` },
            ],
            isError: true,
        };
    }
}
export default SearchTool;