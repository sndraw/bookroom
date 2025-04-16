import { SEARCH_API_MAP } from "@/common/search";
import CustomSearchApi from "@/SDK/search/custom_search";
import TavilyApi from "@/SDK/search/tavily";
import WeatherApi from "@/SDK/search/weather";

interface WeatherInput {
    province?: string;
    city: string;
    timeout?: number;
}

class WeatherTool {
    private config: any;
    public name = "weather_tool";
    public version = "1.0";
    public description = "获取指定地区的天气信息，支持省份和城市查询，需要提供城市名称并带上市县，可选省份名称";
    public parameters = {
        type: "object",
        properties: {
            province: { type: "string", description: "省份名称，带上省/州，可选" },
            city: { type: "string" , description: "城市名称，带上市/县" },
            timeout: { type: "number", description: "超时时间，单位为毫秒" },
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
        const { name, description } = config || {}
        if (name) {
            this.name = `${this.name}_${name}`;
        }
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config || {};
    }
    async execute(args: WeatherInput): Promise<any> {
        const { city, timeout } = args;
        const { host, apiKey, code, parameters } = this.config;

        const queryParams = {
            query: city, // 查询内容
            paramKey: parameters?.paramKey || "", // 可选参数，需要根据实际情况填
            timeout: Number(timeout || 30000), // 超时时间，单位为毫秒
        }
        let data = null;
        switch (code) {
            case SEARCH_API_MAP.tavily.value:
                queryParams.query = "查询天气：" + city;
                data = await new TavilyApi({
                    host: host,
                    apiKey: apiKey,
                }).search(queryParams);
                break;
            case SEARCH_API_MAP.weather.value:
                data = await new WeatherApi({
                    host: host,
                    apiKey: apiKey
                }).search(queryParams);
                break;
            case SEARCH_API_MAP.custom.value:
                queryParams.query = "查询天气：" + city;
                data = await new CustomSearchApi({
                    host: host,
                    apiKey: apiKey,
                }).search(queryParams);
                break;
            default:
                data = {
                    ifError: true,
                    code: 404,
                    message: `${code}接口类型暂不支持`,
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
                { type: "text", text: `${data?.message || data?.content || '未知错误'}` },
            ],
            isError: true,
        };
    }

}

export default WeatherTool;