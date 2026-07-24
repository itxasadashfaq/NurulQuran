import Link from "next/link";
import { Compass, Github, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-emerald-500/10 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800">
                <Compass className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-800 to-amber-600 dark:from-emerald-400 dark:to-amber-500 bg-clip-text text-transparent">
                NurulQuran
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              A premium, comprehensive platform for Quran study, memorization, and Islamic learning. 
              Built to accompany you in your spiritual and educational journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#quran" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Quran Companion
                </Link>
              </li>
              <li>
                <Link href="/#learn" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Learning Modules
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed">
                  Prayer Times API
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed">
                  Islamic Guides
                </span>
              </li>
              <li>
                <span className="text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed">
                  Help & FAQs
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} NurulQuran. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>as a complete Islamic learning platform.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
