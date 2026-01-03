import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "Quizzy — Challenge Your Knowledge",
    template: "%s | Quizzy"
  },
  description: "Quizzy adalah platform kuis interaktif modern untuk menguji wawasanmu dengan pengalaman yang seru dan kompetitif.",
  keywords: ["Quiz", "Knowledge", "Interactive Quiz", "Learning", "Quizzy"],
  authors: [{ name: "Nama Kamu" }], // Ganti dengan nama kamu
  creator: "Nama Kamu",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://quizzy-kamu.vercel.app", // Ganti dengan URL deploy kamu
    siteName: "Quizzy",
    title: "Quizzy — Platform Kuis Interaktif",
    description: "Uji kemampuanmu dengan berbagai kuis menarik di Quizzy. Cepat, seru, dan menantang!",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "Quizzy Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quizzy — Challenge Your Knowledge",
    description: "Platform kuis interaktif modern dengan pengalaman user yang smooth.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png", // Icon untuk iOS
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
