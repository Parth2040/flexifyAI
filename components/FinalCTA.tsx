"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function FinalCTA() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(215,173,102,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-parchment mb-6"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
        >
          Your turn to create.
        </motion.h2>

        <motion.p
          className="text-mist text-base md:text-lg mb-10 leading-relaxed"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Join thousands of people generating their next favorite photo right
          now.
        </motion.p>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <a href="#" className="btn-gold text-base animate-pulse-gold">
            Get started now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
