// Updated StickyNoteColor type with all light, soft colors
export type StickyNoteColor =
  | "strawberry"
  | "orange"
  | "lemon"
  | "lime"
  | "mint"
  | "blueberry"
  | "grape"
  | "bubblegum"
  | "teal" // Soft teal
  | "ruby" // Soft ruby
  | "sapphire" // Soft sapphire
  | "emerald" // Soft emerald
  | "amethyst" // Soft amethyst
  | "coral"; // Soft coral

// Updated colorMap with all light, soft colors
export const colorMap: Record<
  StickyNoteColor,
  {
    bg: string;
    shadow: string;
    colorClass: string;
    textColor: string;
  }
> = {
  // Original cloud candy colors
  strawberry: {
    bg: "bg-[var(--color-cloud-candy-strawberry)]",
    shadow: "shadow-[var(--color-candy-strawberry)]",
    colorClass: "bg-red-400",
    textColor: "text-gray-800",
  },
  orange: {
    bg: "bg-[var(--color-cloud-candy-orange)]",
    shadow: "shadow-[var(--color-candy-orange)]",
    colorClass: "bg-orange-400",
    textColor: "text-gray-800",
  },
  lemon: {
    bg: "bg-[var(--color-cloud-candy-lemon)]",
    shadow: "shadow-[var(--color-candy-lemon)]",
    colorClass: "bg-yellow-300",
    textColor: "text-gray-800",
  },
  lime: {
    bg: "bg-[var(--color-cloud-candy-lime)]",
    shadow: "shadow-[var(--color-candy-lime)]",
    colorClass: "bg-lime-400",
    textColor: "text-gray-800",
  },
  mint: {
    bg: "bg-[var(--color-cloud-candy-mint)]",
    shadow: "shadow-[var(--color-candy-mint)]",
    colorClass: "bg-green-300",
    textColor: "text-gray-800",
  },
  blueberry: {
    bg: "bg-[var(--color-cloud-candy-blueberry)]",
    shadow: "shadow-[var(--color-candy-blueberry)]",
    colorClass: "bg-blue-400",
    textColor: "text-gray-800",
  },
  grape: {
    bg: "bg-[var(--color-cloud-candy-grape)]",
    shadow: "shadow-[var(--color-candy-grape)]",
    colorClass: "bg-purple-400",
    textColor: "text-gray-800",
  },
  bubblegum: {
    bg: "bg-[var(--color-cloud-candy-bubblegum)]",
    shadow: "shadow-[var(--color-candy-bubblegum)]",
    colorClass: "bg-pink-300",
    textColor: "text-gray-800",
  },

  // New light, soft colors - using high lightness (0.95-0.97) and low chroma (0.03-0.05)
  teal: {
    bg: "bg-[oklch(0.96_0.04_190)]",
    shadow: "shadow-[oklch(0.75_0.18_190)]",
    colorClass: "bg-teal-100",
    textColor: "text-gray-800",
  },
  ruby: {
    bg: "bg-[oklch(0.96_0.04_15)]",
    shadow: "shadow-[oklch(0.72_0.29_15)]",
    colorClass: "bg-rose-100",
    textColor: "text-gray-800",
  },
  sapphire: {
    bg: "bg-[oklch(0.96_0.04_255)]",
    shadow: "shadow-[oklch(0.65_0.25_255)]",
    colorClass: "bg-indigo-100",
    textColor: "text-gray-800",
  },
  emerald: {
    bg: "bg-[oklch(0.96_0.04_145)]",
    shadow: "shadow-[oklch(0.76_0.16_145)]",
    colorClass: "bg-emerald-100",
    textColor: "text-gray-800",
  },
  amethyst: {
    bg: "bg-[oklch(0.96_0.04_300)]",
    shadow: "shadow-[oklch(0.65_0.27_300)]",
    colorClass: "bg-violet-100",
    textColor: "text-gray-800",
  },
  coral: {
    bg: "bg-[oklch(0.96_0.04_25)]",
    shadow: "shadow-[oklch(0.72_0.26_25)]",
    colorClass: "bg-red-100",
    textColor: "text-gray-800",
  },
};
