import { createFileClient, getObjectName } from "@/common/file";
import { SERVER_UPLOAD_PATH } from "@/config/minio.conf";
import { WithImplicitCoercion } from "buffer";
import { createWriteStream } from "fs";
import { Context } from "koa";
import { PassThrough } from "stream";
import { Writer } from 'wav';

// 将chunk转换为Buffer格式
export const formatChunkToBuffer = (chunk: any) => {
    // 如果 chunk 是 Buffer，直接使用
    if (Buffer.isBuffer(chunk)) {
        try {
            const chunkObj = JSON.parse(chunk.toString('utf-8'));
            return Buffer.from(chunkObj?.message?.content || chunkObj?.choices?.[0]?.delta?.content || chunkObj?.response || '', 'utf-8')
        } catch (e) {
            return chunk;
        }
    } else {
        if (chunk instanceof Object || chunk instanceof Array) {
            return formatObjectChunk(chunk) || "";
        }
    }

    // 如果 chunk 是字符串
    if (typeof chunk === 'string') {
        return Buffer.from(chunk, 'utf-8');
    }

    // 如果是 chunk 是对象或者数组
    if (chunk instanceof Object || chunk instanceof Array) {
        return Buffer.from(JSON.stringify(chunk, null, 2));
    }

    return chunk;
}

// 处理chunk对象
export const formatObjectChunk = (chunk: any) => {
    if (!(chunk instanceof Object) || chunk instanceof Buffer) {
        return chunk;
    }
    // 如果是语音数据，返回null，表示不处理语音数据，进行另外处理
    if (chunk?.choices?.[0]?.delta?.audio) {
        return null;
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
    return audioData;
}


// 转换文件为音频格式并保存
export const convertAudio = async (audioString: WithImplicitCoercion<string>, audioPath: string) => {
    try {
        // 解码Base64字符串为Buffer
        const wavBuffer = Buffer.from(audioString, 'base64');
        // 创建WAV文件写入流
        const writer = new Writer({
            format: 1,          // PCM格式
            sampleRate: 24000,  // 采样率
            channels: 1,        // 单声道
            bitDepth: 16        // 16位深度
        });
        // 创建输出文件流并建立管道连接
        const outputStream = createWriteStream(audioPath);
        writer.pipe(outputStream);

        // 写入PCM数据并结束写入
        writer.write(wavBuffer);
        writer.end();

        // 使用Promise等待文件写入完成
        await new Promise<void>((resolve, reject) => {
            outputStream.on('finish', () => resolve());
            outputStream.on('error', (err: Error) => reject(err));
        });

        // 添加额外等待时间确保音频完整
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log(`音频文件已成功保存为 ${audioPath}`);
    } catch (error) {
        console.error('处理过程中发生错误:', error);
    }
}

export interface HandleResponseStreamOptions {
    ctx?: Context,
    resovle?: (data: any) => void,
    userId?: string,
};

// 处理流式输出
export const handleResponseStream = async (dataStream: any, options?: HandleResponseStreamOptions) => {
    const { resovle, ctx, userId } = options || {};

    if (!dataStream || (!dataStream?.itr && !dataStream?.iterator)) {
        if (ctx) {
            ctx.status = 200;
            ctx.body = dataStream;
        }
        return dataStream;
    }
    let responseText: string = '';
    const passThroughStream = new PassThrough();

    passThroughStream.on('data', (chunk) => {
        responseText += chunk.toString();
    });

    // 确保在所有数据推送完毕后才调用 end()
    passThroughStream.on('end', () => {
        resovle?.(responseText);
        ctx?.res?.end();
    })
    if (ctx) {
        // ctx.res.statusCode = 200;
        ctx.res.setHeader('Content-Type', 'application/octet-stream');
        ctx.body = passThroughStream;
        passThroughStream.pipe(ctx.res);
    }

    try {
        let isFirstChunk = true;
        let audioBuffer: string = '';
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
                // 处理视频数据
                if (chunk?.choices?.[0].delta?.audio) {
                    const audioData = formatAudioData(chunk?.choices[0]?.delta?.audio);
                    // 如果是对象
                    if(audioData?.transcript){
                        passThroughStream.push(audioData?.transcript, "utf-8")
                    }
                    if(audioData?.data){
                        audioBuffer += audioData.data;
                    }
                }
                newChunk = formatChunkToBuffer(chunk);
            }
            passThroughStream.push(newChunk, "utf-8")
            isFirstChunk = false;
        }
        if (audioBuffer) {
            const formatedStr = await saveAudioToFile(audioBuffer, {
                userId: userId || ctx?.userId
            });
            if (formatedStr) {
                passThroughStream.push(Buffer.from(formatedStr), "utf-8");
            } 
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

export const saveAudioToFile = async (audioString: string, options: { userId?: string }) => {
    if (!audioString) return '';
    const { userId } = options;
    const objectId = new Date().getTime() + '_' + 'voice.wav';
    const objectName = getObjectName(objectId, userId);
    const filePath = `${SERVER_UPLOAD_PATH}/${objectId}`
    await convertAudio(audioString, filePath);
    const result = await createFileClient().fPutObject({
        objectName,
        filePath
    });
    let formatedStr = ""
    if (result) {
        formatedStr = `[${objectId}](${objectId})`;
    }
    return formatedStr;
};