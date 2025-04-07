import request from "@/common/request";
import { handleResponseStream } from "@/utils/streamHelper";

export interface AgentApiConfig {
    host?: string;
    apiKey?: string;
    code?: string;
}


export interface AgentApiChatType {
    query: any,
    stream?: boolean,
    workspace?: string,
    timeout?: number,
    userId?: string,
}

export default class AgentAPI {
    protected readonly host: string = '';
    protected readonly apiKey: string = '';
    protected readonly code: string = '';
    protected readonly config: any;

    constructor(config: AgentApiConfig) {
        if (config?.host) {
            this.host = config.host
        }
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
        if (config?.code) {
            this.code = config.code
        }
        this.config = config;
    }


    async chat(queryParams: AgentApiChatType) {
        const { query, stream, workspace, timeout, userId } = queryParams;
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            }
            // 图谱空间
            if (workspace) {
                headers['X-Workspace'] = workspace;
            }
            // 多种请求头设置，根据实际情况进行调整
            if (this.apiKey) {
                headers['X-API-Key'] = this.apiKey;
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const url = stream ? `${this.host}/query/stream` : `${this.host}/query`;
            const dataStream: any = await request(url, {
                method: 'POST',
                headers,
                data: {
                    query
                },
                responseType: stream ? 'stream' : 'json',
                timeout: timeout || 30000
            });
            if (stream) {
                return await handleResponseStream(dataStream, {
                    userId
                });
            }
            return {
                content: dataStream?.response || '',
                isError: false,
            };
        } catch (error: any) {
            let errMessage = "Agent沟通出错："
            if (error?.response?.data?.detail) {
                errMessage += JSON.stringify(error?.response?.data?.detail)
            } else {
                errMessage += error?.mssage || "未知"
            }
            return {
                content: errMessage,
                isError: true,
            };
        }
    }
}
