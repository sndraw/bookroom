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
    private searching: boolean = false;

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
        // 存储记录记录
        this.history.push(formattedMessage);

        if (!this.logLevel) {
            // console.log(formattedMessage);
            return;
        }
        // 如果未在搜索状态，则开始搜索状态
        if (!this.searching) {
            this.push("<search>\n\n");
            this.searching = true;
        }
        this.push(formattedMessage);
    }
    output(...args: any[]) {
        // 如果在搜索状态，则结束搜索状态
        if (this.searching) {
            this.log('</search>', "\n\n");
            this.searching = false;
        }
        const formattedMessage = this.formattedMessage(args)
        this.push(formattedMessage);
    }

    finalAnswer(content: string) {
        // 类似于 output 方法，确保 search 标签已关闭
        if (this.searching) {
            this.push("</search>\n\n"); // 直接 push 关闭标签
            this.searching = false;
        }
        // 构造包含事件类型的最终消息对象
        const finalMessage = {
            event: 'final_answer', // 使用新的事件类型
            content: content
        };
        // 调用 push 发送这个结构化消息
        this.push(finalMessage);
    }

    push(message: any) {
        if (this.messages instanceof Array) {
            this.messages.push(message);
        } else if (this.messages instanceof PassThrough) {
            // 判定是否为JSON字符串并写入流中
            if (typeof message === 'object') {
                // console.log('[Think] Pushing object:', message); // 移除调试日志
                try {
                    const jsonString = JSON.stringify(message); // 使用单行 JSON，SSE data 不要求格式化
                    // **** 强制构造标准 SSE 格式 ****
                    const eventType = message.event || 'message'; // 获取事件类型，默认为 message
                    const sseMessage = `event: ${eventType}\ndata: ${jsonString}\n\n`;
                    // **** 构造结束 ****
                    // console.log('[Think] Writing SSE:', JSON.stringify(sseMessage)); // 移除调试日志
                    this.messages.write(sseMessage, 'utf8');
                } catch (error) {
                    console.error("[Think] 写入流时出错:", error); // 保留错误日志
                }
            } else {
                // 处理非对象消息 (假定为纯文本或其他)
                 // console.log('[Think] Pushing non-object:', String(message).substring(0, 100) + '...'); // 移除调试日志
                // **** 强制构造标准 SSE data 格式 ****
                const stringMessage = String(message);
                // 将多行文本拆分，每行前加 data:
                const dataLines = stringMessage.split('\n').map(line => `data: ${line}`).join('\n');
                const sseMessage = `${dataLines}\n\n`; // 仅包含 data 行
                // **** 构造结束 ****
                // console.log('[Think] Writing plain text as SSE:', JSON.stringify(sseMessage)); // 移除调试日志
                this.messages.write(sseMessage, 'utf8');
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
        // 停止并输出空字符，判定是否结束了搜索
        this.output('');
        if (this.messages instanceof PassThrough) {
            this.messages.end();
        }
    }
}

export default Think;