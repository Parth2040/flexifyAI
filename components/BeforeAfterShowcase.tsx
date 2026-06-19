"use client";

import { motion, useReducedMotion } from "framer-motion";
import BeforeAfterSlider from "./BeforeAfterSlider";

const destinations = [
  {
    label: "Supercar",
    icon: "supercar",
    beforeImage: "/before-after/supercar-before.jpg",
    afterImage: "/before-after/supercar-after.jpg",
  },
  {
    label: "Private Jet",
    icon: "private-jet",
    beforeImage: "/before-after/jet-before.jpg",
    afterImage: "/before-after/jet-after.jpg",
  },
  {
    label: "Eiffel Tower",
    icon: "colosseum",
    beforeImage: "/before-after/paris-before.jpg",
    afterImage: "/before-after/paris-after.jpg",
  },
  {
    label: "Lambo",
    icon: "supercar",
    beforeImage: "/before-after/lambo-before.jpg",
    afterImage: "/before-after/lambo-after.jpg",
  },
];

export default function BeforeAfterShowcase() {
  const prefersReducedMotion = useReducedMotion();

  // Create duplicated items list for a seamless infinite loop animation
  const marqueeItems = [...destinations, ...destinations, ...destinations];

  return (
    <section id="features" className="section-padding overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Infinite Marquee Cards Container (Full Width) */}
        <div className="relative w-full overflow-hidden py-6 select-none">
          {/* Radial fades for premium transition overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-8 flex-nowrap w-max"
            animate={
              prefersReducedMotion
                ? {}
                : { x: ["0%", "-33.333%"] } // Slide smoothly through 1 set of cards
            }
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
          >
            {marqueeItems.map((dest, idx) => (
              <div
                key={idx}
                className="w-[340px] sm:w-[420px] md:w-[460px] shrink-0"
              >
                <div className="rounded-2xl overflow-hidden bg-[#0c0e12] border border-white/[0.06] shadow-xl">
                  <BeforeAfterSlider
                    beforeLabel="Your Photo"
                    afterLabel={dest.label}
                    afterIcon={dest.icon}
                    beforeImage={dest.beforeImage}
                    afterImage={dest.afterImage}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
