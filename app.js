import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";

// 1. Firebase configuration blueprint
// The app will try to fetch these credentials dynamically from the Express backend
// so you only need to configure the main .env file!
let firebaseConfig = {
  apiKey: "mock-api-key-for-build-purposes-only",
  authDomain: "mock-auth-domain-for-build",
  projectId: "mock-project-id",
  storageBucket: "mock-storage-bucket",
  messagingSenderId: "mock-sender-id",
  appId: "mock-app-id"
};

// 2. Initialize App and Authentication
let app;
let auth;
let isMockAuth = false;

async function initFirebase() {
  try {
    const response = await fetch("http://localhost:5000/api/config");
    if (response.ok) {
      const serverConfig = await response.json();
      if (serverConfig && serverConfig.apiKey) {
        firebaseConfig = serverConfig;
        console.log("Successfully loaded Firebase credentials from backend server.");
      }
    }
  } catch (error) {
    console.warn("Express backend not running or unreachable. Running in client-fallback mode.", error);
  } finally {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("mock")) {
      isMockAuth = true;
      console.log("Using Mock Authentication fallback since no real Firebase credentials are configured.");
    }

    if (isMockAuth) {
      setupAuthObserver();
    } else {
      try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        setupAuthObserver();
      } catch (error) {
        console.error("Failed to initialize Firebase SDK, falling back to mock authentication:", error);
        isMockAuth = true;
        setupAuthObserver();
      }
    }
  }
}

// 3. Sync profile updates with MongoDB
async function syncUserToMongoDB(user) {
  try {
    let idToken = "mock-id-token";
    if (!isMockAuth && typeof user.getIdToken === "function") {
      idToken = await user.getIdToken();
    }
    const response = await fetch("http://localhost:5000/api/auth/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || ""
      })
    });
    if (response.ok) {
      console.log("Successfully synchronized user profile with MongoDB.");
    } else {
      console.error("Backend sync failed:", await response.text());
    }
  } catch (error) {
    console.error("Error syncing user session with MongoDB:", error);
  }
}

// 4. State Listener
function setupAuthObserver() {
  if (isMockAuth) {
    const loadEl = document.getElementById("auth-loading");
    if (loadEl) loadEl.classList.add("hidden");

    const mockUserJson = localStorage.getItem("mock_user");
    if (mockUserJson) {
      try {
        const user = JSON.parse(mockUserJson);
        console.log("User logged in (Mock):", user.email);
        updateUIForLoggedInUser(user);
        syncUserToMongoDB(user);
      } catch (e) {
        console.error("Error parsing mock user session:", e);
        updateUIForLoggedOutUser();
      }
    } else {
      console.log("No active mock user session.");
      updateUIForLoggedOutUser();
    }
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    // Hide headers loadings
    const loadEl = document.getElementById("auth-loading");
    if (loadEl) loadEl.classList.add("hidden");

    if (user) {
      console.log("User logged in:", user.email);
      updateUIForLoggedInUser(user);
      syncUserToMongoDB(user);
    } else {
      console.log("No active user session.");
      updateUIForLoggedOutUser();
    }
  });
}

// 5. Update UI States
function updateUIForLoggedInUser(user) {
  // Elements on both Pages
  const loggedInDivs = document.querySelectorAll("#auth-logged-in");
  const loggedOutDivs = document.querySelectorAll("#auth-logged-out");
  const dashLinks = document.querySelectorAll("#nav-dashboard-link, #mobile-dashboard-link");

  loggedInDivs.forEach(el => el.classList.remove("hidden"));
  loggedOutDivs.forEach(el => el.classList.add("hidden"));
  dashLinks.forEach(el => el.classList.remove("hidden"));

  // Set User Display Names
  const userAvatar = document.getElementById("user-avatar");
  const userName = document.getElementById("user-name");
  const mobileAvatar = document.getElementById("mobile-user-avatar");
  const mobileName = document.getElementById("mobile-user-name");
  const mobileEmail = document.getElementById("mobile-user-email");

  const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : "U";
  const name = user.displayName || "Brother/Sister";

  if (userAvatar) userAvatar.textContent = initial;
  if (userName) userName.textContent = name;
  if (mobileAvatar) mobileAvatar.textContent = initial;
  if (mobileName) mobileName.textContent = name;
  if (mobileEmail) mobileEmail.textContent = user.email;

  // Homepage Elements
  const heroAuthBtns = document.getElementById("hero-auth-btns");
  const heroDashboardBtn = document.getElementById("hero-dashboard-btn");
  if (heroAuthBtns) heroAuthBtns.classList.add("hidden");
  if (heroDashboardBtn) heroDashboardBtn.classList.remove("hidden");

  // Dashboard Page Elements
  const lockScreen = document.getElementById("lock-screen");
  const dashContent = document.getElementById("dashboard-content");
  const dashGreeting = document.getElementById("dash-greeting-name");
  const dashAvatar = document.getElementById("dash-user-avatar");
  const dashDisplayName = document.getElementById("dash-user-displayname");
  const dashEmail = document.getElementById("dash-user-email");
  const dashUid = document.getElementById("dash-user-uid");
  const dashVerified = document.getElementById("dash-user-verified");

  if (lockScreen) lockScreen.classList.add("hidden");
  if (dashContent) dashContent.classList.remove("hidden");
  if (dashGreeting) dashGreeting.textContent = name;
  if (dashAvatar) dashAvatar.textContent = initial;
  if (dashDisplayName) dashDisplayName.textContent = name;
  if (dashEmail) dashEmail.textContent = user.email;
  if (dashUid) dashUid.textContent = user.uid;
  if (dashVerified) dashVerified.textContent = user.emailVerified ? "Verified Account" : "Pending Verification";
  updateDashboardWidgets();
}

function updateUIForLoggedOutUser() {
  const loggedInDivs = document.querySelectorAll("#auth-logged-in");
  const loggedOutDivs = document.querySelectorAll("#auth-logged-out");
  const dashLinks = document.querySelectorAll("#nav-dashboard-link, #mobile-dashboard-link");

  loggedInDivs.forEach(el => el.classList.add("hidden"));
  loggedOutDivs.forEach(el => el.classList.remove("hidden"));
  dashLinks.forEach(el => el.classList.add("hidden"));

  // Homepage Elements
  const heroAuthBtns = document.getElementById("hero-auth-btns");
  const heroDashboardBtn = document.getElementById("hero-dashboard-btn");
  if (heroAuthBtns) heroAuthBtns.classList.remove("hidden");
  if (heroDashboardBtn) heroDashboardBtn.classList.add("hidden");

  // Dashboard Page Elements
  const lockScreen = document.getElementById("lock-screen");
  const dashContent = document.getElementById("dashboard-content");
  if (lockScreen) lockScreen.classList.remove("hidden");
  if (dashContent) dashContent.classList.add("hidden");
}

// 6. Sign Out Event Handlers
function handleSignOut() {
  if (isMockAuth) {
    localStorage.removeItem("mock_user");
    console.log("Logged out successfully (Mock)");
    window.location.href = "index.html";
    return;
  }
  if (auth) {
    signOut(auth)
      .then(() => {
        console.log("Logged out successfully");
        window.location.href = "index.html";
      })
      .catch(error => console.error("Logout Error:", error));
  }
}

