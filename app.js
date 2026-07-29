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
    let selectedTranslation = "en.sahih";
    let isMuted = false;
    let previousVolume = 0.8;
    let isDraggingSlider = false;

    // Tafsir States
    let currentTafsirVerseNum = -1;
    let activeTafsirTab = "ur"; // ur, ar, en
    let loadedTafsirObj = null;

    // Language dropdown selection binding
    const readerLanguageSelect = document.getElementById("reader-language-select");
    if (readerLanguageSelect) {
      readerLanguageSelect.addEventListener("change", (e) => {
        selectedTranslation = e.target.value;
        loadSurah(currentSurahNumber, false);
      });
    }

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
          // Initial load Al-Fatihah (Surah 1)
          loadSurah(1);
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
    async function loadSurah(surahNum, shouldAutoPlay = false) {
      versesContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-24 space-y-3">
          <div class="w-10 h-10 rounded-full border-3 border-emerald-500/30 border-t-emerald-600 animate-spin"></div>
          <span class="text-sm text-slate-500">Loading Surah scripture...</span>
        </div>
      `;

      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,${selectedTranslation},${selectedReciter}`
        );
        if (res.ok) {
          const bodyData = await res.json();
          const editions = bodyData.data;

          const arabicAyahs = editions[0].ayahs;
          const translationAyahs = editions[1].ayahs;
          const audioAyahs = editions[2].ayahs;

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
              translation: translationAyahs[i].text,
              audio: audioAyahs[i].audio
            };
          });

          const activeSurahMeta = surahsList.find(s => s.number === surahNum);
          if (activeSurahMeta) {
            readerSurahTitle.textContent = `${activeSurahMeta.englishName} (${activeSurahMeta.name})`;
            readerSurahMeta.textContent = `${activeSurahMeta.number}: ${activeSurahMeta.englishNameTranslation} (${activeSurahMeta.numberOfAyahs} Verses, ${activeSurahMeta.revelationType})`;
            
            // Set Player Title
            playerTitle.textContent = activeSurahMeta.englishName;
          }

          renderVerses();
          
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

      const isUrdu = selectedTranslation.startsWith("ur");

      currentVerses.forEach((v, index) => {
        const verseRow = document.createElement("div");
        verseRow.id = `verse-row-${index}`;
        verseRow.className = "p-4 md:p-6 rounded-2xl border border-transparent transition-all space-y-4";
        
        verseRow.innerHTML = `
          <div class="flex items-start justify-between gap-4">
            <!-- Verse marker badge & play action & tafsir action -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-450 border border-emerald-500/10">
                ${v.numberInSurah}
              </span>
              <button onclick="window.playVerseFromUI(${index})" class="p-1.5 rounded-lg text-emerald-650 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 transition-colors" title="Play Verse">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M4.555 3.168A1 1 0 003 4v12a1 1 0 001.555.832l10-6a1 1 0 000-1.664l-10-6z"/></svg>
              </button>
              <button onclick="window.openTafsirFromUI(${index})" class="p-1.5 rounded-lg text-emerald-650 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 transition-colors" title="Read Tafsir">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </button>
            </div>
            
            <!-- Verse Arabic scripture -->
            <div class="quran-text text-right text-slate-800 dark:text-slate-100 flex-grow" style="font-size: ${arabicFontSize}px">
              ${v.text}
            </div>
          </div>

          <!-- Translation text block -->
          <div class="translation-text leading-relaxed pl-9 ${isTranslationVisible ? '' : 'hidden'} ${isUrdu ? 'text-right rtl font-amiri text-xl font-bold text-emerald-800 dark:text-emerald-400' : 'text-left ltr text-sm font-semibold text-slate-500 dark:text-slate-300'}">
            ${v.translation}
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

    // ================= TAFSIR CONTROLLERS =================
    const tafsirModal = document.getElementById("tafsir-modal");
    const tafsirArabicText = document.getElementById("tafsir-arabic-text");
    const tafsirTranslationText = document.getElementById("tafsir-translation-text");
    const tafsirLoading = document.getElementById("tafsir-loading");
    const tafsirContentBox = document.getElementById("tafsir-content-box");
    const tafsirModalTitle = document.getElementById("tafsir-modal-title");

    const tabUr = document.getElementById("tab-tafsir-ur");
    const tabAr = document.getElementById("tab-tafsir-ar");
    const tabEn = document.getElementById("tab-tafsir-en");

    window.openTafsirFromUI = function (index) {
      if (index >= 0 && index < currentVerses.length) {
        openTafsirModal(currentVerses[index]);
      }
    };

    function openTafsirModal(verse) {
      if (!tafsirModal) return;
      
      tafsirModal.classList.remove("hidden");
      
      // Load static details
      tafsirModalTitle.textContent = `Surah ${currentSurahNumber} - Verse ${verse.numberInSurah}`;
      tafsirArabicText.textContent = verse.text;
      tafsirTranslationText.textContent = verse.translation;
      
      currentTafsirVerseNum = verse.number;
      activeTafsirTab = "ur"; // Reset to Urdu tab by default
      loadedTafsirObj = null;
      
      updateTafsirTabsUI();
      
      // Show loading spinner
      tafsirLoading.classList.remove("hidden");
      tafsirContentBox.classList.add("hidden");
      
      fetchTafsirContent(verse.number);
    }

    window.closeTafsirModal = function () {
      if (tafsirModal) tafsirModal.classList.add("hidden");
    };

    async function fetchTafsirContent(ayahNum) {
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/ayah/${ayahNum}/editions/quran-uthmani,ur.jalandhry,ur.maududi,ar.tafsir.jalalayn,en.tafsir.rezaanderson`
        );
        if (res.ok) {
          const bodyData = await res.json();
          const editions = bodyData.data;
          
          loadedTafsirObj = {
            ur: editions[2].text || "Urdu exegesis not available.",
            ar: editions[3].text || "Arabic Tafsir Al-Jalalayn not available.",
            en: editions[4].text || "English exegesis not available."
          };
          
          tafsirLoading.classList.add("hidden");
          tafsirContentBox.classList.remove("hidden");
          renderTafsirText();
        } else {
          showTafsirError("Failed to load Tafsir comments.");
        }
      } catch (err) {
        console.error("Error fetching Tafsir details:", err);
        showTafsirError("Network error loading Tafsir.");
      }
    }

    function renderTafsirText() {
      if (!loadedTafsirObj || !tafsirContentBox) return;
      
      const txt = loadedTafsirObj[activeTafsirTab];
      tafsirContentBox.textContent = txt;
      
      // Apply right-align for Urdu / Arabic tabs
      if (activeTafsirTab === "ur" || activeTafsirTab === "ar") {
        tafsirContentBox.className = "text-right rtl font-amiri text-lg font-semibold text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line";
      } else {
        tafsirContentBox.className = "text-left ltr text-sm font-semibold text-slate-500 dark:text-slate-300 leading-relaxed whitespace-pre-line";
      }
    }

    function showTafsirError(msg) {
      tafsirLoading.classList.add("hidden");
      tafsirContentBox.classList.remove("hidden");
      tafsirContentBox.textContent = msg;
      tafsirContentBox.className = "text-center text-red-500 text-xs font-semibold py-4";
    }

    function updateTafsirTabsUI() {
      const activeClasses = "border-emerald-600 text-emerald-600 dark:text-emerald-400";
      const inactiveClasses = "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300";
      
      const tabs = [
        { id: "ur", el: tabUr },
        { id: "ar", el: tabAr },
        { id: "en", el: tabEn }
      ];
      
      tabs.forEach(t => {
        if (!t.el) return;
        if (t.id === activeTafsirTab) {
          t.el.className = `flex-1 pb-2.5 text-xs font-bold border-b-2 ${activeClasses}`;
        } else {
          t.el.className = `flex-1 pb-2.5 text-xs font-semibold border-b-2 ${inactiveClasses}`;
        }
      });
    }

    // Bind tab clicks
    if (tabUr) {
      tabUr.addEventListener("click", () => {
        activeTafsirTab = "ur";
        updateTafsirTabsUI();
        renderTafsirText();
      });
    }
    if (tabAr) {
      tabAr.addEventListener("click", () => {
        activeTafsirTab = "ar";
        updateTafsirTabsUI();
        renderTafsirText();
      });
    }
    if (tabEn) {
      tabEn.addEventListener("click", () => {
        activeTafsirTab = "en";
        updateTafsirTabsUI();
        renderTafsirText();
      });
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

// Run Initializer
initFirebase();

