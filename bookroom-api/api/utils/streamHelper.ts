import { Context } from "koa";
import { PassThrough } from "stream";

// 将chunk转换为Buffer格式
export const formatChunkToBuffer = (chunk: any) => {
    if (typeof chunk === 'object') {
        return formatObjectChunk(chunk);
    }
    // 如果 chunk 是 Buffer，直接使用
    if (chunk instanceof Buffer) {
        try {
            const chunkObj = JSON.parse(chunk.toString('utf-8'));
            return Buffer.from(chunkObj?.message?.content || chunkObj?.choices?.[0]?.delta?.content || chunkObj?.response || '', 'utf-8')
        } catch (e) {
            return chunk;
        }
    }

    // 如果 chunk 是字符串
    if (typeof chunk === 'string') {
        return Buffer.from(chunk, 'utf-8');
    }

    // 如果是 chunk 是对象或者数组
    if (typeof chunk === 'object') {
        return Buffer.from(JSON.stringify(chunk, null, 2));
    }

    return chunk;
}

// 处理chunk对象
export const formatObjectChunk = (chunk: any) => {
    // 如果不是object
    if (!(chunk instanceof Object) || chunk instanceof Buffer) {
        return chunk;
    }
    if (chunk?.choices?.[0]?.delta?.audio) {
        return formatAudioData(chunk?.choices?.[0]?.delta?.audio);
    }
    return chunk?.message?.content || chunk?.choices?.[0]?.delta?.content || chunk?.choices?.[0]?.text || chunk?.response || ''
}

// 处理语音数据
export const formatAudioData = (audioData: any) => {

    // 如果是buffer 直接输出
    if (audioData instanceof Buffer) {
        try {
            return JSON.parse(audioData.toString('utf-8'));
        } catch (e) {
            return audioData;
        }
    }

    // 如果是字符串直接输出
    if (typeof audioData === 'string') {
        return audioData;
    }
    // 如果是对象
    if (audioData instanceof Object) {
        if (audioData?.transcript) {
            return audioData.transcript;
        }
        if (audioData?.transcribe) {
            return audioData.transcribe;
        }
    }

    return null;
}


export const responseStream = async (ctx: Context, dataStream: any, resovle?: (data: any) => void) => {
    let responseText: string = '';

    if (!dataStream || (!dataStream?.itr && !dataStream?.iterator)) {
        ctx.status = 200;
        ctx.body = dataStream;
        return;
    }

    const passThroughStream = new PassThrough();

    passThroughStream.on('data', (chunk) => {
        responseText += chunk.toString();
    });

    // 确保在所有数据推送完毕后才调用 end()
    passThroughStream.on('end', () => {
        resovle?.(responseText);
        ctx.res.end();
    })
    // ctx.res.statusCode = 200;
    ctx.res.setHeader('Content-Type', 'application/octet-stream');
    ctx.body = passThroughStream;
    passThroughStream.pipe(ctx.res);
    try {
        let isFirstChunk = true;
        for await (const chunk of dataStream) {
            let newChunk: any = chunk;
            if (typeof chunk === 'object' && chunk?.status) {
                // 定义分隔符
                const delimiter = '\n';
                // 如果不是第一个 chunk，添加分隔符
                if (!isFirstChunk) {
                    passThroughStream.push(Buffer.from(delimiter), "utf-8");
                }
                newChunk = Buffer.from(JSON.stringify(chunk, null, 2), 'utf-8');
            } else {
                newChunk = formatChunkToBuffer(chunk);
            }
            passThroughStream.push(newChunk, "utf-8")
            isFirstChunk = false;
        }
        // 所有数据推送完毕后，调用 end() 表示流结束
        passThroughStream.end();
    } catch (error: any) {
        // const errorChunk = Buffer.from(JSON.stringify({
        //     status: "error",
        //     error: error?.message
        // }), 'utf-8');
        // passThroughStream.push(errorChunk);
        console.error('Error during stream processing:', error);
        passThroughStream.end();
    } finally {
        return responseText;
    }
};