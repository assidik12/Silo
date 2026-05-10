import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ModalProvider } from '@/components/ModalProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoJo | Gamify Your Student Life",
  description: "Dojo adalah asisten produktivitas mahasiswa berbasis AI dengan sistem gamifikasi XP & Streak. Kelola tugas, rapihin materi kuliah, dan belajar bareng AI Tutor.",
  keywords: ["productivity", "student", "gamification", "AI tutor", "study assistant", "task management"],
  authors: [{ name: "DoJo Team" }],
  openGraph: {
    title: "DoJo | Gamify Your Student Life",
    description: "Tingkatkan produktivitas belajar lo dengan gaya Gen Z. Gamifikasi tugas, AI breakdown, dan Learning Hub dalam satu aplikasi.",
    url: "https://do-jo-wheat.vercel.app/",
    siteName: "DoJo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DoJo - Gamify Your Studies",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DoJo | Gamify Your Student Life",
    description: "Tingkatkan produktivitas belajar lo dengan gaya Gen Z. Gamifikasi tugas, AI breakdown, dan Learning Hub dalam satu aplikasi.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}
