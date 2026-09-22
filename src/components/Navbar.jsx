import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  BookOpen,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Compass,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FlaskConical
} from "lucide-react";

export const Navbar = () => {
  const { user, isAuthenticated, logout, openAuthModal, cloudSyncStatus } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/10 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-md group-hover:scale-105 transition-transform duration-200">
              <svg width="22" height="22" className="w-5.5 h-5.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a3 3 0 0 0 0 6 3 3 0 0 0 0-6Z" fill="currentColor" stroke="none" className="text-amber-400" opacity="0.15"/>
                <path d="M12 19.5V8.5C10.5 7.5 6 7.5 3 9v10.5c3-1.5 7.5-1.5 9 0Z" className="text-amber-400"/>
                <path d="M12 19.5V8.5C13.5 7.5 18 7.5 21 9v10.5c-3-1.5-7.5-1.5-9 0Z" className="text-amber-400"/>
                <path d="M12 6V3M9.5 4.5l1.5 1.5M14.5 4.5L13 6" className="text-amber-400" opacity="0.85" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-amber-500 bg-clip-text text-transparent leading-none">
                NurulQuran
              </span>
              <span className="text-[10px] uppercase font-semibold text-emerald-600/70 dark:text-emerald-400/70 tracking-wider">
                MERN Companion
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isActive("/")
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              Home
            </Link>
            <Link
              to="/quran"
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                isActive("/quran")
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Quran Reader
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                isActive("/dashboard")
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-500" />
              Dashboard
            </Link>
            <Link
              to="/test"
              className={`text-xs font-semibold px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                isActive("/test")
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Test Suite
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* Cloud Sync State Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
                cloudSyncStatus === "synced"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : cloudSyncStatus === "syncing"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                  : "bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400"
              }`}
              title={`Cloud State: ${cloudSyncStatus}`}
            >
              {cloudSyncStatus === "synced" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : cloudSyncStatus === "syncing" ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{cloudSyncStatus === "synced" ? "Synced" : cloudSyncStatus === "syncing" ? "Syncing..." : "Offline"}</span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark/Light theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Auth Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all text-xs font-semibold text-emerald-800 dark:text-emerald-300"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs uppercase font-bold">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name || "Companion"}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-600 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal("login")}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm hover:shadow hover:scale-[1.02] transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2 shadow-xl animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10"
          >
            Home
          </Link>
          <Link
            to="/quran"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10"
          >
            📖 Quran Reader
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10"
          >
            📊 Companion Dashboard
          </Link>
          <Link
            to="/test"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10"
          >
            🧪 Test Suite
          </Link>
        </div>
      )}
    </header>
  );
};
