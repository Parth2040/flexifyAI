"use client";

import { ReactNode } from "react";

interface BoardingPassCardProps {
  children: ReactNode;
  className?: string;
  /** Controls whether the dashed divider and notches appear */
  divided?: boolean;
  /** If true, renders the barcode strip at the bottom */
  barcode?: boolean;
}

function generateBarcodeHeights(count: number): number[] {
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    heights.push(6 + Math.floor(Math.abs(Math.sin(i * 0.7)) * 18));
  }
  return heights;
}

const barcodeHeights = generateBarcodeHeights(40);

export default function BoardingPassCard({
  children,
  className = "",
  divided = true,
  barcode = true,
}: BoardingPassCardProps) {
  return (
    <div className={`boarding-pass ${className}`}>
      {divided && (
        <>
          <div className="notch-left" aria-hidden="true" />
          <div className="notch-right" aria-hidden="true" />
        </>
      )}
      <div className="relative z-[1]">{children}</div>
      {barcode && (
        <div className="barcode pb-3 pt-2" aria-hidden="true">
          {barcodeHeights.map((h, i) => (
            <span key={i} style={{ height: `${h}px` }} />
          ))}
        </div>
      )}
    </div>
  );
}
