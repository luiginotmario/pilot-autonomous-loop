import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { makeMcpServer } from "./mcp.js";

const server = makeMcpServer();
await server.connect(new StdioServerTransport());