// Attach logout listeners
document.addEventListener("DOMContentLoaded", () => {
  const btnSignout = document.getElementById("btn-signout");
  const btnMobileSignout = document.getElementById("mobile-btn-signout");
  const btnDashSignout = document.getElementById("btn-dash-signout");
  const btnDashSignoutSec = document.getElementById("btn-dash-signout");
  const btnDashSignoutThird = document.getElementById("btn-dash-signout");

  if (btnSignout) btnSignout.addEventListener("click", handleSignOut);
  if (btnMobileSignout) btnMobileSignout.addEventListener("click", handleSignOut);
  if (btnDashSignout) btnDashSignout.addEventListener("click", handleSignOut);

  // Dashboard profile card signout button
  const pSignout = document.getElementById("btn-dash-signout");
  if (pSignout) pSignout.addEventListener("click", handleSignOut);

  // Form submit listener for Modal Login/Signup
  const authForm = document.getElementById("auth-form");
  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("auth-email").value;
      const password = document.getElementById("auth-password").value;
      const name = document.getElementById("auth-name").value;
      const alertDiv = document.getElementById("auth-alert");
      const submitBtn = document.getElementById("auth-submit-btn");

      alertDiv.classList.add("hidden");
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";

      try {
        if (isMockAuth) {
          if (window.activeTab === "login") {
            const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
            const foundUser = mockUsers.find(u => u.email === email && u.password === password);
            if (!foundUser) {
              throw new Error("Invalid email or password.");
            }
            const loggedInUser = {
              uid: foundUser.uid,
              email: foundUser.email,
              displayName: foundUser.displayName,
              photoURL: "",
              emailVerified: true
            };
            localStorage.setItem("mock_user", JSON.stringify(loggedInUser));
            setupAuthObserver();
          } else {
            if (password.length < 6) {
              throw new Error("Password should be at least 6 characters.");
            }
            const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
            if (mockUsers.some(u => u.email === email)) {
              throw new Error("This email is already registered.");
            }
            const newUser = {
              uid: "mock-uid-" + Math.random().toString(36).substr(2, 9),
              email: email,
              password: password,
              displayName: name || "Brother/Sister"
            };
            mockUsers.push(newUser);
            localStorage.setItem("mock_users", JSON.stringify(mockUsers));

            const loggedInUser = {
              uid: newUser.uid,
              email: newUser.email,
              displayName: newUser.displayName,
              photoURL: "",
              emailVerified: true
            };
            localStorage.setItem("mock_user", JSON.stringify(loggedInUser));

            // Reload page to reflect updated profile details (as in original code)
            window.location.reload();
          }
          if (typeof window.closeModal === "function") {
            window.closeModal();
          }
        } else {
          if (window.activeTab === "login") {
            await signInWithEmailAndPassword(auth, email, password);
          } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
              displayName: name
            });
            // Reload page to reflect updated profile details
            window.location.reload();
          }
          if (typeof window.closeModal === "function") {
            window.closeModal();
          }
        }
      } catch (error) {
        console.error("Auth action failed:", error);
        alertDiv.classList.remove("hidden");

        let errMsg = error.message;
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
          errMsg = "Invalid email or password.";
        } else if (error.code === "auth/email-already-in-use") {
          errMsg = "This email is already registered.";
        } else if (error.code === "auth/weak-password") {
          errMsg = "Password should be at least 6 characters.";
        } else if (error.code === "auth/invalid-email") {
          errMsg = "Please enter a valid email address.";
        }
        alertDiv.textContent = errMsg;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = window.activeTab === "login" ? "Sign In" : "Create Account";
      }
    });
  }

  // Handle URL redirect query tags (e.g. index.html?auth=login)
  const urlParams = new URLSearchParams(window.location.search);
  const authParam = urlParams.get('auth');
  if (authParam === 'login' || authParam === 'signup') {
    if (typeof window.openModal === "function") {
      window.openModal(authParam);
    }
  }

  // ================= QURAN COMPANION MODULE 2 =================
  const isQuranPage = document.getElementById("surah-list") !== null;
  if (isQuranPage) {
    // Selectors
    const surahSearchInput = document.getElementById("surah-search");
    const surahListContainer = document.getElementById("surah-list");
    const versesContainer = document.getElementById("verses-container");
    const readerSurahTitle = document.getElementById("reader-surah-title");
    const readerSurahMeta = document.getElementById("reader-surah-meta");
    const btnFontDecrease = document.getElementById("btn-font-decrease");
    const btnFontIncrease = document.getElementById("btn-font-increase");
    const btnToggleTranslation = document.getElementById("btn-toggle-translation");

    const playerBar = document.getElementById("audio-player-bar");
    const playerTitle = document.getElementById("player-title");
    const playerSubtitle = document.getElementById("player-subtitle");
    const playerBtnPlay = document.getElementById("player-btn-play");
    const playIcon = document.getElementById("play-icon");
    const pauseIcon = document.getElementById("pause-icon");
    const playerBtnPrev = document.getElementById("player-btn-prev");
    const playerBtnNext = document.getElementById("player-btn-next");
    const playerSlider = document.getElementById("player-slider");
    const playerTimeCurrent = document.getElementById("player-time-current");
    const playerTimeTotal = document.getElementById("player-time-total");
    const playerReciterSelect = document.getElementById("player-reciter-select");
    const playerVolume = document.getElementById("player-volume");
    const playerBtnMute = document.getElementById("player-btn-mute");
    const volumeHighIcon = document.getElementById("volume-high-icon");
    const volumeMutedIcon = document.getElementById("volume-muted-icon");
    const playerBtnClose = document.getElementById("player-btn-close");
    const quranAudio = document.getElementById("quran-audio-element");

    // State parameters (Local page variables)
    let surahsList = [];
    let currentSurahNumber = 1;
    let currentVerses = [];
    let activePlayingVerseIndex = -1;
    let isTranslationVisible = true;
    let arabicFontSize = 26; // pixels
    let selectedReciter = "ar.alafasy";
    let isMuted = false;
    let previousVolume = 0.8;
    let isDraggingSlider = false;

    // ================= SIDEBAR TABS & SEARCH =================
    const tabSurahsBtn = document.getElementById("sidebar-tab-surahs");
    const tabSearchBtn = document.getElementById("sidebar-tab-search");
    const tabBookmarksBtn = document.getElementById("sidebar-tab-bookmarks");

    const containerSurahs = document.getElementById("sidebar-container-surahs");
    const containerSearch = document.getElementById("sidebar-container-search");
    const containerBookmarks = document.getElementById("sidebar-container-bookmarks");

    if (tabSurahsBtn && tabSearchBtn && tabBookmarksBtn) {
      tabSurahsBtn.addEventListener("click", () => setActiveSidebarTab("surahs"));
      tabSearchBtn.addEventListener("click", () => setActiveSidebarTab("search"));
      tabBookmarksBtn.addEventListener("click", () => setActiveSidebarTab("bookmarks"));
    }

    function setActiveSidebarTab(tabName) {
      const activeTabClasses = "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold";
      const inactiveTabClasses = "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold";

      [tabSurahsBtn, tabSearchBtn, tabBookmarksBtn].forEach(btn => {
        if (btn) btn.className = `flex-1 text-center py-1.5 text-xs focus:outline-none cursor-pointer border-b-2 ${inactiveTabClasses}`;
      });

      if (containerSurahs) containerSurahs.classList.add("hidden");
      if (containerSearch) containerSearch.classList.add("hidden");
      if (containerBookmarks) containerBookmarks.classList.add("hidden");

      if (tabName === "surahs") {
        if (tabSurahsBtn) tabSurahsBtn.className = `flex-1 text-center py-1.5 text-xs focus:outline-none cursor-pointer border-b-2 ${activeTabClasses}`;
        if (containerSurahs) containerSurahs.classList.remove("hidden");
      } else if (tabName === "search") {
        if (tabSearchBtn) tabSearchBtn.className = `flex-1 text-center py-1.5 text-xs focus:outline-none cursor-pointer border-b-2 ${activeTabClasses}`;
        if (containerSearch) containerSearch.classList.remove("hidden");
      } else if (tabName === "bookmarks") {
        if (tabBookmarksBtn) tabBookmarksBtn.className = `flex-1 text-center py-1.5 text-xs focus:outline-none cursor-pointer border-b-2 ${activeTabClasses}`;
        if (containerBookmarks) containerBookmarks.classList.remove("hidden");
        if (typeof window.loadSidebarBookmarksAndHistory === "function") {
          window.loadSidebarBookmarksAndHistory();
        }
      }
    }

    const quranSearchQueryInput = document.getElementById("quran-search-query");
    const triggerSearchBtn = document.getElementById("btn-trigger-quran-search");
    const searchResultsContainer = document.getElementById("quran-search-results");

    if (triggerSearchBtn && quranSearchQueryInput) {
      triggerSearchBtn.addEventListener("click", performQuranSearch);
      quranSearchQueryInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") performQuranSearch();
      });
    }

    async function performQuranSearch() {
      const query = quranSearchQueryInput.value.trim();
      if (!query) return;

      if (!searchResultsContainer) return;
      searchResultsContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 space-y-2">
          <div class="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-600 animate-spin"></div>
          <span class="text-[10px] text-slate-400">Searching corpus...</span>
        </div>
      `;

      try {
        let edition = "en.sahih";
        const isArabic = /[\u0600-\u06ff]/.test(query);
        if (isArabic) {
          const isUrdu = /[ٹڈڑںےہؤئ]/.test(query) || query.includes("ہے") || query.includes("میں") || query.includes("کو");
          edition = isUrdu ? "ur.jalandhry" : "quran-simple";
        }

        const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/${edition}`);
        if (res.ok) {
          const body = await res.json();
          const count = body.data.count;
          const matches = body.data.matches;

          if (count === 0 || !matches || matches.length === 0) {
            searchResultsContainer.innerHTML = `<div class="text-center py-8 text-slate-400">No verses found matching &ldquo;${query}&rdquo;.</div>`;
            return;
          }

          searchResultsContainer.innerHTML = `
            <div class="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Matches found: ${count}</div>
            <div class="space-y-2.5"></div>
          `;
          const listDiv = searchResultsContainer.querySelector(".space-y-2\\.5");

          const displayMatches = matches.slice(0, 50);

          displayMatches.forEach(m => {
            const matchRow = document.createElement("button");
            matchRow.className = "w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-left hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-[11px] space-y-1 block cursor-pointer";

            const isMatchArabic = edition === "quran-simple";
            const textDir = isMatchArabic || edition === "ur.jalandhry" ? "text-right rtl font-amiri" : "text-left ltr font-sans";

            matchRow.innerHTML = `
              <div class="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                <span>Surah ${m.surah.englishName}</span>
                <span class="text-emerald-600 dark:text-emerald-450">${m.surah.number}:${m.numberInSurah}</span>
              </div>
              <div class="text-slate-700 dark:text-slate-300 leading-normal whitespace-normal ${textDir}">
                ${m.text}
              </div>
            `;

            matchRow.onclick = () => {
              window.goToVerseFromSearch(m.surah.number, m.numberInSurah);
            };

            listDiv.appendChild(matchRow);
          });

          if (count > 50) {
            const moreDiv = document.createElement("div");
            moreDiv.className = "text-[9px] text-center text-slate-400 py-1 italic";
            moreDiv.textContent = `Showing first 50 results of ${count}...`;
            searchResultsContainer.appendChild(moreDiv);
          }
        } else {
          searchResultsContainer.innerHTML = `<div class="text-center py-8 text-red-550 font-medium">Search failed. Please try a different term.</div>`;
        }
      } catch (err) {
        console.error("Quran Search Error:", err);
        searchResultsContainer.innerHTML = `<div class="text-center py-8 text-red-550 font-medium">Network error executing search.</div>`;
      }
    }

    window.goToVerseFromSearch = function (surahNum, verseNum) {
      currentSurahNumber = surahNum;
      const filtered = surahSearchInput.value ? filterSurahs(surahSearchInput.value) : surahsList;
      renderSurahSidebar(filtered);
      loadSurah(surahNum, false, verseNum);
    };

    // Fetch and load initial values
    fetchSurahList();

    // 1. Fetch Surah listings
    async function fetchSurahList() {
      try {
        const res = await fetch("https://api.alquran.cloud/v1/surah");
        if (res.ok) {
          const data = await res.json();
          surahsList = data.data;
          renderSurahSidebar(surahsList);

          const urlParams = new URLSearchParams(window.location.search);
          const initSurah = parseInt(urlParams.get("surah"));
          const initVerse = parseInt(urlParams.get("verse"));

          if (initSurah && !isNaN(initSurah)) {
            currentSurahNumber = initSurah;
            renderSurahSidebar(surahsList);
            loadSurah(initSurah, false, initVerse || 1);
          } else {
            loadSurah(1);
          }
        } else {
          surahListContainer.innerHTML = `<div class="text-xs text-red-500 text-center py-6">Failed to load Surah index.</div>`;
        }
      } catch (err) {
        console.error("Error fetching Surah list:", err);
        surahListContainer.innerHTML = `<div class="text-xs text-red-550 text-center py-6">Network error loading Surahs.</div>`;
      }
    }

    // 2. Render Surah Sidebar list
    function renderSurahSidebar(list) {
      if (!surahListContainer) return;
      surahListContainer.innerHTML = "";
      if (list.length === 0) {
        surahListContainer.innerHTML = `<div class="text-xs text-slate-400 text-center py-6">No matching Surahs found.</div>`;
        return;
      }

      list.forEach((s) => {
        const btn = document.createElement("button");
        btn.className = `w-full p-3 flex items-center justify-between text-left rounded-xl transition-all border ${currentSurahNumber === s.number
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-450 font-semibold"
            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          }`;
        btn.onclick = () => {
          currentSurahNumber = s.number;
          // Refresh list active styles
          renderSurahSidebar(list);
          loadSurah(s.number);
        };

        btn.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${currentSurahNumber === s.number
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
          }">${s.number}</span>
            <div>
              <div class="text-xs font-bold leading-tight">${s.englishName}</div>
              <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">${s.revelationType} • ${s.numberOfAyahs} verses</div>
            </div>
          </div>
          <span class="text-sm font-bold font-amiri text-emerald-700 dark:text-emerald-400">${s.name}</span>
        `;
        surahListContainer.appendChild(btn);
      });
    }

    // 3. Search filter
    if (surahSearchInput) {
      surahSearchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = surahsList.filter(
          (s) =>
            s.number.toString() === query ||
            s.englishName.toLowerCase().includes(query) ||
            s.englishNameTranslation.toLowerCase().includes(query) ||
            s.name.includes(query)
        );
        renderSurahSidebar(filtered);
      });
    }

    // 4. Fetch Surah text, translation, and audio
    async function loadSurah(surahNum, shouldAutoPlay = false, scrollToVerseNum = null) {
      versesContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-24 space-y-3">
          <div class="w-10 h-10 rounded-full border-3 border-emerald-500/30 border-t-emerald-600 animate-spin"></div>
          <span class="text-sm text-slate-500">Loading Surah scripture...</span>
        </div>
      `;

      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,en.sahih,ur.jalandhry,ur.maududi,${selectedReciter},ur.khan`
        );
        if (res.ok) {
          const bodyData = await res.json();
          const editions = bodyData.data;

          const arabicAyahs = editions[0].ayahs;
          const englishAyahs = editions[1].ayahs;
          const urduAyahs = editions[2].ayahs;
          const tafseerAyahs = editions[3].ayahs;
          const audioAyahs = editions[4].ayahs;
          const urduAudioAyahs = editions[5].ayahs;

          // Parse and combine editions
          currentVerses = arabicAyahs.map((ayah, i) => {
            let cleanText = ayah.text;
            // Strip Bismillah prefix if not Al-Fatihah (1) or Al-Tawbah (9)
            if (surahNum !== 1 && surahNum !== 9 && ayah.numberInSurah === 1) {
              const bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
              if (cleanText.startsWith(bismillah)) {
                cleanText = cleanText.substring(bismillah.length).trim();
              }
            }
            return {
              number: ayah.number,
              numberInSurah: ayah.numberInSurah,
              text: cleanText,
              englishTranslation: englishAyahs[i].text,
              urduTranslation: urduAyahs[i].text,
              tafseer: tafseerAyahs[i].text,
              audio: audioAyahs[i].audio,
              urduAudio: urduAudioAyahs[i].audio
            };
          });

          const activeSurahMeta = surahsList.find(s => s.number === surahNum);
          if (activeSurahMeta) {
            readerSurahTitle.textContent = `${activeSurahMeta.englishName} (${activeSurahMeta.name})`;
            readerSurahMeta.textContent = `${activeSurahMeta.number}: ${activeSurahMeta.englishNameTranslation} (${activeSurahMeta.numberOfAyahs} Verses, ${activeSurahMeta.revelationType})`;

            // Set Player Title
            playerTitle.textContent = activeSurahMeta.englishName;

            // Log Reading History
            const history = JSON.parse(localStorage.getItem("quran_history") || "[]");
            const hIndex = history.findIndex(h => h.surahNumber === surahNum);
            if (hIndex > -1) {
              history.splice(hIndex, 1);
            }
            history.unshift({
              surahNumber: surahNum,
              surahName: activeSurahMeta.englishName,
              timestamp: new Date().toISOString()
            });
            if (history.length > 10) history.pop();
            localStorage.setItem("quran_history", JSON.stringify(history));

            // Log Last Read Coordinates (Default: Verse 1 of loaded Surah)
            const lastRead = {
              surahNumber: surahNum,
              surahName: activeSurahMeta.englishName,
              verseNumber: scrollToVerseNum || 1,
              text: currentVerses[(scrollToVerseNum || 1) - 1]?.text || "",
              translation: currentVerses[(scrollToVerseNum || 1) - 1]?.englishTranslation || ""
            };
            localStorage.setItem("quran_last_read", JSON.stringify(lastRead));
          }

          renderVerses();

          if (scrollToVerseNum) {
            setTimeout(() => {
              const verseRow = document.getElementById(`verse-row-${scrollToVerseNum - 1}`);
              if (verseRow) {
                verseRow.scrollIntoView({ behavior: "smooth", block: "center" });
                verseRow.classList.add("ring-2", "ring-emerald-500/50");
                setTimeout(() => verseRow.classList.remove("ring-2", "ring-emerald-500/50"), 3000);
              }
            }, 500);
          }

          if (shouldAutoPlay && currentVerses.length > 0) {
            playVerse(0);
          } else {
            // Keep player state in sync if a surah is loaded
            activePlayingVerseIndex = -1;
            updateActiveVerseHighlight();
          }
        } else {
          versesContainer.innerHTML = `<div class="text-sm text-red-500 text-center py-20">Failed to fetch Surah contents.</div>`;
        }
      } catch (err) {
        console.error("Error loading Surah contents:", err);
        versesContainer.innerHTML = `<div class="text-sm text-red-500 text-center py-20">Network error fetching Surah.</div>`;
      }
    }

    // 5. Render verses layout
    function renderVerses() {
      if (!versesContainer) return;
      versesContainer.innerHTML = "";

      // Add Bismillah banner if not Surah 9 (Al-Tawbah) and not Surah 1 (Al-Fatihah, where Bismillah is verse 1)
      if (currentSurahNumber !== 9 && currentSurahNumber !== 1) {
        const bisDiv = document.createElement("div");
        bisDiv.className = "text-center py-4 font-amiri text-2xl text-emerald-800 dark:text-emerald-400 border-b border-emerald-500/5 select-none";
        bisDiv.textContent = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
        versesContainer.appendChild(bisDiv);
      }

      const bookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");

      currentVerses.forEach((v, index) => {
        const verseRow = document.createElement("div");
        verseRow.id = `verse-row-${index}`;
        verseRow.className = "p-4 md:p-6 rounded-2xl border border-transparent transition-all space-y-4";

        const isBookmarked = bookmarks.some(b => b.surahNumber === currentSurahNumber && b.verseNumber === v.numberInSurah);

        verseRow.innerHTML = `
          <div class="flex items-start justify-between gap-4">
            <!-- Verse marker badge & play action & bookmark action -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-450 border border-emerald-500/10">
                ${v.numberInSurah}
              </span>
              <button onclick="window.playVerseFromUI(${index})" class="p-1.5 rounded-lg text-emerald-650 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 transition-colors cursor-pointer" title="Play Verse">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M4.555 3.168A1 1 0 003 4v12a1 1 0 001.555.832l10-6a1 1 0 000-1.664l-10-6z"/></svg>
              </button>
              <button onclick="window.toggleBookmarkFromUI(${index})" class="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 transition-colors cursor-pointer" title="Bookmark Verse">
                <svg class="w-4 h-4 ${isBookmarked ? 'fill-current' : 'fill-none stroke-current'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
            
            <!-- Verse Arabic scripture -->
            <div class="quran-text text-right text-slate-800 dark:text-slate-100 flex-grow" style="font-size: ${arabicFontSize}px">
              ${v.text}
            </div>
          </div>

          <!-- Parallel Translations Area -->
          <div class="translation-block space-y-4 pl-9 ${isTranslationVisible ? '' : 'hidden'}">
            <!-- Urdu Translation -->
            <div class="text-right rtl font-amiri text-xl font-bold text-emerald-800 dark:text-emerald-400">
              <div class="flex items-center justify-between gap-2 mb-1 flex-row-reverse select-none">
                <span class="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">اردو ترجمہ</span>
                <button onclick="window.playUrduAudioFromUI(this, ${index})" class="p-1 rounded text-emerald-600 dark:text-emerald-450 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 transition-colors flex items-center justify-center cursor-pointer focus:outline-none" title="Listen to Translation">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5C3.12 7.5 2 8.62 2 10v4c0 1.38 1.12 2.5 2.5 2.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                </button>
              </div>
              <span id="urdu-text-${index}">${v.urduTranslation}</span>
            </div>

            <!-- English Translation -->
            <div class="text-left ltr text-sm font-semibold text-slate-500 dark:text-slate-300">
              <span class="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">English Translation</span>
              ${v.englishTranslation}
            </div>
          </div>

          <!-- Inline Collapsible Tafseer Area -->
          <div class="pl-9 pt-1.5 border-t border-slate-150 dark:border-slate-800/60">
            <button onclick="window.toggleTafseerInline(${index})" class="flex items-center gap-1 text-[11px] font-bold text-emerald-650 dark:text-emerald-450 hover:underline">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <span id="tafseer-toggle-btn-txt-${index}">Show Tafseer (Urdu)</span>
            </button>
            
            <div id="tafseer-inline-box-${index}" class="hidden mt-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 text-right rtl font-amiri text-xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
              <div class="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-1.5 mb-1.5 flex-row-reverse select-none">
                <span class="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">تفسیر (تفہیم القرآن)</span>
                <button onclick="window.speakText(this, ${index}, 'tafseer')" class="p-1 rounded text-emerald-600 dark:text-emerald-450 hover:bg-slate-200 dark:hover:bg-slate-800/30 hover:text-emerald-700 transition-colors flex items-center justify-center cursor-pointer focus:outline-none" title="Listen to Tafseer">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5C3.12 7.5 2 8.62 2 10v4c0 1.38 1.12 2.5 2.5 2.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                </button>
              </div>
              <span id="tafseer-text-${index}">${v.tafseer}</span>
            </div>
          </div>
        `;
        versesContainer.appendChild(verseRow);
      });

      // Keep scrolling container active verse highlighted if applicable
      updateActiveVerseHighlight();
    }

    // 6. Font adjustment actions
    if (btnFontIncrease) {
      btnFontIncrease.addEventListener("click", () => {
        if (arabicFontSize < 48) {
          arabicFontSize += 3;
          renderVerses();
        }
      });
    }
    if (btnFontDecrease) {
      btnFontDecrease.addEventListener("click", () => {
        if (arabicFontSize > 18) {
          arabicFontSize -= 3;
          renderVerses();
        }
      });
    }

    // 7. Translation toggle action
    if (btnToggleTranslation) {
      btnToggleTranslation.addEventListener("click", () => {
        isTranslationVisible = !isTranslationVisible;
        btnToggleTranslation.textContent = isTranslationVisible ? "Hide Translation" : "Show Translation";

        const transTexts = document.querySelectorAll(".translation-text");
        transTexts.forEach((el) => {
          if (isTranslationVisible) {
            el.classList.remove("hidden");
          } else {
            el.classList.add("hidden");
          }
        });
      });
    }

    // 8. Dynamic Audio Controls & Event Listeners
    window.playVerseFromUI = function (index) {
      playVerse(index);
    };

    function playVerse(index) {
      if (index < 0 || index >= currentVerses.length) {
        // Index out of bounds (End of Surah)
        stopPlayback();
        return;
      }

      activePlayingVerseIndex = index;
      const verse = currentVerses[index];

      // Update Player details
      playerSubtitle.textContent = `Verse ${verse.numberInSurah} of ${currentVerses.length}`;
      quranAudio.src = verse.audio;
      quranAudio.play()
        .then(() => {
          playerBar.classList.remove("translate-y-full"); // Slide up player
          playIcon.classList.add("hidden");
          pauseIcon.classList.remove("hidden");
          updateActiveVerseHighlight();
          scrollToActiveVerse();
        })
        .catch(err => {
          console.error("Audio playback error:", err);
          stopPlayback();
        });
    }

    function togglePlay() {
      if (quranAudio.paused) {
        if (activePlayingVerseIndex === -1 && currentVerses.length > 0) {
          playVerse(0);
        } else {
          quranAudio.play();
          playIcon.classList.add("hidden");
          pauseIcon.classList.remove("hidden");
        }
      } else {
        quranAudio.pause();
        playIcon.classList.remove("hidden");
        pauseIcon.classList.add("hidden");
      }
    }

    function playNextVerse() {
      playVerse(activePlayingVerseIndex + 1);
    }

    function playPrevVerse() {
      playVerse(activePlayingVerseIndex - 1);
    }

    function stopPlayback() {
      quranAudio.pause();
      activePlayingVerseIndex = -1;
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
      updateActiveVerseHighlight();
    }

    function updateActiveVerseHighlight() {
      // Remove highlight from all verses
      const rows = document.querySelectorAll("[id^='verse-row-']");
      rows.forEach(r => r.classList.remove("verse-active"));

      // Add highlight to current
      if (activePlayingVerseIndex !== -1) {
        const activeRow = document.getElementById(`verse-row-${activePlayingVerseIndex}`);
        if (activeRow) activeRow.classList.add("verse-active");
      }
    }

    function scrollToActiveVerse() {
      if (activePlayingVerseIndex === -1) return;
      const activeRow = document.getElementById(`verse-row-${activePlayingVerseIndex}`);
      if (activeRow && versesContainer) {
        // Scroll active row smoothly into view inside the scroll container
        versesContainer.scrollTo({
          top: activeRow.offsetTop - versesContainer.offsetTop - 20,
          behavior: "smooth"
        });
      }
    }

    // Audio tag event observers
    quranAudio.addEventListener("timeupdate", () => {
      if (isDraggingSlider) return;
      if (quranAudio.duration) {
        const progress = (quranAudio.currentTime / quranAudio.duration) * 100;
        playerSlider.value = progress;
        playerTimeCurrent.textContent = formatTime(quranAudio.currentTime);
      }
    });

    quranAudio.addEventListener("loadedmetadata", () => {
      playerTimeTotal.textContent = formatTime(quranAudio.duration);
    });

    quranAudio.addEventListener("ended", () => {
      // Continuous autoplay next verse!
      playNextVerse();
    });

    // Player controls buttons handlers
    playerBtnPlay.addEventListener("click", togglePlay);
    playerBtnPrev.addEventListener("click", playPrevVerse);
    playerBtnNext.addEventListener("click", playNextVerse);

    playerBtnClose.addEventListener("click", () => {
      stopPlayback();
      playerBar.classList.add("translate-y-full"); // Slide down player
    });

    // Slider controls
    playerSlider.addEventListener("mousedown", () => { isDraggingSlider = true; });
    playerSlider.addEventListener("mouseup", () => { isDraggingSlider = false; });
    playerSlider.addEventListener("input", (e) => {
      if (quranAudio.duration) {
        const val = e.target.value;
        quranAudio.currentTime = (val / 100) * quranAudio.duration;
        playerTimeCurrent.textContent = formatTime(quranAudio.currentTime);
      }
    });

    // Volume sliders
    playerVolume.addEventListener("input", (e) => {
      const vol = e.target.value / 100;
      quranAudio.volume = vol;
      isMuted = vol === 0;
      updateVolumeUI(vol);
    });

    playerBtnMute.addEventListener("click", () => {
      isMuted = !isMuted;
      if (isMuted) {
        previousVolume = quranAudio.volume;
        quranAudio.volume = 0;
        playerVolume.value = 0;
      } else {
        quranAudio.volume = previousVolume;
        playerVolume.value = previousVolume * 100;
      }
      updateVolumeUI(quranAudio.volume);
    });

    function updateVolumeUI(vol) {
      if (vol === 0) {
        volumeHighIcon.classList.add("hidden");
        volumeMutedIcon.classList.remove("hidden");
      } else {
        volumeHighIcon.classList.remove("hidden");
        volumeMutedIcon.classList.add("hidden");
      }
    }

    // Reciter dropdown selection trigger
    if (playerReciterSelect) {
      playerReciterSelect.addEventListener("change", (e) => {
        selectedReciter = e.target.value;
        // Reload surah to update audio Links, preserving active position if possible
        const lastActiveIndex = activePlayingVerseIndex;
        loadSurah(currentSurahNumber, false).then(() => {
          if (lastActiveIndex !== -1) {
            playVerse(lastActiveIndex);
          }
        });
      });
    }

    // ================= TAFSEER CONTROLLER INLINE =================
    window.toggleTafseerInline = function (index) {
      const box = document.getElementById(`tafseer-inline-box-${index}`);
      const btnTxt = document.getElementById(`tafseer-toggle-btn-txt-${index}`);
      if (box && btnTxt) {
        if (box.classList.contains("hidden")) {
          box.classList.remove("hidden");
          btnTxt.textContent = "Hide Tafseer";
        } else {
          box.classList.add("hidden");
          btnTxt.textContent = "Show Tafseer (Urdu)";
        }
      }
    };
    // ================= BOOKMARKS & HISTORY CONTROLLERS =================
    window.loadSidebarBookmarksAndHistory = function () {
      const bookmarksListEl = document.getElementById("sidebar-bookmarks-list");
      const historyListEl = document.getElementById("sidebar-history-list");

      if (bookmarksListEl) {
        const bookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
        if (bookmarks.length === 0) {
          bookmarksListEl.innerHTML = `<div class="text-center py-6 text-slate-450 italic text-[10px]">No bookmarked verses yet.</div>`;
        } else {
          bookmarksListEl.innerHTML = "";
          bookmarks.forEach(b => {
            const bRow = document.createElement("div");
            bRow.className = "p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[10px]";

            bRow.innerHTML = `
              <button onclick="window.goToVerseFromSearch(${b.surahNumber}, ${b.verseNumber})" class="font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors text-left flex-grow truncate focus:outline-none cursor-pointer">
                Surah ${b.surahName} (${b.surahNumber}:${b.verseNumber})
              </button>
              <button onclick="window.removeBookmarkFromSidebar(${b.surahNumber}, ${b.verseNumber})" class="text-red-400 hover:text-red-500 transition-colors font-bold text-[9px] cursor-pointer focus:outline-none flex-shrink-0">
                Remove
              </button>
            `;
            bookmarksListEl.appendChild(bRow);
          });
        }
      }

      if (historyListEl) {
        const history = JSON.parse(localStorage.getItem("quran_history") || "[]");
        if (history.length === 0) {
          historyListEl.innerHTML = `<div class="text-center py-6 text-slate-455 italic text-[10px]">No reading history yet.</div>`;
        } else {
          historyListEl.innerHTML = "";
          history.forEach(h => {
            const hRow = document.createElement("button");
            hRow.className = "w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-left hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-[10px] font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center cursor-pointer focus:outline-none";
            hRow.innerHTML = `
              <span>Surah ${h.surahName}</span>
              <span class="text-[8px] text-slate-400 font-normal font-sans">${new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            `;
            hRow.onclick = () => {
              window.goToVerseFromSearch(h.surahNumber, 1);
            };
            historyListEl.appendChild(hRow);
          });
        }
      }
    };

    window.toggleBookmarkFromUI = function (index) {
      if (index >= 0 && index < currentVerses.length) {
        const v = currentVerses[index];
        const bookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
        const bIndex = bookmarks.findIndex(b => b.surahNumber === currentSurahNumber && b.verseNumber === v.numberInSurah);

        const activeSurahMeta = surahsList.find(s => s.number === currentSurahNumber);
        const surahName = activeSurahMeta ? activeSurahMeta.englishName : "Surah";

        if (bIndex > -1) {
          bookmarks.splice(bIndex, 1);
        } else {
          bookmarks.push({
            surahNumber: currentSurahNumber,
            surahName: surahName,
            verseNumber: v.numberInSurah,
            text: v.text,
            englishTranslation: v.englishTranslation,
            urduTranslation: v.urduTranslation
          });
        }
        localStorage.setItem("quran_bookmarks", JSON.stringify(bookmarks));
        renderVerses();

        if (tabBookmarksBtn && tabBookmarksBtn.classList.contains("border-emerald-600")) {
          window.loadSidebarBookmarksAndHistory();
        }
      }
    };

    window.removeBookmarkFromSidebar = function (surahNumber, verseNumber) {
      const bookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
      const bIndex = bookmarks.findIndex(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber);
      if (bIndex > -1) {
        bookmarks.splice(bIndex, 1);
        localStorage.setItem("quran_bookmarks", JSON.stringify(bookmarks));
        window.loadSidebarBookmarksAndHistory();
        if (surahNumber === currentSurahNumber) {
          renderVerses();
        }
      }
    };
    // ================= DAILY AYAT ENGINE =================
    const dailyArabicEl = document.getElementById("daily-verse-arabic");
    if (dailyArabicEl) {
      loadDailyAyat();
    }

    async function loadDailyAyat() {
      const today = new Date();
      const dateString = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

      let hash = 0;
      for (let i = 0; i < dateString.length; i++) {
        hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
      }
      const absoluteAyahNumber = Math.abs(hash) % 6236 || 1;

      try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${absoluteAyahNumber}/editions/quran-uthmani,en.sahih,ur.jalandhry,ar.alafasy`);
        if (res.ok) {
          const body = await res.json();
          const editions = body.data;

          const arabicText = editions[0].text;
          const englishText = editions[1].text;
          const urduText = editions[2].text;
          const audioUrl = editions[3].audio;
          const surahName = editions[0].surah.englishName;
          const surahNumber = editions[0].surah.number;
          const numberInSurah = editions[0].numberInSurah;

          const refEl = document.getElementById("daily-verse-ref");
          const arabicEl = document.getElementById("daily-verse-arabic");
          const transEl = document.getElementById("daily-verse-translation");

          if (refEl) refEl.textContent = `Surah ${surahName} ${surahNumber}:${numberInSurah}`;
          if (arabicEl) arabicEl.textContent = arabicText;
          if (transEl) {
            transEl.innerHTML = `
              <div class="space-y-3">
                <div class="text-left ltr text-xs font-semibold text-slate-300">
                  <span class="text-[9px] uppercase tracking-wider text-emerald-400 block mb-1">English Translation</span>
                  ${englishText}
                </div>
                <div class="text-right rtl font-amiri text-lg font-bold text-emerald-300">
                  <span class="text-[9px] uppercase font-sans tracking-wider text-emerald-400 block mb-1">اردو ترجمہ</span>
                  ${urduText}
                </div>
              </div>
            `;
          }

          const playBtn = document.getElementById("btn-play-daily");
          if (playBtn) {
            let dailyAudio = null;
            playBtn.addEventListener("click", () => {
              if (dailyAudio && !dailyAudio.paused) {
                dailyAudio.pause();
                playBtn.innerHTML = `<span class="text-amber-400">▶</span> Play Recitation`;
              } else {
                if (!dailyAudio) {
                  dailyAudio = new Audio(audioUrl);
                  dailyAudio.addEventListener("ended", () => {
                    playBtn.innerHTML = `<span class="text-amber-400">▶</span> Play Recitation`;
                  });
                }
                dailyAudio.play();
                playBtn.innerHTML = `<span class="text-amber-400">⏸</span> Pause Recitation`;
              }
            });
          }

          const bookmarkBtn = document.getElementById("btn-bookmark-daily");
          if (bookmarkBtn) {
            const bookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
            const isBookmarked = bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === numberInSurah);
            bookmarkBtn.textContent = isBookmarked ? "✦ Bookmarked" : "✦ Bookmark";

            bookmarkBtn.addEventListener("click", () => {
              const currentBookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
              const index = currentBookmarks.findIndex(b => b.surahNumber === surahNumber && b.verseNumber === numberInSurah);
              if (index > -1) {
                currentBookmarks.splice(index, 1);
                bookmarkBtn.textContent = "✦ Bookmark";
              } else {
                currentBookmarks.push({
                  surahNumber,
                  surahName,
                  verseNumber: numberInSurah,
                  text: arabicText,
                  englishTranslation: englishText,
                  urduTranslation: urduText
                });
                bookmarkBtn.textContent = "✦ Bookmarked";
              }
              localStorage.setItem("quran_bookmarks", JSON.stringify(currentBookmarks));
            });
          }
        }
      } catch (err) {
        console.error("Error loading Daily Ayat:", err);
      }
    }

    // Util Time formatter
    function formatTime(seconds) {
      if (isNaN(seconds)) return "00:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
  }
});

