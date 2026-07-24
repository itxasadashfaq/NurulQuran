# NurulQuran – A Complete Islamic Learning & Quran Companion Platform

NurulQuran is a premium, modern companion platform for Quran study, prayer tracking, and structured Islamic learning modules. This codebase represents the simplified version of **Module 1 (Planning & Project Foundation)**.

By leveraging a decoupled design, this setup separates the frontend and backend into clear, vanilla files that work immediately with VS Code's **Go Live (Live Server)** extension without compilation overhead.

---

## 📂 Simplified Folder Structure

```text
ZYNAX SOLUTION PROJECT/
├── index.html          # Responsive homepage, navbar, footer & auth modal
├── dashboard.html      # Protected user dashboard (streaks, progress, prayers)
├── styles.css          # Vanilla theme variables, fonts, glassmorphism & animations
├── app.js              # Client-side JavaScript (Firebase Auth, UI controllers)
│
├── server.js           # Lightweight Node.js/Express backend (serves configs, syncs MongoDB)
├── package.json        # Backend scripts & dependency packages
├── .env.example        # Blueprint configuration parameters
└── README.md           # Simple startup documentation
```

---

## 🛠️ Technology Stack

1.  **Frontend Layout:** HTML5 Semantic Structure & Tailwind CSS v3 via CDN
2.  **Frontend Logic:** Vanilla ES6 Javascript (using modules map)
3.  **Authentication:** Firebase Auth (v10 JS Client SDK loaded via GStatic)
4.  **Backend Server:** Node.js + Express
5.  **Database Sync:** MongoDB Atlas + Mongoose ORM

---

## ⚙️ Setup & Local Startup Guide

Follow these 3 simple steps to get the project running locally:

### 1. Configure Environmental Variables
Copy the `.env.example` file and create a new file named `.env.local` or `.env` in the root folder, then populate your credentials:

```env
# Firebase Client Credentials
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# MongoDB Server connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nurulquran?retryWrites=true&w=majority
```

> [!IMPORTANT]
> Make sure to enable the **Email/Password** provider in your Firebase project console under **Authentication > Sign-in method** for authentication to function.

---

### 2. Start the Backend Server
Install the lightweight node modules and start the backend Express server:

```bash
# 1. Install dependencies
npm install

# 2. Run backend Express server
npm start
```
The server will start listening on port `5000` (http://localhost:5000) and automatically establish a connection with MongoDB.

---

### 3. Open the Frontend Platform
Open VS Code, click the **Go Live** button in the bottom right corner (from the Live Server extension) or double-click the `index.html` file to run the web application. 

It will automatically serve the page on **`http://127.0.0.1:5500/index.html`**, load Firebase Auth, and interface with your Express backend at port `5000`!
