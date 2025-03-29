import { SEARCH_API_MAP } from "@/common/search";
import CustomSearchApi from "@/SDK/custom_search";
import TavilyApi from "@/SDK/tavily";

interface WeatherInput {
    province?: string;
    city: string;
}

class WeatherTool {
    private config: any;
    public name = "weather_tool";
    public version = "1.0";
    public description = "获取指定地区的天气信息，支持省份和城市查询，需要提供城市名称并带上市县，可选省份名称";
    public parameters = {
        type: "object",
        properties: {
            province: { type: "string" },
            city: { type: "string" }
        },
        required: ["city"],
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
    async execute(args: WeatherInput): Promise<any> {
        const { city } = args;
        const { host, apiKey, code, parameters } = this.config;

        const queryParams = {
            query: city, // 查询内容
        }

        let data = null;
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
                    code: 404,
                    message: "API暂不支持。",
                }
                break;
        }
        if (data && typeof data === 'object' && !data?.isError) {
            return {
                content: [{ type: "text", text: `搜索天气结果：${JSON.stringify(data)}` }],
                isError: false,
            };
        }
        return {
            content: [
                { type: "text", text: `${data?.message || data?.content  || '未知错误'}` },
            ],
            isError: true,
        };
    }

}

export default WeatherTool;