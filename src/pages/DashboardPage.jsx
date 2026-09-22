import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  ISLAMIC_BOOKS,
  HADITH_SEARCH_COLLECTION,
  DAILY_AZKAR,
  NAMAZ_STEPS,
  SALAH_RAKAT_TABLE
} from "../data/islamicData";
import { api, fetchNearbyMosques } from "../services/api";
import {
  LayoutDashboard,
  Flame,
  Award,
  BookMarked,
  CheckCircle2,
  Calendar as CalendarIcon,
  Compass,
  BookOpen,
  Search,
  Calculator,
  MapPin,
  HelpCircle,
  Sparkles,
  Settings,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Play,
  Share2,
  Eye,
  Sliders,
  RefreshCw,
  LogOut,
  ExternalLink
} from "lucide-react";

export const DashboardPage = () => {
  const { user, updateProfile, syncWithCloud, cloudSyncStatus, logout } = useAuth();
  const { isDark, toggleTheme, accent, setAccent } = useTheme();

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // 1. OVERVIEW & DAILY PRAYER CHECKLIST
  const [prayersChecklist, setPrayersChecklist] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`nqp_prayers_${today}`);
    return saved ? JSON.parse(saved) : { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
  });

  const togglePrayerCheck = async (prayerKey) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = { ...prayersChecklist, [prayerKey]: !prayersChecklist[prayerKey] };
    setPrayersChecklist(updated);
    localStorage.setItem(`nqp_prayers_${today}`, JSON.stringify(updated));

    // Sync to backend if authenticated
    try {
      await api.post("/user/prayer-log", { date: today, prayers: updated });
    } catch (e) {}
  };

  // 2. TACTILE TASBEEH CLICKER STATE
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [tasbeehTarget, setTasbeehTarget] = useState(33);
  const [tasbeehDhikr, setTasbeehDhikr] = useState("سُبْحَانَ اللَّهِ (SubhanAllah)");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [tasbeehLogs, setTasbeehLogs] = useState(() => {
    return JSON.parse(localStorage.getItem("nqp_tasbeeh_logs") || "[]");
  });

  const playClickAudio = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  };

  const handleTasbeehClick = () => {
    playClickAudio();
    if (vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(25);
    }
    const newCount = tasbeehCount + 1;
    setTasbeehCount(newCount);

    if (newCount >= tasbeehTarget) {
      // Record completed session
      const newLog = {
        title: tasbeehDhikr,
        count: newCount,
        target: tasbeehTarget,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      const updatedLogs = [newLog, ...tasbeehLogs].slice(0, 30);
      setTasbeehLogs(updatedLogs);
      localStorage.setItem("nqp_tasbeeh_logs", JSON.stringify(updatedLogs));

      if (user) {
        api.post("/user/tasbeeh-log", {
          dhikrTitle: tasbeehDhikr,
          count: newCount,
          target: tasbeehTarget
        }).catch(() => {});
      }
    }
  };

  const resetTasbeeh = () => {
    setTasbeehCount(0);
  };

  // 3. ZAKAT CALCULATOR STATE
  const [zakatCurrency, setZakatCurrency] = useState("USD");
  const [cash, setCash] = useState(5000);
  const [goldGrams, setGoldGrams] = useState(0);
  const [silverGrams, setSilverGrams] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [liabilities, setLiabilities] = useState(0);
  const [goldPricePerGram, setGoldPricePerGram] = useState(75);
  const [silverPricePerGram, setSilverPricePerGram] = useState(0.92);
  const [zakatBasis, setZakatBasis] = useState("gold"); // 'gold' | 'silver'
  const [zakatHistory, setZakatHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("nqp_zakat_logs") || "[]");
  });

  const totalAssets =
    (parseFloat(cash) || 0) +
    (parseFloat(goldGrams) || 0) * (parseFloat(goldPricePerGram) || 0) +
    (parseFloat(silverGrams) || 0) * (parseFloat(silverPricePerGram) || 0) +
    (parseFloat(investments) || 0);

  const netWealth = Math.max(0, totalAssets - (parseFloat(liabilities) || 0));
  const nisabThreshold = zakatBasis === "gold" ? 85 * goldPricePerGram : 595 * silverPricePerGram;
  const isZakatEligible = netWealth >= nisabThreshold;
  const zakatDue = isZakatEligible ? netWealth * 0.025 : 0;

  const saveZakatRecord = () => {
    const record = {
      currency: zakatCurrency,
      netWealth,
      zakatDue,
      basis: zakatBasis,
      date: new Date().toLocaleDateString()
    };
    const updated = [record, ...zakatHistory].slice(0, 15);
    setZakatHistory(updated);
    localStorage.setItem("nqp_zakat_logs", JSON.stringify(updated));

    if (user) {
      api.post("/user/zakat-log", {
        currency: zakatCurrency,
        netWealth,
        zakatDue,
        basis: zakatBasis,
        nisabThreshold
      }).catch(() => {});
    }
  };

  // 4. HADITH SEARCH
  const [hadithQuery, setHadithQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [copiedRef, setCopiedRef] = useState("");

  const filteredHadiths = HADITH_SEARCH_COLLECTION.filter((h) => {
    const matchesTopic = selectedTopic === "All" || h.topic === selectedTopic;
    const q = hadithQuery.toLowerCase();
    const matchesText =
      h.english.toLowerCase().includes(q) ||
      h.arabic.includes(q) ||
      h.ref.toLowerCase().includes(q) ||
      h.tags.some((t) => t.toLowerCase().includes(q));
    return matchesTopic && matchesText;
  });

  const copyHadith = (text, ref) => {
    navigator.clipboard.writeText(`${text}\n[${ref}]`);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(""), 2000);
  };

  // 5. DAILY AZKAR COUNTERS
  const [azkarCounts, setAzkarCounts] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`nqp_azkar_${today}`);
    return saved ? JSON.parse(saved) : {};
  });

  const handleAzkarIncrement = (id, target) => {
    const today = new Date().toISOString().split("T")[0];
    const current = azkarCounts[id] || 0;
    const next = Math.min(target, current + 1);
    const updated = { ...azkarCounts, [id]: next };
    setAzkarCounts(updated);
    localStorage.setItem(`nqp_azkar_${today}`, JSON.stringify(updated));
  };

  // Web Speech TTS helper
  const speakText = (text, lang = "ar") => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "ar" ? "ar-SA" : "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 6. ISLAMIC BOOKS MODAL
  const [activeBook, setActiveBook] = useState(null);

  // 7. MOSQUE LOCATOR
  const [mosques, setMosques] = useState([]);
  const [mosquesLoading, setMosquesLoading] = useState(false);

  const loadNearbyMosques = async () => {
    setMosquesLoading(true);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const data = await fetchNearbyMosques(pos.coords.latitude, pos.coords.longitude);
            const elements = data.elements || [];
            setMosques(elements.map((el) => ({
              id: el.id,
              name: el.tags?.name || "Local Masjid / Prayer Hall",
              lat: el.lat || el.center?.lat,
              lng: el.lon || el.center?.lon,
              dist: "Within 5km"
            })));
            setMosquesLoading(false);
          },
          () => {
            // Default mock mosques in Makkah/Medina
            setMosques([
              { id: 1, name: "Masjid al-Haram", dist: "0.2 km", lat: 21.4225, lng: 39.8262 },
              { id: 2, name: "Masjid Aisha (Al-Tan'eem)", dist: "6.5 km", lat: 21.4633, lng: 39.7981 },
              { id: 3, name: "Masjid Nimrah", dist: "14.2 km", lat: 21.3533, lng: 39.9722 }
            ]);
            setMosquesLoading(false);
          }
        );
      }
    } catch (e) {
      setMosquesLoading(false);
    }
  };

  // Bookmarks loaded from local storage
  const bookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
  const lastRead = JSON.parse(localStorage.getItem("quran_last_read") || '{"surahNumber":1,"surahName":"Al-Fatihah","ayahNumber":1}');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Top User Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-amber-500/10 border-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-emerald-400/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Assalamu Alaikum, {user?.name || "Brother/Sister"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                MERN Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {user?.email || "companion@nurulquran.local"} • Track your streaks, recitation history, and daily dhikr.
            </p>
          </div>
        </div>

        {/* Sync & Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Streak</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.readingStreak || 5} Days</span>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Memorized</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.memorizedSurahs || 12} Surahs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "overview", label: "📊 Overview", icon: LayoutDashboard },
          { id: "tasbeeh", label: "🕋 Tasbeeh Clicker", icon: RotateCcw },
          { id: "hadith", label: "🔍 Hadith Search", icon: Search },
          { id: "zakat", label: "💰 Zakat Calculator", icon: Calculator },
          { id: "books", label: "📖 Islamic Books", icon: BookOpen },
          { id: "azkar", label: "🤲 Daily Azkar", icon: Sparkles },
          { id: "salahguide", label: "🕌 Namaz Guide", icon: HelpCircle },
          { id: "mosques", label: "📍 Mosque Locator", icon: MapPin },
          { id: "settings", label: "⚙️ Settings", icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-500/20 scale-[1.02]"
                : "bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          
          {/* Top Row: Prayer Checklist & Last Read */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Daily Prayer Tracker */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Daily Salah Checklist
                  </h3>
                  <p className="text-xs text-slate-500">Check off your obligatory prayers completed today</p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {Object.values(prayersChecklist).filter(Boolean).length}/5 Completed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { key: "fajr", name: "Fajr", time: "Dawn" },
                  { key: "dhuhr", name: "Dhuhr", time: "Noon" },
                  { key: "asr", name: "Asr", time: "Afternoon" },
                  { key: "maghrib", name: "Maghrib", time: "Sunset" },
                  { key: "isha", name: "Isha", time: "Night" }
                ].map((p) => {
                  const checked = prayersChecklist[p.key];
                  return (
                    <button
                      key={p.key}
                      onClick={() => togglePrayerCheck(p.key)}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                        checked
                          ? "bg-gradient-to-b from-emerald-500/20 to-emerald-600/5 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <CheckCircle2 className={`w-5 h-5 mb-2 ${checked ? "text-emerald-600 fill-emerald-100 dark:fill-emerald-950" : "text-slate-300"}`} />
                      <span className="text-xs font-bold">{p.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{p.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Last Read Ayah Resume Card */}
            <div className="lg:col-span-1 glass-card rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block mb-1">
                  Continue Quran Recitation
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Surah {lastRead.surahName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Coordinates: Surah #{lastRead.surahNumber} • Ayah #{lastRead.ayahNumber}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/quran"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Resume Reading Now</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Bookmarks Section */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Saved Bookmarks ({bookmarks.length})
                </h3>
              </div>
              <Link to="/quran" className="text-xs font-semibold text-emerald-600 hover:underline">
                Explore More Surahs
              </Link>
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">No bookmarks saved yet. Click the ribbon icon on any Ayah in the Quran Reader to save it here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bm, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span>{bm.surahName} ({bm.surahNumber}:{bm.ayahNumber})</span>
                      <span className="text-[10px] text-slate-400 font-normal">Saved</span>
                    </div>
                    {bm.arabicText && (
                      <p className="quran-text text-sm text-slate-800 dark:text-slate-200 truncate">
                        {bm.arabicText}
                      </p>
                    )}
                    {bm.translationText && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        "{bm.translationText}"
                      </p>
                    )}
                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-end">
                      <Link
                        to="/quran"
                        className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <span>Jump to Verse</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: TACTILE TASBEEH CLICKER */}
      {activeTab === "tasbeeh" && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2">
            <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">Digital Counter</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{tasbeehDhikr}</h2>
            <p className="text-xs text-slate-500">Tap anywhere on the large circular dial or press Spacebar to count</p>
          </div>

          {/* Large Circular Dial */}
          <div className="flex flex-col items-center justify-center my-6">
            <button
              onClick={handleTasbeehClick}
              className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white shadow-2xl shadow-emerald-600/30 flex flex-col items-center justify-center border-4 border-amber-400/40 active:scale-95 transition-all cursor-pointer group"
            >
              <span className="text-[11px] uppercase font-bold text-amber-300 tracking-widest mb-1">
                Target: {tasbeehTarget}
              </span>
              <span className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tight">
                {tasbeehCount}
              </span>
              <span className="text-xs font-semibold text-emerald-100/80 mt-2 group-hover:scale-110 transition-transform">
                TAP TO COUNT
              </span>
            </button>
          </div>

          {/* Controls & Presets */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={resetTasbeeh}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {[33, 99, 100].map((t) => (
              <button
                key={t}
                onClick={() => { setTasbeehTarget(t); setTasbeehCount(0); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  tasbeehTarget === t
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Target {t}
              </button>
            ))}

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs ${soundEnabled ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "text-slate-400"}`}
              title="Toggle Audio Feedback"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Tasbeeh History Ledger */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs uppercase font-bold text-slate-400 mb-3">Recent Dhikr Sessions</h4>
            <div className="flex flex-wrap gap-2">
              {tasbeehLogs.slice(0, 8).map((log, i) => (
                <div key={i} className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-emerald-600">{log.count}x</span>
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px]">{log.title}</span>
                  <span className="text-[10px] text-slate-400">{log.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 3: HADITH SEARCH */}
      {activeTab === "hadith" && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Authentic Hadith Directory</h2>
              <p className="text-xs text-slate-500">Search 60+ authentic narrations from Bukhari, Muslim, and Tirmidhi</p>
            </div>

            {/* Topic Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {["All", "Faith", "Manners", "Charity", "Knowledge"].map((tpc) => (
                <button
                  key={tpc}
                  onClick={() => setSelectedTopic(tpc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTopic === tpc
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {tpc}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords, tags, or narrator (e.g. intentions, prayer, knowledge)..."
              value={hadithQuery}
              onChange={(e) => setHadithQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Hadith Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHadiths.map((h, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{h.ref}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {h.topic}
                  </span>
                </div>

                <p className="quran-text text-base text-right text-slate-900 dark:text-emerald-200 font-bold">
                  {h.arabic}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{h.english}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex gap-1">
                    {h.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] text-slate-400">#{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(h.arabic, "ar")}
                      className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600"
                      title="Audio Pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyHadith(h.english, h.ref)}
                      className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600"
                      title="Copy to Clipboard"
                    >
                      {copiedRef === h.ref ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB CONTENT 4: ZAKAT CALCULATOR */}
      {activeTab === "zakat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Zakat Nisab Calculator</h2>
              <p className="text-xs text-slate-500">Calculate 2.5% obligatory wealth purification against gold/silver standards</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Currency</label>
                <select
                  value={zakatCurrency}
                  onChange={(e) => setZakatCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (₨)</option>
                  <option value="SAR">SAR (﷼)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nisab Basis</label>
                <select
                  value={zakatBasis}
                  onChange={(e) => setZakatBasis(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="gold">Gold Standard (85 Grams)</option>
                  <option value="silver">Silver Standard (595 Grams)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Cash in Bank & Hand</label>
                <input
                  type="number"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Gold Weight (Grams)</label>
                <input
                  type="number"
                  value={goldGrams}
                  onChange={(e) => setGoldGrams(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Stocks & Business Assets</label>
                <input
                  type="number"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Debts & Immediate Liabilities</label>
                <input
                  type="number"
                  value={liabilities}
                  onChange={(e) => setLiabilities(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <button
              onClick={saveZakatRecord}
              className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
            >
              Save Calculation to Cloud
            </button>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-1 glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Summary Assessment</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {zakatCurrency} {netWealth.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">Net Assessable Wealth</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                {isZakatEligible ? "Zakat is Due (2.5%)" : "Below Nisab Threshold"}
              </span>
              <div className="text-2xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                {zakatCurrency} {zakatDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-500">Nisab Threshold: {zakatCurrency} {nisabThreshold.toFixed(0)}</span>
            </div>

            {/* History logs */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Saved Calculations</span>
              {zakatHistory.slice(0, 3).map((zh, i) => (
                <div key={i} className="text-xs flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500">{zh.date}</span>
                  <span className="font-bold text-emerald-600">{zh.currency} {zh.zakatDue?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: ISLAMIC BOOKS */}
      {activeTab === "books" && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Curated Islamic Library</h2>
            <p className="text-xs text-slate-500 mb-6">Select a classic collection to read chapters with detailed commentary</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ISLAMIC_BOOKS.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setActiveBook(b)}
                  className="glass-card rounded-3xl p-5 hover:border-emerald-500/50 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className={`h-36 rounded-2xl bg-gradient-to-br ${b.coverGradient} p-4 text-white flex flex-col justify-between shadow-md mb-4 group-hover:scale-[1.02] transition-transform`}>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">{b.category}</span>
                    <h3 className="text-base font-bold leading-snug">{b.title}</h3>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{b.author}</p>
                  <span className="text-[11px] font-bold text-emerald-600 mt-2 block">
                    {b.chapters.length} Chapters Available →
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Book Chapters Modal */}
          {activeBook && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border-emerald-500/30">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-600">{activeBook.category}</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activeBook.title}</h3>
                </div>
                <button
                  onClick={() => setActiveBook(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Close Reader
                </button>
              </div>

              <div className="space-y-4">
                {activeBook.chapters.map((ch) => (
                  <div key={ch.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{ch.title}</h4>
                    {ch.arabic && <p className="quran-text text-base text-right text-slate-900 dark:text-emerald-200">{ch.arabic}</p>}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">{ch.english}</p>
                    {ch.explanation && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-800 dark:text-slate-200">
                        <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">Explanation:</span>
                        {ch.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 6: DAILY AZKAR */}
      {activeTab === "azkar" && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Azkar & Supplications</h2>
            <p className="text-xs text-slate-500">Morning and evening protective prayers with audio text-to-speech pronunciation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAILY_AZKAR.map((az) => {
              const count = azkarCounts[az.id] || 0;
              const isCompleted = count >= az.targetCount;

              return (
                <div
                  key={az.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isCompleted
                      ? "bg-emerald-500/10 border-emerald-500/40"
                      : "bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{az.title}</h3>
                    <button
                      onClick={() => speakText(az.arabic, "ar")}
                      className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600"
                      title="Audio Pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="quran-text text-lg text-right text-emerald-800 dark:text-emerald-200 mb-2">
                    {az.arabic}
                  </p>
                  <p className="text-xs text-slate-500 italic mb-2">{az.transliteration}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{az.english}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-400">
                      Progress: {count} / {az.targetCount}
                    </span>
                    <button
                      onClick={() => handleAzkarIncrement(az.id, az.targetCount)}
                      disabled={isCompleted}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 text-white shadow"
                      }`}
                    >
                      {isCompleted ? "Completed ✓" : `Tap (+1)`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: NAMAZ GUIDE */}
      {activeTab === "salahguide" && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Complete Namaz (Salah) Guide</h2>
            <p className="text-xs text-slate-500">Step-by-step recitation guide and complete Rakat tally table</p>
          </div>

          {/* Rakat Tally Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase font-bold text-slate-500 text-[10px]">
                <tr>
                  <th className="p-3">Prayer</th>
                  <th className="p-3">Sunnah (Mu'akkadah)</th>
                  <th className="p-3">Fard (Obligatory)</th>
                  <th className="p-3">Nafl</th>
                  <th className="p-3">Witr</th>
                  <th className="p-3 font-bold text-emerald-600">Total Rakats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {SALAH_RAKAT_TABLE.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{row.prayer}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{row.sunnahMuakkadah}</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{row.fard}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{row.nafl}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{row.witr || "-"}</td>
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recitation Steps */}
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Prayer Postures & Recitations</h3>
            {NAMAZ_STEPS.map((st) => (
              <div key={st.step} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Step {st.step}: {st.title}</span>
                  <button onClick={() => speakText(st.arabic, "ar")} className="p-1 text-slate-400 hover:text-emerald-600">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="quran-text text-base text-right text-slate-900 dark:text-emerald-200">{st.arabic}</p>
                <p className="text-xs text-slate-500 italic">{st.transliteration}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">{st.english}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 8: MOSQUE LOCATOR */}
      {activeTab === "mosques" && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Local Mosque Locator</h2>
              <p className="text-xs text-slate-500">Query OpenStreetMap for Masjids within a 5km radius</p>
            </div>
            <button
              onClick={loadNearbyMosques}
              disabled={mosquesLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{mosquesLoading ? "Locating..." : "Find Nearby Masjids"}</span>
            </button>
          </div>

          {mosques.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <MapPin className="w-8 h-8 text-emerald-600 mx-auto opacity-50" />
              <p className="text-xs text-slate-500">Click "Find Nearby Masjids" to query local prayer halls near your coordinates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mosques.map((m, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🕌</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{m.name}</h4>
                  </div>
                  <p className="text-xs text-emerald-600 font-semibold">{m.dist}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-500 hover:text-emerald-600 flex items-center gap-1 mt-2"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 9: SETTINGS */}
      {activeTab === "settings" && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings & Customization</h2>
            <p className="text-xs text-slate-500">Tailor your interface theme, colors, and companion preferences</p>
          </div>

          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Dark Mode</span>
                <span className="text-xs text-slate-500">Switch between light and dark Islamic themes</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                {isDark ? "Enable Light Mode" : "Enable Dark Mode"}
              </button>
            </div>

            {/* Accent Theme Color */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Accent Highlight Color</span>
              <div className="flex gap-2">
                {[
                  { id: "emerald", name: "Emerald Green", color: "bg-emerald-600" },
                  { id: "gold", name: "Amber Gold", color: "bg-amber-600" },
                  { id: "blue", name: "Royal Blue", color: "bg-blue-600" },
                  { id: "purple", name: "Amethyst Purple", color: "bg-purple-600" }
                ].map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setAccent(acc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 ${acc.color} ${
                      accent === acc.id ? "ring-2 ring-offset-2 ring-emerald-500 scale-105" : "opacity-80"
                    }`}
                  >
                    <span>{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cloud Sync Manual Trigger */}
            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">Manual Cloud Sync</span>
                <span className="text-xs text-slate-500">Push all bookmarks, dhikr logs, and streaks to MongoDB</span>
              </div>
              <button
                onClick={() => syncWithCloud()}
                className="px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/10 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Now</span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="pt-4">
              <button
                onClick={logout}
                className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Companion Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
