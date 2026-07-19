import type { PriceRange } from "@prisma/client";

export const PRICE_LABEL: Record<PriceRange, string> = {
  BUDGET: "$",
  MID: "$$",
  PREMIUM: "$$$",
  LUXURY: "$$$$",
};

export const PRICE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: "BUDGET", label: "$ — bình dân" },
  { value: "MID", label: "$$ — vừa phải" },
  { value: "PREMIUM", label: "$$$ — hơi sang" },
  { value: "LUXURY", label: "$$$$ — đặc biệt" },
];
