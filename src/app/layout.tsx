import type { Metadata } from "next";
import { Anton, Archivo, Roboto_Mono } from "next/font/google";
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
