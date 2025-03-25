import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
    ListPromptsRequestSchema,
    GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

class McpServer {
    private server: Server;
    private transport?: StdioServerTransport;

    constructor(ops: any) {
        const { name, apiKey, version = "1.0.0" } = ops;
        if (!name) throw new Error("No Name provided");
        const server = new Server(
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
        this.server = server;
    }
    async start_stdio() {
        const transport = new StdioServerTransport();
        this.transport = transport;
        this.server.connect(transport);
    }
    async send_message(message: any) {
        const transport = this.transport;
        if (transport) {
            await transport.send(message);
            return true;
        }
        return false;
    }
    async stop_stdio() {
        const transport = this.transport;
        if (transport) {
            await transport.close();
            console.log(`Stdio  connection closed.`);
        } else {
            console.log(`No Stdio connection found.`);
        }
    }
    async disconnect() {
        await this.server.close();
    }
}

export default McpServer;
