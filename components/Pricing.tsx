"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

const plans = [
  {
    name: "Pro Weekly",
    price: "€2.99",
    period: "/ week",
    subPrice: "~€13.00/month",
    credits: "500 credits · 10 images / week",
    features: [
      "AI image generation",
      "Ultra-realistic output (4K)",
      "Very fast turnaround",
      "Access to every preset collection",
      "24/7 support",
    ],
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro Weekly",
    price: "€5.99",
    period: "/ week",
    subPrice: "~€26.00/month",
    credits: "10,000 credits · 200 images / week",
    features: [
      "AI image generation",
      "Ultra-realistic output (4K)",
      "Very fast turnaround",
      "Access to every preset collection",
      "24/7 support",
    ],
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro Annual",
    price: "€59.99",
    period: "/ year",
    subPrice: "~€4.99/month",
    credits: "1,650 credits/month · 33 images / month",
    features: [
      "AI image generation",
      "Ultra-realistic output (4K)",
      "Very fast turnaround",
      "Access to every preset collection",
      "24/7 support",
    ],
    highlighted: false,
    badge: null,
  },
];

export default function Pricing() {
  const prefersReducedMotion = useReducedMotion();
  const setPrebookOpen = useAuthStore((state) => state.setPrebookOpen);

  const handleChoosePlan = async (e: React.MouseEvent, planName: string) => {
    e.preventDefault();
    setPrebookOpen(true);
    try {
      await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric: "prebook" }),
      });
    } catch (err) {
      console.error("Failed to track prebook click:", err);
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
          Full access either way. Cancel anytime. Payments handled securely by Stripe.
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
              className={`relative rounded-3xl bg-[#0f1115] p-8 flex flex-col justify-between transition-all duration-300 min-h-[560px] ${plan.highlighted
                ? "border border-indigo-500/80 shadow-[0_0_40px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500/50"
                : "border border-neutral-900"
                }`}
            >
              {/* Highlight Badge */}
              {plan.highlighted && plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-mono text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-indigo-400/40">
                  {plan.badge}
                </div>
              )}

              {/* Plan Header & Credits Info */}
              <div>
                <h3 className="font-sans text-2xl font-bold text-white mb-4">
                  {plan.name}
                </h3>

                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-sans text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="font-sans text-sm text-neutral-500">
                    {plan.period}
                  </span>
                </div>

                <p className="font-mono text-xs text-neutral-500 mb-4">
                  {plan.subPrice}
                </p>

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
                {plan.highlighted ? (
                  <button
                    onClick={(e) => handleChoosePlan(e, plan.name)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.45)] cursor-pointer text-center"
                  >
                    CHOOSE THIS PLAN
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleChoosePlan(e, plan.name)}
                    className="w-full py-4 bg-transparent border border-neutral-800 text-indigo-400 hover:text-indigo-300 hover:border-neutral-700 rounded-full font-bold text-sm transition-all cursor-pointer text-center"
                  >
                    Choose this plan
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
