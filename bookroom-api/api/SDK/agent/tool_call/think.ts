import { Context } from "koa";
import { PassThrough } from "stream";

export type ThinkOptions = {
    is_stream?: boolean;
};

class Think {
    private messages: Array<any> | PassThrough | null = [];
    constructor(options: ThinkOptions, ctx?: Context) {
        const { is_stream = false } = options;
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

    log(...args: any[]) {
        // 拼接参数并输出到控制台
        const formattedMessage = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return arg;
        }).join('');
        // console.log(String(formattedMessage));
        this.push(formattedMessage);
    }

    push(message: any) {
        if (this.messages instanceof Array) {
            this.messages.push(message);
        } else if (this.messages instanceof PassThrough) {
            // 判定是否为JSON字符串并写入流中
            if (typeof message === 'object') {
                try {
                    const jsonString = JSON.stringify(message);
                    this.messages.write(jsonString, 'utf8');
                } catch (error) {
                    console.error("写入流时出错:", error);
                }
            } else {
                this.messages.write(message, 'utf8');
            }
        }
    }

    getData() {
        return this.messages;
    }

    toString() {
        if (this.messages instanceof Array) {
            return this.messages.join('\n');
        }
        if (this.messages instanceof PassThrough) {
            return this.messages.read().toString('utf8');
        }
    }

    end() {
        if (this.messages instanceof PassThrough) {
            this.messages.end();
        }
    }
}

export default Think;