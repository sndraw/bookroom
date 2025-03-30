export interface Config {
    host?: string;
    apiKey?: string;
}


export default class WeatherApi {
    protected readonly host: string = '';
    protected readonly apiKey: string = '';

    constructor(config: { host: string; apiKey: string; }) {
        if (config?.host) {
            this.host = config.host
        }
        if (config?.apiKey) {
            this.apiKey = config.apiKey;
        }
    }

    async search(queryParams: any) {
        const { query, paramKey = "city" } = queryParams || {};
        try {
            const urlObj = new URL(this.host);
            urlObj.searchParams.append(paramKey, query);
            const url = urlObj.toString();
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
