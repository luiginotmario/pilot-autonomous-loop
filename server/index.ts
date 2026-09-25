import express from "express";
import { resolve } from "node:path";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createTest, getReport, runTest } from "../lib/pilot.js";
import { makeMcpServer } from "./mcp.js";
import type { CreateTestInput } from "../lib/types.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use((_request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", process.env.WEB_ORIGIN ?? "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});
app.options("/{*path}", (_request, response) => response.sendStatus(204));

function input(body: unknown): CreateTestInput {
  const value = body as Partial<CreateTestInput>;
  if ((value.mode !== "artifact" && value.mode !== "agent") || !value.source?.trim()) throw new Error("mode and source are required");
  return { mode: value.mode, source: value.source.trim(), personaCount: Math.min(20, Math.max(2, Number(value.personaCount) || 5)), title: value.title };
}

app.get("/health", (_request, response) => response.json({ ok: true }));
app.get("/tests/:id", (request, response) => {
  const report = getReport(request.params.id);
  if (!report) return response.status(404).json({ error: "Report not found" });
  return response.json(report);
});
app.post("/tests/stream", async (request, response) => {
  let test: CreateTestInput;
  try { test = input(request.body); } catch (error) { return response.status(400).json({ error: error instanceof Error ? error.message : "Invalid test" }); }
  const report = createTest(test);
  response.status(200).set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  response.flushHeaders();
  const send = (event: string, data: unknown) => response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  send("created", { id: report.id });
  await runTest(report.id, test, (message) => send("progress", { message }));
  send("complete", getReport(report.id));
  response.end();
});
app.all("/mcp", async (request, response) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = makeMcpServer();
  await server.connect(transport);
  await transport.handleRequest(request, response, request.body);
  response.on("close", () => { void transport.close(); void server.close(); });
});

const client = resolve(process.cwd(), "dist/client");
app.use(express.static(client));
app.get("/{*path}", (_request, response) => response.sendFile(resolve(client, "index.html")));
const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`PILOT API listening on ${port}`));
