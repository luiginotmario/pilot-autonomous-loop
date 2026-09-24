import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createTest, getReport, runTest } from "../lib/pilot.js";

const testInput = {
  mode: z.enum(["artifact", "agent"]),
  source: z.string().min(1),
  personaCount: z.number().int().min(2).max(20).default(5),
  title: z.string().optional(),
};

export function makeMcpServer() {
  const server = new McpServer({ name: "pilot", version: "0.1.0" });
  server.tool("create_test", "Create a simulated-user test.", testInput, async (input) => {
    const report = createTest(input);
    return { content: [{ type: "text", text: JSON.stringify({ id: report.id, status: report.status }) }] };
  });
  server.tool("run_test", "Run a created test and return its report.", { id: z.string(), ...testInput }, async ({ id, ...input }) => {
    const report = await runTest(id, input);
    return { content: [{ type: "text", text: JSON.stringify(report) }] };
  });
  server.tool("get_report", "Retrieve a test report by ID.", { id: z.string() }, async ({ id }) => {
    const report = getReport(id);
    return { content: [{ type: "text", text: report ? JSON.stringify(report) : "Report not found" }], isError: !report };
  });
  return server;
}
