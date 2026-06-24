"use client";

import { useRef, useState } from "react";

interface BeforeAfterCompareProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

/**
 * Interactive before/after comparison slider. The divider follows the cursor
 * while hovering (and tracks touch drags). The BEFORE image is shown on the
 * left of the divider, the AFTER image on the right.
 */
export default function BeforeAfterCompare({
  beforeImage,
  afterImage,
  beforeAlt = "Before",
  afterAlt = "After",
  className = "",
}: BeforeAfterCompareProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [active, setActive] = useState(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden select-none cursor-ew-resize ${className}`}
      onMouseEnter={() => setActive(true)}
      onMouseMove={(e) => updateFromClientX(e.clientX)}
      onMouseLeave={() => {
        setActive(false);
        setPos(50);
      }}
      onTouchStart={(e) => {
        setActive(true);
        updateFromClientX(e.touches[0].clientX);
      }}
      onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
      onTouchEnd={() => setActive(false)}
    >
      {/* After (base layer) */}
      <img
        src={afterImage}
        alt={afterAlt}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before (clipped to the left of the divider) */}
      <img
        src={beforeImage}
        alt={beforeAlt}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      {/* Labels */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-sans font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/10 shadow-lg">
        Before
      </div>
      <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-gold text-[10px] font-sans font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/10 shadow-lg">
        After
      </div>

      {/* Divider + handle */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="relative h-full w-[2px] bg-white/85 shadow-[0_0_12px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-ink">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 7l-4 5 4 5" />
            <path d="M15 7l4 5-4 5" />
          </svg>
        </div>
      </div>

      {/* Hint — fades out once the user starts interacting */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-black/55 backdrop-blur-md text-white/90 text-[11px] font-sans font-medium px-4 py-2 rounded-full border border-white/10 shadow-lg pointer-events-none transition-opacity duration-300 ${
          active ? "opacity-0" : "opacity-100"
        }`}
      >
        Hover &amp; move to compare
      </div>
    </div>
  );
}
