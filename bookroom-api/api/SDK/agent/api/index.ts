import request from "@/common/request";

export interface Config {
    host?: string;
    apiKey?: string;
}
export default class AgentAPI {
    protected readonly host: string = '';
    protected readonly apiKey: string = '';
    protected readonly code: string = '';
    protected readonly config: any;


    constructor(config: { host: string; apiKey: string; code: any; }) {
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
    async chat(queryParams: any) {
        const { stream, workspace } = queryParams;
        try {
            const url = stream ? `${this.host}/query/stream` : `${this.host}/query`;
            const dataStream: any = await request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey,
                    'X-Workspace': encodeURIComponent(workspace || ""),
                },
                data: queryParams,
                responseType: stream ? 'stream' : 'json'
            });
            if (stream) {
                return dataStream;
            }
            return {
                content: dataStream?.response || '',
                isError: false,
            };
        } catch (error: any) {
            const errMessage = error?.response?.data?.detail || error
            return {
                content: `Error in chat: ${errMessage}`,
                isError: true,
            };
        }
    }
}
