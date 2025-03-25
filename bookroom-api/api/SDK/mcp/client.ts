import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transports: { [sessionId: string]: SSEClientTransport } = {};

class McpClient {
    private client: Client;
    private sseUrl: string;
    constructor(ops: any) {
        const { name, apiKey, host, version = "1.0.0" } = ops;
        if (!name) throw new Error("缺少客户端名称");
        if (!apiKey) throw new Error("缺少API密钥");
        if (!host) throw new Error("缺少主机地址");
        this.sseUrl = host;
        const client = new Client(
            {
                name,
                version,
            },
            {
                capabilities: {
                    prompts: {},
                    resources: {},
                    tools: {}
                },
            },
        );
        this.client = client;
    }
    async start_sse(sessionId: string) {
        const transport = new SSEClientTransport(new URL(this.sseUrl));
        transports[sessionId] = transport;
        await this.client.connect(transport);
    }

    async stop_sse(sessionId: string) {
        const transport = transports[sessionId];
        if (transport) {
            await transport.close();
            delete transports[sessionId];
            console.log(`SSE connection for session ${sessionId} closed.`);
        } else {
            console.log(`No SSE connection found for session ${sessionId}.`);
        }
    }

    async stop_all_sse() {
        for (const sessionId in transports) {
            await this.stop_sse(sessionId);
        }
    }

    async disconnect() {
        await this.stop_all_sse();
        if (this.client) {
            this.client.close();
        }
    }
}

export default McpClient;
