const API_BASE = "https://api.persimmon.humansand.ai/v1";

type Participant = { name: string; description: string; generate_content?: boolean };
type Turn = { name: string; content: string };

function apiKey() {
  const key = process.env.PERSIMMON_API_KEY;
  if (!key) throw new Error("PERSIMMON_API_KEY is not configured. Add it to .env.local to run live users.");
  return key;
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Persimmon ${response.status}: ${detail || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function createConversation(setting: string, participants: Participant[]) {
  return request<{ id: string }>("/conversations", {
    method: "POST",
    body: JSON.stringify({ model: "persimmon-v0.1", setting, participants }),
  });
}

export async function nextPersonaTurn(conversationId: string, name: string, turns: Turn[]) {
  return request<{ name: string; content: string | null }>(`/conversations/${conversationId}/turns`, {
    method: "POST",
    body: JSON.stringify({ turns, speaker: name, max_tokens: 260 }),
  });
}
