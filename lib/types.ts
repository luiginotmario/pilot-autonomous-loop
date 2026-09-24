export type TestMode = "artifact" | "agent";
export type TestStatus = "queued" | "running" | "complete" | "failed";

export type Persona = {
  id: string;
  name: string;
  description: string;
  goal: string;
  patience: "low" | "medium" | "high";
};

export type TranscriptTurn = {
  speaker: "persona" | "product";
  content: string;
  sentiment: number;
};

export type PersonaResult = {
  persona: Persona;
  turns: TranscriptTurn[];
  verdict: "would use" | "maybe" | "would not use";
  dropOff?: string;
  finding: string;
};

export type PilotReport = {
  id: string;
  title: string;
  mode: TestMode;
  status: TestStatus;
  createdAt: string;
  personas: PersonaResult[];
  events: string[];
  summary?: string;
  error?: string;
};

export type CreateTestInput = {
  mode: TestMode;
  source: string;
  personaCount: number;
  title?: string;
};
