export const VARIANTS = [
  { key: "direct", name: "A — Direct (drag selects)" },
  { key: "library", name: "B — Library (drag pans)" },
  { key: "modal", name: "C — Modal (a switch decides)" },
] as const;

export type VariantKey = (typeof VARIANTS)[number]["key"];
