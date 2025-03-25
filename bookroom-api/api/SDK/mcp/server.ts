import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
    Tool,
    ListPromptsRequestSchema,
    GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { zodToJsonSchema } from "zod-to-json-schema"
const transports: { [sessionId: string]: SSEServerTransport } = {};

class McpServer {
    private server: Server;
    private tools: Set<Tool> = new Set();
    constructor(ops: any) {
        const { name, apiKey, host, version = "1.0.0" } = ops;
        if (!name) throw new Error("No Name provided");
        if (!apiKey) throw new Error("No API Key provided");
        if (!host) throw new Error("No Host provided");
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
    async add_tool(tool: any) {
        this.tools.add(tool);
    }

    async start_sse(endpoint: string, res: any) {
        const transport = new SSEServerTransport(endpoint, res);
        transports[transport.sessionId] = transport;
        this.server.connect(transport);
        transport.onclose = () => {
            delete transports[transport.sessionId];
        };
        res.on("close", () => {
            delete transports[transport.sessionId];
        });
    }
    async send_message(sessionId: string, message: any) {
        const transport = transports[sessionId];
        if (transport) {
            await transport.send(message);
            return true;
        }
        return false;
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
        await this.server.close();
    }
}

export default McpServer;
