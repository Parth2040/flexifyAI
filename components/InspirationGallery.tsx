"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import SectionEyebrow from "./SectionEyebrow";

export default function InspirationGallery() {
  const [showAll, setShowAll] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <SectionEyebrow text="Inspiration Gallery" />

        <motion.h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-parchment mb-4"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          Out of ideas? Start here.
        </motion.h2>

        <motion.p
          className="text-mist text-base md:text-lg max-w-2xl mb-12 leading-relaxed"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          250+ ready-made scenes, organized by vibe — jet-setter, landmark
          hopper, supercar owner, yacht life. Pick one, drop in your photo, done.
        </motion.p>

        {/* ── Visual Animated Image Gallery (Symmetric 5-column layout) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-16 items-end">

          {/* Left-1 (Coming from left) */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
          >
            <img
              src="/inspirations/left-1.jpg"
              alt="Inspiration layout"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>

          {/* Left-2 (Coming from left with small delay) */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
          >
            <img
              src="/inspirations/left-2.jpg"
              alt="Inspiration layout"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>

          {/* Center (Coming from bottom to center - featured slightly taller) */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/4.4] overflow-hidden rounded-2xl border border-gold/25 bg-neutral-900/40 shadow-2xl shadow-gold/5 group cursor-pointer z-10 sm:col-span-1 col-span-2"
          >
            <img
              src="/inspirations/center.jpg"
              alt="Inspiration layout center"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-mono text-[10px] text-gold uppercase tracking-widest font-semibold">
                Explore Vibe
              </span>
            </div>
          </motion.div>

          {/* Right-1 (Coming from right with small delay) */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
          >
            <img
              src="/inspirations/right-1.jpg"
              alt="Inspiration layout"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>

          {/* Right-2 (Coming from right) */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
          >
            <img
              src="/inspirations/right-2.jpg"
              alt="Inspiration layout"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>

          <AnimatePresence>
            {showAll && (
              <>
                {/* New-1 */}
                <motion.div
                  key="new-1"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
                >
                  <img
                    src="/inspirations/new-1.jpg"
                    alt="Inspiration layout new 1"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                {/* New-2 */}
                <motion.div
                  key="new-2"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
                >
                  <img
                    src="/inspirations/new-2.jpg"
                    alt="Inspiration layout new 2"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                {/* New-3 */}
                <motion.div
                  key="new-3"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4.4] overflow-hidden rounded-2xl border border-gold/25 bg-neutral-900/40 shadow-2xl shadow-gold/5 group cursor-pointer z-10 sm:col-span-1 col-span-2"
                >
                  <img
                    src="/inspirations/new-3.jpg"
                    alt="Inspiration layout new center"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-mono text-[10px] text-gold uppercase tracking-widest font-semibold">
                      Explore Vibe
                    </span>
                  </div>
                </motion.div>

                {/* New-4 */}
                <motion.div
                  key="new-4"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
                >
                  <img
                    src="/inspirations/new-4.jpg"
                    alt="Inspiration layout new 4"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                {/* New-5 */}
                <motion.div
                  key="new-5"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
                >
                  <img
                    src="/inspirations/new-5.jpg"
                    alt="Inspiration layout new 5"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                {/* New-6 */}
                <motion.div
                  key="new-6"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
                >
                  <img
                    src="/inspirations/new-6.png"
                    alt="Inspiration layout new 6"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                {/* New-7 */}
                <motion.div
                  key="new-7"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
                >
                  <img
                    src="/inspirations/new-7.png"
                    alt="Inspiration layout new 7"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                {/* New-8 */}
                <motion.div
                  key="new-8"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4.4] overflow-hidden rounded-2xl border border-gold/25 bg-neutral-900/40 shadow-2xl shadow-gold/5 group cursor-pointer z-10 sm:col-span-1 col-span-2"
                >
                  <img
                    src="/inspirations/new-8.png"
                    alt="Inspiration layout new center 2"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="font-mono text-[10px] text-gold uppercase tracking-widest font-semibold">
                      Explore Vibe
                    </span>
                  </div>
                </motion.div>

                {/* New-9 */}
                <motion.div
                  key="new-9"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
                >
                  <img
                    src="/inspirations/new-9.png"
                    alt="Inspiration layout new 9"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                {/* New-10 */}
                <motion.div
                  key="new-10"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-neutral-900/40 shadow-xl group cursor-pointer"
                >
                  <img
                    src="/inspirations/new-10.png"
                    alt="Inspiration layout new 10"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Footer note */}
        <motion.p
          className="font-mono text-xs text-mist/60 text-center mb-8"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          250+ inspirations &middot; updated every week
        </motion.p>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-gold cursor-pointer"
          >
            {showAll ? "Show less" : "Browse inspirations"}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
