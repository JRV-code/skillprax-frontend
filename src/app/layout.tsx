import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Skillprax | Autonomous Competency Learning Platform",
  description: "Closed-loop pedagogical engine and skill RPG HUD",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090A0F] text-slate-100 min-h-screen font-sans antialiased selection:bg-[#00F0FF] selection:text-black">
        {/* CRT scanlines overlay */}
        <div className="fixed inset-0 cyber-scanlines z-50 pointer-events-none opacity-40" />

        {/* Subtle Ambient Brand Watermark */}
        <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.025] select-none">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="w-[650px] max-w-none grayscale brightness-150 rotate-[-12deg]"
          />
        </div>

        {/* Main content above watermark */}
        <div className="relative z-10">
          <ClientProviders>{children}</ClientProviders>
        </div>
      </body>
    </html>
  );
}
