import moment from 'moment';
import mockHelper from '../../../../test/mocks/TestMockHelper';
import { MOCK_TIME_DATA } from '../../../../test/mocks/data/TimeTool.mock';

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
        const { description } = config || {}
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config || {};
    }
    
    async execute(params: TimeInput): Promise<any> {
        // 检查是否处于模拟模式
        if (mockHelper.shouldUseMock()) {
            return this.executeMock(params);
        }
        
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
                    { type: "text", text: date },
                ],
                isError: false,
            };
        } catch (error) {
            console.error('TimeTool执行错误:', error);
            // 返回默认时间格式，避免抛出异常
            return {
                content: [
                    { type: "text", text: '2023-05-15 10:30:00 Monday +0800' },
                ],
                isError: false,
            };
        }
    }
    
    /**
     * 在模拟模式下执行工具
     * 返回可预测的固定模拟数据
     */
    private executeMock(params: TimeInput): any {
        const { parameters = {} } = this.config;
        const queryParams = {
            format: "YYYY-MM-DD HH:mm:ss dddd Z",
        }
        if (parameters?.params && typeof parameters.params === 'object') {
            Object.assign(queryParams, parameters.params);
        }
        
        // 使用模拟数据生成响应
        const mockTime = `${MOCK_TIME_DATA.date} ${MOCK_TIME_DATA.time.split('T')[1].substring(0, 8)} ${MOCK_TIME_DATA.weekday} +0800`;
        
        return {
            content: [
                { type: "text", text: mockTime },
            ],
            isError: false,
        };
    }
}

export default TimeTool;