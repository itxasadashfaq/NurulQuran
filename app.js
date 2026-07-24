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

async function initFirebase() {
  try {
    const response = await fetch("http://localhost:5000/api/config");
    if (response.ok) {
      firebaseConfig = await response.json();
      console.log("Successfully loaded Firebase credentials from backend server.");
    }
  } catch (error) {
    console.warn("Express backend not running or unreachable. Running in client-fallback mode.", error);
  } finally {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    setupAuthObserver();
  }
}

// 3. Sync profile updates with MongoDB
async function syncUserToMongoDB(user) {
  try {
    const idToken = await user.getIdToken();
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
        if (activeTab === "login") {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, {
            displayName: name
          });
          // Reload page to reflect updated profile details
          window.location.reload();
        }
        closeModal();
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
        submitBtn.textContent = activeTab === "login" ? "Sign In" : "Create Account";
      }
    });
  }

  // Handle URL redirect query tags (e.g. index.html?auth=login)
  const urlParams = new URLSearchParams(window.location.search);
  const authParam = urlParams.get('auth');
  if (authParam === 'login' || authParam === 'signup') {
    openModal(authParam);
  }
});

// Run Initializer
initFirebase();
