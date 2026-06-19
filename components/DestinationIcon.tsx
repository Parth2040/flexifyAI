"use client";

interface DestinationIconProps {
  type: string;
  className?: string;
  size?: number;
}

export default function DestinationIcon({ type, className = "", size = 32 }: DestinationIconProps) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (type) {
    case "eiffel-tower":
      return (
        <svg {...iconProps}>
          <path d="M16 3L16 29M16 3L12 15M16 3L20 15M10 29L16 15L22 29M12 10H20M11 20H21M13 25H19" />
        </svg>
      );

    case "great-wall":
      return (
        <svg {...iconProps}>
          <path d="M3 28L8 18L13 22L18 14L23 20L29 12M5 15V11H8V15M12 19V15H15V19M19 13V9H22V13M25 11V7H28V11" />
        </svg>
      );

    case "petra":
      return (
        <svg {...iconProps}>
          <path d="M8 28V12L12 6H20L24 12V28M12 28V18H20V28M14 22H18M10 12H22M14 6V3M18 6V3" />
        </svg>
      );

    case "christ-redeemer":
      return (
        <svg {...iconProps}>
          <path d="M16 5V20M16 20L16 28M10 12H22M8 14L10 12M22 12L24 14M14 28H18M16 5C16 5 15 3 16 2C17 3 16 5 16 5Z" />
        </svg>
      );

    case "machu-picchu":
      return (
        <svg {...iconProps}>
          <path d="M2 28L8 16L14 20L20 10L26 16L30 12M6 24H12V28M14 20H20V24H14ZM8 20H12" />
        </svg>
      );

    case "chichen-itza":
      return (
        <svg {...iconProps}>
          <path d="M6 28L10 8H22L26 28M10 8L13 4H19L22 8M8 18H24M9 23H23M12 13H20" />
        </svg>
      );

    case "colosseum":
      return (
        <svg {...iconProps}>
          <path d="M4 24C4 16 8 10 16 10C24 10 28 16 28 24M8 24V14M12 24V12M16 24V11M20 24V12M24 24V14M6 18H26M6 21H26" />
        </svg>
      );

    case "taj-mahal":
      return (
        <svg {...iconProps}>
          <path d="M16 4C16 4 10 10 10 16V28H22V16C22 10 16 4 16 4ZM10 28H6V22L8 20M22 28H26V22L24 20M14 28V22H18V28M16 4V2M6 28H26" />
        </svg>
      );

    case "private-jet":
      return (
        <svg {...iconProps}>
          <path d="M3 18L12 16L18 6L22 6L19 16L28 14L30 10L32 10L30 16L32 18L30 18L28 16L19 18L22 28L18 28L12 18L3 20Z" />
        </svg>
      );

    case "supercar":
      return (
        <svg {...iconProps}>
          <path d="M5 20L8 14L14 12H22L26 14L29 20M5 20H3V22H7M29 20H31V22H27M7 22C7 23.6569 8.34315 25 10 25C11.6569 25 13 23.6569 13 22M21 22C21 23.6569 22.3431 25 24 25C25.6569 25 27 23.6569 27 22M13 22H21M14 16H22" />
        </svg>
      );

    case "yacht":
      return (
        <svg {...iconProps}>
          <path d="M4 22L8 18H28L30 22M6 22C8 24 12 26 16 26C20 26 26 24 28 22M16 18V8M16 8L24 18M16 8L10 16M12 22H20" />
        </svg>
      );

    case "penthouse":
      return (
        <svg {...iconProps}>
          <path d="M8 28V10L16 4L24 10V28M4 28H28M12 28V22H20V28M12 14H14M18 14H20M12 18H14M18 18H20" />
        </svg>
      );

    case "camera":
      return (
        <svg {...iconProps}>
          <path d="M4 10H8L10 7H22L24 10H28V25H4V10ZM16 20C18.2091 20 20 18.2091 20 16C20 13.7909 18.2091 12 16 12C13.7909 12 12 13.7909 12 16C12 18.2091 13.7909 20 16 20Z" />
        </svg>
      );

    case "mountain":
      return (
        <svg {...iconProps}>
          <path d="M4 26L12 8L18 18L22 12L28 26H4ZM12 8L14 12" />
        </svg>
      );

    default:
      return (
        <svg {...iconProps}>
          <circle cx="16" cy="16" r="10" />
          <path d="M16 10V16L20 18" />
        </svg>
      );
  }
}
