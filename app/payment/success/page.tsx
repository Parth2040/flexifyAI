"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CoinIcon from "@/components/CoinIcon";

/**
 * Polar redirects here after a successful one-time purchase. The actual credit
 * happens via the webhook, which may lag a second or two — so we poll the
 * balance a couple of times.
 */
export default function PaymentSuccessPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<number | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("/api/account")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d.tokens === "number") setTokens(d.tokens);
        })
        .catch(() => {});
    load();
    const t1 = setTimeout(load, 2500);
    const t2 = setTimeout(load, 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#e2a85c]/15 border border-[#e2a85c]/40 flex items-center justify-center text-[#e2a85c] mb-6">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl font-semibold mb-2">Payment successful</h1>
      <p className="text-sm text-neutral-400 max-w-sm mb-6">
        Thanks for your purchase! Your credits are being added to your account.
      </p>

      <div className="flex items-center gap-2 text-[#e2a85c] bg-[#e2a85c]/10 border border-[#e2a85c]/30 px-4 py-2 rounded-full mb-8">
        <CoinIcon className="w-4 h-4" />
        <span className="font-semibold">
          {tokens === null ? "Updating balance…" : `${tokens.toLocaleString()} credits`}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/generate")}
          className="px-6 py-3 bg-[#e2a85c] hover:bg-[#d4994f] text-black rounded-xl font-bold text-sm transition-all cursor-pointer shadow-[0_4px_20px_rgba(226,168,92,0.25)]"
        >
          Start creating
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-transparent border border-neutral-800 text-white hover:border-neutral-600 rounded-xl font-medium text-sm transition-all cursor-pointer"
        >
          Home
        </button>
      </div>
    </div>
  );
}
