import React, { useState, useEffect } from "react";
import { fetchPrayerTimesAPI } from "../services/api";
import { Clock, MapPin, Settings2, Moon, Sun, Sunrise, Sunset } from "lucide-react";

export const PrayerTimesCard = () => {
  const [timings, setTimings] = useState(null);
  const [nextPrayer, setNextPrayer] = useState({ name: "Dhuhr", countdown: "--:--:--" });
  const [activePrayer, setActivePrayer] = useState("Fajr");
  const [locationName, setLocationName] = useState("Detecting Location...");
  const [coords, setCoords] = useState({ lat: 21.4225, lng: 39.8262 }); // Default Makkah
  const [school, setSchool] = useState(() => parseInt(localStorage.getItem("nqp_prayer_school") || "1", 10)); // 1 = Hanafi, 0 = Shafi
  const [method, setMethod] = useState(() => parseInt(localStorage.getItem("nqp_prayer_method") || "2", 10)); // 2 = ISNA

  // Detect GPS Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationName("Your Current Location");
        },
        () => {
          setLocationName("Makkah Al-Mukarramah (Default)");
        },
        { timeout: 8000 }
      );
    } else {
      setLocationName("Makkah Al-Mukarramah");
    }
  }, []);

  // Fetch Prayer Times
  useEffect(() => {
    let isMounted = true;
    const loadTimes = async () => {
      try {
        const res = await fetchPrayerTimesAPI(coords.lat, coords.lng, method, school);
        if (isMounted && res.data && res.data.timings) {
          setTimings(res.data.timings);
        }
      } catch (err) {
        console.warn("Using fallback prayer schedule:", err);
        // Fallback realistic times
        if (isMounted) {
          setTimings({
            Fajr: "04:45",
            Sunrise: "06:12",
            Dhuhr: "12:30",
            Asr: "15:45",
            Maghrib: "18:48",
            Isha: "20:05"
          });
        }
      }
    };

    loadTimes();
    return () => { isMounted = false; };
  }, [coords, method, school]);

  // Real-time Countdown & Active Prayer calculation
  useEffect(() => {
    if (!timings) return;

    const interval = setInterval(() => {
      const now = new Date();
      const prayerKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

      let upcoming = null;
      let minDiff = Infinity;
      let currentActive = "Isha";

      prayerKeys.forEach((key) => {
        const timeStr = timings[key];
        if (!timeStr) return;
        const [h, m] = timeStr.split(":").map(Number);
        const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);

        const diff = pDate - now;
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          upcoming = { name: key, target: pDate };
        }
        if (now >= pDate) {
          currentActive = key;
        }
      });

      // If all passed today, next is tomorrow Fajr
      if (!upcoming && timings.Fajr) {
        const [fh, fm] = timings.Fajr.split(":").map(Number);
        const tomFajr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, fh, fm, 0);
        upcoming = { name: "Fajr", target: tomFajr };
        minDiff = tomFajr - now;
      }

      setActivePrayer(currentActive);

      if (upcoming) {
        const totalSec = Math.floor(minDiff / 1000);
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        setNextPrayer({
          name: upcoming.name,
          countdown: `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timings]);

  const prayersDisplay = [
    { key: "Fajr", name: "Fajr", icon: Sunrise },
    { key: "Sunrise", name: "Sunrise", icon: Sun },
    { key: "Dhuhr", name: "Dhuhr", icon: Sun },
    { key: "Asr", name: "Asr", icon: Sun },
    { key: "Maghrib", name: "Maghrib", icon: Sunset },
    { key: "Isha", name: "Isha", icon: Moon }
  ];

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-300">
      
      {/* Subtle Background Glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Today's Prayer Schedule</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{locationName}</span>
          </div>
        </div>

        {/* Next Prayer Pill with countdown */}
        <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider leading-none">
              Next: {nextPrayer.name}
            </span>
            <span className="text-sm font-mono font-bold tracking-tight">
              {nextPrayer.countdown}
            </span>
          </div>
        </div>
      </div>

      {/* Prayers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {prayersDisplay.map((p) => {
          const Icon = p.icon;
          const isAct = activePrayer === p.key;
          const isNext = nextPrayer.name === p.key;
          const rawTime = timings ? timings[p.key] : "--:--";

          return (
            <div
              key={p.key}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                isAct
                  ? "bg-gradient-to-b from-emerald-500/15 to-emerald-600/5 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 shadow-sm scale-[1.02]"
                  : isNext
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
                  : "bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Icon className={`w-4 h-4 mb-1.5 ${isAct ? "text-emerald-600" : isNext ? "text-amber-500" : "text-slate-400"}`} />
              <span className="text-xs font-bold">{p.name}</span>
              <span className="text-base font-mono font-bold mt-0.5 text-slate-900 dark:text-white">
                {rawTime}
              </span>
              {isAct && (
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-1">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Asr Juristic School selector */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs text-slate-500">
        <span className="text-[11px]">Asr Jurisprudence Method:</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => { setSchool(1); localStorage.setItem("nqp_prayer_school", "1"); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              school === 1
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            Hanafi
          </button>
          <button
            onClick={() => { setSchool(0); localStorage.setItem("nqp_prayer_school", "0"); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              school === 0
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            Shafi'i / Standard
          </button>
        </div>
      </div>

    </div>
  );
};
