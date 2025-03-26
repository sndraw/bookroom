import { FastMCP } from "fastmcp"

// import { zodToJsonSchema } from "zod-to-json-schema"
class McpServer {
    public server: FastMCP;
    constructor(ops: any) {
        const { name = "MCP Server", version = "1.0.0" } = ops;
        const server = new FastMCP(
            {
                name,
                version,
            }
        );
        this.server = server;
    }
}

export default McpServer;
