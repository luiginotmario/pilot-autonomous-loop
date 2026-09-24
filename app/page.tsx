"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Circle, Code2, ExternalLink, GitPullRequest, MessageSquare, MoreHorizontal, Play, RotateCcw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { person: "Beth" | "Daryl" | "Observer"; initials: string; tone: "user" | "observer"; text: string; time?: string };

const opening: Message[] = [
  { person: "Beth", initials: "BE", tone: "user", text: "I’m trying to understand whether this actually helps me ship with confidence. Where do I start?" },
  { person: "Daryl", initials: "DA", tone: "user", text: "The page says it tests a release, but I can’t tell what it will actually do to my code or how long it takes." },
  { person: "Beth", initials: "BE", tone: "user", text: "I want to see a concrete failure before I connect anything. Otherwise it feels like another abstract eval tool." },
  { person: "Observer", initials: "AI", tone: "observer", text: "Signal detected: both users need a concrete first-run experience before committing. I found the friction in the empty state and proposed a small, reversible fix." },
];

export default function Home() {
  const [messages, setMessages] = useState(opening);
  const [status, setStatus] = useState<"review" | "approved" | "rejected">("review");
  const [note, setNote] = useState("");

  function decide(next: "approved" | "rejected") {
    setStatus(next);
    setMessages((items) => [...items, { person: "Observer", initials: "AI", tone: "observer", text: next === "approved" ? "Change approved. I opened a pull request and sent the preview into the next user-model round." : "Change rejected. I’ll preserve this feedback and wait for your direction before proposing another fix.", time: "now" }]);
  }

  function send() {
    if (!note.trim()) return;
    setMessages((items) => [...items, { person: "Observer", initials: "AI", tone: "observer", text: `Human note: ${note.trim()}. I’ll use this as a constraint in the next iteration.`, time: "now" }]);
    setNote("");
  }

  return <main className="min-h-screen bg-[#fbfbfa] text-[#1a1a19]">
    <header className="flex h-16 items-center justify-between border-b border-[#e6e5e1] px-5 sm:px-8"><div className="text-[1.55rem] font-black tracking-[-0.09em]">PILOT<span className="text-[#548777]">&amp;</span></div><div className="flex items-center gap-3"><span className="hidden text-sm text-[#777772] sm:block">Autonomous product loop</span><span className="size-8 rounded-full bg-[#437c6c]" /></div></header>
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[260px_minmax(0,1fr)_350px]">
      <aside className="border-r border-[#e6e5e1] px-5 py-7"><Button variant="outline" className="w-full justify-start rounded-lg border-[#d8d7d2] bg-white text-[#30302e] shadow-none"><Play className="size-3.5 fill-current" /> New loop</Button><div className="mt-9"><p className="px-2 text-[11px] font-bold uppercase tracking-[.1em] text-[#85857e]">Your loops</p><button className="mt-3 flex w-full items-start gap-3 rounded-lg bg-[#f0f1ed] px-3 py-3 text-left"><Circle className="mt-1 size-2.5 fill-[#548777] text-[#548777]" /><span><span className="block text-sm font-semibold">Launch reliability</span><span className="mt-1 block text-xs text-[#777772]">2 users · iteration 3</span></span></button><button className="mt-1 flex w-full items-start gap-3 px-3 py-3 text-left text-[#777772]"><Circle className="mt-1 size-2.5 text-[#a9a9a3]" /><span><span className="block text-sm">Onboarding flow</span><span className="mt-1 block text-xs">Paused</span></span></button></div><div className="mt-auto hidden pt-24 lg:block"><p className="text-xs leading-5 text-[#85857e]">Persimmon users retain the friction and context from the last iteration. Stop the loop when the problem changes.</p></div></aside>
      <section className="min-w-0"><div className="flex items-center justify-between border-b border-[#e6e5e1] px-6 py-6 sm:px-10"><div><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#548777]" /><h1 className="text-xl font-semibold tracking-[-.04em]">Launch reliability</h1></div><p className="mt-1 text-sm text-[#85857e]">Observing · social-1 · Persimmon</p></div><button className="rounded-md p-2 text-[#777772] hover:bg-[#f0f1ed]"><MoreHorizontal className="size-5" /></button></div>
        <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10"><div className="border-b border-[#e6e5e1] pb-7"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#85857e]">Scenario</p><p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#74746f]">A team is about to launch an internal reliability product. They need to understand the value before connecting a repository or inviting their team.</p></div><div className="space-y-7 py-9">{messages.map((message, index) => <MessageRow key={index} message={message} />)}</div>
          {status === "approved" && <div className="mb-6 flex items-center gap-2 rounded-lg border border-[#cfe1d9] bg-[#eff7f2] px-4 py-3 text-sm text-[#356754]"><Check className="size-4" /> Preview is now being tested in iteration 4.</div>}
          <div className="flex gap-3 border-t border-[#e6e5e1] pt-6"><input value={note} onChange={(event) => setNote(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Leave a constraint or ask the observer…" className="h-11 min-w-0 flex-1 rounded-lg border border-[#d8d7d2] bg-white px-3 text-sm outline-none placeholder:text-[#9a9a94] focus:border-[#548777]" /><Button onClick={send} size="icon" className="size-11 rounded-lg bg-[#1f1f1d] text-white hover:bg-[#363633]"><Send className="size-4" /></Button></div>
        </div>
      </section>
      <aside className="border-l border-[#e6e5e1] bg-white px-5 py-7"><div className="flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#85857e]">Observer proposal</p><span className="rounded-full bg-[#f6edca] px-2 py-1 text-[11px] font-medium text-[#846b1d]">Needs review</span></div><h2 className="mt-3 text-lg font-semibold tracking-[-.035em]">Make the first run tangible</h2><p className="mt-2 text-sm leading-6 text-[#73736e]">Add a prebuilt reliability check to the empty state, then invite the user to connect their own repository.</p><div className="mt-6 rounded-lg border border-[#e2e1dc] bg-[#fbfbfa] p-4"><div className="flex items-center gap-2 text-sm font-medium"><Code2 className="size-4 text-[#548777]" /> Proposed change</div><pre className="mt-4 overflow-x-auto text-xs leading-6 text-[#64645f]"><span className="text-[#568c64]">+ </span>showSampleFailure();{"\n"}<span className="text-[#568c64]">+ </span>cta = "Run this check";{"\n"}<span className="text-[#b35f54]">- </span>cta = "Connect repository";</pre></div><div className="mt-4 rounded-lg border border-[#e2e1dc] p-4"><div className="flex items-center justify-between"><span className="text-sm font-medium">Preview</span><ExternalLink className="size-4 text-[#777772]" /></div><div className="mt-3 rounded-md bg-[#17312b] p-3"><div className="h-1.5 w-12 rounded bg-[#d4ff57]" /><div className="mt-3 rounded bg-white/10 p-2"><div className="h-1.5 w-2/3 rounded bg-white/50" /><div className="mt-2 h-5 w-20 rounded bg-[#d4ff57]" /></div></div><p className="mt-3 text-xs text-[#85857e]">pilot-preview-481.onrender.com</p></div><div className="mt-5 flex gap-2">{status === "review" ? <><Button onClick={() => decide("approved")} className="flex-1 rounded-lg bg-[#1f1f1d] text-white hover:bg-[#363633]"><Check className="size-4" /> Approve</Button><Button onClick={() => decide("rejected")} variant="outline" className="rounded-lg border-[#d8d7d2] text-[#5d5d58]"><X className="size-4" /> Deny</Button></> : <Button onClick={() => setStatus("review")} variant="outline" className="w-full rounded-lg"><RotateCcw className="size-4" /> Reopen review</Button>}</div><div className="mt-7 border-t border-[#e6e5e1] pt-5"><p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#85857e]">Loop history</p><ol className="mt-4 space-y-4 text-sm"><li className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-[#548777]" /><span><b>Iteration 3</b><br /><span className="text-[#85857e]">2 users surfaced first-run uncertainty</span></span></li><li className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-[#bebeb7]" /><span><b>Iteration 2</b><br /><span className="text-[#85857e]">Copy change approved</span></span></li></ol></div></aside>
    </div>
  </main>;
}

function MessageRow({ message }: { message: Message }) {
  const observer = message.tone === "observer";
  return <article className={`flex gap-4 ${observer ? "rounded-xl border border-[#d9e6df] bg-[#f4f8f5] p-4" : ""}`}><span className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold ${observer ? "bg-[#263d36] text-[#d4ff57]" : message.person === "Beth" ? "bg-[#548777] text-white" : "bg-[#c96c4f] text-white"}`}>{message.initials}</span><div className="min-w-0"><div className="flex items-center gap-2"><p className="text-sm font-semibold">{message.person}</p>{observer && <span className="rounded bg-[#dcece4] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#467361]">Observer</span>}<span className="text-xs text-[#999993]">{message.time}</span></div><p className="mt-2 text-[15px] leading-7 text-[#373735]">{message.text}</p></div></article>;
}
