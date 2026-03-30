import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoinInsight",
  description: "AI-powered crypto analytics platform that combines real-time market data from CoinGecko with NLP-based sentiment analysis using Hugging Face to generate predictive trading insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body className="min-h-full flex flex-col">
      <Header/>

      {children}
      
      
      </body>
    </html>
  );
}
