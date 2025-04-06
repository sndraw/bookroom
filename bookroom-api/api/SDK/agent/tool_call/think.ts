import { Context } from "koa";
import { PassThrough } from "stream";

export type ThinkOptions = {
    is_stream?: boolean;
    logLevel?: boolean;
};

class Think {
    private history: Array<any> = [];
    private messages: Array<any> | PassThrough | null = [];
    private logLevel?: boolean = true;

    constructor(options: ThinkOptions, ctx?: Context) {
        const { is_stream = false, logLevel = true } = options;
        this.logLevel = logLevel;
        if (is_stream && ctx) {
            const passThroughStream = new PassThrough();
            // 确保在所有数据推送完毕后才调用 end()
            passThroughStream.on('end', () => {
                ctx.res.end();
            })
            passThroughStream.pipe(ctx.res);
            this.messages = passThroughStream;
            ctx.res.on('finish', () => {
                this.end();
            });
        }
    }

    formattedMessage(args: any[]) {
        // 如果为空
        const formattedMessage = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return arg || '';
        }).join('');
        return formattedMessage;
    }
    log(...args: any[]) {
        const formattedMessage = this.formattedMessage(args);
        this.history.push(formattedMessage);

        if (!this.logLevel) {
            return;
        }
        this.push(formattedMessage);
    }
    output(...args: any[]) {
        const formattedMessage = this.formattedMessage(args)
        this.push(formattedMessage);
    }

    finalAnswer(content: string) {
        const finalMessage = {
            event: 'final_answer',
            content: content
        };
        this.push(finalMessage);
    }

    push(message: any) {
        if (this.messages instanceof Array) {
            this.messages.push(message);
        } else if (this.messages instanceof PassThrough) {
            // 判定是否为JSON字符串并写入流中
            if (typeof message === 'object') {
                // console.log('[Think] Pushing object:', message); // 保持移除
                try {
                    const jsonString = JSON.stringify(message);
                    const eventType = message.event || 'message'; 
                    const sseMessage = `event: ${eventType}\ndata: ${jsonString}\n\n`;
                    // console.log('[Think] Writing SSE:', JSON.stringify(sseMessage)); // 保持移除
                    this.messages.write(sseMessage, 'utf8');
                } catch (error) {
                    console.error("[Think] 写入流时出错:", error); // 保留错误日志
                }
            } else {
                // **** 修改点：使用标准的多行 data 格式发送纯文本 ****
                const stringMessage = String(message);
                // 将消息按换行符分割成多行
                const lines = stringMessage.split('\n');
                // 为每一行添加 "data: " 前缀
                const dataLines = lines.map(line => `data: ${line}`).join('\n');
                // 构造最终的 SSE 消息，以 \n\n 结尾
                const sseMessage = `${dataLines}\n\n`;
                this.messages.write(sseMessage, 'utf8');
                // **** 修改结束 ****
            }
        }
    }

    getData() {
        return this.messages;
    }
    getHistory() {
        return this.history;
    }
    toString() {
        if (this.messages instanceof Array) {
            return this.messages.join('\n');
        }
        if (this.messages instanceof PassThrough) {
            return this.messages.read()?.toString('utf8');
        }
    }

    end() {
        this.output('');
        if (this.messages instanceof PassThrough) {
            this.messages.end();
        }
    }
}

export default Think;