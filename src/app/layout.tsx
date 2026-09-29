import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { CinematicVideoBackground } from "@/components/CinematicVideoBackground";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
    <html lang="en">
      <body className={`${plusJakartaSans.variable} bg-transparent text-foreground min-h-screen font-sans antialiased selection:bg-primary/20 selection:text-primary`}>
        {/* Zero-Cut Seamless Looping Video Background Engine */}
        <CinematicVideoBackground src="/background video.mp4" poster="/background-poster.jpg" />
        
        {/* Main content */}
        <div className="relative z-10">
          <ClientProviders>{children}</ClientProviders>
        </div>
      </body>
    </html>
  );
}

