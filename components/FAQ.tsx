"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const faqItems = [
  {
    question: "What is flexify ai?",
    answer:
      "A tool that takes one photo of you and places you, convincingly, into scenes you\u2019d otherwise need a private jet or a passport to reach \u2014 landmarks, supercars, yachts, and more.",
  },
  {
    question: "How does the generation actually work?",
    answer:
      "You upload a clear photo and describe the scene you want. The model rebuilds everything around your face \u2014 the location, lighting, clothing, and pose \u2014 while keeping your actual features intact.",
  },
  {
    question: "What kinds of images can I create?",
    answer:
      "Travel landmarks like the Eiffel Tower, Petra, or Machu Picchu, luxury settings like private jets and yachts, and a constantly updated library of other premium scenes.",
  },
  {
    question: "Will it still look like me?",
    answer:
      "Yes \u2014 that\u2019s the whole point. The system is built to preserve your face precisely while changing everything around it.",
  },
  {
    question: "Can AI-detection tools flag these as fake?",
    answer:
      "Output is tuned to avoid the common artifacts that detection tools look for, but no system can guarantee a 100% pass rate forever as detection tools evolve. Treat results as social-media-ready, not as evidence in a legal dispute.",
  },
  {
    question: "Can I post these on Instagram, TikTok, or Snapchat?",
    answer:
      "Yes, that\u2019s exactly what they\u2019re designed for \u2014 full resolution, no watermark, ready to post.",
  },
  {
    question: "What does it cost?",
    answer:
      "Plans start at a few dollars a week. See the Pricing section above for current tiers and credit allowances.",
  },
  {
    question: "Do you keep or share my photos?",
    answer:
      "Uploaded photos are used only to generate your images and are not sold or shared with third parties. (Link to your actual privacy policy here \u2014 don\u2019t ship this claim without a real policy behind it.)",
  },

  {
    question: "How is this different from regular photo editing?",
    answer:
      "A normal editor still needs the original background, lighting, and props to exist somewhere. This generates all of that from a text description \u2014 no photoshoot, no props, no editing skills required.",
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: (typeof faqItems)[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="border-b border-gold/10"
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <button
        className="w-full flex items-center justify-between py-5 text-left group cursor-pointer"
        onClick={onToggle}
        aria-expanded={isOpen}
        id={`faq-trigger-${index}`}
        aria-controls={`faq-content-${index}`}
      >
        <span className="font-sans text-base font-medium text-parchment group-hover:text-gold transition-colors pr-4">
          {item.question}
        </span>
        <motion.span
          className="flex-shrink-0 text-gold"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-gold"
          >
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-content-${index}`}
            role="region"
            aria-labelledby={`faq-trigger-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="overflow-hidden"
          >
            <p className="text-mist text-sm leading-relaxed pb-5 pr-8">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section id="faq" className="section-padding">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-parchment mb-4 text-center"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          Questions, answered
        </motion.h2>

        <motion.p
          className="text-mist text-base md:text-lg text-center mb-12 leading-relaxed"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Everything you&apos;d want to know before you upload your first photo.
        </motion.p>

        <div>
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
