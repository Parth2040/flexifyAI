"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface RotatingTextProps {
  lines: string[];
  interval?: number;
}

export default function RotatingText({ lines, interval = 3000 }: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const advance = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % lines.length);
  }, [lines.length]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <p className="font-sans text-mist text-base md:text-lg leading-relaxed min-h-[2em]">
        &ldquo;{lines[0]}&rdquo;
      </p>
    );
  }

  return (
    <div className="relative min-h-[3em] md:min-h-[2.5em]">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          className="font-sans text-mist text-base md:text-lg leading-relaxed absolute inset-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          &ldquo;{lines[currentIndex]}&rdquo;
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
