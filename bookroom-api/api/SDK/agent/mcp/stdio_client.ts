import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

const transports: { [sessionId: string]: StdioClientTransport } = {};

class McpClient {
    private client: Client;
    constructor(ops: any) {
        const { name, host, version = "1.0.0" } = ops;
        if (!name) throw new Error("缺少客户端名称");
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
    async start_stdio(sessionId: string) {
        const currentWorkingDirectory = process.cwd();
        const serverPath = path.join(currentWorkingDirectory, "stdio_server.js");
        const transport = new StdioClientTransport({
            command: "node",
            args: [serverPath],
          });
          
        transports[sessionId] = transport;
        await this.client.connect(transport);
    }

    async stop_stdio(sessionId: string) {
        const transport = transports[sessionId];
        if (transport) {
            await transport.close();
            delete transports[sessionId];
            console.log(`SSE connection for session ${sessionId} closed.`);
        } else {
            console.log(`No SSE connection found for session ${sessionId}.`);
        }
    }

    async stop_all_stdio() {
        for (const sessionId in transports) {
            await this.stop_stdio(sessionId);
        }
    }

    async disconnect() {
        await this.stop_all_stdio();
        if (this.client) {
            this.client.close();
        }
    }
}

export default McpClient;
