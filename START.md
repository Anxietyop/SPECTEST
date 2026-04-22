# 🚀 SPECTEST - Quick Start Guide

## Prerequisites
- Node.js 16+ (for AI service and frontend)
- Python 3.8+ (for backend)
- OpenRouter API key (set in `.env`)

## 1️⃣ Start the Backend (FastAPI)

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Expected output:
```
Uvicorn running on http://127.0.0.1:8000
```

## 2️⃣ Start the AI Service (Node.js)

In a **new terminal**:

```bash
cd AI/NL-To-JSON/src
node server.js
```

Expected output:
```
Server running on http://localhost:3000
```

**Make sure your `.env` file has:**
```
API_KEY=sk-or-v1-xxxxxxxxxxxxx
PORT=3000
```

## 3️⃣ Start the Frontend (React + Vite)

In a **new terminal**:

```bash
cd frontend
npm run dev
```

Expected output:
```
Local:   http://localhost:5173
```

## 4️⃣ Test the System

1. Open http://localhost:5173 in your browser
2. Type a requirement, e.g.:
   ```
   Create a user registration system with email and password. 
   Users should be able to fetch their profile and update their bio.
   ```
3. Click **RUN** button
4. Wait for results (should appear in 5-10 seconds)

## 🔍 Troubleshooting

### "AI request failed: 404"
- AI service not running on port 3000
- Check: `node server.js` in AI/NL-To-JSON/src

### "Backend poll failed: 404"
- FastAPI backend not running on port 8000
- Check: `uvicorn main:app --reload --port 8000`

### "No results from backend"
- Ensure **all 3 services** are running
- Check API_KEY in AI service `.env`
- Check browser console for more details

### API Key not working
- Verify OpenRouter API key format: `sk-or-v1-...`
- Check https://openrouter.ai/keys for current keys

## 📊 Check Service Health

```bash
# Frontend
curl http://localhost:5173

# AI Service
curl http://localhost:3000

# Backend
curl http://localhost:8000
```

All should return 200 OK.

## 🛠 Development Tips

- **Frontend changes**: Auto-reload on save (Vite)
- **Backend changes**: Auto-reload when `--reload` flag is set
- **AI Service changes**: Restart with `node server.js`
- **Logs**: Check browser console (Frontend), terminal (AI Service & Backend)

## 📝 Architecture

```
User Input (Frontend React)
    ↓
Parse via AI Service (OpenRouter API)
    ↓
Extract requirements from spec
    ↓
Send to Backend (FastAPI)
    ↓
Map endpoints & run tests
    ↓
Display results in Frontend
```