// ================= DASHBOARD WIDGET UPDATERS =================
function updateDashboardWidgets() {
  const dashLastReadCard = document.getElementById("dash-last-read-card");
  const dashLastReadRef = document.getElementById("dash-last-read-ref");
  const dashLastReadArabic = document.getElementById("dash-last-read-arabic");
  const dashLastReadTranslation = document.getElementById("dash-last-read-translation");
  const dashBtnContinueReading = document.getElementById("dash-btn-continue-reading");

  const dashBookmarksContainer = document.getElementById("dashboard-bookmarks-container");

  // 1. Update Last Read widget
  if (dashLastReadCard) {
    const lastRead = JSON.parse(localStorage.getItem("quran_last_read"));
    if (lastRead) {
      if (dashLastReadRef) dashLastReadRef.textContent = `Surah ${lastRead.surahName} (${lastRead.surahNumber}:${lastRead.verseNumber})`;
      if (dashLastReadArabic) dashLastReadArabic.textContent = lastRead.text || "بِسْمِ ٱللَّهِ";
      if (dashLastReadTranslation) dashLastReadTranslation.textContent = lastRead.translation || "";
      if (dashBtnContinueReading) {
        dashBtnContinueReading.href = `index.html?surah=${lastRead.surahNumber}&verse=${lastRead.verseNumber}#quran`;
      }
    } else {
      // Default fallback
      if (dashLastReadRef) dashLastReadRef.textContent = "Surah Al-Kahf (18:10)";
      if (dashLastReadArabic) dashLastReadArabic.textContent = "إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ";
      if (dashLastReadTranslation) dashLastReadTranslation.textContent = "When the youths retreated to the cave...";
      if (dashBtnContinueReading) {
        dashBtnContinueReading.href = `index.html?surah=18&verse=10#quran`;
      }
    }
  }

  // 2. Update Bookmarks widget
  if (dashBookmarksContainer) {
    const bookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
    if (bookmarks.length === 0) {
      dashBookmarksContainer.innerHTML = `<div class="text-center py-10 text-xs text-slate-400">No bookmarked verses yet.</div>`;
    } else {
      dashBookmarksContainer.innerHTML = "";
      bookmarks.forEach(b => {
        const bRow = document.createElement("div");
        bRow.className = "py-2.5 flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800/50 last:border-0 group";

        bRow.innerHTML = `
          <a href="index.html?surah=${b.surahNumber}&verse=${b.verseNumber}#quran" class="font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors">
            Surah ${b.surahName} (${b.surahNumber}:${b.verseNumber})
          </a>
          <button onclick="window.removeBookmarkFromDashboard(${b.surahNumber}, ${b.verseNumber})" class="text-red-400 hover:text-red-500 transition-colors text-[10px] font-bold cursor-pointer focus:outline-none">
            Remove
          </button>
        `;
        dashBookmarksContainer.appendChild(bRow);
      });
    }
  }
}

