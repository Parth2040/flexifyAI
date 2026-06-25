"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import CoinIcon from "@/components/CoinIcon";

interface Transaction {
  id: string;
  type: "purchase" | "spend";
  amount: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
}

function humanizeReason(reason: string): string {
  if (reason === "image_generation") return "Image generation";
  if (reason === "refund") return "Refund (failed generation)";
  if (reason.startsWith("plan:")) {
    const plan = reason.slice(5);
    return `Purchased ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`;
  }
  if (reason === "purchase") return "Credits purchased";
  return reason;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AccountPage() {
  const router = useRouter();
  const { isLoggedIn, loading: sessionLoading } = useSession();
  const [tokens, setTokens] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !isLoggedIn) router.push("/login");
  }, [sessionLoading, isLoggedIn, router]);

  useEffect(() => {
    if (sessionLoading || !isLoggedIn) return;
    Promise.all([
      fetch("/api/account").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/account/history").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([acc, hist]) => {
        if (acc && typeof acc.tokens === "number") setTokens(acc.tokens);
        if (hist && Array.isArray(hist.history)) setTransactions(hist.history);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionLoading, isLoggedIn]);

  if (sessionLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-white flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-neutral-900/60 bg-neutral-950/30 backdrop-blur-md">
        <button
          onClick={() => router.push("/")}
          className="font-serif text-lg font-semibold tracking-tight text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          flexify ai
        </button>
        <button
          onClick={() => router.push("/generate")}
          className="text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          ← Back to create
        </button>
      </header>

      <main className="flex-grow w-full max-w-2xl mx-auto px-4 py-10">
        {/* Balance card */}
        <div className="rounded-2xl border border-[#e2a85c]/25 bg-gradient-to-br from-[#e2a85c]/10 to-transparent p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-10">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-400">
              Your credits
            </p>
            <p className="text-4xl font-bold text-[#e2a85c] flex items-center gap-2 mt-1">
              <CoinIcon className="w-7 h-7" />
              {(tokens ?? 0).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => router.push("/#pricing")}
            className="bg-[#e2a85c] hover:bg-[#d4994f] active:bg-[#c68b42] text-black font-sans font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(226,168,92,0.3)] cursor-pointer whitespace-nowrap"
          >
            Buy more credits
          </button>
        </div>

        {/* Transaction history */}
        <h2 className="font-serif text-xl font-semibold text-neutral-200 mb-4">
          Transaction history
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-neutral-900 bg-[#0c0e11]">
            <p className="text-sm text-neutral-500">No transactions yet.</p>
            <p className="text-xs text-neutral-600 mt-1">
              Buy credits or generate an image and it&apos;ll show up here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {transactions.map((t) => {
              const isPurchase = t.type === "purchase";
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-neutral-900 bg-[#0c0e11] px-4 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${
                        isPurchase
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : "bg-neutral-800/60 text-neutral-400 border border-neutral-700"
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {isPurchase ? (
                          <path d="M12 5v14M5 12h14" />
                        ) : (
                          <path d="M5 12h14" />
                        )}
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-200 truncate">
                        {humanizeReason(t.reason)}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-500">
                        {formatDate(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold ${
                        isPurchase ? "text-green-400" : "text-neutral-300"
                      }`}
                    >
                      {isPurchase ? "+" : "−"}
                      {t.amount.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-mono text-neutral-600">
                      Balance: {t.balanceAfter.toLocaleString()}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
