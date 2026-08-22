import { useState } from "react";
import {
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function DemoPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleDemo = () => {
    setIsProcessing(true);
    setCompleted(false);

    setTimeout(() => {
      setIsProcessing(false);
      setCompleted(true);
    }, 2000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_50%)]" />

      {/* Floating particles */}
      <div className="absolute left-[10%] top-[20%] h-3 w-3 animate-pulse rounded-full bg-blue-400 blur-sm" />
      <div className="absolute right-[15%] top-[30%] h-4 w-4 animate-pulse rounded-full bg-purple-400 blur-sm" />
      <div className="absolute bottom-[20%] left-[20%] h-2 w-2 animate-pulse rounded-full bg-cyan-400 blur-sm" />

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* SAARTHI CORE */}
        <div className="relative mb-10 flex h-48 w-48 items-center justify-center">
          <div className="absolute h-48 w-48 animate-spin rounded-full border border-blue-400/30" />

          <div className="absolute h-36 w-36 animate-pulse rounded-full border border-purple-400/40" />

          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 shadow-2xl shadow-blue-500/40">
            {isProcessing ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : completed ? (
              <CheckCircle2 className="h-10 w-10" />
            ) : (
              <Sparkles className="h-10 w-10" />
            )}
          </div>
        </div>

        {/* Badge */}
        <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-300 backdrop-blur">
          SAARTHI AI • DEMO MODE
        </div>

        {/* Title */}
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          THE INTERNET
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
            SHOULD ADAPT TO YOU.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          SAARTHI AI helps transform complex digital experiences into simpler,
          smarter, multilingual, and more accessible experiences.
        </p>

        {/* Demo Result */}
        {completed && (
          <div className="mt-8 max-w-xl rounded-2xl border border-green-400/20 bg-green-400/10 p-5 backdrop-blur">
            <div className="flex items-center justify-center gap-2 text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">
                SAARTHI AI Demo Completed Successfully
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-300">
              This feature is currently running with demo data. Real AI and
              backend services can be connected in the next version.
            </p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleDemo}
          disabled={isProcessing}
          className="mt-8 flex items-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-slate-950 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              SAARTHI IS PROCESSING...
            </>
          ) : completed ? (
            <>
              RUN AGAIN
              <Play className="h-5 w-5" />
            </>
          ) : (
            <>
              EXPERIENCE SAARTHI
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Features */}
        <div className="mt-14 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["WEBSITE", "Analyze accessibility and identify barriers."],
            ["DOCUMENT", "Understand complex documents easily."],
            ["AI ASSISTANT", "Get intelligent accessibility guidance."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur transition hover:-translate-y-1 hover:border-blue-400/40"
            >
              <h3 className="font-bold text-blue-300">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}