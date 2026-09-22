import axios from "axios";

// Base API instance for NurulQuran Express Server
export const api = axios.create({
  baseURL: "/api",
  timeout: 12000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nqp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for logging/handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, could clear token or let AuthContext handle it
      console.warn("API 401: Unauthorized access or expired token");
    }
    return Promise.reject(error);
  }
);

// External Services: Al Quran Cloud
export const fetchSurahEditions = async (surahNumber) => {
  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ur.jalandhry,ur.maududi,ar.alafasy,ur.khan`;
  const response = await axios.get(url);
  return response.data;
};

// External Services: Aladhan Prayer Times
export const fetchPrayerTimesAPI = async (lat, lng, method = 2, school = 0) => {
  const date = new Date();
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
  const response = await axios.get(url);
  return response.data;
};

// External Services: Aladhan Hijri Calendar
export const fetchHijriCalendarAPI = async (year, month, lat = 21.4225, lng = 39.8262) => {
  const url = `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}?latitude=${lat}&longitude=${lng}`;
  const response = await axios.get(url);
  return response.data;
};

// External Services: Overpass OSM Mosque Finder
export const fetchNearbyMosques = async (lat, lng, radiusMeters = 5000) => {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
    );
    out center 25;
  `;
  const response = await axios.post("https://overpass-api.de/api/interpreter", query, {
    headers: { "Content-Type": "text/plain" }
  });
  return response.data;
};
