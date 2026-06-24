"use client";

import { useRouter } from "next/navigation";

/**
 * Shown if the user backs out of the Polar checkout.
 */
export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#07080b] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mb-6">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl font-semibold mb-2">Checkout canceled</h1>
      <p className="text-sm text-neutral-400 max-w-sm mb-8">
        No charge was made. You can pick a plan whenever you&apos;re ready.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/#pricing")}
          className="px-6 py-3 bg-[#e2a85c] hover:bg-[#d4994f] text-black rounded-xl font-bold text-sm transition-all cursor-pointer shadow-[0_4px_20px_rgba(226,168,92,0.25)]"
        >
          Back to pricing
        </button>
        <button
          onClick={() => router.push("/generate")}
          className="px-6 py-3 bg-transparent border border-neutral-800 text-white hover:border-neutral-600 rounded-xl font-medium text-sm transition-all cursor-pointer"
        >
          Keep creating
        </button>
      </div>
    </div>
  );
}
