/**
 * Simple coin/credit icon (SVG) — replaces the 🪙 emoji, which renders as a
 * missing-glyph box on some systems. Inherits color via `currentColor`.
 */
export default function CoinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M14.6 9.3a2.4 2.4 0 0 0-2.6-1.5c-1.4 0-2.5.8-2.5 1.9s1 1.6 2.5 2 2.6.9 2.6 2-1.2 1.9-2.6 1.9a2.4 2.4 0 0 1-2.6-1.5" />
      <path d="M12 6.5v11" />
    </svg>
  );
}
