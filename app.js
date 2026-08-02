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
        btn.className = `w-full p-3 flex items-center justify-between text-left rounded-xl transition-all border ${
          currentSurahNumber === s.number
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
            <span class="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
              currentSurahNumber === s.number
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
          `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,en.sahih,ur.jalandhry,ur.maududi,${selectedReciter}`
        );
        if (res.ok) {
          const bodyData = await res.json();
          const editions = bodyData.data;

          const arabicAyahs = editions[0].ayahs;
          const englishAyahs = editions[1].ayahs;
          const urduAyahs = editions[2].ayahs;
          const tafseerAyahs = editions[3].ayahs;
          const audioAyahs = editions[4].ayahs;

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
              audio: audioAyahs[i].audio
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
                <button onclick="window.speakText(this, ${index}, 'ur')" class="p-1 rounded text-emerald-600 dark:text-emerald-450 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 transition-colors flex items-center justify-center cursor-pointer focus:outline-none" title="Listen to Translation">
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
              <span class="text-[8px] text-slate-400 font-normal font-sans">${new Date(h.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
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

window.speakText = function (btn, index, lang) {
  let text = "";
  if (lang === 'ur') {
    const el = document.getElementById(`urdu-text-${index}`);
    if (el) text = el.textContent;
  } else if (lang === 'tafseer') {
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

// Run Initializer
initFirebase();

