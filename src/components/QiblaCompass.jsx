import React, { useState, useEffect } from "react";
import { Compass as CompassIcon, RotateCw, Navigation2 } from "lucide-react";

export const QiblaCompass = () => {
  const [coords, setCoords] = useState({ lat: 21.4225, lng: 39.8262 });
  const [bearing, setBearing] = useState(0);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [manualOffset, setManualOffset] = useState(0);
  const [hasCompassSensor, setHasCompassSensor] = useState(false);

  // Kaaba coordinates
  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  // Calculate Great-circle Bearing to Kaaba
  const calculateBearing = (lat, lng) => {
    const phi1 = (lat * Math.PI) / 180;
    const phi2 = (KAABA_LAT * Math.PI) / 180;
    const deltaLambda = ((KAABA_LNG - lng) * Math.PI) / 180;

    const y = Math.sin(deltaLambda);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

    let b = (Math.atan2(y, x) * 180) / Math.PI;
    return (b + 360) % 360;
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          const b = calculateBearing(lat, lng);
          setBearing(b);
        },
        () => {
          setBearing(calculateBearing(coords.lat, coords.lng));
        }
      );
    }
  }, []);

  // Listen for mobile orientation sensor
  useEffect(() => {
    const handleOrientation = (e) => {
      let compass = e.webkitCompassHeading || e.alpha;
      if (compass !== null && compass !== undefined) {
        setHasCompassSensor(true);
        setDeviceHeading(compass);
      }
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const effectiveRotation = hasCompassSensor
    ? (bearing - deviceHeading + 360) % 360
    : (bearing + manualOffset) % 360;

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-between text-center transition-all">
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
          <CompassIcon className="w-4 h-4" />
          <span>Interactive Qibla Direction</span>
        </div>
        <div className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          {bearing.toFixed(1)}° to Kaaba
        </div>
      </div>

      {/* Compass Dial Rose */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-3 flex items-center justify-center">
        {/* Outer Circular Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20" />
        <div className="absolute inset-2 rounded-full border border-slate-200 dark:border-slate-800" />

        {/* Cardinal Markers */}
        <span className="absolute top-3 font-bold text-xs text-amber-500">N</span>
        <span className="absolute bottom-3 font-bold text-xs text-slate-400">S</span>
        <span className="absolute left-3 font-bold text-xs text-slate-400">W</span>
        <span className="absolute right-3 font-bold text-xs text-slate-400">E</span>

        {/* Needle Container */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${effectiveRotation}deg)` }}
        >
          {/* Kaaba Marker on top of needle */}
          <div className="absolute -top-1 flex flex-col items-center">
            <span className="text-xl">🕋</span>
            <div className="w-1.5 h-16 bg-gradient-to-t from-emerald-600 to-amber-500 rounded-full shadow-lg shadow-emerald-500/50" />
          </div>

          <div className="w-4 h-4 rounded-full bg-emerald-700 border-2 border-white dark:border-slate-900 shadow-md z-10" />

          <div className="absolute bottom-4 flex flex-col items-center">
            <div className="w-1.5 h-14 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>

      {/* Sensor info & Manual control */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
        {hasCompassSensor
          ? "Compass orientation detected via mobile sensor. Align device flat."
          : "Calculated from your coordinates. Rotate your device toward the Kaaba indicator."}
      </p>

      {/* Manual Test Adjuster Slider */}
      <div className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-[11px] text-slate-400">
        <span>Test Rotation:</span>
        <input
          type="range"
          min="0"
          max="360"
          value={manualOffset}
          onChange={(e) => setManualOffset(parseInt(e.target.value, 10))}
          className="w-36 accent-emerald-600 h-1 cursor-pointer"
        />
        <span className="font-mono text-slate-600 dark:text-slate-300 w-8 text-right">
          {manualOffset}°
        </span>
      </div>
    </div>
  );
};
