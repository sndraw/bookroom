import { Context } from "koa";
import { PassThrough } from "stream";

export const responseStream = async (ctx: Context, dataStream: any, resovle?: (data: any) => void) => {
    let responseText: string = '';

    const passThroughStream = new PassThrough();

    passThroughStream.on('data', (chunk) => {
        responseText += chunk.toString();
    });

    // 确保在所有数据推送完毕后才调用 end()
    passThroughStream.on('end', () => {
        resovle?.(responseText);
        // console.log("Stream ended successfully.")
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
            if (typeof chunk === 'object') {
                if (chunk?.status) {
                    // 定义分隔符
                    const delimiter = '\n';
                    // 如果不是第一个 chunk，添加分隔符
                    if (!isFirstChunk) {
                        passThroughStream.push(Buffer.from(delimiter), "utf-8");
                    }
                    newChunk = Buffer.from(JSON.stringify(chunk), 'utf-8');
                } else {
                    newChunk = Buffer.from(chunk?.message?.content || chunk?.choices?.[0]?.delta?.content || chunk?.response || '', 'utf-8')
                }

                // if(chunk?.done && chunk?.context){
                //     console.log(chunk?.context?.toString("base64"))
                //     console.log(Buffer.from(chunk?.context, 'utf-8'))
                //     ctx.res.write(Buffer.from(chunk?.context, 'utf-8'));
                // }
            }
            // 如果 chunk 是字符串
            if (typeof chunk === 'string') {
                newChunk = Buffer.from(chunk, 'utf-8');
            }

            // 如果 chunk 是 Buffer，直接使用
            if (chunk instanceof Buffer) {
                try {
                    const chunkObj = JSON.parse(chunk.toString('utf-8'));
                    newChunk = Buffer.from(chunkObj?.message?.content || chunkObj?.choices?.[0]?.delta?.content || chunkObj?.response || '', 'utf-8')
                } catch (e) {
                    newChunk = chunk;
                }
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