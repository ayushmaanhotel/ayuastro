import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AyuAstro - AI-Powered Emotional Intelligence",
  description:
    "Discover your hidden emotional patterns through Vedic astrology, numerology, and AI-powered behavioral analysis. Not generic horoscopes - emotionally accurate, personalized life-pattern intelligence.",
  keywords: [
    "astrology",
    "emotional intelligence",
    "vedic astrology",
    "numerology",
    "personality report",
    "AI astrology",
  ],
  authors: [{ name: "AyuAstro" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AyuAstro - AI-Powered Emotional Intelligence",
    description: "Discover your hidden emotional patterns through Vedic astrology and AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F8F5F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
        <Toaster position="top-center" richColors={false} closeButton toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
