
# 🏗️ SPECTEST

**SPECTEST** is an automated API Specification Testing Tool designed to bridge the gap between natural language requirements and functional API validation. It leverages AI to transform human-readable requirements into OpenAPI specifications and then validates those specs against live or mock API endpoints.

-----

## 🎯 Key Features

  * **NL-to-OpenAPI**: Convert natural language descriptions into structured OpenAPI 3.0 JSON.
  * **Requirement Mapping**: Automatically map requirements to API endpoints and HTTP methods.
  * **Automated Validation**: Run schema compliance tests against endpoints (defaults to JSONPlaceholder).
  * **Ambiguity Detection**: AI-powered flagging of vague or contradictory requirements.
  * **Modern UI**: A React-based dashboard to visualize entities, test results, and raw JSON data.

-----

## 🏗️ System Architecture

The system consists of three decoupled services:

1.  **Frontend (React + Vite)**: Port `5173`. Provides the user interface for inputting requirements and viewing analysis.
2.  **AI Service (Node.js + Express)**: Port `3000`. Uses the OpenRouter API to parse natural language into OpenAPI specs.
3.  **Backend (FastAPI)**: Port `8000`. Performs the heavy lifting of spec analysis, endpoint mapping, and test execution.

-----

## 🚀 Quick Start

### Prerequisites

  * Node.js 16+
  * Python 3.8+
  * An OpenRouter API Key

### Automated Startup (Recommended)

```bash
./start-all.sh
```

### Manual Startup

If you prefer to run services individually:

**Terminal 1: Backend**

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2: AI Service**

```bash
cd AI/NL-To-JSON/src
npm install
# Create a .env file with API_KEY=sk-or-v1-xxxxxx
node server.js
```

**Terminal 3: Frontend**

```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** to begin.

-----

## 📝 Usage Example

1.  Open the frontend dashboard.
2.  In the input area, enter a requirement:
    > "Users can register with an email and password. They should also be able to fetch their profile details and update their bio."
3.  Click **RUN**.
4.  In 5-15 seconds, view the mapped entities (User, Profile), test passes/fails, and any identified schema issues.

-----

## 📂 Documentation Guide

For more detailed information, please refer to the following documents:

  * **[ARCHITECTURE.md](https://www.google.com/search?q=./ARCHITECTURE.md)**: Deep dive into the codebase, data flow, and technology stack.
  * **[START.md](https://www.google.com/search?q=./START.md)**: Detailed installation and environment setup instructions.
  * **[TESTING\_GUIDE.md](https://www.google.com/search?q=./TESTING_GUIDE.md)**: Pre-flight checks and service health verification.
  * **[BUG\_FIXES.md](https://www.google.com/search?q=./BUG_FIXES.md)** & **[FIXES\_SUMMARY.md](https://www.google.com/search?q=./FIXES_SUMMARY.md)**: History of critical fixes and current system status.
  * **[QUICK\_REFERENCE.md](https://www.google.com/search?q=./QUICK_REFERENCE.md)**: A one-page summary of ports, endpoints, and commands.

-----

## 🔧 Configuration

The AI Service requires an environment file located at `AI/NL-To-JSON/src/.env`:

```env
API_KEY=your_openrouter_key_here
PORT=3000
```

-----

## 🛠 Tech Stack

  * **Frontend**: React, Vite, Tailwind CSS
  * **Backend**: FastAPI, HTTPX, Pydantic
  * **AI Service**: Node.js, Express, OpenRouter SDK
  * **Testing**: JSONPlaceholder (Default Mock Target)