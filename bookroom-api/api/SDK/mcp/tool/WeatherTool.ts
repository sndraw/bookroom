import BaseTool from "./BaseTool";

class WeatherTool extends BaseTool  {
    
    constructor(name: string, version: string) {
        super();
        this.name = name;
        this.version = version;
        this.description = "Get weather information";
        this.inputSchema = {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Query information",
                },
            },
            required: ["query"],
        }
        this.execute = this.getWeather.bind(this);
    }
    async getWeather(args: object): Promise<any> {
        const { province, city } = args as { province: string, city: string };
        const res = await fetch(`https://uapis.cn/api/weather?name=${city}`);
        const data: any = await res.json();
        if (typeof data === 'object' && data !== null && data?.code !== 200) {
            return {
                content: [{ type: "text", text: `查询到天气：${JSON.stringify(data)}` }],
                isError: false,
            };
        }
        return {
            content: [
                { type: "text", text: `查询天气失败，错误码：${data?.code}` },
            ],
            isError: true,
        };
    }
}

export default WeatherTool;