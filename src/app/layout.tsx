import type { Metadata } from "next";
import { Anton, Archivo, Roboto_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex-provider";
import "./globals.css";

const display = Anton({ subsets: ["latin"], weight: "400", variable: "--f-display" });
const ui = Archivo({ subsets: ["latin"], variable: "--f-ui" });
const mono = Roboto_Mono({ subsets: ["latin"], variable: "--f-mono" });

export const metadata: Metadata = {
  title: "200 SQUARES",
  description: "199 squares and one daily banner.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${ui.variable} ${mono.variable} h-full antialiased`}
    >
      {/* The board page is exactly one screen — its main takes the space the top
          bar leaves. The other pages are as long as their text. */}
      {/* The Convex client lives above the router, so the websocket survives
          navigation: a visitor who reads /how-it-works and comes back does not
          open a second one. */}
      <body className="flex min-h-full flex-col">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
