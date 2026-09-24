import { createConversation, nextPersonaTurn } from "./persimmon.js";
import type { CreateTestInput, Persona, PersonaResult, PilotReport, TranscriptTurn } from "./types.js";

const reports = new Map<string, PilotReport>();

const profiles: Omit<Persona, "id">[] = [
  { name: "Maya", description: "Busy operations lead. Wants clarity, hates setup work, and abandons vague products fast.", goal: "Find whether this saves time this week.", patience: "low" },
  { name: "Jon", description: "Skeptical staff engineer. Tests edge cases, asks exact questions, dislikes marketing language.", goal: "Understand what can break and why.", patience: "high" },
  { name: "Leah", description: "Curious solo founder with limited technical context. Optimistic but easily overwhelmed.", goal: "Decide if this feels simple enough to try.", patience: "medium" },
  { name: "Drew", description: "Blunt procurement manager. Risk-conscious, price-sensitive, and suspicious of unproven claims.", goal: "Find a reason not to trust it.", patience: "low" },
  { name: "Sofia", description: "Power user who enjoys new tools but expects thoughtful defaults and fast feedback.", goal: "See if the workflow rewards exploration.", patience: "medium" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function titleFor(input: CreateTestInput) {
  if (input.title?.trim()) return input.title.trim();
  try { return new URL(input.source).hostname; } catch { return "Untitled concept"; }
}

function record(report: PilotReport, event: string) {
  report.events.push(event);
}

async function artifactContext(source: string) {
  if (!source.startsWith("http")) return source;
  const response = await fetch(source, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`Could not read ${source} (${response.status})`);
  const html = await response.text();
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 12_000);
}

function mockResult(persona: Persona, mode: CreateTestInput["mode"]): PersonaResult {
  const complaint = mode === "agent" ? "I still do not know what the agent will do with my request." : "I cannot tell what happens after I try it.";
  return {
    persona,
    turns: [
      { speaker: "persona", content: "What is the first useful thing I can do here?", sentiment: 0.25 },
      { speaker: "product", content: "The product explains its core workflow, but leaves the next step implicit.", sentiment: 0.02 },
      { speaker: "persona", content: complaint, sentiment: -0.5 },
    ],
    verdict: "maybe",
    dropOff: "First meaningful action is not obvious",
    finding: "The value proposition lands, but the first action needs to be explicit.",
  };
}

async function callAgent(endpoint: string, message: string, persona: Persona) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, persona: { name: persona.name, description: persona.description } }),
  });
  if (!response.ok) throw new Error(`Agent endpoint returned ${response.status}`);
  const payload = (await response.json()) as Record<string, unknown>;
  return String(payload.content ?? payload.message ?? payload.reply ?? "No response returned.");
}

async function runPersona(input: CreateTestInput, persona: Persona, context: string): Promise<PersonaResult> {
  if (!process.env.PERSIMMON_API_KEY) return mockResult(persona, input.mode);
  const productName = "Product";
  const conversation = await createConversation(
    `You are evaluating this ${input.mode === "agent" ? "agent" : "product artifact"}:\n${context}\nStay in character. Your replies should reveal genuine uncertainty, friction, interest, or skepticism.`,
    [
      { name: persona.name, description: `${persona.description} Goal: ${persona.goal}` },
      { name: productName, description: "The product under evaluation. Its messages are supplied by the evaluation harness.", generate_content: false },
    ],
  );
  const history: { name: string; content: string }[] = [{ name: productName, content: input.mode === "artifact" ? "You have just encountered this page. What do you make of it?" : "You can now message the agent." }];
  const turns: TranscriptTurn[] = [];

  for (let step = 0; step < 2; step++) {
    const simulated = await nextPersonaTurn(conversation.id, persona.name, history);
    const message = simulated.content ?? "";
    history.push({ name: persona.name, content: message });
    turns.push({ speaker: "persona", content: message, sentiment: step === 0 ? 0.1 : -0.1 });
    const productReply = input.mode === "agent"
      ? await callAgent(input.source, message, persona)
      : "You are reading the product information above. Continue evaluating whether it is concrete enough to try.";
    history.push({ name: productName, content: productReply });
    turns.push({ speaker: "product", content: productReply, sentiment: 0 });
  }
  const last = turns.at(-2)?.content ?? "";
  const negative = /confus|don't|do not|unclear|can't|cannot|why/i.test(last);
  return {
    persona,
    turns,
    verdict: negative ? "would not use" : "maybe",
    dropOff: negative ? "Confidence falls after the second exchange" : undefined,
    finding: negative ? "This persona could not connect the product response to their goal." : "Interested, but needs one more concrete proof point.",
  };
}

function summary(personas: PersonaResult[]) {
  const no = personas.filter((result) => result.verdict === "would not use").length;
  const dropOffs = personas.filter((result) => result.dropOff).length;
  return `${no ? `${no} persona${no === 1 ? "" : "s"} would not use this yet.` : "No immediate rejection."} ${dropOffs} drop-off moment${dropOffs === 1 ? "" : "s"} surfaced across the swarm.`;
}

export function createTest(input: CreateTestInput) {
  const report: PilotReport = { id: uid(), title: titleFor(input), mode: input.mode, status: "queued", createdAt: new Date().toISOString(), personas: [], events: [] };
  reports.set(report.id, report);
  return report;
}

export async function runTest(id: string, input: CreateTestInput, onEvent?: (event: string) => void) {
  const report = reports.get(id);
  if (!report) throw new Error("Test not found");
  report.status = "running";
  const emit = (event: string) => { record(report, event); onEvent?.(event); };
  try {
    const context = input.mode === "artifact" ? await artifactContext(input.source) : input.source;
    const chosen: Persona[] = Array.from({ length: input.personaCount }, (_, index) => ({ ...profiles[index % profiles.length]!, id: `p${index + 1}` }));
    emit(`Context ready. Sending ${chosen.length} people in.`);
    for (const persona of chosen) {
      emit(`${persona.name} is exploring`);
      const result = await runPersona(input, persona, context);
      report.personas.push(result);
      emit(`${persona.name}: ${result.verdict}`);
    }
    report.summary = summary(report.personas);
    report.status = "complete";
    emit("Report ready");
  } catch (error) {
    report.status = "failed";
    report.error = error instanceof Error ? error.message : "The test failed.";
    emit(report.error);
  }
  return report;
}

export function getReport(id: string) {
  return reports.get(id) ?? null;
}
