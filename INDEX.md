# 📖 SPECTEST Documentation Index

Welcome to SPECTEST! Here's everything you need to know about this project.

---

## 🚀 Getting Started (Start Here!)

### For First-Time Users
1. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - 1-page overview of everything
2. **[START.md](START.md)** - How to install and run the project
3. **[FIXES_SUMMARY.md](FIXES_SUMMARY.md)** - What was broken and how it was fixed

### Want to Run It Right Now?
```bash
./start-all.sh
# or manually:
# Terminal 1: cd backend && uvicorn main:app --reload --port 8000
# Terminal 2: cd AI/NL-To-JSON/src && node server.js
# Terminal 3: cd frontend && npm run dev
# Then open: http://localhost:5173
```

---

## 📚 Deep Dive Documentation

### [ARCHITECTURE.md](ARCHITECTURE.md) - Full System Design
- **Project structure** - Directory layout and file descriptions
- **Component descriptions** - Each service's purpose and API
- **Data flow diagram** - How data moves through the system
- **API endpoints map** - All REST endpoints documented
- **Technology stack** - Libraries and frameworks used
- **Performance notes** - Expected timings and benchmarks

### [BUG_FIXES.md](BUG_FIXES.md) - Detailed Bug Analysis
- **3 critical bugs identified** - What was broken
- **Root cause analysis** - Why it happened
- **Before/after code** - Exact fixes applied
- **Files modified** - Which files were changed and how
- **Impact explanation** - Why bugs mattered
- **Verification** - How to test the fixes

### [TESTING_GUIDE.md](TESTING_GUIDE.md) - Quality Assurance
- **Pre-flight checks** - Verify setup before running
- **Service health checks** - Ensure all services work
- **Unit tests** - Test individual endpoints
- **Integration tests** - Test service-to-service communication
- **End-to-end tests** - Test complete user workflows
- **Troubleshooting** - Common issues and solutions
- **Performance benchmarks** - Expected timings

---

## 🎯 Purpose & Flow

### What SPECTEST Does
```
You provide: Natural language requirements
    ↓
AI Service: Converts to OpenAPI specification
    ↓
Backend: Maps to real API endpoints
    ↓
Backend: Runs automated tests
    ↓
You see: Analysis with issues and test results
```

### Example
```
Input: "Create a user with email and password"

Output:
- Endpoint mapped: POST /users
- Fields in spec: email (required), password (required)
- Test results: Valid request ✓ 201, Invalid request ✓ 400
- Issues: None
```

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────┐
│ Frontend (React)                            │
│ http://localhost:5173                       │
│ - Textarea for requirements input           │
│ - Results display with tabs                 │
│ - Raw JSON export                           │
└──────────────┬──────────────────────────────┘
               │ POST /parse
               ↓
┌──────────────────────────────────────────────┐
│ AI Service (Node.js + Express)              │
│ http://localhost:3000                       │
│ - Calls OpenRouter API (GPT)                │
│ - Converts NL → OpenAPI spec                │
│ - Extracts structured requirements          │
└──────────────┬──────────────────────────────┘
               │ POST /auto-analyze
               ↓
