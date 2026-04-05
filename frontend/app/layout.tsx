import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {Inter} from "next/font/google"
import "./globals.css";
import { Sidebar } from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MusicBase",
  description: "My favourite music",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-[#121212] text-white flex`}>

        <Sidebar/>

        <main className="flex-1 h-screen overfllow-y-auto bg-gradient-to-b from-[#1e1e1e] to-[#121212]">
          {children}
        </main>

      </body>
    </html>
  );
}
