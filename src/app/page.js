"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";
import {
  BookOpen,
  Compass,
  Award,
  ChevronRight,
  ArrowRight,
  Play,
  Bookmark,
  Sparkles,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("signup");

  const openAuth = (tab) => {
    setModalTab(tab);
    setModalOpen(true);
  };

  // Mock Prayer Times
  const prayerTimes = [
    { name: "Fajr", time: "04:12 AM", status: "passed" },
    { name: "Dhuhr", time: "12:28 PM", status: "passed" },
    { name: "Asr", time: "04:54 PM", status: "active" },
    { name: "Maghrib", time: "07:18 PM", status: "upcoming" },
    { name: "Isha", time: "08:44 PM", status: "upcoming" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-islamic-bg dark:to-islamic-dark-bg text-white py-20 lg:py-28">
        {/* Geometric Islamic Pattern Background overlays */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/40 border border-emerald-500/30 text-amber-300 text-xs font-semibold tracking-wide animate-pulse-gold">
                <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                <span>Now live: Quran Memorization Trackers</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                A Complete Islamic Learning & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                  Quran Companion Platform
                </span>
              </h1>
              <p className="text-lg text-emerald-100 max-w-2xl mx-auto lg:mx-0">
                Immerse yourself in Quran study, track daily prayers, master Arabic, 
                and memorize surahs with structured lessons and a personal tracking dashboard.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 rounded-xl text-base font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    Go to Your Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => openAuth("signup")}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 rounded-xl text-base font-bold shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      Start Free Journey
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => openAuth("login")}
                      className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800/40 hover:bg-emerald-800/60 border border-emerald-500/40 rounded-xl text-base font-semibold transition-all cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Hero Interactive Cards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Daily Quran Verse Card */}
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between text-xs text-emerald-200">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    DAILY VERSE
                  </span>
                  <span>Surah Al-Baqarah 2:256</span>
                </div>
                <div className="quran-text text-right text-2xl font-bold text-amber-200 py-2">
                  لَا إِكْرَاهَ فِي الدِّينِ ۖ قَد تَّبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ ۚ
                </div>
                <p className="text-sm text-emerald-50 font-medium leading-relaxed">
                  &ldquo;There is no compulsion in religion. Verily, the Right Path has become distinct from the wrong path.&rdquo;
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-emerald-300">
                  <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                    <Play className="w-3.5 h-3.5 fill-current" /> Play Recitation
                  </button>
                  <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                    <Bookmark className="w-3.5 h-3.5" /> Bookmark
                  </button>
                </div>
              </div>

              {/* Mini Prayer Times Widget */}
              <div className="p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/50 shadow-xl space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    PRAYER TIMES
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
                    Active: Asr
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {prayerTimes.map((p) => (
                    <div
                      key={p.name}
                      className={`p-2 rounded-xl text-center flex flex-col items-center justify-between border ${
                        p.status === "active"
                          ? "bg-emerald-500/20 border-emerald-500 text-amber-300"
                          : p.status === "passed"
                          ? "bg-slate-800/30 border-transparent text-slate-400 opacity-60"
                          : "bg-slate-800/50 border-slate-700/50 text-slate-200"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider">{p.name}</span>
                      <span className="text-xs font-semibold mt-1">{p.time.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section id="quran" className="py-20 bg-islamic-bg dark:bg-islamic-dark-bg transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Elegantly Formed Features
            </h2>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white sm:text-4xl">
              Platform Modules Crafted for Muslims
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Discover intuitive tools designed to support your spiritual growth, Quranic memorization, and Islamic knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1: Quran Reader */}
            <div className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-6 mb-3">
                  Interactive Quran Companion
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Read, search, and bookmark verses with full English translations, word-by-word analysis, 
                  and high-fidelity recitations by global Qaris.
                </p>
              </div>
              <div className="pt-6">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  Launch Reader <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Feature 2: Islamic Learning */}
            <div id="learn" className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-200">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-6 mb-3">
                  Learning Modules
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Structured classes covering Aqeedah, Fiqh, Seerah, Tajweed, and Quranic Arabic, complete with 
                  quizzes and graded certificates.
                </p>
              </div>
              <div className="pt-6">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400 group-hover:underline">
                  Start Lessons <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Feature 3: Memorization Track */}
            <div className="group p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-6 mb-3">
                  Hifz Memorization Companion
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Smart memorization routines, review prompts, and virtual reciters that help you track and perfect 
                  your Hifz milestones.
                </p>
              </div>
              <div className="pt-6">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  Track Memorization <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. SYNC BENEFIT CTA SECTION */}
      <section className="py-20 bg-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          
          <h2 className="text-3xl font-extrabold sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
            Never Lose Your Progress
          </h2>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            By establishing a NurulQuran account, your reading logs, bookmarked verses, 
            memorization milestones, and course progress are securely synchronized to your database profile in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-xl mx-auto text-left bg-slate-900/60 p-6 rounded-2xl border border-emerald-800/30">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-900/50 flex items-center justify-center border border-emerald-700/30 text-amber-300">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">Real-time Cloud Sync</h4>
              <p className="text-xs text-slate-400 mt-1">
                Connected with Firebase Auth and backed by a MongoDB cloud database to safeguard your study history.
              </p>
            </div>
          </div>

          <div className="pt-4">
            {user ? (
              <Link
                href="/dashboard"
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 rounded-xl font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => openAuth("signup")}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-900 rounded-xl font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                Register Your Profile
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* Auth Modal Container */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
      />
    </div>
  );
}
