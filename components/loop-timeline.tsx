import type { FeedbackMessage } from "@/lib/demo-loop";

export function LoopTimeline({ messages }: { messages: FeedbackMessage[] }) {
  return <ol className="divide-y divide-zinc-200/80">{messages.map((message) => <li key={message.id} className="flex gap-3 px-5 py-5 sm:px-7"><span className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${message.kind === "persona" ? "bg-zinc-900 text-white" : message.kind === "observer" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>{message.initials}</span><div><div className="flex items-center gap-2"><span className="text-sm font-semibold text-zinc-900">{message.author}</span>{message.kind !== "persona" && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{message.kind}</span>}</div><p className="mt-1.5 max-w-xl text-[15px] leading-6 text-zinc-600">{message.body}</p></div></li>)}</ol>;
}
