import React from "react";
import { Link } from "react-router-dom";
import { Heart, BookOpen, Sparkles, Compass } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-emerald-500/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-700 text-amber-400 font-bold">
                📖
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-amber-600 dark:from-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
                NurulQuran
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              A complete, modern digital sanctuary designed for Quran reading with concurrent English and Urdu translations, inline Tafseer, live prayer timings, interactive Tasbeeh, and faith-building knowledge modules.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
              <span>for the Global Ummah</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/quran" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Quran Reader & Tafseer
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Companion Dashboard
                </Link>
              </li>
              <li>
                <Link to="/test" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Verification Suite
                </Link>
              </li>
            </ul>
          </div>

          {/* Faith Tools */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Faith Utilities
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Interactive Tasbeeh Clicker
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Zakat Nisab Calculator
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Dynamic Hijri Calendar
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Mosque Geolocation Finder
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} NurulQuran Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Powered by MERN Stack (MongoDB, Express, React, Node.js)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
