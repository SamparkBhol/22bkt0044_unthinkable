# Smart Recipe — Minimal Prototype

This is a lightweight React + Vite prototype implementing the requested features: ingredient input (text + image recognition), recipe matching, filters, substitutions, serving scaling, favorites, and a recipe database (20 items).

Quick start

1. Install dependencies

```powershell
npm install
```

2. Run dev server

```powershell
npm run dev
```

Build & preview

```powershell
npm run build; npm run preview
```

Deployment

Deploy to Netlify or Vercel by connecting the repository and using the `build` command (`npm run build`). This is a frontend-only app and can be deployed on the free tiers.

Environment keys

Add a `.env` with any keys you need (for example `GEMINI_API_KEY`), but do NOT commit `.env` to source control. A `.env.example` is included.

Semantic embeddings (optional)

An optional small server is included at `server/` to proxy embedding requests (so you don't expose API keys in the browser). It supports calling GEMINI embeddings via `GEMINI_API_KEY` or can be adapted for Gemini. To run the server locally:

```powershell
cd server
npm install
setx GEMINI_API_KEY "your_key_here"
node index.js
```

If the server is running, the frontend will attempt semantic matching using embeddings and fall back to TF-IDF when not available.

Approach (<=200 words)

I built a simple React app that matches recipes by computing ingredient overlap and applying user filters (diet, difficulty, max time). Image-based ingredient recognition uses TensorFlow.js MobileNet to classify an uploaded photo and suggest likely ingredients which are then added to the search. Substitutions are provided via a small heuristic map. Nutrition scales linearly with servings. Favorites and ratings are stored in localStorage for persistence. The app focuses on clear UX, loading states for the image classifier, and graceful fallbacks when no ingredients are provided. The matching logic is deliberately simple (match percentage) so it is fast and explainable; it can be extended with TF-IDF-like weights or semantic matching (embedding models) if desired.

Notes & limitations

- No backend included; favorites and ratings are local only.
- For production-grade ingredient recognition a fine-tuned model is recommended. The included MobileNet classifier is a proof-of-concept.
- To get a live URL I can deploy to Vercel/Netlify if you grant repository access or provide deploy tokens.



=================================

# 🍳 Smart Recipe

## 🧠 Project Overview
The **Smart Recipe** application is a modern, client-side web app built with **React** and **Vite**.  
Its purpose is to help users find recipes based on the ingredients they already have.  
The “smart” part comes from its **image recognition** feature, which allows users to upload pictures of ingredients instead of typing them.

---

## 🧰 Key Technologies

- **Frontend:** React, Vite, Framer Motion (animations), React Icons, Lottie-React (animations)
- **Machine Learning:** TensorFlow.js with **MobileNet** model for in-browser image classification (detects ingredients from photos)
- **Backend (Optional):** Minimal **Node.js** server for proxying requests ( Gemini APIs for semantic embeddings)

---

## 🎨 Research and Design

The project is a well-thought-out prototype designed to answer the common question:  
> *"What can I make with what I have?"*  

It focuses on user experience and leverages modern web technologies effectively.

---

### 1️⃣ Ingredient Input: Text and Image Recognition

#### Problem
Users may not want to type all ingredients manually. Some may not even recognize certain ingredients.

#### Solution
Two input methods are provided:
1. **Text Input:** Users can type in ingredients.
2. **Image Recognition:** Users upload a photo, and the app uses a pre-trained **MobileNet** model to identify ingredients.  
   - This runs directly in the browser for faster, privacy-friendly performance.

---

### 2️⃣ Recipe Matching and Filtering

#### Problem
How to find the most suitable recipes and account for dietary restrictions or cooking time?

#### Solution
The application uses multiple matching strategies:
- **Ingredient Overlap:** Matches recipes based on ingredient similarity.
- **Semantic Matching (Optional):** Uses AI embeddings to understand relationships (e.g., *beef ≈ steak*).
- **Filtering:** Users can filter recipes by diet (vegetarian, gluten-free), difficulty, or time.

---

### 3️⃣ User-Centric Features

#### Problem
How to make the app engaging for repeat users?

#### Solution
Includes several features for a personalized experience:
- **Substitutions:** Suggests ingredient alternatives.
- **Serving Scaling:** Adjusts ingredient quantities based on servings.
- **Favorites & Ratings:** Users can save and rate recipes (stored locally via `localStorage`).

---

## 🏗️ Architecture

- **Frontend-First:** Core logic runs entirely in the browser. Easy to deploy on **Netlify** or **Vercel**.
- **Component-Based:** Built with reusable React components (`/src` directory).
- **Optional Backend:** A minimal **Node.js** server (`/server` directory) can securely handle API keys for Gemini integrations.

---

## 🚀 Potential for Further Research & Development

- **Fine-Tuned Model:** The current MobileNet model is a proof-of-concept.  
  → Future versions could use a custom fine-tuned model for higher ingredient recognition accuracy.
- **Backend Integration:**  
  → Add a proper backend (e.g., Express + MongoDB) to store user favorites, ratings, and profiles.
- **Expanded Recipe Database:**  
  → Extend beyond the current 20-item recipe list to include more diverse cuisines and dietary options.

---

## 💡 Summary

The **Smart Recipe** project showcases:
- Real-time ingredient recognition using client-side AI
- Smart recipe discovery based on context and similarity
- A foundation for an AI-powered cooking assistant built with modern web tech
