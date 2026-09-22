import React, { useState, useEffect, useRef } from "react";
import { SURAHS_CATALOG } from "../data/islamicData";
import { fetchSurahEditions } from "../services/api";
import { useAudio } from "../context/AudioContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Volume2,
  Sliders,
  Sparkles,
  CheckCircle,
  ExternalLink
} from "lucide-react";

export const QuranReaderPage = () => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(1);
  const [surahData, setSurahData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState("");
  const [expandedTafseer, setExpandedTafseer] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { playAyah, currentTrack, isPlaying } = useAudio();
  const { arabicFontSize, setArabicFontSize } = useTheme();
  const { user, updateProfile } = useAuth();

  const activeSurahMeta = SURAHS_CATALOG.find((s) => s.number === selectedSurahNumber) || SURAHS_CATALOG[0];

  // Fetch Surah Editions whenever selectedSurahNumber changes
  useEffect(() => {
    let isMounted = true;
    const loadSurah = async () => {
      setIsLoading(true);
      try {
        const res = await fetchSurahEditions(selectedSurahNumber);
        if (isMounted && res.data) {
          // Editions map: 0: Arabic, 1: English, 2: Urdu, 3: Tafseer Maududi, 4: Audio, 5: Urdu Audio
          const arabicVerses = res.data[0]?.ayahs || [];
          const englishVerses = res.data[1]?.ayahs || [];
          const urduVerses = res.data[2]?.ayahs || [];
          const tafseerVerses = res.data[3]?.ayahs || [];
          const audioVerses = res.data[4]?.ayahs || [];
          const urduAudioVerses = res.data[5]?.ayahs || [];

          const combined = arabicVerses.map((item, idx) => ({
            number: item.number,
            numberInSurah: item.numberInSurah,
            arabic: item.text,
            english: englishVerses[idx]?.text || "",
            urdu: urduVerses[idx]?.text || "",
            tafseer: tafseerVerses[idx]?.text || "",
            audioUrl: audioVerses[idx]?.audio || "",
            urduAudioUrl: urduAudioVerses[idx]?.audio || ""
          }));

          setSurahData({
            surahInfo: res.data[0],
            verses: combined
          });

          // Save last read coordinate
          localStorage.setItem("quran_last_read", JSON.stringify({
            surahNumber: selectedSurahNumber,
            surahName: activeSurahMeta.englishName,
            ayahNumber: 1,
            timestamp: new Date()
          }));

          if (user) {
            updateProfile({
              lastRead: {
                surahNumber: selectedSurahNumber,
                surahName: activeSurahMeta.englishName,
                ayahNumber: 1,
                updatedAt: new Date()
              }
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error("Error loading Surah:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSurah();
    return () => { isMounted = false; };
  }, [selectedSurahNumber]);

  // Toggle Tafseer collapse
  const toggleTafseer = (ayahNum) => {
    setExpandedTafseer((prev) => ({
      ...prev,
      [ayahNum]: !prev[ayahNum]
    }));
  };

  // Play a specific verse
  const handlePlayVerse = (verse) => {
    playAyah(
      {
        surahNumber: selectedSurahNumber,
        surahName: activeSurahMeta.englishName,
        ayahNumber: verse.numberInSurah,
        audioUrl: verse.audioUrl
      },
      // When audio ends: continuous play next verse if available
      () => {
        const nextIndex = surahData.verses.findIndex((v) => v.numberInSurah === verse.numberInSurah + 1);
        if (nextIndex !== -1) {
          handlePlayVerse(surahData.verses[nextIndex]);
        }
      }
    );
  };

  // Play Urdu Voice recitation
  const handlePlayUrduAudio = (verse) => {
    if (!verse.urduAudioUrl) return;
    playAyah({
      surahNumber: selectedSurahNumber,
      surahName: `${activeSurahMeta.englishName} (Urdu)`,
      ayahNumber: verse.numberInSurah,
      audioUrl: verse.urduAudioUrl
    });
  };

  // Bookmarking
  const [bookmarks, setBookmarks] = useState(() => {
    return JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
  });

  const isAyahBookmarked = (ayahNum) => {
    return bookmarks.some((b) => b.surahNumber === selectedSurahNumber && b.ayahNumber === ayahNum);
  };

  const toggleBookmark = (verse) => {
    let updated;
    const exists = isAyahBookmarked(verse.numberInSurah);
    if (exists) {
      updated = bookmarks.filter(
        (b) => !(b.surahNumber === selectedSurahNumber && b.ayahNumber === verse.numberInSurah)
      );
    } else {
      const newBookmark = {
        id: `${selectedSurahNumber}:${verse.numberInSurah}`,
        surahNumber: selectedSurahNumber,
        surahName: activeSurahMeta.englishName,
        ayahNumber: verse.numberInSurah,
        arabicText: verse.arabic,
        translationText: verse.english,
        timestamp: new Date()
      };
      updated = [newBookmark, ...bookmarks];
    }
    setBookmarks(updated);
    localStorage.setItem("quran_bookmarks", JSON.stringify(updated));

    if (user) {
      updateProfile({ bookmarks: updated }).catch(() => {});
    }
  };

  // Filtered Surahs in sidebar
  const filteredSurahs = SURAHS_CATALOG.filter((s) => {
    const q = surahSearchQuery.toLowerCase();
    return (
      s.number.toString().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.name.includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Controller Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-500 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Surah Directory ({selectedSurahNumber}/114)</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
            <span>{activeSurahMeta.number}. {activeSurahMeta.englishName}</span>
            <span className="text-xs font-normal text-slate-400">({activeSurahMeta.englishNameTranslation})</span>
            <span className="text-base quran-text text-emerald-600 font-bold ml-1">{activeSurahMeta.name}</span>
          </div>
        </div>

        {/* Font Scale Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Arabic Size:</span>
            <button
              onClick={() => setArabicFontSize(Math.max(22, arabicFontSize - 2))}
              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300 w-6 text-center">
              {arabicFontSize}
            </span>
            <button
              onClick={() => setArabicFontSize(Math.min(42, arabicFontSize + 2))}
              className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SURAH SELECTION SIDEBAR */}
        <aside
          className={`lg:block ${
            sidebarOpen ? "block" : "hidden"
          } lg:col-span-1 glass-card rounded-3xl p-4 h-[80vh] flex flex-col`}
        >
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 114 Surahs..."
              value={surahSearchQuery}
              onChange={(e) => setSurahSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Surah List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredSurahs.map((s) => {
              const isSelected = s.number === selectedSurahNumber;
              return (
                <button
                  key={s.number}
                  onClick={() => {
                    setSelectedSurahNumber(s.number);
                    setSidebarOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {s.number}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold leading-tight">{s.englishName}</span>
                      <span className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                        {s.revelationType} • {s.numberOfAyahs} ayahs
                      </span>
                    </div>
                  </div>
                  <span className={`text-base quran-text font-bold ${isSelected ? "text-amber-300" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN READER AREA */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Surah Header Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden bg-gradient-to-br from-emerald-900/10 via-emerald-800/5 to-amber-500/10 border-emerald-500/20">
            <div className="max-w-md mx-auto space-y-2">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Surah #{activeSurahMeta.number} • {activeSurahMeta.revelationType}
              </span>
              <h1 className="text-3xl sm:text-4xl quran-text text-emerald-800 dark:text-emerald-300 font-bold">
                {activeSurahMeta.name}
              </h1>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {activeSurahMeta.englishName} ({activeSurahMeta.englishNameTranslation})
              </p>
              <div className="pt-2">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold">
                  {activeSurahMeta.numberOfAyahs} Ayahs Total
                </span>
              </div>

              {/* Bismillah banner for surahs other than Surah At-Tawbah (#9) */}
              {activeSurahMeta.number !== 9 && (
                <div className="pt-4">
                  <p className="quran-text text-2xl text-emerald-950 dark:text-emerald-200">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="glass-card rounded-3xl p-16 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-500">
                Fetching Arabic, English, Urdu Translations, and Maududi Tafseer...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {surahData?.verses?.map((verse) => {
                const isPlayingThis =
                  currentTrack?.surahNumber === selectedSurahNumber &&
                  currentTrack?.ayahNumber === verse.numberInSurah &&
                  isPlaying;
                const isBookmarked = isAyahBookmarked(verse.numberInSurah);
                const isTafseerOpen = !!expandedTafseer[verse.numberInSurah];

                return (
                  <article
                    key={verse.numberInSurah}
                    id={`ayah-${verse.numberInSurah}`}
                    className={`glass-card rounded-3xl p-5 sm:p-6 transition-all duration-200 ${
                      isPlayingThis
                        ? "border-amber-500 ring-2 ring-amber-500/30 shadow-xl bg-amber-500/5 dark:bg-amber-950/15"
                        : "hover:border-emerald-500/30"
                    }`}
                  >
                    
                    {/* Verse Control Bar */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                          {verse.numberInSurah}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Ayah {selectedSurahNumber}:{verse.numberInSurah}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Play Arabic Audio */}
                        <button
                          onClick={() => handlePlayVerse(verse)}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                            isPlayingThis
                              ? "bg-amber-500 text-white shadow-md animate-pulse"
                              : "hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                          title="Recite Arabic Verse"
                        >
                          {isPlayingThis ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                          <span className="text-[11px] hidden sm:inline">Recite</span>
                        </button>

                        {/* Play Urdu Voice Recitation */}
                        {verse.urduAudioUrl && (
                          <button
                            onClick={() => handlePlayUrduAudio(verse)}
                            className="p-2 rounded-xl text-xs font-semibold hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
                            title="Urdu Voice Translation"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span className="text-[10px] hidden sm:inline">Urdu Audio</span>
                          </button>
                        )}

                        {/* Bookmark Button */}
                        <button
                          onClick={() => toggleBookmark(verse)}
                          className={`p-2 rounded-xl transition-all ${
                            isBookmarked
                              ? "text-amber-500 bg-amber-500/10"
                              : "text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          title={isBookmarked ? "Remove Bookmark" : "Bookmark Ayah"}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Scripture Display */}
                    <div className="py-5 px-2">
                      <p
                        className="quran-text font-bold text-slate-900 dark:text-emerald-100 text-right"
                        style={{ fontSize: `${arabicFontSize}px` }}
                      >
                        {verse.arabic}
                      </p>
                    </div>

                    {/* Parallel Translations (English & Urdu) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      
                      {/* English Translation */}
                      <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          English (Sahih International)
                        </span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {verse.english}
                        </p>
                      </div>

                      {/* Urdu Translation */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-600/70 dark:text-emerald-400/70 block mb-1">
                          اردو ترجمہ (فتح محمد جالندھری)
                        </span>
                        <p className="urdu-text text-sm text-emerald-900 dark:text-emerald-200">
                          {verse.urdu}
                        </p>
                      </div>

                    </div>

                    {/* Collapsible Urdu Tafhim-ul-Quran Tafseer */}
                    {verse.tafseer && (
                      <div className="mt-3 pt-2">
                        <button
                          onClick={() => toggleTafseer(verse.numberInSurah)}
                          className="flex items-center justify-between w-full p-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            {isTafseerOpen ? "چھپائیں تفہیم القرآن تفسیر" : "دیکھیں مولانا مودودی کی تفہیم القرآن تفسیر (Urdu Tafseer)"}
                          </span>
                          {isTafseerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isTafseerOpen && (
                          <div className="mt-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right animate-fade-in">
                            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 mb-2 uppercase tracking-wide">
                              تفہیم القرآن از سید ابوالاعلیٰ مودودی
                            </div>
                            <p className="urdu-text text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                              {verse.tafseer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </article>
                );
              })}
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
