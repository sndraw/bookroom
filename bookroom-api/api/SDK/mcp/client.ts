import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transports: { [sessionId: string]: any } = {};

class McpClient {
    private client: Client;
    private sseUrl: string;
    constructor(ops: any) {
        const { name, apiKey, host, version = "1.0.0" } = ops;
        if (!name) throw new Error("缺少客户端名称");
        if (!host) throw new Error("缺少主机地址");
        this.sseUrl = host;
        this.client = new Client(
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
    }
    async start_sse(sessionId: string) {
        if (!sessionId) {
            throw new Error("缺少会话ID");
        }
        if (transports[sessionId]) {
            await this.stop_sse(sessionId); // Stop any existing connection
        }
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
            await this.client.close();
        }
    }
}

export default McpClient;
