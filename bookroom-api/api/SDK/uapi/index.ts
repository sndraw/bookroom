export interface Config {
    host?: string;
    apiKey?: string;
}


export default class UApi {
    protected readonly host: string = '';
    protected readonly apiKey: string = '';
    protected readonly config: any;

    constructor(config: { host: string; apiKey: string; }) {
        if (config?.host) {
            this.host = config.host
        }
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async search(queryParams: any) {
        const { search_type = "hotlist", query } = queryParams || {};
        try {
            // 访问地址
            let url = `${this.host}/api/${search_type}`;
            // 将params转化为query参数
            let params = null;
            switch (search_type) {
                case "weather":
                    params = new URLSearchParams({
                        name: query,
                    });
                    break;
                case "hotlist":
                    params = new URLSearchParams({
                        type: query,
                    });
                default:
                    params = new URLSearchParams({
                        text: query,
                    });
                    break;
            }
            url += '?' + params.toString();
            const res = await fetch(url);
            const data: any = await res.json();
            if (typeof data === 'object' && data !== null && data?.code === 200) {
                return {
                    content: data,
                    isError: false,
                };
            }
            return {
                content: `查询失败，错误码：${data?.code}`,
                isError: true,
            };
        } catch (error: any) {
            console.error('Error in search:', error);
            return { isError: true, content: `Search failed: ${error?.message || 'Unknown error'}` };
        }
    }
}
