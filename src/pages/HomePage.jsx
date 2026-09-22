import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PrayerTimesCard } from "../components/PrayerTimesCard";
import { QiblaCompass } from "../components/QiblaCompass";
import { useAudio } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Sparkles,
  Play,
  Bookmark,
  CheckCircle,
  Clock,
  Compass,
  Calculator,
  Calendar,
  Layers,
  Search,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export const HomePage = () => {
  const { playAyah } = useAudio();
  const { openAuthModal, isAuthenticated } = useAuth();
  const [dailyBookmarked, setDailyBookmarked] = useState(false);

  // Dynamic Daily Ayat
  const dailyAyah = {
    surahNumber: 2,
    surahName: "Al-Baqarah",
    ayahNumber: 152,
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    english: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    urdu: "پس تم مجھے یاد رکھو، میں تمہیں یاد رکھوں گا، اور میرا شکر ادا کرو اور ناشکری نہ کرو۔",
    audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/159.mp3"
  };

  const handlePlayDaily = () => {
    playAyah({
      surahNumber: dailyAyah.surahNumber,
      surahName: dailyAyah.surahName,
      ayahNumber: dailyAyah.ayahNumber,
      audioUrl: dailyAyah.audioUrl
    });
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24">
        {/* Glow & Radial Background Gradients */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/15 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>MERN Stack Production Release</span>
          </div>

          {/* Main Hero Header */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Illuminate Your Heart with the{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-amber-500 bg-clip-text text-transparent">
              Divine Words of Allah
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your all-in-one Islamic digital sanctuary. Read the Holy Quran with parallel English and Urdu translations, explore Maududi’s <em>Tafhim-ul-Quran</em> exegesis, track real-time prayers, and build daily spiritual habits.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/quran"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Open Quran Reader</span>
            </Link>

            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Companion Dashboard</span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </Link>
          </div>

        </div>
      </section>

      {/* 2. DYNAMIC DAILY VERSE OF THE DAY */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border-amber-500/20 dark:border-amber-500/20 shadow-xl">
          
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                Daily Quran Inspiration
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Surah {dailyAyah.surahName} (2:{dailyAyah.ayahNumber})
            </div>
          </div>

          {/* Arabic Text */}
          <div className="text-center py-4 px-2">
            <p className="quran-text text-2xl sm:text-3xl text-emerald-900 dark:text-emerald-300 font-bold mb-4">
              {dailyAyah.arabic}
            </p>
          </div>

          {/* English & Urdu Translations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">English (Sahih Intl.)</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                "{dailyAyah.english}"
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-600/70 dark:text-emerald-400/70 block mb-1">Urdu (Jalandhry)</span>
              <p className="urdu-text text-sm text-emerald-800 dark:text-emerald-300">
                {dailyAyah.urdu}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={handlePlayDaily}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen Recitation (Mishary Alafasy)</span>
            </button>

            <button
              onClick={() => setDailyBookmarked(!dailyBookmarked)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                dailyBookmarked
                  ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-600"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${dailyBookmarked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{dailyBookmarked ? "Bookmarked" : "Bookmark Ayah"}</span>
            </button>
          </div>

        </div>
      </section>

      {/* 3. PRAYER TIMES & QIBLA COMPASS WIDGETS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PrayerTimesCard />
          </div>
          <div className="lg:col-span-1">
            <QiblaCompass />
          </div>
        </div>
      </section>

      {/* 4. PLATFORM FEATURES & LEARNING MODULES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Comprehensive Islamic Companion Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need for spiritual growth, scripture study, prayer punctuality, and Islamic jurisprudence in one unified application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <Link
            to="/quran"
            className="glass-card rounded-3xl p-6 hover:border-emerald-500/50 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              📖
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>Parallel Quran Study</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Read all 114 Surahs with side-by-side English and Urdu translations, inline collapsible Urdu Tafhim-ul-Quran exegesis, and sticky continuous audio recitation.
            </p>
          </Link>

          <Link
            to="/dashboard"
            className="glass-card rounded-3xl p-6 hover:border-emerald-500/50 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              🕋
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>Tactile Tasbeeh Dial</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Interactive circular clicker with audio tones, haptic feedback, 33/99/100 presets, custom targets, and automatic cloud log synchronization.
            </p>
          </Link>

          <Link
            to="/dashboard"
            className="glass-card rounded-3xl p-6 hover:border-emerald-500/50 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              💰
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>Smart Zakat Calculator</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Multi-currency assessment for Cash, Gold, Silver, and Investments. Dynamic Nisab thresholds, tola-to-gram conversion, and persistent history logs.
            </p>
          </Link>

          <Link
            to="/dashboard"
            className="glass-card rounded-3xl p-6 hover:border-emerald-500/50 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              📅
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>Dynamic Hijri Calendar</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Aladhan lunar calendar integration highlighting sacred Islamic events (Ramadan, Eid, Ashura) with customizable ±3 day moon-sighting adjustments.
            </p>
          </Link>

          <Link
            to="/dashboard"
            className="glass-card rounded-3xl p-6 hover:border-emerald-500/50 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              🕌
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>Interactive Salah Guide</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Step-by-step prayer manual with Arabic scripture, transliteration, English meanings, and an exhaustive Rakat tally matrix for all five daily prayers.
            </p>
          </Link>

          <Link
            to="/dashboard"
            className="glass-card rounded-3xl p-6 hover:border-emerald-500/50 hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              🤲
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>Daily Azkar & Speech TTS</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Curated morning, evening, and daily supplications with interactive counts and spoken text-to-speech audio pronunciation.
            </p>
          </Link>

        </div>
      </section>

    </div>
  );
};
