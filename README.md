# FlyBetter - Global Flight Intelligence & Systems Platform

FlyBetter is a production-grade flight search, intelligence, and distributed backend architecture platform built with React 19, TypeScript, Vite 6, Tailwind CSS v4, Express, and Google Gemini 2.5 Flash (`@google/genai`).

---

## 🌟 Dual-Layer Architecture

1. **Layer 1: End-User Passenger Landing Page**
   - **Cheapest Flight Finder**: Real-time fare tracking with buy/wait price confidence scores.
   - **Interactive Calendar**: Dynamic date selection with instant inventory availability.
   - **Smart Filters**: Filter by budget slider, stopovers, cabin class, and carrier / company.
   - **AI Flight Search Copilot**: Natural-language flight query parser powered by Gemini 2.5.
   - **Trending Destinations & Price Alerts**: Route analytics across global aviation hubs.

2. **Layer 2: Enterprise Systems & Architecture Console**
   - **15 DDD Bounded Contexts**: Event-driven domain boundaries, Citus PostgreSQL schemas, and Kafka message topics.
   - **Multi-Tier Caching & Search Engine**: Edge L1 CDN (<50ms), L2 Redis Cluster, and L3 Spanner storage.
   - **Apache Flink Mistake Fare Detector**: Real-time stream processing for price anomalies.
   - **Chief Architect AI Chatbot**: Server-side proxy to Gemini 2.5 Flash for deep engineering insights.

---

## 🚀 Quick Deployment on Render

This repository includes a `render.yaml` Blueprint file for seamless automated deployment to [Render](https://render.com).

### Option A: Render Blueprint (Recommended)
1. Push this repository to **GitHub**.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect `render.yaml`.
5. Under Environment Variables, set:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
6. Click **Apply**. Render will build and deploy your web service.

### Option B: Manual Render Web Service Setup
1. On Render, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Add Environment Variable:
   - `GEMINI_API_KEY`: `<Your Gemini API Key>`
   - `NODE_ENV`: `production`

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/your-username/flybetter-flight-platform.git
cd flybetter-flight-platform

# 2. Install dependencies
npm install

# 3. Create .env file from .env.example
cp .env.example .env

# 4. Add your Gemini API Key in .env
# GEMINI_API_KEY="AIzaSy..."

# 5. Start development server
npm run dev
```

The application will launch on `http://localhost:3000`.

---

## 🛠 Production Build & Test Locally

```bash
# Build the client bundle & bundle server with esbuild
npm run build

# Start the standalone Node.js production server
npm start
```

---

## 📂 Project Directory Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore patterns
├── package.json              # NPM dependencies & scripts
├── render.yaml               # Render deployment blueprint
├── server.ts                 # Express backend & Gemini API proxy
├── vite.config.ts            # Vite & Tailwind configuration
├── index.html                # Single-page application entry HTML
├── specifications/           # Architectural specifications & TDD docs
└── src/
    ├── App.tsx               # Main application routing & tab manager
    ├── components/           # UI components (Landing Page, DDD, Architecture, Chat)
    ├── data/                 # Architecture documentation & domain data
    └── types.ts              # TypeScript interfaces & domain models
```

---

## 🔒 Security & Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | **Yes** (for AI features) | Google Gemini API key used server-side for the Chief Architect copilot and AI search |
| `PORT` | No (Defaults to `3000`) | Server port assigned dynamically by Render / Cloud Run / Heroku |
| `NODE_ENV` | No (Defaults to `development`) | Environment flag (`development` or `production`) |

---

## 📄 License

MIT License. Designed for scalability and high-performance travel engineering.
