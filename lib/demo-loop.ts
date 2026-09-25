export type FeedbackMessage = { id: string; author: string; initials: string; kind: "persona" | "observer" | "agent"; body: string };

export const demoLoop = {
  title: "Launch reliability", iteration: 3,
  messages: [
    { id: "1", author: "Beth", initials: "BE", kind: "persona", body: "I need proof that this catches something before I give it access to a real release." },
    { id: "2", author: "Daryl", initials: "DA", kind: "persona", body: "I understand the promise, but I still cannot tell what happens after I connect a repository." },
    { id: "3", author: "Observer", initials: "AI", kind: "observer", body: "Both users stop at the same decision: they need to see a concrete failure before committing access. I isolated this as the primary drop-off." },
    { id: "4", author: "Build agent", initials: "BA", kind: "agent", body: "I made one contained change: the empty state now shows a sample failed check and a clear next action. The preview is ready for review." },
  ] satisfies FeedbackMessage[],
  proposal: {
    title: "Show a sample failure before connection", summary: "A small first-run change responding to the shared user drop-off.",
    before: { eyebrow: "Before", heading: "Connect your repository", body: "Start a reliability check on your next release.", action: "Connect repository" },
    after: { eyebrow: "After", heading: "A failure you would have caught", body: "The checkout retry exhausted after 3 attempts. See how the check works, then connect your release.", action: "Run sample check" },
  },
};
