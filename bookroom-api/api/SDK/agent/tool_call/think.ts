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

    private formatAsSseData(data: string): string {
        const lines = String(data).split('\n');
        const dataLines = lines.map(line => `data: ${line}`).join('\n');
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

        const isStreaming = this.messages instanceof PassThrough;

        if (!this.searching) {
            const searchStartTag = "<search>\n\n";
            this.push(isStreaming ? this.formatAsSseData(searchStartTag) : searchStartTag);
            this.searching = true;
        }
        this.push(isStreaming ? this.formatAsSseData(formattedMessage) : formattedMessage);
    }
    output(...args: any[]) {
        const isStreaming = this.messages instanceof PassThrough;
        if (this.searching) {
            this.log('</search>', "\n\n");
            this.searching = false;
        }
        const formattedMessage = this.formattedMessage(args);
        this.push(isStreaming ? this.formatAsSseData(formattedMessage) : formattedMessage);
    }
    push(message: any) {
        if (this.messages instanceof Array) {
            this.messages.push(message);
        } else if (this.messages instanceof PassThrough) {
            if (typeof message === 'object') {
                try {
                    const jsonString = JSON.stringify(message);
                    this.messages.write(jsonString, 'utf8');
                } catch (error) {
                    console.error("[Think] 写入流时出错 (object):", error);
                }
            } else {
                this.messages.write(String(message), 'utf8');
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