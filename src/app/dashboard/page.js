"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";
import {
  Compass,
  BookOpen,
  Award,
  LogOut,
  Clock,
  ArrowRight,
  Lock,
  User,
  Bookmark,
  Sparkles,
  Flame,
  CheckCircle2,
} from "lucide-react";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }) +
          " - " +
          now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mock Prayer Times with simple status check
  const prayerTimes = [
    { name: "Fajr", time: "04:12 AM", status: "passed" },
    { name: "Dhuhr", time: "12:28 PM", status: "passed" },
    { name: "Asr", time: "04:54 PM", status: "active" },
    { name: "Maghrib", time: "07:18 PM", status: "upcoming" },
    { name: "Isha", time: "08:44 PM", status: "upcoming" },
  ];

  // Mock Bookmarks
  const bookmarks = [
    { surah: "Surah Al-Kahf", verse: "Verse 1-10", path: "/#quran" },
    { surah: "Surah Yaseen", verse: "Verse 1-83", path: "/#quran" },
    { surah: "Surah Al-Mulk", verse: "Verse 1-30", path: "/#quran" },
  ];

  // Loading Screen
  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[70vh] bg-islamic-bg dark:bg-islamic-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Aligning your progress...
          </span>
        </div>
      </div>
    );
  }

  // Not Logged In Screen
  if (!user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-islamic-bg dark:bg-islamic-dark-bg min-h-[80vh]">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center shadow-xl space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Private Companion Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Create an account or sign in to track your reading streaks, memorization milestones, 
              local prayer times, and learning modules progress.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Sign In / Sign Up
          </button>
        </div>
        <AuthModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialTab="login"
        />
      </div>
    );
  }

  // Authenticated Dashboard Screen
  return (
    <div className="flex-grow bg-islamic-bg dark:bg-islamic-dark-bg py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. WELCOME BANNER & DATE */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 to-emerald-850 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold">
              Assalamu Alaikum, {user.displayName || "Brother/Sister"}
            </h1>
            <p className="text-sm text-emerald-200">
              Welcome back to your companion dashboard. Keep growing in knowledge and faith.
            </p>
          </div>
          <div className="text-right text-xs md:text-sm font-semibold text-amber-300 bg-emerald-900/40 px-4 py-2 rounded-2xl border border-emerald-800/35 self-start md:self-center relative z-10">
            {currentDateTime || "Loading date..."}
          </div>
        </div>

        {/* 2. MAIN GRID (3 Columns on Large Screens) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANELS: Progress trackers & Quick actions (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Daily Streak */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Flame className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">5 Days</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Reading Streak</div>
                </div>
              </div>

              {/* Memorization Progress */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">12 Surahs</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Memorized (Hifz)</div>
                </div>
              </div>

              {/* Course Badges */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">2 Completed</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Learning Courses</div>
                </div>
              </div>

            </div>

            {/* Current Enrolled course */}
            <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  Active Learning Module
                </h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                  All Courses
                </span>
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                    Level 1 - Beginner
                  </div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white">
                    Introduction to Tajweed Rules
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Next Lesson: Makharij al-Huroof (Articulation Points of Letters)
                  </p>
                </div>
                
                {/* Progress Circle or Bar */}
                <div className="w-full md:w-48 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-emerald-600 dark:text-emerald-400">65%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Link
                  href="/#learn"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/5 cursor-pointer"
                >
                  Resume Course
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Last Read & Bookmarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Last Read Card */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-emerald-600" />
                    Last Read Verse
                  </h3>
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center space-y-3">
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      Surah Al-Kahf (18:10)
                    </div>
                    <div className="quran-text text-xl font-bold text-slate-800 dark:text-slate-200">
                      إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      &ldquo;When the youths retreated to the cave...&rdquo;
                    </p>
                  </div>
                </div>
                <Link
                  href="/#quran"
                  className="w-full py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold text-center border border-slate-200/50 dark:border-slate-800 transition-colors inline-block"
                >
                  Continue Reading
                </Link>
              </div>

              {/* Bookmarks Card */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Bookmark className="w-4.5 h-4.5 text-emerald-600" />
                    Bookmarked Surahs
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-850">
                    {bookmarks.map((bm) => (
                      <Link
                        key={bm.surah}
                        href={bm.path}
                        className="py-2.5 flex items-center justify-between text-xs hover:text-emerald-600 transition-colors group"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600">
                          {bm.surah}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">
                          {bm.verse}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
                <Link
                  href="/#quran"
                  className="w-full py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold text-center border border-slate-200/50 dark:border-slate-800 transition-colors inline-block"
                >
                  Manage Bookmarks
                </Link>
              </div>

            </div>

          </div>

          {/* RIGHT PANELS: Sidebar widget details (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Active Prayer Times */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-emerald-600" />
                  Prayer Times
                </h3>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                  Local
                </span>
              </div>

              <div className="space-y-3">
                {prayerTimes.map((p) => (
                  <div
                    key={p.name}
                    className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all duration-200 ${
                      p.status === "active"
                        ? "bg-emerald-500/15 border-emerald-500/70 text-slate-800 dark:text-white shadow-sm"
                        : p.status === "passed"
                        ? "bg-slate-50/50 dark:bg-slate-850/20 border-transparent text-slate-400 dark:text-slate-550 opacity-60"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">{p.name}</span>
                      {p.status === "active" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{p.time}</span>
                      {p.status === "passed" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile detail card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-emerald-600" />
                Profile Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-900/30">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="font-bold text-sm text-slate-800 dark:text-white truncate">
                      {user.displayName || "Bro/Sis"}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Account ID:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{user.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Verified:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{user.emailVerified ? "Yes" : "No"}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full mt-2 py-2.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out of NurulQuran
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
