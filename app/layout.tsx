import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";
import { ModalProvider } from '@/components/providers/ModalProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Silo | Gamify Your Student Life",
  description: "Silo adalah asisten produktivitas mahasiswa berbasis AI dengan sistem gamifikasi XP & Streak. Kelola tugas, rapihin materi kuliah, dan belajar bareng Neko, AI Tutor kamu.",
  keywords: ["productivity", "student", "gamification", "AI tutor", "neko", "study assistant", "task management"],
  authors: [{ name: "Silo Team" }],
  openGraph: {
    title: "Silo | Gamify Your Student Life",
    description: "Tingkatkan produktivitas belajar lo dengan gaya Gen Z. Gamifikasi tugas, AI breakdown, dan Learning Hub dalam satu aplikasi.",
    url: "https://do-jo-wheat.vercel.app/",
    siteName: "Silo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Silo - Gamify Your Studies",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Silo | Gamify Your Student Life",
    description: "Tingkatkan produktivitas belajar lo dengan gaya Gen Z. Gamifikasi tugas, AI breakdown, dan Learning Hub dalam satu aplikasi.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/assets/mascots/neko_icon.png",
    apple: "/assets/mascots/neko_icon.png",
  },
  verification: {
    google: "MvB63igIQjEO8xCinb6FrMC5k6J41WAfVSaa_HsvEm4",
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
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${quicksand.variable} antialiased scroll-smooth scroll-pt-24`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ModalProvider>{children}</ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