window.removeBookmarkFromDashboard = function (surahNumber, verseNumber) {
  const bookmarks = JSON.parse(localStorage.getItem("quran_bookmarks") || "[]");
  const bIndex = bookmarks.findIndex(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber);
  if (bIndex > -1) {
    bookmarks.splice(bIndex, 1);
    localStorage.setItem("quran_bookmarks", JSON.stringify(bookmarks));
    updateDashboardWidgets();
  }
};

let activeUrduAudio = null;
let activeUrduAudioBtn = null;

window.playUrduAudioFromUI = function (btn, index) {
  if (index >= 0 && index < currentVerses.length) {
    const v = currentVerses[index];
    const audioUrl = v.urduAudio;

    if (!audioUrl) {
      alert("Urdu translation audio is not available.");
      return;
    }

    if (activeUrduAudio && !activeUrduAudio.paused) {
      activeUrduAudio.pause();
      if (activeUrduAudioBtn) {
        activeUrduAudioBtn.innerHTML = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5C3.12 7.5 2 8.62 2 10v4c0 1.38 1.12 2.5 2.5 2.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
      }
      if (activeUrduAudioBtn === btn) {
        activeUrduAudio = null;
        activeUrduAudioBtn = null;
        return;
      }
    }

    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    activeUrduAudio = new Audio(audioUrl);
    activeUrduAudioBtn = btn;

    btn.innerHTML = `<span class="text-[9px] font-sans font-bold text-amber-500 animate-pulse">Playing...</span>`;

    activeUrduAudio.play();

    activeUrduAudio.onended = () => {
      btn.innerHTML = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5C3.12 7.5 2 8.62 2 10v4c0 1.38 1.12 2.5 2.5 2.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
      activeUrduAudio = null;
      activeUrduAudioBtn = null;
    };

    activeUrduAudio.onerror = () => {
      btn.innerHTML = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5C3.12 7.5 2 8.62 2 10v4c0 1.38 1.12 2.5 2.5 2.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
      activeUrduAudio = null;
      activeUrduAudioBtn = null;
      alert("Could not load Urdu recitation stream.");
    };
  }
};

window.speakText = function (btn, index, lang) {
  let text = "";
  if (lang === 'tafseer') {
    const el = document.getElementById(`tafseer-text-${index}`);
    if (el) text = el.textContent;
  }

  if (!text) return;

  if ('speechSynthesis' in window) {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // Reset button icon
      btn.innerHTML = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5C3.12 7.5 2 8.62 2 10v4c0 1.38 1.12 2.5 2.5 2.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ur-PK';

    btn.innerHTML = `<span class="text-[9px] font-sans font-bold text-amber-500 animate-pulse">Playing...</span>`;

    utterance.onend = () => {
      btn.innerHTML = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5C3.12 7.5 2 8.62 2 10v4c0 1.38 1.12 2.5 2.5 2.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
    };

    utterance.onerror = () => {
      btn.innerHTML = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5C3.12 7.5 2 8.62 2 10v4c0 1.38 1.12 2.5 2.5 2.5h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
    };

    const voices = window.speechSynthesis.getVoices();
    // Prefer Urdu voice, fallback to Arabic or system default
    const urVoice = voices.find(v => v.lang.startsWith('ur') || v.lang.startsWith('ar'));
    if (urVoice) utterance.voice = urVoice;

    window.speechSynthesis.speak(utterance);
  } else {
    alert("Text-to-speech is not supported in your browser.");
  }
};

// ================= PRAYER TIMES & QIBLA COMPASS MODULE 3 =================

// State Configuration
let prayerSettings = {
  locMode: "gps", // "gps" or "manual"
  manualPreset: "karachi",
  lat: 24.8607,
  lng: 67.0011,
  calcMethod: "3", // MWL
  asrSchool: "0", // Standard (Shafi)
  cityName: "Karachi",
  hijriAdjust: 0
};

// Preset Coordinates Mapping
const PRESET_CITIES = {
  karachi: { lat: 24.8607, lng: 67.0011, name: "Karachi, PK" },
  makkah: { lat: 21.4225, lng: 39.8262, name: "Makkah, SA" },
  london: { lat: 51.5074, lng: -0.1278, name: "London, UK" },
  newyork: { lat: 40.7128, lng: -74.0060, name: "New York, US" },
  cairo: { lat: 30.0444, lng: 31.2357, name: "Cairo, EG" },
  istanbul: { lat: 41.0082, lng: 28.9784, name: "Istanbul, TR" },
  dhaka: { lat: 23.8103, lng: 90.4125, name: "Dhaka, BD" },
  dubai: { lat: 25.2048, lng: 55.2708, name: "Dubai, AE" },
  sydney: { lat: -33.8688, lng: 151.2093, name: "Sydney, AU" }
};

