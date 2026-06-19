"use client";

import { useState, useEffect } from "react";

interface PrebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = "form" | "success";

export default function PrebookModal({ isOpen, onClose }: PrebookModalProps) {
  const [step, setStep] = useState<ModalStep>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Real-time click counters
  const [prebookCount, setPrebookCount] = useState<number | null>(null);
  const [signupCount, setSignupCount] = useState<number | null>(null);

  // Fetch metrics when the modal is opened
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/metrics");
        if (res.ok) {
          const data = await res.json();
          setPrebookCount(data.prebook);
          setSignupCount(data.yes); // Map the "yes" metric database counter to signups count
        }
      } catch (err) {
        console.error("Failed to load metrics:", err);
      }
    };
    if (isOpen) {
      fetchMetrics();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit waitlist signup to database
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Track signup metric (mapped as yes metric in DB)
        if (signupCount !== null) {
          setSignupCount(signupCount + 1);
        }
        try {
          await fetch("/api/metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ metric: "yes" }),
          });
        } catch (metricErr) {
          console.error("Failed to track signup metric:", metricErr);
        }

        setStep("success");
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setErrorMsg("Connection error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setErrorMsg("");
    setStep("form");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={resetForm}
      />

      {/* Card Container */}
      <div
        className="relative w-full max-w-[420px] bg-[#0c0e12] border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-2xl z-10 flex flex-col gap-5"
      >
        {/* Close Button */}
        <button
          onClick={resetForm}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer z-30"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* STEP 1: Name & Email Form */}
        {step === "form" && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                Prebook your spot
              </h3>
              <p className="text-xs text-neutral-400">
                Enter your details to secure early access features and discount packages.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errorMsg && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-500">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isSubmitting}
                  className="w-full bg-[#121417] hover:bg-[#15181c] border border-neutral-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-500">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  className="w-full bg-[#121417] hover:bg-[#15181c] border border-neutral-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl font-sans font-bold text-sm transition-all cursor-pointer text-center shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
              >
                {isSubmitting ? "Submitting..." : "Notify me"}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Success State */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-indigo-950 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
              You're on the list!
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-[280px]">
              Thank you for signing up. We'll email you as soon as early access spots open up.
            </p>
            <button
              onClick={resetForm}
              className="mt-4 px-6 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-xl text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Real-time Click Metrics Footer */}
        {prebookCount !== null && signupCount !== null && (
          <div className="border-t border-neutral-900/45 pt-4 mt-2 text-center font-mono text-[10px] text-neutral-500 flex justify-center gap-4 select-none">
            <span>Prebook clicks: <strong className="text-neutral-400 font-semibold">{prebookCount}</strong></span>
            <span className="text-neutral-800">|</span>
            <span>Signups: <strong className="text-neutral-400 font-semibold">{signupCount}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
