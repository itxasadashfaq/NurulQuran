# NurulQuran – A Complete Islamic Learning & Quran Companion Platform

NurulQuran is a premium, modern web application designed for Quran study, memorization, daily prayer tracking, and structured Islamic learning modules. This codebase represents the complete foundation built under **Module 1 (Planning & Project Foundation)**.

---

## 🌟 Key Features (Module 1)

*   **Premium Islamic Aesthetic:** Designed with a curated color system (deep emerald greens, gold/amber accents, slate grays, and soft white/dark modes) featuring custom fonts (Amiri for Arabic scripture, Inter for UI), custom scrollbars, and fluid hover animations.
*   **Responsive Navigation & Layout:** Interactive navbar (sticky with glassmorphism, collapsible hamburger menu for mobile) and clean structural layout including header, footer, and main viewport sizing.
*   **Firebase Authentication UI & Integration:** Client-side integration of Firebase Auth (Login & Signup modal) with real-time UI state tracking (personalized greetings, profiles, and conditional dashboard routing).
*   **Mongoose-cached MongoDB Sync:** Serverless Next.js API route (`/api/auth/sync`) that automatically synchronizes/upserts Firebase authenticated profiles to MongoDB to prevent session data loss.
*   **Responsive Homepage:** An engaging landing page showcasing core modules, a *Daily Verse* container with custom Quranic styling, and an active *Prayer Times* widget.
*   **Personal Companion Dashboard:** Access-restricted dashboard featuring reading habits/streaks, active learning module completion trackers, last read references, bookmark widgets, local prayer times lists, profile metrics, and sign out controls.

---

## 📂 Project Folder Structure

The project follows a standard modular Next.js (App Router) structure:

```text
ZYNAX SOLUTION PROJECT/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── sync/
│   │   │           └── route.js       # Syncs Firebase users to MongoDB
│   │   │   
│   │   ├── dashboard/
│   │   │   └── page.js                # Private user dashboard page
│   │   │   
│   │   ├── favicon.ico
│   │   ├── globals.css                # Tailwind CSS v4, animations & fonts
│   │   ├── layout.js                  # App Shell, fonts, context wrapper
│   │   └── page.js                    # Responsive homepage
│   │
│   ├── components/
│   │   ├── AuthModal.js               # Login/Signup forms using Firebase Auth
│   │   ├── Footer.js                  # Multi-column footer
│   │   └── Navbar.js                  # Sticky glassmorphic navigation header
│   │
│   ├── lib/
│   │   ├── AuthContext.js             # Context provider for client session states
│   │   ├── firebase.js                # Firebase Client initialization
│   │   └── mongodb.js                 # Cached serverless Mongoose connection
│   │
│   └── models/
│       └── User.js                    # MongoDB User schema model
│
├── public/                            # Static assets
├── .env.example                       # Environmental variables blueprint
├── .gitignore
├── eslint.config.mjs                  # ESLint configuration
├── jsconfig.json                      # Path aliases config (@/*)
├── next.config.mjs                    # Next.js configurations
├── package.json                       # Scripts & dependency packages
├── postcss.config.mjs
└── README.md                          # Project documentation
```

---

## 🛠️ Technology Stack

1.  **Core Framework:** Next.js 16 (App Router)
2.  **Logic & Templating:** React 19 / JavaScript ES6+
3.  **Styling & Theme:** Tailwind CSS v4 (configured via `@theme` in CSS)
4.  **Authentication:** Firebase Authentication (Client SDK)
5.  **Database Connection:** MongoDB Atlas / Mongoose ORM
6.  **Icons:** Lucide React

---

## ⚙️ Setup & Configuration

Follow these steps to run the platform locally:

### 1. Prerequisites
*   Node.js v18 or later installed.
*   A Firebase project created in the [Firebase Console](https://console.firebase.google.com/).
*   A MongoDB connection URI (from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local database).

### 2. Environment Setup
Create a `.env.local` file in the root directory (based on `.env.example`):

```bash
# Firebase Client Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# MongoDB Server Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nurulquran?retryWrites=true&w=majority
```

> [!IMPORTANT]
> Make sure to enable **Email/Password Provider** in your Firebase Console under **Authentication > Sign-in method** for signup/login to work.

### 3. Local Development
Install the dependencies and start the development server:

```bash
# Install additional components (if needed, otherwise package-lock.json is ready)
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build Production Bundle
To compile and optimize the app for production:

```bash
npm run build
```

---

## 📅 Roadmap: Upcoming Modules

*   **Module 2 (Interactive Quran Core):** Digital Quran reading pane, word-by-word analysis, Audio player widget, bookmark listings, search engine.
*   **Module 3 (Learning Platform & Quizzes):** Interactive courses, video/text lectures, Tajweed rules parser, progress dashboard quizzes, certification models.
*   **Module 4 (Hifz Memorization Tracker):** Memorization tracker interface, spacing repetition, speech recitation evaluator, streaks & badge awards.
