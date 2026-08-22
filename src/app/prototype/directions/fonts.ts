// PROTOTYPE — one font per direction pair. Ticket 05 locks the real choice.
import { Anton, Archivo, JetBrains_Mono, Roboto_Mono, Saira_Condensed } from "next/font/google";

export const archivo = Archivo({ subsets: ["latin"], variable: "--f-archivo" });
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--f-jet" });
export const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--f-saira",
});
export const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--f-roboto-mono" });
export const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--f-anton" });
