"use client";

import { motion, useReducedMotion } from "framer-motion";
import RotatingText from "./RotatingText";
import AnimatedCounter from "./AnimatedCounter";
import BeforeAfterCompare from "./BeforeAfterCompare";
import { useGetStarted } from "@/hooks/useGetStarted";

const rotatingLines = [
  "To stand in front of Petra without booking a single flight",
  "To pull up in a car you\u2019ll never have to insure",
  "To get the photo before you ever get the passport",
  "A new backdrop. Still unmistakably you.",
  "Your face, dropped into someone else\u2019s highlight reel",
];

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const handleHeroGetStarted = useGetStarted();

  const ease = [0.22, 1, 0.36, 1] as const;

  const fadeUp = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease },
        };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Subtle radial glow */}
      <div
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(215,173,102,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Eyebrow */}
            <motion.p
              className="font-mono text-xs tracking-[0.25em] uppercase text-gold"
              {...fadeUp(0)}
            >
              Image Generation &middot; Ultra-Realistic
            </motion.p>

            {/* Headline */}
            <motion.h1
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] text-parchment"
              {...fadeUp(0.15)}
            >
              Picture yourself
              <br />
              anywhere.
              <br />
              <span className="text-gold">Generated in seconds.</span>
            </motion.h1>

            {/* Rotating subhead */}
            <motion.div {...fadeUp(0.3)}>
              <RotatingText lines={rotatingLines} interval={3200} />
            </motion.div>

            {/* CTA */}
            <motion.div className="flex flex-col sm:flex-row items-start gap-5" {...fadeUp(0.45)}>
              <a
                href="#"
                onClick={handleHeroGetStarted}
                className="btn-gold text-base animate-pulse-gold"
              >
                Get Started
              </a>
            </motion.div>

            {/* Live stat */}
            <motion.p
              className="text-sm text-mist flex items-center gap-2"
              {...fadeUp(0.55)}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <AnimatedCounter target={308412} prefix="+" suffix=" images generated" duration={2500} />
            </motion.p>
          </div>

          {/* Right — Modern Before/After Visual */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={
              prefersReducedMotion
                ? {}
                : { opacity: 0, y: 40, scale: 0.95 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease }}
          >
            <div className="w-full max-w-lg lg:max-w-xl rounded-2xl overflow-hidden bg-[#0c0e12] border border-white/[0.06] shadow-2xl shadow-black/60">
              <BeforeAfterCompare
                beforeImage="/before-after/paris-before.jpg"
                afterImage="/before-after/paris-after.jpg"
                beforeAlt="Before: your selfie"
                afterAlt="After: in front of the Eiffel Tower"
                className="w-full h-[340px] sm:h-[460px]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
