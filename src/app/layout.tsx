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
  title: 'SKILL-TRACK | Autonomous Cognitive & Athletic Studio',
  description: 'Master cognitive disciplines, track physical athletic drills, discover local verified clubs, and achieve verified milestones.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
      </head>
      <body className={`${plusJakartaSans.variable} bg-transparent text-foreground min-h-screen font-sans antialiased selection:bg-primary/20 selection:text-primary`}>
        {/* Zero-Cut Seamless Looping Video Background Engine */}
        <CinematicVideoBackground src="/background-motion.mp4" poster="/background-poster.jpg" />
        
        {/* Main content */}
        <div className="relative z-10">
          <ClientProviders>{children}</ClientProviders>
        </div>
      </body>
    </html>
  );
}

