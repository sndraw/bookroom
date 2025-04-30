import moment from 'moment';

interface TimeInput {
    query: string;
}

class TimeTool {
    private config: any;
    public name = "time_tool";
    public version = "1.0";
    public description = "API for curent time  | 查询当前时间接口";
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

    constructor(config?: any) {
        const { name, description } = config || {}
        if (name) {
            this.name = `${this.name}_${name}`;
        }
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config || {};
    }

    async execute(params: TimeInput): Promise<any> {
        const { query } = params;
        const { parameters = {} } = this.config;
        const queryParams = {
            query: query,
            format: "YYYY-MM-DD HH:mm:ss dddd Z",
        }
        if (parameters?.params instanceof Object) {
            Object.assign(queryParams, parameters.params);
        }

        try {
            // 查询当前时间
            const date = moment().format(queryParams?.format);
            return {
                content: [
                    { type: "text", text: `当前时间：${date}`},
                ],
                isError: false,
            };
        } catch (error: any) {
            console.error('TimeTool执行错误:', error);
            // 返回默认时间格式，避免抛出异常
            return {
                content: [
                    { type: "text", text: `${error?.message || '未知错误'}` },
                ],
                isError: true,
            };
        }
    }
}

export default TimeTool;