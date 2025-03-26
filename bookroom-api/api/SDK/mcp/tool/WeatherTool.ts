interface WeatherInput {
    province?: string;
    city: string;
}

const WeatherTool = {
    name: "weather_tool",
    version: "1.0",
    description: "获取指定地区的天气信息，支持省份和城市查询，需要提供城市名称并带上市县，可选省份名称。",
    parameters: {
        type: "object",
        properties: {
            province: { type: "string" },
            city: { type: "string" }
        },
        required: ["city"],
    },
    returns: {
        type: "object",
        properties: {
            content: {
                type: "array",
                items: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
            },
            isError: { type: "boolean" }
        },
        required: ["content", "isError"]
    },
    execute: async (args: WeatherInput): Promise<any> => {
        const { city } = args;
        const res = await fetch(`https://uapis.cn/api/weather?name=${city}`);

        const data: any = await res.json();
        if (typeof data === 'object' && data !== null && data?.code === 200) {
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