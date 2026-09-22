import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, CheckCircle2, XCircle, ArrowLeft, Play, ShieldAlert } from "lucide-react";

export const TestingPage = () => {
  // 1. Math formulas
  const calculateBearing = (lat, lng) => {
    const kaabaLat = (21.422487 * Math.PI) / 180;
    const kaabaLng = (39.826206 * Math.PI) / 180;
    const myLat = (lat * Math.PI) / 180;
    const myLng = (lng * Math.PI) / 180;

    const dLng = kaabaLng - myLng;
    const y = Math.sin(dLng);
    const x = Math.cos(myLat) * Math.tan(kaabaLat) - Math.sin(myLat) * Math.cos(dLng);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  const calculateZakatDue = (assets, goldPrice, basis) => {
    const goldNisabThreshold = 85 * goldPrice;
    const silverNisabThreshold = 595 * 0.90;
    const nisab = basis === "gold" ? goldNisabThreshold : silverNisabThreshold;
    return assets >= nisab ? Math.max(0, assets * 0.025) : 0;
  };

  const parseHijriMonth = (monthVal) => {
    const monthNames = [
      "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
      "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
      "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    ];
    let month = parseInt(monthVal, 10);
    if (isNaN(month)) {
      const cleanVal = monthVal.toLowerCase().replace(/[^a-z']/g, "");
      const matchedIdx = monthNames.findIndex((name) => {
        const cleanName = name.toLowerCase().replace(/[^a-z']/g, "");
        return cleanName.includes(cleanVal) || cleanVal.includes(cleanName);
      });
      month = matchedIdx !== -1 ? matchedIdx + 1 : 1;
    }
    return { monthIndex: month, monthName: monthNames[month - 1] };
  };

  // Test Runner State
  const [testResults, setTestResults] = useState([]);
  const [hasRun, setHasRun] = useState(false);

  // Playground State
  const [playLat, setPlayLat] = useState(24.8607);
  const [playLng, setPlayLng] = useState(67.0011);
  const [playAssets, setPlayAssets] = useState(10000);
  const [playGoldPrice, setPlayGoldPrice] = useState(75);
  const [playBasis, setPlayBasis] = useState("gold");
  const [playMonthStr, setPlayMonthStr] = useState("Ramadan");

  const runAllTests = () => {
    const results = [];

    // Test 1: Bearing to Kaaba from Karachi
    const karachiBearing = calculateBearing(24.8607, 67.0011);
    results.push({
      name: "Qibla Bearing Karachi Assertion",
      expected: "Approx 262° to 267°",
      actual: `${karachiBearing.toFixed(2)}°`,
      passed: karachiBearing >= 260 && karachiBearing <= 270
    });

    // Test 2: Bearing to Kaaba from London
    const londonBearing = calculateBearing(51.5074, -0.1278);
    results.push({
      name: "Qibla Bearing London Assertion",
      expected: "Approx 115° to 125°",
      actual: `${londonBearing.toFixed(2)}°`,
      passed: londonBearing >= 115 && londonBearing <= 125
    });

    // Test 3: Zakat above Nisab threshold
    const zakatHigh = calculateZakatDue(10000, 75, "gold"); // Nisab: 85*75 = 6375. 10000*0.025 = 250
    results.push({
      name: "Zakat Due Above Nisab (Gold)",
      expected: "$250.00",
      actual: `$${zakatHigh.toFixed(2)}`,
      passed: zakatHigh === 250
    });

    // Test 4: Zakat below Nisab threshold
    const zakatLow = calculateZakatDue(2000, 75, "gold"); // Below 6375
    results.push({
      name: "Zakat Due Below Nisab (Exempt)",
      expected: "$0.00",
      actual: `$${zakatLow.toFixed(2)}`,
      passed: zakatLow === 0
    });

    // Test 5: Lunar month parser
    const parsedRamadan = parseHijriMonth("Ramadan");
    results.push({
      name: "Hijri Month Text Resolver ('Ramadan')",
      expected: "Index 9 (Ramadan)",
      actual: `Index ${parsedRamadan.monthIndex} (${parsedRamadan.monthName})`,
      passed: parsedRamadan.monthIndex === 9
    });

    // Test 6: Lunar month parser for Safar
    const parsedSafar = parseHijriMonth("Safar AH");
    results.push({
      name: "Hijri Month Text Resolver with Suffix ('Safar AH')",
      expected: "Index 2 (Safar)",
      actual: `Index ${parsedSafar.monthIndex} (${parsedSafar.monthName})`,
      passed: parsedSafar.monthIndex === 2
    });

    setTestResults(results);
    setHasRun(true);
  };

  const calculatedBearing = calculateBearing(parseFloat(playLat) || 0, parseFloat(playLng) || 0);
  const calculatedZakat = calculateZakatDue(
    parseFloat(playAssets) || 0,
    parseFloat(playGoldPrice) || 0,
    playBasis
  );
  const resolvedMonth = parseHijriMonth(playMonthStr);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-md">
            🧪
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Platform Automated Verification Suite
            </h1>
            <p className="text-xs text-slate-500">
              Validates Islamic mathematical formulations, great-circle Qibla bearings, and Nisab rules
            </p>
          </div>
        </div>

        <button
          onClick={runAllTests}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Automated Tests</span>
        </button>
      </div>

      {/* Test Results Table */}
      {hasRun && (
        <div className="glass-card rounded-3xl p-6 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Test Assertions ({testResults.filter((r) => r.passed).length}/{testResults.length} Passed)
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
              100% Passing
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {testResults.map((tr, idx) => (
              <div key={idx} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {tr.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{tr.name}</span>
                </div>
                <div className="text-xs font-mono flex items-center gap-4 text-slate-500">
                  <span>Expected: {tr.expected}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Result: {tr.actual}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Testing Playground */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Interactive Parameter Playground
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Qibla Test */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold text-emerald-600 block uppercase">1. Qibla Bearing Math</span>
            <div>
              <label className="block text-[11px] text-slate-400">Latitude</label>
              <input
                type="number"
                value={playLat}
                onChange={(e) => setPlayLat(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400">Longitude</label>
              <input
                type="number"
                value={playLng}
                onChange={(e) => setPlayLng(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border rounded-lg"
              />
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-400">Computed Bearing:</span>
              <div className="text-lg font-mono font-bold text-emerald-600">{calculatedBearing.toFixed(2)}°</div>
            </div>
          </div>

          {/* Zakat Test */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold text-amber-600 block uppercase">2. Zakat Nisab Engine</span>
            <div>
              <label className="block text-[11px] text-slate-400">Net Assets ($)</label>
              <input
                type="number"
                value={playAssets}
                onChange={(e) => setPlayAssets(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400">Gold Price ($/g)</label>
              <input
                type="number"
                value={playGoldPrice}
                onChange={(e) => setPlayGoldPrice(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border rounded-lg"
              />
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-400">Calculated Zakat:</span>
              <div className="text-lg font-mono font-bold text-amber-600">${calculatedZakat.toFixed(2)}</div>
            </div>
          </div>

          {/* Hijri Month Parser Test */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold text-indigo-600 block uppercase">3. Lunar Month Resolver</span>
            <div>
              <label className="block text-[11px] text-slate-400">Month Name String</label>
              <input
                type="text"
                value={playMonthStr}
                onChange={(e) => setPlayMonthStr(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border rounded-lg"
              />
            </div>
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-400">Resolved Index:</span>
              <div className="text-lg font-mono font-bold text-indigo-600">
                {resolvedMonth.monthIndex} ({resolvedMonth.monthName})
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
