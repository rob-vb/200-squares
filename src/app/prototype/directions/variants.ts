export const VARIANTS = [
  { key: "register", name: "Register (graft)" },
  { key: "exchange", name: "Exchange" },
  { key: "plot", name: "Plot" },
  { key: "stage", name: "Stage" },
] as const;

export type VariantKey = (typeof VARIANTS)[number]["key"];
