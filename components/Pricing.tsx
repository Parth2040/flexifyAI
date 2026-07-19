"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$4",
    credits: "100 Credits · 10 generations",
    features: [
      "High-quality lifestyle images",
      "Ultra-realistic output (4K)",
      "Very fast turnaround",
      "Access to every preset collection",
    ],
    highlighted: false,
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$10",
    credits: "500 Credits · 50 generations",
    features: [
      "High-quality lifestyle images",
      "Ultra-realistic output (4K)",
      "Very fast turnaround",
      "Access to every preset collection",
    ],
    highlighted: true,
    badge: "⭐ Most Popular",
  },
  {
    id: "elite",
    name: "Elite",
    price: "$80",
    credits: "6,000 Credits · 600 generations",
    features: [
      "High-quality lifestyle images",
      "Ultra-realistic output (4K)",
      "Very fast turnaround",
      "Access to every preset collection",
    ],
    highlighted: false,
    badge: null,
  },
];

export default function Pricing() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const { isLoggedIn } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const handleChoosePlan = async (planId: string) => {
    if (loadingPlan) return;
    // Must be signed in so we can attribute the purchase + credit tokens.
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setErr("");
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        // Hand off to Polar's hosted checkout.
        window.location.href = data.checkoutUrl;
      } else {
        setErr(data.error || "Could not start checkout. Please try again.");
        setLoadingPlan(null);
      }
    } catch {
      setErr("Connection error. Please try again.");
      setLoadingPlan(null);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
      },
    };

  return (
    <section id="pricing" className="section-padding bg-black/40 relative overflow-hidden">
      {/* Background radial glows matching the website's gold visual vibe */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-parchment mb-4 text-center"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          Pick your plan
        </motion.h2>

        <motion.p
          className="text-mist text-base md:text-lg max-w-xl mx-auto text-center mb-16 sm:mb-20 leading-relaxed"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          One-time payment — no subscription. Secured by Polar.
        </motion.p>

        {/* Pricing Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {plans.map((plan) => (
            <motion.div
              key={`${plan.name}-${plan.price}`}
              variants={cardVariants}
              className={`relative rounded-3xl bg-[#1a1a1a] p-6 sm:p-8 flex flex-col transition-all duration-300 ${plan.highlighted
                ? "border border-indigo-500/80 shadow-[0_0_40px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50"
                : "border border-neutral-900"
                }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border whitespace-nowrap ${plan.highlighted
                    ? "bg-indigo-600 text-white border-indigo-400/40"
                    : "bg-[#272727] text-neutral-300 border-neutral-700"
                    }`}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan Header & Credits Info */}
              <div>
                <h3 className="font-sans text-2xl font-bold text-white mb-4">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="font-sans text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    {plan.price}
                  </span>
                </div>

                <p className="font-sans text-sm text-neutral-300 leading-relaxed mb-8">
                  {plan.credits}
                </p>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="font-sans text-sm text-neutral-400 leading-relaxed">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-auto pt-4">
                <button
                  onClick={() => handleChoosePlan(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full py-4 rounded-full font-bold text-sm transition-all cursor-pointer text-center disabled:opacity-60 disabled:cursor-not-allowed ${plan.highlighted
                    ? "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white uppercase text-xs tracking-widest shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.45)]"
                    : "bg-transparent border border-neutral-800 text-indigo-400 hover:text-indigo-300 hover:border-neutral-700"
                    }`}
                >
                  {loadingPlan === plan.id ? "Redirecting…" : "Choose this plan"}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {err && (
          <p className="text-center text-sm text-red-400 mt-8">{err}</p>
        )}
      </div>
    </section>
  );
}
