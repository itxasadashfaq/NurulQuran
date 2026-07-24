"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AuthModal from "./AuthModal";
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard, Compass } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("login");
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const handleOpenModal = (tab) => {
    setModalTab(tab);
    setModalOpen(true);
    setIsOpen(false);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Quran Companion", href: "/#quran" },
    { name: "Learning Modules", href: "/#learn" },
    ...(user ? [{ name: "Dashboard", href: "/dashboard" }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-emerald-500/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-md group-hover:scale-105 transition-transform duration-200">
                  <Compass className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-amber-500 bg-clip-text text-transparent">
                  NurulQuran
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 ${
                    pathname === link.href
                      ? "text-emerald-700 dark:text-emerald-400 font-bold"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Action Buttons / Auth */}
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-600 animate-spin" />
              ) : user ? (
                <div className="flex items-center gap-4">
                  {/* User Profile Info */}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                      {user.displayName || "User"}
                    </span>
                  </Link>

                  {/* Sign Out Button */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal("login")}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenModal("signup")}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 px-4 py-3 space-y-3 animate-fade-in shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <hr className="border-slate-100 dark:border-slate-800 my-1" />

            {/* Mobile Auth Actions */}
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {user.displayName || "User"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200/25 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleOpenModal("login")}
                  className="px-4 py-2.5 text-center text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenModal("signup")}
                  className="px-4 py-2.5 text-center bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Shared Auth Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
      />
    </>
  );
}
