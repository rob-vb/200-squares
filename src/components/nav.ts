// The pages beside the board.
//
// ⚠️ The dataset used to ride along on every link as `?data=`. It is gone: which
// board a deployment shows is now the deployment's own business, set with
// `npx convex run seed:full` and friends. A search parameter on the board route
// is what made every page dynamic, and ticket 15 was told not to put one back.

export const PAGES: { href: string; label: string }[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];
