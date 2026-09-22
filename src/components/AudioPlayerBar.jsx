import React from "react";
import { useAudio } from "../context/AudioContext";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Repeat,
  Music,
  ChevronDown
} from "lucide-react";

export const AudioPlayerBar = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    continuousPlay,
    setContinuousPlay,
    reciter,
    setReciter,
    qariOptions,
    togglePlay,
    seek,
    stop
  } = useAudio();

  if (!currentTrack) return null;

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const currentQari = qariOptions.find((q) => q.id === reciter) || qariOptions[0];

  return (
    <aside aria-label="Audio Recitation Player" className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-emerald-500/20 shadow-2xl transition-all duration-300">
      {/* Progress Bar (Scrubber) */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 cursor-pointer relative group">
        <div
          className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full transition-all duration-100"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime || 0}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-slate-800 dark:text-slate-100">
        
        {/* Track Details */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-amber-400 flex items-center justify-center font-bold shadow-md relative overflow-hidden">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-5 px-1">
                <span className="w-1 bg-amber-400 rounded-full animate-wave-1" />
                <span className="w-1 bg-amber-300 rounded-full animate-wave-2" />
                <span className="w-1 bg-amber-400 rounded-full animate-wave-3" />
                <span className="w-1 bg-amber-200 rounded-full animate-wave-4" />
              </div>
            ) : (
              <Music className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {currentTrack.surahName} : Ayah {currentTrack.ayahNumber}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {currentQari.name}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
          </button>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Autoplay Toggle */}
          <button
            onClick={() => setContinuousPlay(!continuousPlay)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              continuousPlay
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold"
                : "border-slate-200 dark:border-slate-800 text-slate-400"
            }`}
            title="Continuous Recitation (Auto-play next Ayah)"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Auto-Next</span>
          </button>
        </div>

        {/* Qari Selector & Volume & Close */}
        <div className="flex items-center gap-3">
          
          {/* Reciter Dropdown */}
          <div className="relative hidden md:block">
            <select
              value={reciter}
              onChange={(e) => setReciter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
            >
              {qariOptions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 accent-emerald-600 h-1 cursor-pointer"
            />
          </div>

          {/* Close Player */}
          <button
            onClick={stop}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </aside>
  );
};
