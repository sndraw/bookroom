import request from "@/common/request";
export interface Config {
    host?: string;
    apiKey?: string;
}


export default class TavilyAPI {
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
        const { query, max_results = 5, stream = false } = queryParams || {};
        const data = {
            query: query,
            topic: "general",
            search_depth: "basic",
            max_results,
            time_range: null,
            days: 3,
            include_answer: false,
            include_raw_content: false,
            include_images: false,
            include_image_descriptions: false,
            include_domains: [],
            exclude_domains: []
        }
        try {
            const url = `${this.host}/search`;
            const result: any = await request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                data: data,
                responseType: stream ? 'stream' : 'json'
            });
            if (stream) {
                return result;
            }
            return {
                isError: false,
                content: result,
            };
        } catch (error: any) {
            console.error('Error in search:', error);
            return { isError: true, content: `Search failed: ${error?.message || 'Unknown error'}` };
        }
    }
}
