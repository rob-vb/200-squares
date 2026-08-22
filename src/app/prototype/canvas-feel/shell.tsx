"use client";

// PROTOTYPE — ticket 02. The frame every variant sits in: a stub top bar and a canvas
// viewport that owns the rest of the first screen. Real layout is ticket 08.

export function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <header
        style={{
          height: 48,
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid var(--color-hairline)",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>200 SQUARES</span>
        <span style={{ font: "12px var(--font-ui)", color: "var(--color-faint)" }}>{title}</span>
      </header>
      {children}
    </div>
  );
}
