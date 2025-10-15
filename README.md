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

An optional small server is included at `server/` to proxy embedding requests (so you don't expose API keys in the browser). It supports calling OpenAI embeddings via `OPENAI_API_KEY` or can be adapted for Gemini. To run the server locally:

```powershell
cd server
npm install
setx OPENAI_API_KEY "your_key_here"
node index.js
```

If the server is running, the frontend will attempt semantic matching using embeddings and fall back to TF-IDF when not available.

Approach (<=200 words)

I built a simple React app that matches recipes by computing ingredient overlap and applying user filters (diet, difficulty, max time). Image-based ingredient recognition uses TensorFlow.js MobileNet to classify an uploaded photo and suggest likely ingredients which are then added to the search. Substitutions are provided via a small heuristic map. Nutrition scales linearly with servings. Favorites and ratings are stored in localStorage for persistence. The app focuses on clear UX, loading states for the image classifier, and graceful fallbacks when no ingredients are provided. The matching logic is deliberately simple (match percentage) so it is fast and explainable; it can be extended with TF-IDF-like weights or semantic matching (embedding models) if desired.

Notes & limitations

- No backend included; favorites and ratings are local only.
- For production-grade ingredient recognition a fine-tuned model is recommended. The included MobileNet classifier is a proof-of-concept.
- To get a live URL I can deploy to Vercel/Netlify if you grant repository access or provide deploy tokens.
