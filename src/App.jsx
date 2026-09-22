import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AudioProvider } from "./context/AudioContext";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AudioPlayerBar } from "./components/AudioPlayerBar";
import { AuthModal } from "./components/AuthModal";

import { HomePage } from "./pages/HomePage";
import { QuranReaderPage } from "./pages/QuranReaderPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TestingPage } from "./pages/TestingPage";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AudioProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-islamic-bg dark:bg-islamic-dark-bg text-slate-900 dark:text-slate-100 transition-colors duration-200">
              {/* Sticky Navbar */}
              <Navbar />

              {/* Main App Routed Content */}
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/quran" element={<QuranReaderPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/test" element={<TestingPage />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />

              {/* Sticky bottom audio reciter bar */}
              <AudioPlayerBar />

              {/* Auth Modal */}
              <AuthModal />
            </div>
          </Router>
        </AudioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
