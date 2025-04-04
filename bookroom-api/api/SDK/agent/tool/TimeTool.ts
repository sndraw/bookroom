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

    constructor(config: any) {
        const { description } = config;
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config;
    }
    async execute(params: TimeInput): Promise<any> {
        const { query } = params;
        const { parameters = {} } = this.config;
        const queryParams = {
            query: query,
            format: "YYYY-MM-DD HH:mm:ss dddd Z",
        }
        if (parameters?.params && typeof parameters.params === 'object') {
            Object.assign(queryParams, parameters.params);
        }
        // const date = moment(queryParams?.query);
        // 查询当前时间
        const date = moment().format(queryParams?.format);
        return {
            content: [
                { type: "text", text: date },
            ],
            isError: false,
        };
    }
}
export default TimeTool;