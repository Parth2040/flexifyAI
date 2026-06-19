"use client";

interface BeforeAfterSliderProps {
  beforeLabel: string;
  afterLabel: string;
  afterIcon: string;
  beforeImage?: string;
  afterImage?: string;
}

export default function BeforeAfterSlider({
  beforeLabel,
  afterLabel,
  afterIcon,
  beforeImage,
  afterImage,
}: BeforeAfterSliderProps) {
  return (
    <div className="flex flex-col gap-0 w-full">
      {/* Before Panel */}
      <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] overflow-hidden">
        {beforeImage ? (
          <img
            src={beforeImage}
            alt={`Before: ${beforeLabel}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/50">
            <span className="font-mono text-xs text-mist uppercase tracking-wider">
              {beforeLabel}
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-sans font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/10 shadow-lg select-none z-10">
          BEFORE
        </div>
      </div>

      {/* After Panel */}
      <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] overflow-hidden">
        {afterImage ? (
          <img
            src={afterImage}
            alt={`After: ${afterLabel}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/50">
            <span className="font-mono text-xs text-gold uppercase tracking-wider">
              {afterLabel}
            </span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-sans font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/10 shadow-lg select-none z-10">
          AFTER
        </div>
      </div>
    </div>
  );
}
