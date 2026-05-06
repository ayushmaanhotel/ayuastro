import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "AyuAstro — AI-Powered Emotional Intelligence",
  description: "Discover your hidden emotional patterns through Vedic astrology, numerology, and AI-powered behavioral analysis. Not generic horoscopes — emotionally accurate, personalized life-pattern intelligence.",
  keywords: ["astrology", "emotional intelligence", "vedic astrology", "numerology", "personality report", "AI astrology"],
  authors: [{ name: "AyuAstro" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AyuAstro — AI-Powered Emotional Intelligence",
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
      <body className={`${playfair.variable} ${inter.variable} ${cormorant.variable} antialiased bg-background text-foreground overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
