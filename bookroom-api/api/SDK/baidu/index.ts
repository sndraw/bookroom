import axios from 'axios';
import natural from 'natural';
import cheerio from 'cheerio';


async function searchBaidu(query: string) {
    const url = `https://www.baidu.com/s?wd=${query}&force_refresh=1`;
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
        const body = response.data;
        // 搜索结果解析
        const $ = cheerio.load(body);
        const urls: string[] = [];
        $('a').each((i: any, el: any) => {
            const href = $(el).attr('href');
            if (href?.startsWith('/url?q=')) {
                const url = decodeURIComponent(href.split('&url=')[1].split('&')[0]);
                urls.push(url);
            }
        });
        return urls.slice(0, 3);

    } catch (err) {
        throw err;
    }
}
async function parseUrl(url: string | URL) {
    try {
        const urlString = typeof url === 'string' ? url : url.toString();
        const response = await axios.get(urlString, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
        const body = response.data;

        const $ = cheerio.load(body);
        const title = $('title').text();
        const description = $('meta[name="description"]').attr('content');
        return { title, description };
    } catch (err) {
        throw err;
    }
}
export async function getKeywords(query: string) {
    const tokenizer = new natural.WordTokenizer();
    const text=decodeURIComponent(query)
    const tokens = tokenizer.tokenize(text);
    let keywords: any = tokens;
    // 如果tokens是数组，转换为字符串
    if (Array.isArray(tokens)) {
        keywords = tokens.join(' ');
    }
    return keywords;
}
async function searchAndParse(query: string) {
    try {
        const keywords = await getKeywords(query);
        if(!keywords){
            throw new Error('Invalid keywords');
        }
        const urls = await searchBaidu(keywords);
        if (!Array.isArray(urls)) {
            throw new Error('Invalid URLs');
        }
        const results = [];
        for (const url of urls) {
            const result = await parseUrl(url);
            if (typeof result !== 'object' || result === null) {
                throw new Error('Invalid result');
            }
            results.push({ url, ...result });
        }
        return results;
    } catch (err) {
        console.error(err);
    }
}

export default searchAndParse;
