"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SectionEyebrowProps {
  text: string;
}

export default function SectionEyebrow({ text }: SectionEyebrowProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.p
      className="font-mono text-xs tracking-[0.25em] uppercase text-gold mb-4"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      {text}
    </motion.p>
  );
}
