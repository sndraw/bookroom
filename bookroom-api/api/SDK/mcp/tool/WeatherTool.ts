interface WeatherInput {
    province?: string;
    city: string;
}

const WeatherTool = {
    name: "weather_tool",
    version: "1.0",
    description: "Get weather information",
    parameters: {
        type: "object",
        properties: {
            province: { type: "string" },
            city: { type: "string" }
        },
        required: ["city"],
    },
    execute: async (args: WeatherInput): Promise<any> => {
        const { city } = args;
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