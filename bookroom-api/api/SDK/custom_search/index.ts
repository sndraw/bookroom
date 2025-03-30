import axios from 'axios';
import natural from 'natural';
import { load as cheerioLoad } from 'cheerio';

export async function searchUrl(query: string, host: string = "https://www.baidu.com/s?wd=") {
    const url = `${host}${encodeURIComponent(query)}`;
    console.log("自定义搜索: ", url)
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
        const body = response.data;
        // 搜索结果解析
        const $ = cheerioLoad(body);
        const urls: string[] = [];
        const $linkList = $('a');
        if ($linkList.length > 0) {
            $($linkList).each((i: any, el: any) => {
                const href = $(el).attr('href');
                if (href?.startsWith('/url?q=')) {
                    const url = decodeURIComponent(href.split('&url=')[1].split('&')[0]);
                    urls.push(url);
                } else {
                    if (href?.startsWith('https')) {
                        urls.push(href);
                    }
                }
            });
            return urls.slice(0, 3);

        }
        return $('title').text();

    } catch (err) {
        throw err;
    }
}
async function parseUrl(url: string | URL) {
    try {
        const urlString = typeof url === 'string' ? url : url.toString();
        const response = await axios.get(urlString, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
        const body = response.data;
        const $ = cheerioLoad(body);
        const title = $('title').text();
        const description = $('meta[name="description"]').attr('content');
        return { title, description };
    } catch (err) {
        throw err;
    }
}
export async function getKeywords(query: string) {
    const tokenizer = new natural.WordTokenizer();
    const text = decodeURIComponent(query)
    const tokens = tokenizer.tokenize(text);
    let keywords: any = tokens;
    // 如果tokens是数组，转换为字符串
    if (Array.isArray(tokens)) {
        keywords = tokens.join(' ');
    }
    return keywords;
}
export async function searchAndParse(params: {
    query: string,
    max_results?: number,
    is_tokenizer?: boolean,
    host?: string,
}) {
    try {
        const { query, max_results = 5, is_tokenizer, host } = params;
        let keywords = query;
        if (is_tokenizer) {
            keywords = await getKeywords(query);
            if (!keywords) {
                keywords = query; // 如果获取不到关键词，使用原始查询字符串
            }
        }
        const urls = await searchUrl(keywords, host);
        if (!Array.isArray(urls) || !urls?.length) {
            throw new Error(`Invalid URLs: ${urls}`);
        }
        console.log(urls)

        // 只取前max_results个url
        urls.splice(max_results);
        const results = [];
        for (const url of urls) {
            try {
                const result = await parseUrl(url);
                if (typeof result !== 'object' || result === null) {
                    continue;
                }
                results.push({ url, ...result });
            } catch (error: any) {
                console.error('Error in parseUrl:', error?.message || error?.code);
                continue;
            }
        }
        return results;
    } catch (err: any) {
        return {
            code: 500,
            message: err?.message || 'Internal Server Error',
        };

    }
}

export default class CustomSearchAPI {
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
        const { query, max_results = 5 } = queryParams || {};

        try {
            const result: any = await searchAndParse({
                query: query,
                host: this.host,
                max_results,
                is_tokenizer: false
            })
            if (!result || !result?.length) {
                return { isError: true, content: result?.message || 'No results found' };
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

