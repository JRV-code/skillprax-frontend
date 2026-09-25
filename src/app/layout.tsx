import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skillprax — AI Learning Agent & Skill OS",
  description: "Closed-loop pedagogical engine and skill RPG HUD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090A0F] text-slate-100 min-h-screen font-sans antialiased selection:bg-[#00F0FF] selection:text-black">
        <div className="fixed inset-0 cyber-scanlines z-50 pointer-events-none opacity-40" />
        {children}
      </body>
    </html>
  );
}
