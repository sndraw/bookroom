import { SQLITE_DB_PATH } from "@/config/sqlite.conf";
import SqliteDB from "@/SDK/sqlite";
import fs from "fs";
import path from "path";


interface SqliteDBInput {
    query: string;
    params: any[],
    action: "run" | "get" | "all",
    timeout?: number,
}

class SqliteDBTool {
    private config: any;
    public name = "sqlite_db_tool";
    public version = "1.0";
    public description = "API based on sqlite3 | sqlite3数据库操作工具 | 可以通过SQL语句进行sqlite3数据库操作。";
    public parameters = {
        type: "object",
        properties: {
            query: { type: "string", description: "SQL语句" },
            params: { type: "array", items: { type: "any" }, description: "SQL语句参数" },
            action: { type: "string", enum: ["run", "get", "all"], description: "操作类型，run表示执行SQL语句，get表示查询单个符合条件的实例，all表示查询所有符合条件的实例" },
            timeout: { type: "number", description: "超时时间，单位为毫秒" },
        },
        required: ["query","action"],
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
    async execute(props: SqliteDBInput): Promise<any> {
        const { query, params, action, timeout } = props;
        const { dbPath = SQLITE_DB_PATH, parameters = {}, userId } = this.config;
        const queryParams: any = {
            query: query,// 查询内容，必填项
            params: params, // 查询参数，可选项
            action: action, // 操作类型，可选项，如：run、get、all等
            timeout: timeout || 30000,// 超时时间，单位为毫秒
            userId: userId // 用户ID，用于记录用户操作日志
        }
        if (parameters?.params instanceof Object) {
            Object.assign(queryParams, parameters.params);
        }
        let data: any = null;
        try {
            // 如果参数错误
            if (!query) {
                throw new Error('SQL查询内容不能为空');
            }
            const dirPath = path.join(dbPath, encodeURIComponent(this.name), userId).replaceAll('\\', '/'); // 替换反斜杠为正斜杠
            const filePath = path.join(dirPath, 'database.db')

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '')
            }
            const db = new SqliteDB(filePath);
            let result: any = null;
            switch (action) {
                case 'run':
                    result = await db.run(query, params);
                    data = {
                        isError: false,
                        message: `${action}操作执行成功：${query} | ${JSON.stringify(params, null, 2)}`,
                        content: result,
                    }
                    break;
                case 'get':
                    result = await db.get(query, params);
                    data = {
                        isError: false,
                        message: `${action}操作执行成功：${query} | ${JSON.stringify(params, null, 2)}`,
                        content: result,
                    }
                    break;
                case 'all':
                    result = await db.all(query, params);
                    data = {
                        isError: false,
                        message: `${action}操作执行成功：${query} | ${JSON.stringify(params, null, 2)}`,
                        content: result,
                    }
                    break;
                default:
                    data = {
                        isError: true,
                        code: 404,
                        message: `无效的操作类型${action}`,
                    }
                    break;
            }
        } catch (error: any) {
            data = {
                isError: true,
                code: 500,
                message: `SQL数据库交互失败：${error?.message || '未知错误'}`,
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
export default SqliteDBTool;