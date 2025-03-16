import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
class McpClient {
    // private client: Client;
    // constructor() {
    //     this.client = new Client({
    //         transport: new StdioClientTransport(),
    //     });
    // }
    // async queryMcpList() {
    //     const result = await this.client.query("mcp.list");
    //     return result.data;
    // }
}

export default McpClient;
