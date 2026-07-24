import { Amiri, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata = {
  title: "NurulQuran – Complete Islamic Learning & Quran Companion",
  description: "Learn Quran reading, memorization, and track daily prayers and progress in one elegant Islamic learning companion platform.",
  keywords: "Quran, Islam, Quran Memorization, Prayer Times, Islamic Learning, Hadith, Muslim Companion",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${amiri.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-islamic-bg dark:bg-islamic-dark-bg text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