// Load saved settings
function loadPrayerSettings() {
  const saved = localStorage.getItem("nqp_prayer_settings");
  if (saved) {
    try {
      prayerSettings = { ...prayerSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Failed to load prayer settings:", e);
    }
  }
}

// Save current settings
function savePrayerSettings() {
  localStorage.setItem("nqp_prayer_settings", JSON.stringify(prayerSettings));
}

// Calculate client bearing to Makkah
function getQiblaBearing(lat, lng) {
  const kaabaLat = 21.422487 * Math.PI / 180;
  const kaabaLng = 39.826206 * Math.PI / 180;
  const myLat = lat * Math.PI / 180;
  const myLng = lng * Math.PI / 180;

  const dLng = kaabaLng - myLng;
  const y = Math.sin(dLng);
  const x = Math.cos(myLat) * Math.tan(kaabaLat) - Math.sin(myLat) * Math.cos(dLng);

  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360;
  return bearing;
}

// Fetch and load prayer times (with memory caching support)
let cachedTimings = null;
let cachedDateKey = "";

async function updatePrayerTimes() {
  const lat = prayerSettings.lat;
  const lng = prayerSettings.lng;
  const method = prayerSettings.calcMethod;
  const school = prayerSettings.asrSchool;

  // Format today's date DD-MM-YYYY
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;

  // Update Location indicators in HTML
  const locText = prayerSettings.locMode === "gps" ? `GPS (${lat.toFixed(2)}, ${lng.toFixed(2)})` : prayerSettings.cityName;

  const homeLocEl = document.getElementById("home-prayer-location");
  if (homeLocEl) homeLocEl.textContent = locText;

  const dashLocEl = document.getElementById("dash-prayer-location");
  if (dashLocEl) dashLocEl.textContent = locText;

  // Cache hit check: skip API request if settings and date remain unchanged
  const currentConfigKey = `${dateStr}_${lat}_${lng}_${method}_${school}`;
  if (cachedTimings && cachedDateKey === currentConfigKey) {
    renderPrayerTimes(cachedTimings);
    return;
  }

  try {
    const res = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`);
    if (!res.ok) throw new Error("Failed to fetch timings from Aladhan");

    const data = await res.json();
    const timings = data.data.timings;

    cachedTimings = timings;
    cachedDateKey = currentConfigKey;
    renderPrayerTimes(timings);
  } catch (err) {
    console.error("Error loading Prayer Times:", err);
    if (cachedTimings) {
      renderPrayerTimes(cachedTimings);
    }
  }
}

// Render values into elements
function renderPrayerTimes(timings) {
  // Normalize prayer values
  const prayers = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha }
  ];

  // Render on Homepage
  prayers.forEach(p => {
    const timeEl = document.getElementById(`home-${p.name.toLowerCase()}-time`);
    if (timeEl) {
      timeEl.textContent = format12Hour(p.time);
    }
  });

  // Calculate active and next prayer
  const activeObj = getActivePrayer(prayers);
  const homeActiveBadge = document.getElementById("home-prayer-active-badge");
  if (homeActiveBadge) {
    homeActiveBadge.textContent = `Active: ${activeObj.active}`;
  }

  // Highlight active prayer card on homepage
  prayers.forEach(p => {
    const card = document.getElementById(`home-${p.name.toLowerCase()}-card`);
    if (card) {
      // Remove previous active classes
      card.className = "p-1.5 rounded-xl text-center transition-all bg-slate-800/30 border border-transparent text-slate-400 opacity-60";

      if (p.name === activeObj.active) {
        card.className = "p-1.5 rounded-xl text-center transition-all bg-emerald-500/20 border-emerald-500 text-amber-300 scale-102 font-semibold shadow-md";
      } else if (p.name === activeObj.next) {
        card.className = "p-1.5 rounded-xl text-center transition-all bg-slate-800/60 border border-slate-700/50 text-slate-200";
      }
    }
  });

  // Render on Dashboard
  const dashList = document.getElementById("dash-prayer-list");
  if (dashList) {
    dashList.innerHTML = "";

    // Load Checked prayers for today
    const todayKey = `checked_prayers_${new Date().toDateString()}`;
    const checkedPrayers = JSON.parse(localStorage.getItem(todayKey) || "[]");

    // Automatically clean up old checked_prayers keys in localStorage to keep it tidy
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("checked_prayers_") && key !== todayKey) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn("Storage cleanup warning:", e);
    }

    prayers.forEach(p => {
      const isChecked = checkedPrayers.includes(p.name);
      const isActive = p.name === activeObj.active;

      const row = document.createElement("div");
      // Style base
      let rowClasses = "p-3.5 rounded-2xl flex items-center justify-between border bg-slate-50/50 dark:bg-slate-800/10 border-transparent text-slate-400 opacity-60 transition-all";

      if (isActive) {
        rowClasses = "p-3.5 rounded-2xl flex items-center justify-between border bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/60 text-slate-850 dark:text-white shadow-sm font-semibold prayer-active-row";
      } else if (!isActive && isChecked) {
        rowClasses = "p-3.5 rounded-2xl flex items-center justify-between border bg-slate-50/50 dark:bg-slate-800/10 border-transparent text-slate-800 dark:text-slate-350 transition-all";
      } else if (!isActive && !isChecked) {
        rowClasses = "p-3.5 rounded-2xl flex items-center justify-between border bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all";
      }

      row.className = rowClasses;
      row.innerHTML = `
        <div class="flex items-center gap-2.5">
          <input type="checkbox" id="chk-prayer-${p.name.toLowerCase()}" ${isChecked ? 'checked' : ''} 
            class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 cursor-pointer"
            onclick="window.togglePrayerCheck('${p.name}')">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider">${p.name}</span>
            ${isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping"></span>' : ''}
          </div>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="text-sm font-semibold">${format12Hour(p.time)}</span>
          <span id="chk-status-${p.name.toLowerCase()}" class="text-[11px] font-bold text-emerald-600 dark:text-emerald-450 ${isChecked ? '' : 'invisible'}">✓</span>
        </div>
      `;
      dashList.appendChild(row);
    });
  }
}

// Toggle prayer checkoff
window.togglePrayerCheck = function (prayerName) {
  const todayKey = `checked_prayers_${new Date().toDateString()}`;
  let checked = JSON.parse(localStorage.getItem(todayKey) || "[]");

  const idx = checked.indexOf(prayerName);
  if (idx > -1) {
    checked.splice(idx, 1);
  } else {
    checked.push(prayerName);
  }
  localStorage.setItem(todayKey, JSON.stringify(checked));

  // Re-render to reflect checkbox status
  updatePrayerTimes();
};

// Formatter to convert "13:30" to "01:30 PM"
function format12Hour(time24) {
  if (!time24) return "--:--";
  const parts = time24.split(':');
  let hrs = parseInt(parts[0]);
  const mins = parts[1];
  const ampm = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12;
  hrs = hrs ? hrs : 12; // 0 should be 12
  const hrsStr = String(hrs).padStart(2, '0');
  return `${hrsStr}:${mins} ${ampm}`;
}

// Helper to calculate active and next prayer
function getActivePrayer(prayers) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Map prayer times to minutes from midnight
  const times = prayers.map(p => {
    const parts = p.time.split(':');
    return {
      name: p.name,
      minutes: parseInt(parts[0]) * 60 + parseInt(parts[1])
    };
  });

  // Sort by minutes
  times.sort((a, b) => a.minutes - b.minutes);

  let activeIndex = -1;
  for (let i = 0; i < times.length; i++) {
    if (currentMinutes >= times[i].minutes) {
      activeIndex = i;
    }
  }

  // Fallback if before Fajr (active is Isha of yesterday, next is Fajr)
  if (activeIndex === -1) {
    return {
      active: "Isha",
      next: "Fajr"
    };
  }

  const activeName = times[activeIndex].name;
  const nextName = times[(activeIndex + 1) % times.length].name;

  return {
    active: activeName,
    next: nextName
  };
}

// Qibla Compass logic
let compassHeading = 0; // Device orientation heading
let qiblaHeading = 0; // Computed Qibla bearing
let manualHeading = 0; // Manually adjusted heading

function updateQiblaUI() {
  const dial = document.getElementById("qibla-compass-dial");
  const needle = document.getElementById("qibla-needle");

  const bearingText = document.getElementById("qibla-bearing-text");
  const coordsText = document.getElementById("qibla-coords-text");

  if (bearingText) bearingText.textContent = `Qibla Direction: ${qiblaHeading.toFixed(1)}°`;
  if (coordsText) coordsText.textContent = `Coordinates: ${prayerSettings.lat.toFixed(4)}°, ${prayerSettings.lng.toFixed(4)}°`;

  // Total dial rotation includes device heading or manual slider heading
  const dialRotation = compassHeading !== 0 ? -compassHeading : -manualHeading;
  const needleRotation = qiblaHeading + dialRotation;

  if (dial) dial.style.transform = `rotate(${dialRotation}deg)`;
  if (needle) needle.style.transform = `rotate(${needleRotation}deg)`;
}

// Setup orientation sensors
function initQiblaCompass() {
  qiblaHeading = getQiblaBearing(prayerSettings.lat, prayerSettings.lng);
  updateQiblaUI();

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const desktopCtrls = document.getElementById("qibla-desktop-controls");

  if (!isMobile) {
    // Show manual slider for desktop fallback
    if (desktopCtrls) {
      desktopCtrls.classList.remove("hidden");
      const slider = document.getElementById("qibla-manual-slider");
      const sliderVal = document.getElementById("qibla-slider-value");
      if (slider && sliderVal) {
        slider.addEventListener("input", (e) => {
          manualHeading = parseInt(e.target.value);
          sliderVal.textContent = `${manualHeading}°`;
          updateQiblaUI();
        });
      }
    }

    const statusText = document.getElementById("qibla-status-text");
    if (statusText) statusText.textContent = "Adjust compass manually using slider";
    return;
  }

  // Device orientation checking for mobile
  const statusText = document.getElementById("qibla-status-text");
  if (statusText) statusText.textContent = "Align device to North";

  const handleOrientation = (e) => {
    if (e.webkitCompassHeading !== undefined) {
      compassHeading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      compassHeading = 360 - e.alpha;
    }
    updateQiblaUI();
  };

  // Check absolute orientation events (mainly for Android)
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    // Compass click prompt to request permission (required for newer iOS versions)
    const compassBox = document.getElementById("qibla-compass-dial");
    if (compassBox) {
      compassBox.style.cursor = "pointer";
      compassBox.addEventListener("click", async () => {
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          try {
            const permissionState = await DeviceOrientationEvent.requestPermission();
            if (permissionState === "granted") {
              window.addEventListener("deviceorientation", handleOrientation, true);
              if (statusText) statusText.textContent = "Orientation active";
            } else {
              alert("Compass orientation permission denied. You can still use the manual slider if available.");
            }
          } catch (error) {
            console.error("Error requesting DeviceOrientation permission:", error);
          }
        }
      });
    }
  }
}

// IP Geolocation Fallback (completely automatic, silent)
async function detectIPLocation() {
  try {
    const res = await fetch("https://ip-api.com/json/");
    if (res.ok) {
      const ipData = await res.json();
      if (ipData && ipData.lat && ipData.lon) {
        console.log("IP-based geolocation auto-detected:", ipData.city, ipData.lat, ipData.lon);

        // Auto update if user is in GPS mode and hasn't received higher precision GPS coordinates yet
        if (prayerSettings.locMode === "gps" && (prayerSettings.lat === 24.8607 && prayerSettings.lng === 67.0011)) {
          prayerSettings.lat = ipData.lat;
          prayerSettings.lng = ipData.lon;
          prayerSettings.cityName = `${ipData.city}, ${ipData.countryCode || ""}`;
          savePrayerSettings();

          updatePrayerTimes();
          qiblaHeading = getQiblaBearing(ipData.lat, ipData.lon);
          updateQiblaUI();
        }
      }
    }
  } catch (e) {
    console.warn("Silent IP Geolocation fallback failed:", e);
  }
}

// GPS Location detection helper
function detectGPSLocation() {
  const gpsStatus = document.getElementById("settings-gps-status");
  const gpsLat = document.getElementById("settings-gps-lat");
  const gpsLng = document.getElementById("settings-gps-lng");

  if (!navigator.geolocation) {
    if (gpsStatus) gpsStatus.textContent = "Not Supported";
    detectIPLocation(); // Fallback silently
    return;
  }

  if (gpsStatus) gpsStatus.textContent = "Requesting...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (gpsStatus) gpsStatus.textContent = "Active";
      if (gpsLat) gpsLat.textContent = lat.toFixed(4);
      if (gpsLng) gpsLng.textContent = lng.toFixed(4);

      if (prayerSettings.locMode === "gps") {
        prayerSettings.lat = lat;
        prayerSettings.lng = lng;
        savePrayerSettings();
        updatePrayerTimes();
        qiblaHeading = getQiblaBearing(lat, lng);
        updateQiblaUI();
      }
    },
    (err) => {
      console.warn("Geolocation error:", err);
      if (gpsStatus) gpsStatus.textContent = "Denied/Unavailable";

      // Auto fallback to IP location silently on GPS block or failure
      if (prayerSettings.locMode === "gps") {
        detectIPLocation();
      }
    },
    { enableHighAccuracy: true, timeout: 6000 }
  );
}

// Open settings modal
window.openPrayerSettingsModal = function () {
  const modal = document.getElementById("prayer-settings-modal");
  if (!modal) return;

  // Initialize input fields based on settings state
  const methodSelect = document.getElementById("settings-calc-method");
  const schoolSelect = document.getElementById("settings-asr-school");
  const citySelect = document.getElementById("settings-city-preset");
  const manualLatInput = document.getElementById("settings-manual-lat");
  const manualLngInput = document.getElementById("settings-manual-lng");

  if (methodSelect) methodSelect.value = prayerSettings.calcMethod;
  if (schoolSelect) schoolSelect.value = prayerSettings.asrSchool;
  if (citySelect) citySelect.value = prayerSettings.manualPreset;
  if (manualLatInput) manualLatInput.value = prayerSettings.lat;
  if (manualLngInput) manualLngInput.value = prayerSettings.lng;

  applyLocationModeUI();
  detectGPSLocation(); // Probe GPS details

  modal.classList.remove("hidden");
};

// Close settings modal
window.closePrayerSettingsModal = function () {
  const modal = document.getElementById("prayer-settings-modal");
  if (modal) modal.classList.add("hidden");
};

// Mode switcher UI helper
function applyLocationModeUI() {
  const gpsBtn = document.getElementById("settings-loc-gps");
  const manualBtn = document.getElementById("settings-loc-manual");

  const gpsInfo = document.getElementById("settings-gps-info");
  const manualInfo = document.getElementById("settings-manual-info");

  if (!gpsBtn || !manualBtn) return;

  if (prayerSettings.locMode === "gps") {
    gpsBtn.className = "py-1.5 text-xs font-bold rounded-lg transition-all focus:outline-none bg-emerald-600 text-white shadow-sm cursor-pointer";
    manualBtn.className = "py-1.5 text-xs font-bold rounded-lg transition-all focus:outline-none text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350 cursor-pointer";
    if (gpsInfo) gpsInfo.classList.remove("hidden");
    if (manualInfo) manualInfo.classList.add("hidden");
  } else {
    manualBtn.className = "py-1.5 text-xs font-bold rounded-lg transition-all focus:outline-none bg-emerald-600 text-white shadow-sm cursor-pointer";
    gpsBtn.className = "py-1.5 text-xs font-bold rounded-lg transition-all focus:outline-none text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350 cursor-pointer";
    if (gpsInfo) gpsInfo.classList.add("hidden");
    if (manualInfo) manualInfo.classList.remove("hidden");
  }
}

// On Settings Save
function handleSettingsSave(e) {
  e.preventDefault();

  const methodSelect = document.getElementById("settings-calc-method");
  const schoolSelect = document.getElementById("settings-asr-school");
  const citySelect = document.getElementById("settings-city-preset");
  const manualLatInput = document.getElementById("settings-manual-lat");
  const manualLngInput = document.getElementById("settings-manual-lng");

  if (methodSelect) prayerSettings.calcMethod = methodSelect.value;
  if (schoolSelect) prayerSettings.asrSchool = schoolSelect.value;

  if (prayerSettings.locMode === "manual") {
    const preset = citySelect ? citySelect.value : "karachi";
    prayerSettings.manualPreset = preset;

    if (preset === "custom") {
      prayerSettings.lat = parseFloat(manualLatInput.value) || 24.8607;
      prayerSettings.lng = parseFloat(manualLngInput.value) || 67.0011;
      prayerSettings.cityName = `Custom (${prayerSettings.lat.toFixed(2)}, ${prayerSettings.lng.toFixed(2)})`;
    } else {
      const data = PRESET_CITIES[preset];
      prayerSettings.lat = data.lat;
      prayerSettings.lng = data.lng;
      prayerSettings.cityName = data.name;
    }
  }

  savePrayerSettings();
  updatePrayerTimes();

  qiblaHeading = getQiblaBearing(prayerSettings.lat, prayerSettings.lng);
  updateQiblaUI();

  window.closePrayerSettingsModal();
}

// Initial binding
function initPrayerAndQiblaModule() {
  loadPrayerSettings();

  // Set up event listeners for settings elements
  const gpsBtn = document.getElementById("settings-loc-gps");
  const manualBtn = document.getElementById("settings-loc-manual");
  if (gpsBtn && manualBtn) {
    gpsBtn.addEventListener("click", () => {
      prayerSettings.locMode = "gps";
      applyLocationModeUI();
      detectGPSLocation();
    });
    manualBtn.addEventListener("click", () => {
      prayerSettings.locMode = "manual";
      applyLocationModeUI();
    });
  }

  const citySelect = document.getElementById("settings-city-preset");
  const customCoordsRow = document.getElementById("settings-custom-coords-row");
  if (citySelect) {
    citySelect.addEventListener("change", (e) => {
      if (e.target.value === "custom") {
        if (customCoordsRow) customCoordsRow.classList.remove("hidden");
      } else {
        if (customCoordsRow) customCoordsRow.classList.add("hidden");
      }
    });
  }

  const settingsForm = document.getElementById("prayer-settings-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", handleSettingsSave);
  }

  // Auto detect location: run silent IP geolocation lookup first to load times instantly
  if (prayerSettings.locMode === "gps") {
    detectIPLocation().then(() => {
      // Then attempt high-precision GPS lookup
      detectGPSLocation();
    });
  } else {
    updatePrayerTimes();
  }

  initQiblaCompass();

  // Automated periodic active prayer highlight refresher (every 30 seconds)
  setInterval(() => {
    updatePrayerTimes();
  }, 30000);
}

// Kick off when script loads and DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPrayerAndQiblaModule);
} else {
  initPrayerAndQiblaModule();
}

// Run Initializer
initFirebase();

// ================= FAITH & KNOWLEDGE TOOLS SYSTEM =================

// State variables
let tasbeehCount = 0;
let tasbeehTarget = 33;
let tasbeehDhikr = "SubhanAllah";
let currentCalDate = new Date();
let activeBook = null;
let activeChapterIndex = 0;
let activeHadithTopic = "all";
let audioCtx = null;

// Tab Switcher
window.switchFaithTab = function (tabId) {
  const tabs = ['tasbeeh', 'calendar', 'books', 'hadith', 'zakat', 'mosques'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const pane = document.getElementById(`pane-${t}`);

    if (btn) {
      if (t === tabId) {
        btn.classList.add('tab-active');
      } else {
        btn.classList.remove('tab-active');
      }
    }

    if (pane) {
      if (t === tabId) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    }
  });

  if (tabId === 'mosques') {
    window.initMosqueMap();
  }
};

// Tasbeeh Synthesizer Audio Feedback
function playTallySound(type) {
  try {
    const isEnabled = document.getElementById("tasbeeh-sound")?.checked;
    if (!isEnabled) return;

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(850, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } else if (type === "complete") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {
    console.warn("AudioContext playback blocked/failed:", e);
  }
}

// Tasbeeh Vibration Feedback
function triggerVibration(duration) {
  try {
    const isEnabled = document.getElementById("tasbeeh-vibration")?.checked;
    if (isEnabled && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  } catch (e) {
    console.warn("Vibrate failed:", e);
  }
}

// Tasbeeh Increment
window.incrementTasbeeh = function () {
  tasbeehCount++;

  const display = document.getElementById("tasbeeh-display");
  if (display) {
    display.textContent = String(tasbeehCount).padStart(2, '0');
  }

  // Check Target Met
  if (tasbeehTarget !== "infinite" && tasbeehCount >= tasbeehTarget) {
    playTallySound("complete");
    triggerVibration(200);

    // Save completion log
    saveTasbeehLog(tasbeehDhikr, tasbeehCount);

    // Toast alert
    const targetBadge = document.getElementById("tasbeeh-target-status");
    if (targetBadge) {
      const originalText = targetBadge.textContent;
      targetBadge.textContent = "🎯 Complete!";
      targetBadge.className = "text-[10px] font-semibold text-white bg-emerald-600 px-3 py-1 rounded-full animate-bounce";
      setTimeout(() => {
        targetBadge.textContent = originalText;
        targetBadge.className = "text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50";
      }, 2000);
    }

    tasbeehCount = 0;
    if (display) {
      setTimeout(() => {
        display.textContent = "00";
      }, 500);
    }
  } else {
    playTallySound("click");
    triggerVibration(15);
  }
};

window.decrementTasbeeh = function () {
  if (tasbeehCount > 0) {
    tasbeehCount--;
    const display = document.getElementById("tasbeeh-display");
    if (display) {
      display.textContent = String(tasbeehCount).padStart(2, '0');
    }
    playTallySound("click");
    triggerVibration(10);
  }
};

window.resetTasbeeh = function () {
  tasbeehCount = 0;
  const display = document.getElementById("tasbeeh-display");
  if (display) display.textContent = "00";
  playTallySound("click");
  triggerVibration(15);
};

window.onDhikrChange = function () {
  const preset = document.getElementById("tasbeeh-preset");
  const customRow = document.getElementById("tasbeeh-custom-row");
  const dhikrInputBox = document.getElementById("tasbeeh-custom-dhikr-box");

  if (!preset) return;

  if (preset.value === "custom") {
    if (customRow) customRow.classList.remove("hidden");
    if (dhikrInputBox) dhikrInputBox.classList.remove("hidden");
    tasbeehDhikr = "";
  } else {
    if (dhikrInputBox) dhikrInputBox.classList.add("hidden");
    if (customRow && document.getElementById("tasbeeh-custom-target-box").classList.contains("hidden")) {
      customRow.classList.add("hidden");
    }
    tasbeehDhikr = preset.options[preset.selectedIndex].text.split(' (')[0];
  }
};

window.onTargetChange = function () {
  const target = document.getElementById("tasbeeh-target");
  const customRow = document.getElementById("tasbeeh-custom-row");
  const targetInputBox = document.getElementById("tasbeeh-custom-target-box");
  const targetBadge = document.getElementById("tasbeeh-target-status");

  if (!target) return;

  if (target.value === "custom") {
    if (customRow) customRow.classList.remove("hidden");
    if (targetInputBox) targetInputBox.classList.remove("hidden");
    tasbeehTarget = 33;
  } else if (target.value === "infinite") {
    if (targetInputBox) targetInputBox.classList.add("hidden");
    if (customRow && document.getElementById("tasbeeh-custom-dhikr-box").classList.contains("hidden")) {
      customRow.classList.add("hidden");
    }
    tasbeehTarget = "infinite";
    if (targetBadge) targetBadge.textContent = "Target: Free Count";
  } else {
    if (targetInputBox) targetInputBox.classList.add("hidden");
    if (customRow && document.getElementById("tasbeeh-custom-dhikr-box").classList.contains("hidden")) {
      customRow.classList.add("hidden");
    }
    tasbeehTarget = parseInt(target.value);
    if (targetBadge) targetBadge.textContent = `Target: ${tasbeehTarget}`;
  }
};

function saveTasbeehLog(dhikrText, countVal) {
  const preset = document.getElementById("tasbeeh-preset");

  let finalDhikr = dhikrText;
  if (preset && preset.value === "custom") {
    const input = document.getElementById("tasbeeh-custom-dhikr-input");
    finalDhikr = (input && input.value.trim()) ? input.value.trim() : "Custom Dhikr";
  }

  const newLog = {
    dhikr: finalDhikr,
    count: countVal,
    time: new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })
  };

  const logs = JSON.parse(localStorage.getItem("nqp_tasbeeh_logs") || "[]");
  logs.unshift(newLog);
  if (logs.length > 15) logs.pop();
  localStorage.setItem("nqp_tasbeeh_logs", JSON.stringify(logs));
  window.renderTasbeehHistory();
}

window.clearTasbeehHistory = function () {
  localStorage.removeItem("nqp_tasbeeh_logs");
  window.renderTasbeehHistory();
};

window.renderTasbeehHistory = function () {
  const container = document.getElementById("tasbeeh-history");
  if (!container) return;

  const logs = JSON.parse(localStorage.getItem("nqp_tasbeeh_logs") || "[]");
  if (logs.length === 0) {
    container.innerHTML = '<div class="text-center py-4 text-[10px] text-slate-400">No completion logs recorded today.</div>';
    return;
  }

  container.innerHTML = logs.map(l => `
    <div class="flex justify-between py-1.5 text-[11px]">
      <span class="font-semibold text-slate-700 dark:text-slate-350">${l.dhikr}</span>
      <div class="flex gap-2">
        <span class="font-mono text-emerald-600 dark:text-emerald-450 font-bold">${l.count}x</span>
        <span class="text-slate-400 font-mono">${l.time}</span>
      </div>
    </div>
  `).join('');
};

// Hijri Calendar Converter & Renderer
const ISLAMIC_EVENTS = {
  "1/1": { name: "Hijri New Year", desc: "Start of the Islamic Year (1st Muharram)" },
  "1/10": { name: "Day of Ashura", desc: "Fasting day of historical deliverance (10th Muharram)" },
  "3/12": { name: "Mawlid al-Nabi", desc: "Prophet Muhammad's Birthday (12th Rabi' al-Awwal)" },
  "7/27": { name: "Isra' and Mi'raj", desc: "Prophet's miraculous Night Journey (27th Rajab)" },
  "8/15": { name: "Mid-Sha'ban", desc: "Night of salvation and prayer (15th Sha'ban)" },
  "9/1": { name: "Ramadan Begins", desc: "Month of obligatory daily fasting (1st Ramadan)" },
  "9/27": { name: "Laylat al-Qadr", desc: "Night of Power (observed 27th Ramadan)" },
  "10/1": { name: "Eid al-Fitr", desc: "Holiday marking the end of Ramadan (1st Shawwal)" },
  "12/9": { name: "Day of Arafah", desc: "Core day of Hajj pilgrimage (9th Dhu al-Hijjah)" },
  "12/10": { name: "Eid al-Adha", desc: "Feast of Sacrifice (10th Dhu al-Hijjah)" }
};

function getHijriDetails(date) {
  try {
    // Apply user-configured Hijri correction offset
    const adjustedDate = new Date(date.getTime());
    const offset = parseInt(prayerSettings.hijriAdjust) || 0;
    adjustedDate.setDate(adjustedDate.getDate() + offset);

    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(adjustedDate);
    const day = parseInt(parts.find(p => p.type === 'day').value);
    const month = parseInt(parts.find(p => p.type === 'month').value);
    const year = parseInt(parts.find(p => p.type === 'year').value);

    const monthNames = [
      "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
      "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
      "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    ];

    return {
      day,
      month,
      year,
      monthName: monthNames[month - 1] || "Unknown"
    };
  } catch (e) {
    console.error("Hijri formatting failed:", e);
    return null;
  }
}

window.changeCalendarMonth = function (direction) {
  currentCalDate.setMonth(currentCalDate.getMonth() + direction);
  window.renderCalendar();
};

window.renderCalendar = function () {
  const hijriMonthLabel = document.getElementById("calendar-hijri-month");
  const gregMonthLabel = document.getElementById("calendar-gregorian-month");
  const grid = document.getElementById("calendar-grid");
  const eventsList = document.getElementById("calendar-events-list");

  if (!grid) return;

  grid.innerHTML = "";

  const yr = currentCalDate.getFullYear();
  const mo = currentCalDate.getMonth();

  if (gregMonthLabel) {
    gregMonthLabel.textContent = currentCalDate.toLocaleDateString("en-US", { year: 'numeric', month: 'long' });
  }

  const totalDays = new Date(yr, mo + 1, 0).getDate();
  const firstDayIndex = new Date(yr, mo, 1).getDay();

  const middleDate = new Date(yr, mo, 15);
  const midHijri = getHijriDetails(middleDate);
  if (midHijri && hijriMonthLabel) {
    hijriMonthLabel.textContent = `${midHijri.monthName} ${midHijri.year} AH`;
  }

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day-cell calendar-empty";
    grid.appendChild(emptyCell);
  }

  const eventsInThisMonth = [];
  const today = new Date();

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(yr, mo, day);
    const hijri = getHijriDetails(dateObj);

    if (!hijri) continue;

    const cell = document.createElement("div");

    const isToday = dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();

    const holidayKey = `${hijri.month}/${hijri.day}`;
    const holiday = ISLAMIC_EVENTS[holidayKey];

    let cellClasses = "calendar-day-cell bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm";
    if (isToday) cellClasses += " calendar-day-today";
    if (holiday) {
      cellClasses += " calendar-day-event has-tooltip";
      eventsInThisMonth.push({
        dayGreg: day,
        dayHijri: hijri.day,
        monthNameHijri: hijri.monthName,
        name: holiday.name,
        desc: holiday.desc
      });
    }

    cell.className = cellClasses;
    cell.innerHTML = `
      <span class="text-xs font-bold text-slate-850 dark:text-slate-200 self-start">${day}</span>
      <span class="text-[9px] font-mono text-slate-400 self-end">${hijri.day}</span>
      ${holiday ? `
        <div class="tooltip-box bg-slate-950/90 text-white text-[9px] font-medium p-2 rounded-xl border border-slate-800 shadow-xl max-w-[150px] leading-tight text-center">
          <div class="font-bold text-amber-400">${holiday.name}</div>
          <div class="mt-0.5 text-slate-300 text-[8px]">${holiday.desc}</div>
        </div>
      ` : ''}
    `;
    grid.appendChild(cell);
  }

  if (eventsList) {
    if (eventsInThisMonth.length === 0) {
      eventsList.innerHTML = '<div class="text-[10px] text-slate-450 text-center py-4">No events found in this Hijri month.</div>';
    } else {
      eventsInThisMonth.sort((a, b) => a.dayGreg - b.dayGreg);
      eventsList.innerHTML = eventsInThisMonth.map(e => `
        <div class="p-2.5 rounded-xl border border-amber-500/10 bg-amber-500/5 flex items-start gap-2.5">
          <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/15 flex flex-col items-center justify-center text-amber-600 dark:text-amber-400 font-mono">
            <span class="text-xs font-bold">${e.dayHijri}</span>
            <span class="text-[7px] uppercase font-bold tracking-tight">${e.monthNameHijri.substring(0, 3)}</span>
          </div>
          <div class="space-y-0.5 min-w-0 flex-grow">
            <h5 class="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">${e.name}</h5>
            <p class="text-[9px] text-slate-550 dark:text-slate-400 leading-normal">${e.desc}</p>
          </div>
        </div>
      `).join('');
    }
  }
};

window.convertDate = function (e) {
  if (e) e.preventDefault();

  const input = document.getElementById("convert-input-date");
  const resultBox = document.getElementById("convert-result");

  if (!input || !resultBox) return;

  const dateVal = new Date(input.value);
  if (isNaN(dateVal.getTime())) return;

  const hijri = getHijriDetails(dateVal);
  if (hijri) {
    resultBox.textContent = `🕋 ${hijri.monthName} ${hijri.day}, ${hijri.year} AH`;
    resultBox.classList.remove("hidden");
  }
};

// Islamic Books shelf & Reader Implementation
window.renderBookshelf = function () {
  const shelf = document.getElementById("bookshelf-grid");
  if (!shelf) return;

  shelf.innerHTML = ISLAMIC_BOOKS.map(b => {
    const progressIndex = parseInt(localStorage.getItem(`nqp_read_progress_${b.id}`) || "-1");
    const progressPercent = Math.round(((progressIndex + 1) / b.chapters.length) * 100);

    return `
      <div class="book-card p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[280px]">
        <div>
          <div class="w-full h-24 rounded-2xl bg-gradient-to-br ${b.coverGradient} p-4 flex flex-col justify-between text-white shadow-sm relative overflow-hidden select-none">
            <div class="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none"></div>
            <span class="text-[9px] font-bold tracking-widest uppercase opacity-70">${b.category}</span>
            <h4 class="text-sm font-bold leading-tight font-serif drop-shadow">${b.title}</h4>
          </div>
          <div class="mt-4 space-y-1">
            <h5 class="text-xs font-bold text-slate-800 dark:text-white truncate">${b.title}</h5>
            <p class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">${b.author}</p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="space-y-1">
            <div class="flex justify-between text-[9px] font-bold text-slate-455 dark:text-slate-500">
              <span>Read: ${progressIndex + 1}/${b.chapters.length} Ch</span>
              <span>${progressPercent}%</span>
            </div>
            <div class="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-600 rounded-full" style="width: ${progressPercent}%"></div>
            </div>
          </div>
          <button onclick="window.openBookReader('${b.id}', '')" class="w-full py-2 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 rounded-xl text-[11px] font-bold transition-all cursor-pointer text-center">
            ${progressPercent > 0 ? 'Resume Reading' : 'Start Reading'} &rarr;
          </button>
        </div>
      </div>
    `;
  }).join('');
};

window.openBookReader = function (bookId, chapterId) {
  const book = ISLAMIC_BOOKS.find(b => b.id === bookId);
  if (!book) return;

  activeBook = book;

  if (!chapterId) {
    activeChapterIndex = parseInt(localStorage.getItem(`nqp_read_progress_${bookId}`) || "0");
  } else {
    activeChapterIndex = book.chapters.findIndex(c => c.id === chapterId);
    if (activeChapterIndex === -1) activeChapterIndex = 0;
  }

  const modal = document.getElementById("book-reader-modal");
  if (modal) {
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  const readerTitle = document.getElementById("reader-book-title");
  if (readerTitle) readerTitle.textContent = book.title;

  const menu = document.getElementById("reader-chapters-menu");
  if (menu) {
    menu.innerHTML = book.chapters.map((ch, idx) => `
      <button onclick="window.openBookReader('${book.id}', '${ch.id}')" 
        class="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold truncate transition-all cursor-pointer ${idx === activeChapterIndex ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}">
        ${ch.title.split(': ')[0]}
      </button>
    `).join('');
  }

  loadChapterContent();
};

window.closeBookReader = function () {
  const modal = document.getElementById("book-reader-modal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
  window.renderBookshelf();
};

function loadChapterContent() {
  if (!activeBook) return;

  const ch = activeBook.chapters[activeChapterIndex];
  if (!ch) return;

  localStorage.setItem(`nqp_read_progress_${activeBook.id}`, activeChapterIndex);

  const chTitle = document.getElementById("reader-chapter-title");
  if (chTitle) chTitle.textContent = ch.title;

  const arabicEl = document.getElementById("reader-text-arabic");
  const englishEl = document.getElementById("reader-text-english");
  const explanationEl = document.getElementById("reader-text-explanation");
  const explanationBox = document.getElementById("reader-explanation-box");

  if (arabicEl) arabicEl.textContent = ch.arabic;
  if (englishEl) englishEl.textContent = ch.english;

  if (ch.explanation) {
    if (explanationBox) explanationBox.classList.remove("hidden");
    if (explanationEl) explanationEl.textContent = ch.explanation;
  } else {
    if (explanationBox) explanationBox.classList.add("hidden");
  }

  const pageLabel = document.getElementById("reader-page-indicator");
  if (pageLabel) {
    pageLabel.textContent = `Chapter ${activeChapterIndex + 1} of ${activeBook.chapters.length}`;
  }

  const prevBtn = document.getElementById("reader-btn-prev");
  const nextBtn = document.getElementById("reader-btn-next");
  if (prevBtn) prevBtn.disabled = activeChapterIndex === 0;
  if (nextBtn) nextBtn.disabled = activeChapterIndex === activeBook.chapters.length - 1;

  const container = document.getElementById("reader-text-container");
  if (container) container.scrollTop = 0;
}

window.navigateBookChapter = function (direction) {
  if (!activeBook) return;
  const newIdx = activeChapterIndex + direction;
  if (newIdx >= 0 && newIdx < activeBook.chapters.length) {
    activeChapterIndex = newIdx;

    const menu = document.getElementById("reader-chapters-menu");
    if (menu) {
      const btns = menu.querySelectorAll("button");
      btns.forEach((btn, idx) => {
        if (idx === activeChapterIndex) {
          btn.className = "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold truncate transition-all cursor-pointer bg-emerald-600 text-white shadow-sm";
        } else {
          btn.className = "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold truncate transition-all cursor-pointer text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";
        }
      });
    }

    loadChapterContent();
  }
};

window.bindReaderEvents = function () {
  const fontSlider = document.getElementById("reader-font-slider");
  if (fontSlider) {
    fontSlider.addEventListener("input", (e) => {
      const size = parseInt(e.target.value);
      const arabic = document.getElementById("reader-text-arabic");
      const english = document.getElementById("reader-text-english");

      if (arabic) arabic.style.fontSize = `${size + 2}px`;
      if (english) english.style.fontSize = `${size - 2}px`;
    });
  }
};

// Hadith Search Engine Implementation
window.searchHadith = function () {
  const container = document.getElementById("hadith-results-container");
  const emptyLabel = document.getElementById("hadith-search-empty");
  const queryInput = document.getElementById("hadith-search-input");
  const collFilter = document.getElementById("hadith-filter-collection");

  if (!container) return;

  const query = queryInput ? queryInput.value.trim().toLowerCase() : "";
  const collection = collFilter ? collFilter.value : "all";

  const results = HADITH_SEARCH_COLLECTION.filter(h => {
    if (activeHadithTopic !== "all" && h.topic !== activeHadithTopic) {
      return false;
    }

    if (collection !== "all") {
      const refLower = h.ref.toLowerCase();
      if (collection === "bukhari" && !refLower.includes("bukhari")) return false;
      if (collection === "muslim" && !refLower.includes("muslim")) return false;
      if (collection === "abudawud" && !refLower.includes("dawud")) return false;
      if (collection === "tirmidhi" && !refLower.includes("tirmidhi")) return false;
    }

    if (query !== "") {
      const textMatch = h.english.toLowerCase().includes(query) ||
        h.arabic.includes(query) ||
        h.ref.toLowerCase().includes(query) ||
        h.tags.some(t => t.toLowerCase().includes(query));
      if (!textMatch) return false;
    }

    return true;
  });

  if (results.length === 0) {
    container.innerHTML = "";
    if (emptyLabel) emptyLabel.classList.remove("hidden");
    return;
  }

  if (emptyLabel) emptyLabel.classList.add("hidden");

  function highlightText(text, keyword) {
    if (!keyword) return text;
    const escapedKwd = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedKwd})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-250 dark:bg-amber-900/60 rounded px-0.5 text-slate-900 dark:text-slate-100">$1</mark>');
  }

  container.innerHTML = results.map(h => {
    const highlightedEnglish = highlightText(h.english, query);
    const highlightedRef = highlightText(h.ref, query);

    const escapedEnglish = h.english.replace(/'/g, "\\'");
    const escapedArabic = h.arabic.replace(/'/g, "\\'");
    const escapedRef = h.ref.replace(/'/g, "\\'");

    return `
      <div class="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[9px] font-bold uppercase tracking-wider">${h.topic}</span>
            <span class="text-[10px] font-bold text-slate-400 font-mono">${highlightedRef}</span>
          </div>
          <div class="quran-text text-lg text-slate-800 dark:text-slate-200 leading-normal text-right select-all">${h.arabic}</div>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">${highlightedEnglish}</p>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div class="flex gap-1.5 overflow-hidden">
            ${h.tags.map(t => `<span class="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider truncate max-w-[60px]">${t}</span>`).join('')}
          </div>
          <button onclick="window.copyHadith('${escapedRef}', '${escapedArabic}', '${escapedEnglish}', this)" class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-500 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1">
            📋 Copy Hadith
          </button>
        </div>
      </div>
    `;
  }).join('');
};

window.selectHadithTopicTag = function (btnEl, topicName) {
  const tags = document.querySelectorAll(".hadith-topic-tag");
  tags.forEach(t => {
    t.className = "hadith-topic-tag px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 hover:text-slate-750 text-[10px] font-bold transition-all cursor-pointer";
  });

  if (btnEl) {
    btnEl.className = "hadith-topic-tag px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold transition-all cursor-pointer";
  }

  activeHadithTopic = topicName;
  window.searchHadith();
};

window.copyHadith = function (ref, arabic, english, btnEl) {
  const textToCopy = `Hadith [${ref}]:\n\n${arabic}\n\n"${english}"\n\n- via NurulQuran App`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    if (btnEl) {
      const originalText = btnEl.innerHTML;
      btnEl.innerHTML = "✓ Copied!";
      btnEl.className = "px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1";
      setTimeout(() => {
        btnEl.innerHTML = originalText;
        btnEl.className = "px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-500 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1";
      }, 1500);
    }
  }).catch(e => {
    console.error("Clipboard copy failed:", e);
  });
};

// Global initializer launcher is moved to the bottom of the file to prevent execution before calculations load

// ================= ZAKAT CALCULATOR & MOSQUE LOCATOR MODULES =================

// Weight unit conversion factor
const TOLA_TO_GRAM = 11.6638;

// Zakat State variables
let zakatWealth = 0;
let zakatNisab = 0;
let zakatDue = 0;
let zakatBasisSelected = "silver";
let zakatCurrencySelected = "USD";
let zakatWeightUnitSelected = "gram";

// Currency Configuration rates & default prices per gram
const zakatCurrencies = {
  USD: { symbol: "$", gold: 75, silver: 0.90 },
  PKR: { symbol: "Rs", gold: 21000, silver: 250 },
  SAR: { symbol: "SR", gold: 280, silver: 3.40 },
  AED: { symbol: "AED", gold: 275, silver: 3.30 },
  GBP: { symbol: "£", gold: 58, silver: 0.70 },
  EUR: { symbol: "€", gold: 68, silver: 0.80 },
  INR: { symbol: "₹", gold: 6200, silver: 75 }
};

window.changeZakatCurrency = function () {
  const select = document.getElementById("zakat-currency");
  if (!select) return;

  const curr = select.value;
  zakatCurrencySelected = curr;

  const config = zakatCurrencies[curr] || zakatCurrencies.USD;

  // If Weight Unit is Tola, scale base prices
  let goldVal = config.gold;
  let silverVal = config.silver;
  if (zakatWeightUnitSelected === "tola") {
    goldVal = Math.round(goldVal * TOLA_TO_GRAM);
    silverVal = Math.round(silverVal * TOLA_TO_GRAM * 100) / 100;
  }

  // Update inputs values for gold and silver price
  const goldPriceEl = document.getElementById("zakat-gold-price");
  const silverPriceEl = document.getElementById("zakat-silver-price");
  if (goldPriceEl) goldPriceEl.value = goldVal;
  if (silverPriceEl) silverPriceEl.value = silverVal;

  // Update all currency symbol labels in the DOM
  const symbolSpans = document.querySelectorAll(".zakat-currency-symbol");
  symbolSpans.forEach(span => {
    span.textContent = config.symbol;
  });

  // Recalculate
  window.calculateZakat();
};

window.changeZakatWeightUnit = function () {
  const unitSelect = document.getElementById("zakat-weight-unit");
  if (!unitSelect) return;

  const newUnit = unitSelect.value;
  if (newUnit === zakatWeightUnitSelected) return;

  const factor = TOLA_TO_GRAM;

  const goldWeightEl = document.getElementById("zakat-gold-weight");
  const silverWeightEl = document.getElementById("zakat-silver-weight");
  const goldPriceEl = document.getElementById("zakat-gold-price");
  const silverPriceEl = document.getElementById("zakat-silver-price");

  let goldWeight = parseFloat(goldWeightEl?.value) || 0;
  let silverWeight = parseFloat(silverWeightEl?.value) || 0;
  let goldPrice = parseFloat(goldPriceEl?.value) || 0;
  let silverPrice = parseFloat(silverPriceEl?.value) || 0;

  if (newUnit === "tola") {
    // Gram -> Tola (Weight / factor, Price * factor)
    if (goldWeightEl) goldWeightEl.value = parseFloat((goldWeight / factor).toFixed(4));
    if (silverWeightEl) silverWeightEl.value = parseFloat((silverWeight / factor).toFixed(4));
    if (goldPriceEl) goldPriceEl.value = parseFloat((goldPrice * factor).toFixed(2));
    if (silverPriceEl) silverPriceEl.value = parseFloat((silverPrice * factor).toFixed(2));
  } else {
    // Tola -> Gram (Weight * factor, Price / factor)
    if (goldWeightEl) goldWeightEl.value = parseFloat((goldWeight * factor).toFixed(4));
    if (silverWeightEl) silverWeightEl.value = parseFloat((silverWeight * factor).toFixed(4));
    if (goldPriceEl) goldPriceEl.value = parseFloat((goldPrice / factor).toFixed(2));
    if (silverPriceEl) silverPriceEl.value = parseFloat((silverPrice / factor).toFixed(2));
  }

  zakatWeightUnitSelected = newUnit;

  // Update DOM labels
  const weightSpans = document.querySelectorAll(".zakat-weight-unit-label");
  weightSpans.forEach(span => {
    span.textContent = newUnit === "tola" ? "Tolas" : "Grams";
  });

  const priceSpans = document.querySelectorAll(".zakat-price-unit-label");
  priceSpans.forEach(span => {
    span.textContent = newUnit === "tola" ? "/Tola" : "/g";
  });

  window.calculateZakat();
};

window.calculateZakat = function (e) {
  if (e) e.preventDefault();

  const cash = parseFloat(document.getElementById("zakat-cash")?.value) || 0;
  const investments = parseFloat(document.getElementById("zakat-investments")?.value) || 0;
  const goldWeightInput = parseFloat(document.getElementById("zakat-gold-weight")?.value) || 0;
  const silverWeightInput = parseFloat(document.getElementById("zakat-silver-weight")?.value) || 0;
  const business = parseFloat(document.getElementById("zakat-business")?.value) || 0;
  const receivables = parseFloat(document.getElementById("zakat-receivables")?.value) || 0;
  const liabilities = parseFloat(document.getElementById("zakat-liabilities")?.value) || 0;

  const goldPriceInput = parseFloat(document.getElementById("zakat-gold-price")?.value) || 75;
  const silverPriceInput = parseFloat(document.getElementById("zakat-silver-price")?.value) || 0.90;
  const basis = document.getElementById("zakat-nisab-basis")?.value || "silver";

  zakatBasisSelected = basis;

  const currencySelect = document.getElementById("zakat-currency");
  zakatCurrencySelected = currencySelect ? currencySelect.value : "USD";
  const currencySymbol = zakatCurrencies[zakatCurrencySelected]?.symbol || "$";

  const unitSelect = document.getElementById("zakat-weight-unit");
  zakatWeightUnitSelected = unitSelect ? unitSelect.value : "gram";

  // Convert inputs to Grams internally for standard checks if units are in Tolas
  let goldWeight = goldWeightInput;
  let silverWeight = silverWeightInput;
  let goldPrice = goldPriceInput;
  let silverPrice = silverPriceInput;

  if (zakatWeightUnitSelected === "tola") {
    goldWeight = goldWeightInput * TOLA_TO_GRAM;
    silverWeight = silverWeightInput * TOLA_TO_GRAM;
    goldPrice = goldPriceInput / TOLA_TO_GRAM;
    silverPrice = silverPriceInput / TOLA_TO_GRAM;
  }

  const goldValue = goldWeight * goldPrice;
  const silverValue = silverWeight * silverPrice;
  const totalAssets = cash + goldValue + silverValue + investments + business + receivables;
  zakatWealth = totalAssets - liabilities;

  if (basis === "gold") {
    zakatNisab = 85 * goldPrice;
  } else {
    zakatNisab = 595 * silverPrice;
  }

  const isEligible = zakatWealth >= zakatNisab;
  zakatDue = isEligible ? Math.max(0, zakatWealth * 0.025) : 0;

  const dueEl = document.getElementById("zakat-result-due");
  const wealthEl = document.getElementById("zakat-result-wealth");
  const nisabEl = document.getElementById("zakat-result-nisab");
  const statusEl = document.getElementById("zakat-result-status");
  const explanationEl = document.getElementById("zakat-explanation");
  const saveBtn = document.getElementById("zakat-btn-save");

  if (dueEl) dueEl.textContent = `${currencySymbol}${zakatDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (wealthEl) wealthEl.textContent = `${currencySymbol}${zakatWealth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (nisabEl) nisabEl.textContent = `${currencySymbol}${zakatNisab.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (statusEl) {
    if (isEligible) {
      statusEl.textContent = "Eligible (Payable)";
      statusEl.className = "inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase";
    } else {
      statusEl.textContent = "Below Nisab";
      statusEl.className = "inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase";
    }
  }

  if (explanationEl) {
    if (isEligible) {
      explanationEl.innerHTML = `Your assessable net wealth of <b>${currencySymbol}${zakatWealth.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b> is above the Nisab threshold of <b>${currencySymbol}${zakatNisab.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>.<br/>You are required to pay Zakat (2.5%) of <b>${currencySymbol}${zakatDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>.`;
    } else {
      explanationEl.innerHTML = `Your assessable net wealth of <b>${currencySymbol}${zakatWealth.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b> is below the Nisab threshold of <b>${currencySymbol}${zakatNisab.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>.<br/>No Zakat is due at this time.`;
    }
  }

  if (saveBtn) {
    if (isEligible && zakatDue > 0) {
      saveBtn.classList.remove("hidden");
    } else {
      saveBtn.classList.add("hidden");
    }
  }
};

window.saveZakatCalculation = function () {
  const currencySymbol = zakatCurrencies[zakatCurrencySelected]?.symbol || "$";
  const newRecord = {
    wealth: zakatWealth,
    nisab: zakatNisab,
    due: zakatDue,
    basis: zakatBasisSelected,
    symbol: currencySymbol,
    time: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
  };

  const records = JSON.parse(localStorage.getItem("nqp_zakat_logs") || "[]");
  records.unshift(newRecord);
  if (records.length > 10) records.pop();
  localStorage.setItem("nqp_zakat_logs", JSON.stringify(records));

  window.renderZakatHistory();

  const form = document.getElementById("zakat-form");
  if (form) form.reset();

  // Reset weight units to Grams
  zakatWeightUnitSelected = "gram";
  const weightSelect = document.getElementById("zakat-weight-unit");
  if (weightSelect) weightSelect.value = "gram";

  const weightSpans = document.querySelectorAll(".zakat-weight-unit-label");
  weightSpans.forEach(span => span.textContent = "Grams");
  const priceSpans = document.querySelectorAll(".zakat-price-unit-label");
  priceSpans.forEach(span => span.textContent = "/g");

  window.changeZakatCurrency();

  const saveBtn = document.getElementById("zakat-btn-save");
  if (saveBtn) saveBtn.classList.add("hidden");
};

window.clearZakatHistory = function () {
  localStorage.removeItem("nqp_zakat_logs");
  window.renderZakatHistory();
};

window.renderZakatHistory = function () {
  const container = document.getElementById("zakat-history");
  if (!container) return;

  const records = JSON.parse(localStorage.getItem("nqp_zakat_logs") || "[]");
  if (records.length === 0) {
    container.innerHTML = '<div class="text-center py-4 text-[10px] text-slate-400">No calculation records saved.</div>';
    return;
  }

  container.innerHTML = records.map(r => `
    <div class="flex justify-between py-2 text-[11px] items-center">
      <div>
        <span class="font-semibold text-slate-700 dark:text-slate-350">${r.symbol || "$"}${r.due.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        <span class="text-[9px] text-slate-400 ml-1">(${r.basis === "gold" ? "Gold Nisab" : "Silver Nisab"})</span>
      </div>
      <div class="flex gap-2">
        <span class="text-slate-400 text-[10px]">${r.time}</span>
      </div>
    </div>
  `).join('');
};

// Mosque Locator Map & OSM Logic
let mosqueMap = null;
let mosqueMarkersGroup = null;
let mosqueMarkerIcon = null;

window.initMosqueMap = function () {
  if (typeof L === "undefined") {
    setTimeout(window.initMosqueMap, 500);
    return;
  }

  const mapStatus = document.getElementById("map-status");
  const lat = prayerSettings.lat || 24.8607;
  const lng = prayerSettings.lng || 67.0011;

  if (mosqueMap) {
    mosqueMap.invalidateSize();
    return;
  }

  try {
    mosqueMap = L.map('mosque-map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mosqueMap);

    mosqueMarkersGroup = L.layerGroup().addTo(mosqueMap);

    mosqueMarkerIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([lat, lng])
      .addTo(mosqueMap)
      .bindPopup(`<b>Your Location</b><br/>${prayerSettings.cityName || "Detected City"}`)
      .openPopup();

    if (mapStatus) mapStatus.textContent = "Map Initialized";

    window.findNearbyMosques();
  } catch (err) {
    console.error("Leaflet Map init failed:", err);
    if (mapStatus) mapStatus.textContent = "Map load error";
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

window.findNearbyMosques = function () {
  const sidebar = document.getElementById("mosques-sidebar-list");
  const mapStatus = document.getElementById("map-status");

  if (!sidebar) return;

  const lat = prayerSettings.lat || 24.8607;
  const lng = prayerSettings.lng || 67.0011;
  const radius = 5000;

  sidebar.innerHTML = '<div class="text-[10px] text-slate-400 text-center py-10 animate-pulse">Searching nearby mosques using Overpass API...</div>';
  if (mapStatus) mapStatus.textContent = "Querying Overpass API...";

  const overpassQuery = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng}););out center;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Overpass query failed");
      return res.json();
    })
    .then(data => {
      if (mosqueMarkersGroup) mosqueMarkersGroup.clearLayers();

      const mosques = [];
      const elements = data.elements || [];

      elements.forEach(el => {
        const mLat = el.lat || (el.center && el.center.lat);
        const mLng = el.lon || (el.center && el.center.lon);
        const name = (el.tags && el.tags.name) || "Unnamed Masjid / Mosque";

        if (mLat && mLng) {
          const dist = calculateDistance(lat, lng, mLat, mLng);
          mosques.push({ name, lat: mLat, lng: mLng, distance: dist });
        }
      });

      mosques.sort((a, b) => a.distance - b.distance);

      if (mosques.length === 0) {
        loadMockMosques(lat, lng);
        return;
      }

      renderMosqueListAndMarkers(mosques);
      if (mapStatus) mapStatus.textContent = `Found ${mosques.length} mosques`;
    })
    .catch(err => {
      console.warn("Overpass API failed, loading local mocks:", err);
      loadMockMosques(lat, lng);
    });
};

function renderMosqueListAndMarkers(mosques) {
  const sidebar = document.getElementById("mosques-sidebar-list");
  if (!sidebar) return;

  sidebar.innerHTML = "";

  mosques.forEach((m, idx) => {
    if (mosqueMap && mosqueMarkersGroup && mosqueMarkerIcon) {
      const marker = L.marker([m.lat, m.lng], { icon: mosqueMarkerIcon })
        .bindPopup(`<b>${m.name}</b><br/>Distance: ${m.distance.toFixed(2)} km`);
      mosqueMarkersGroup.addLayer(marker);
    }

    const item = document.createElement("div");
    item.className = "py-3 flex justify-between items-start gap-2.5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl border-b border-slate-100 dark:border-slate-800/20";
    item.innerHTML = `
      <div class="min-w-0">
        <h5 class="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate" title="${m.name}">${m.name}</h5>
        <span class="text-[9px] text-slate-400 font-mono">${m.distance.toFixed(2)} km away</span>
      </div>
      <button type="button" onclick="window.focusMosque(${m.lat}, ${m.lng}, '${m.name.replace(/'/g, "\\'")}', ${m.distance})" class="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-450 text-[9px] font-bold transition-all cursor-pointer">
        View
      </button>
    `;
    sidebar.appendChild(item);
  });
}

window.focusMosque = function (lat, lng, name, dist) {
  if (mosqueMap) {
    mosqueMap.setView([lat, lng], 17);

    if (mosqueMarkersGroup) {
      mosqueMarkersGroup.eachLayer(layer => {
        const coords = layer.getLatLng();
        if (coords.lat === lat && coords.lng === lng) {
          layer.openPopup();
        }
      });
    }
  }
};

function loadMockMosques(userLat, userLng) {
  const mapStatus = document.getElementById("map-status");
  if (mapStatus) mapStatus.textContent = "Offline/Mock Mode";

  const mockNames = [
    "Jamia Masjid Al-Noor",
    "Madina Mosque & Community Center",
    "Masjid Umar Al-Farooq",
    "Baitul Mukarram Mosque"
  ];

  const mocks = mockNames.map((name, idx) => {
    const latOffset = (idx + 1) * 0.004 * (idx % 2 === 0 ? 1 : -1);
    const lngOffset = (idx + 1) * 0.005 * (idx % 2 === 1 ? 1 : -1);
    const mLat = userLat + latOffset;
    const mLng = userLng + lngOffset;
    const dist = calculateDistance(userLat, userLng, mLat, mLng);

    return { name, lat: mLat, lng: mLng, distance: dist };
  });

  mocks.sort((a, b) => a.distance - b.distance);
  renderMosqueListAndMarkers(mocks);
}

// Global initializer launcher (Placed at bottom to guarantee all calculations register beforehand)
window.initFaithTools = function () {
  if (!document.getElementById("bookshelf-grid")) return;

  window.switchFaithTab('tasbeeh');
  window.renderBookshelf();
  window.searchHadith();
  window.renderCalendar();
  window.renderTasbeehHistory();
  window.renderZakatHistory();
  window.bindReaderEvents();
};

// Hook into ready listeners
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.initFaithTools);
} else {
  window.initFaithTools();
}




