"use client";

import { useState } from "react";
import { Circle, ChevronDown } from "lucide-react";
import { LoopTimeline } from "@/components/loop-timeline";
import { IterationPreview } from "@/components/iteration-preview";
import { demoLoop } from "@/lib/demo-loop";

export default function Home() {
  const [iteration, setIteration] = useState(demoLoop.iteration);
  return <main className="min-h-screen bg-white text-zinc-900"><header className="flex h-16 items-center justify-between border-b border-zinc-200 px-5 sm:px-7"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-zinc-900 text-sm font-black tracking-[-.1em] text-white">P</span><span className="text-base font-semibold tracking-tight">PILOT</span></div><button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100">{demoLoop.title}<ChevronDown className="size-4" /></button><span className="hidden text-sm text-zinc-500 sm:block">Iteration {iteration}</span></header><div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(340px,.75fr)_minmax(520px,1.25fr)]"><aside className="border-b border-zinc-200 bg-white lg:border-b-0 lg:border-r"><div className="flex items-center justify-between px-5 py-5 sm:px-7"><div><p className="text-xs font-semibold uppercase tracking-[.13em] text-zinc-500">Feedback loop</p><p className="mt-1 text-sm text-zinc-500">Humans, observer, build agent</p></div><Circle className="size-2.5 fill-emerald-500 text-emerald-500" /></div><LoopTimeline messages={demoLoop.messages} /></aside><IterationPreview proposal={demoLoop.proposal} onDecision={(decision) => { if (decision === "approved") setIteration((value) => value + 1); }} /></div></main>;
}
