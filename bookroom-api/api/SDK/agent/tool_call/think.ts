import { Context } from "koa";
import { PassThrough } from "stream";

export type ThinkOptions = {
    is_stream?: boolean;
    logLevel?: boolean;
    is_SSE?: boolean;
};

class Think {
    private history: Array<any> = [];
    private messages: Array<any> | PassThrough | null = [];
    private logLevel?: boolean = true;
    private searching: boolean = false;
    private is_SSE: boolean = false;

    constructor(options: ThinkOptions, ctx?: Context) {
        const { is_stream = false, logLevel = true, is_SSE = false } = options;
        this.logLevel = logLevel;
        this.is_SSE = is_SSE;
        if (is_stream && ctx) {
            const passThroughStream = new PassThrough();
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

    private formatAsSseData(data: any): string {
        // 将data转换为SSE格式的数据行，并在每行末尾添加换行符和两个连续的换行符以表示消息结束。
        const lines = String(data).split('\n');
        const dataLines = lines.map(line => `data: ${line}\r`).join('\n');
        return `${dataLines}\n\n`;
    }

    formattedMessage(args: any[]) {
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
        if (!this.searching) {
            const searchStartTag = "<search>\n\n";
            this.push(searchStartTag);
            this.searching = true;
        }
        this.push(formattedMessage);
    }
    output(...args: any[]) {
        if (this.searching) {
            this.log('</search>', "\n\n");
            this.searching = false;
        }
        const formattedMessage = this.formattedMessage(args);
        this.push(formattedMessage);
    }
    push(message: any) {
        if (this.messages instanceof Array) {
            this.messages.push(message);
        } else if (this.messages instanceof PassThrough) {
            let outputStr = ""
            if (typeof message === 'object') {
                try {
                    outputStr = JSON.stringify(message, null, 2);
                } catch (error) {
                    console.error("[Think] 写入流时出错 (object):", error);
                }
            } else {
                outputStr = String(message);
            }
            if (outputStr) {
                if (this.is_SSE) {
                    outputStr = this.formatAsSseData(outputStr);
                }
                this.messages.write(outputStr, 'utf8');
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