┌──────────────────────────────────────────────┐
│ Backend (FastAPI - Python)                  │
│ http://localhost:8000                       │
│ - Parses OpenAPI spec                       │
│ - Maps endpoints via fuzzy matching         │
│ - Runs HTTP tests                           │
│ - Returns analysis results                  │
└──────────────────────────────────────────────┘
```

---

## 🐛 What Was Fixed

### Bug #1: AI Service Not Extracting Requirements
- **File**: `AI/NL-To-JSON/src/Components/nlPraser.js`
- **Impact**: Backend never received requirements array
- **Fix**: Added `extractRequirementsFromSpec()` function

### Bug #2: Incomplete Data Sent to Backend
- **File**: `AI/NL-To-JSON/src/server.js`
- **Impact**: Backend received only spec, missing requirements
- **Fix**: Changed payload to include both `spec` and `requirements`

### Bug #3: Frontend Polling Broken
- **File**: `frontend/src/ModernApiUI.jsx`
- **Impact**: Results never displayed to user
- **Fix**: Fixed double-fetch bug, improved polling logic, better error handling

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Files modified | 4 |
| Lines added/changed | ~130 |
| Bugs fixed | 3 critical |
| Services | 3 |
| Languages | Python, JavaScript, JSX |
| Documentation files | 8 |

---

## ✅ Status

**All critical bugs fixed ✅**

- ✅ AI Service → Backend communication working
- ✅ Backend → Frontend results available
- ✅ Frontend → User can see results
- ✅ Error handling improved
- ✅ All services integrated properly
- ✅ Fully tested and documented

---

## 🛠️ Technology Stack

### Frontend
- React 19.2.5
- Vite 8.0.9
- Tailwind CSS 4.2.4

### Backend
- FastAPI
- Uvicorn
- Pydantic
- RapidFuzz (string matching)

### AI Service
- Node.js + Express
- OpenRouter API integration
- Multer (file uploads)
- Mammoth (DOCX parsing)

### External
- OpenRouter AI (LLM API)
- JSONPlaceholder (Mock API for testing)

---

## 🎨 Design

**⚠️ Important**: Frontend design was **NOT changed** during bug fixes

- Dark theme: Preserved ✓
- Design tokens: Preserved ✓
- Brutalist styling: Preserved ✓
- Animations: Preserved ✓
- Layout: Preserved ✓

Only functionality bugs were fixed.

---

## 📖 Reading Order - By Use Case

### "I just want to run it"
1. [START.md](START.md)
2. Done! ✅

### "I want to understand what it does"
1. [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. [FIXES_SUMMARY.md](FIXES_SUMMARY.md)
3. [ARCHITECTURE.md](ARCHITECTURE.md)

### "I want to debug or improve it"
1. [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. [BUG_FIXES.md](BUG_FIXES.md)
3. [ARCHITECTURE.md](ARCHITECTURE.md)
4. [TESTING_GUIDE.md](TESTING_GUIDE.md)

### "I want to add features"
1. [ARCHITECTURE.md](ARCHITECTURE.md)
2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
3. [TESTING_GUIDE.md](TESTING_GUIDE.md)

### "Something is broken or not working"
1. [TESTING_GUIDE.md](TESTING_GUIDE.md) - Troubleshooting section
2. [BUG_FIXES.md](BUG_FIXES.md) - Understand what was fixed
3. Check browser console (F12)

---

## 🚀 How to Use

### Basic Usage
1. Run all 3 services
2. Open http://localhost:5173
3. Type a requirement
4. Click RUN
5. Wait 5-10 seconds
6. See results

### Example Requirement
```
Build a todo list API where:
- Users can create tasks with title and description
- Tasks have completion status
- Users can fetch, update, and delete their tasks
- Each user has a unique email
```

### What You'll See
- Entities extracted (User, Task)
- Endpoints mapped (/users, /todos)
- Schema comparison (spec vs API)
- Test results (HTTP status codes)
- Issues found (if any)

---

## 🆘 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| "AI request failed" | Run AI service: `node server.js` in Terminal 2 |
| "Backend poll failed" | Run Backend: `uvicorn main:app --reload` in Terminal 1 |
| "No results" | Start all 3 services |
| "API Key error" | Add API_KEY to `.env` in `AI/NL-To-JSON/src/` |
| "Port in use" | Kill process or use `pkill -f uvicorn` |

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for more detailed troubleshooting.

---

## 📞 Need Help?

### Check These First
1. **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Troubleshooting section
2. **[START.md](START.md)** - Setup instructions
3. **Browser console** (F12) - Error messages

### Files Have Detailed Comments
- `backend/main.py` - Has inline comments
- `AI/NL-To-JSON/src/Components/nlPraser.js` - Has function docs
- `frontend/src/ModernApiUI.jsx` - Has component descriptions

---

## 🎯 Next Steps

1. **Run one of the startup methods** from [START.md](START.md)
2. **Test with a sample requirement**
3. **Explore the results interface**
4. **Read [ARCHITECTURE.md](ARCHITECTURE.md)** to understand the design
5. **Check [TESTING_GUIDE.md](TESTING_GUIDE.md)** to verify everything works

---

## 📝 Version Info

- **Project**: SPECTEST - API Specification Testing Tool
- **Status**: ✅ Production Ready
- **Last Updated**: April 22, 2026
- **Bugs Fixed**: 3/3 ✅
- **Documentation**: Complete ✅

---

**Happy Testing! 🚀**

All three services are now properly integrated and ready to use.
