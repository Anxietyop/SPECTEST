# 🏗️ SPECTEST - Architecture & Codebase Overview

## Project Structure

```
SPECTEST/
├── frontend/              # React + Vite (Port 5173)
│   ├── src/
│   │   ├── ModernApiUI.jsx    # Main component - handles all UI
│   │   ├── App.jsx            # Root component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Tailwind styles
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # FastAPI Python (Port 8000)
│   ├── main.py            # Core API endpoints
│   ├── Readme.md          # Setup instructions
│   └── requirements.txt   # Python dependencies
│
├── AI/                    # NL-to-OpenAPI Service (Port 3000)
│   ├── NL-To-JSON/
│   │   ├── src/
│   │   │   ├── server.js                    # Express server
│   │   │   ├── Components/
│   │   │   │   ├── nlPraser.js             # Parses NL→OpenAPI
│   │   │   │   ├── prompt.js               # System prompt
│   │   │   │   └── safePrase.js            # JSON extraction
│   │   │   ├── Helper/
│   │   │   │   └── util.js                 # File utilities
│   │   │   └── uploads/
│   │   └── test/
│   └── package.json
│
├── START.md               # Quick start guide
├── BUG_FIXES.md          # Detailed bug report
└── start-all.sh          # Multi-service startup script
```

---

## Component Descriptions

### 1. Frontend (React + Vite)

**Purpose**: User interface for submitting requirements and viewing analysis results

**Main Component**: `ModernApiUI.jsx` (570 lines)

**Key Features**:
- Textarea for natural language requirement input
- Real-time stats dashboard (entities, tests, passed/failed, issues)
- Tabbed interface showing per-entity analysis
- Raw JSON export
- Advanced styling with design tokens

**Key Functions**:
```javascript
// Send requirement to AI service
sendPromptToAI(text) // POST http://localhost:3000/parse

// Poll backend for results
pollBackend() // GET http://localhost:8000/auto-analyze/result

// Main flow
runTest() → sendPromptToAI() → pollBackend() → setOutput()
```

**State Management**:
- `prompt`: User input text
- `output`: Analysis results (array of entities)
- `activeTab`: Currently selected entity
- `loading`: Processing indicator

---

### 2. Backend (FastAPI - Python)

**Purpose**: Analyzes OpenAPI specs and runs tests against JSONPlaceholder API

**Main File**: `backend/main.py` (250+ lines)

**Key Features**:
- Converts OpenAPI spec to endpoint list
- Smart entity-to-endpoint mapping using fuzzy matching
- Generates test payloads (valid and invalid)
- Runs HTTP requests against target API
- Compares spec requirements with actual API

**Key Functions**:
```python
convert_spec_to_endpoints(spec)          # Parse OpenAPI paths
smart_map_to_endpoint(requirement, eps)  # Fuzzy match entity→endpoint
generate_payload(schema)                 # Create test data
run_specific_test(endpoint)              # Execute HTTP tests
compare_schema(req, schema)              # Check for mismatches
```

**Endpoints**:
- `GET /` - Health check
- `POST /auto-analyze` - Main analysis endpoint
- `GET /auto-analyze/result` - Retrieve latest results

**Data Models**:
```python
class Field(BaseModel):
    name: str
    required: bool
    type: Optional[str] = None

class Requirement(BaseModel):
    action: str           # create, fetch, update, delete
    entity: str          # Resource name
    fields: List[Field]
    constraints: List[str]
    ambiguities: List[str]
```

---

### 3. AI Service (Node.js + Express)

**Purpose**: Converts natural language requirements to OpenAPI specifications

**Main File**: `AI/NL-To-JSON/src/server.js` (90+ lines)

**Key Features**:
- File upload support (DOCX, TXT, MD)
- OpenRouter API integration (using gpt-oss-120b:free model)
- Automatic requirement extraction from generated spec
- Cleans up malformed JSON responses
- Logs all requests and responses

**Key Functions**:
```javascript
parseRequirement(text)                    // Call OpenRouter API
extractRequirementsFromSpec(spec)        // Parse spec→requirements
extractJSON(text)                        // Extract JSON from response
readFileContent(path, originalName)      // Handle file uploads
```

**Endpoints**:
- `GET /` - Health check
- `POST /parse` - Analyze requirement (file or text)

**Response Format**:
```javascript
{
  spec: { /* OpenAPI 3.0.0 spec */ },
  requirements: [
    {
      action: "create",
      entity: "User",
      fields: [{ name: "email", required: true, type: "string" }],
      constraints: ["User email must be unique"],
      ambiguities: []
    }
  ]
}
```

---

## Data Flow Diagram

```
User Input (Browser)
    ↓
[Frontend] ModernApiUI.jsx
    ├─ sendPromptToAI(text)
    │   ↓
    └→ POST http://localhost:3000/parse
        ↓
        [AI Service] nlPraser.js
        ├─ Call OpenRouter API (gpt-oss-120b:free)
        ├─ Extract JSON spec
        ├─ Parse into { spec, requirements }
        │   └→ POST http://localhost:8000/auto-analyze
        │
        └→ Return { spec, requirements } to Frontend
            
            [Backend] main.py /auto-analyze
            ├─ Convert spec to endpoints
            ├─ Map requirements to endpoints
            ├─ Run HTTP tests against JSONPlaceholder
            ├─ Check schema compliance
            └→ Store results (global latest_result)

Frontend → Poll http://localhost:8000/auto-analyze/result
                ↓
            [Backend] GET /auto-analyze/result
                ↓
            Return array of analysis results
                ↓
Frontend → Display results in tabbed interface
```

---

## API Endpoints Map

### Frontend → AI Service (Port 3000)

```
POST /parse
├─ body: { text: string }
└─ returns: { spec: OpenAPI, requirements: Array }
```

### Frontend → Backend (Port 8000)

```
POST /auto-analyze
├─ body: { spec: OpenAPI, requirements: Array }
└─ returns: Array<Analysis>

GET /auto-analyze/result
└─ returns: Array<Analysis>

GET /
└─ returns: { status: string }
```

### AI Service → Backend (Internal)

```
POST http://127.0.0.1:8000/auto-analyze
├─ Called automatically after parsing
├─ body: { spec: OpenAPI, requirements: Array }
└─ (no response captured)
```

---

## Key Technologies

### Frontend
- **React 19.2.5** - UI framework
- **Vite 8.0.9** - Build tool (fast refresh)
- **Tailwind CSS 4.2.4** - Utility CSS
- **Lucide React 1.8.0** - Icon library

### Backend
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Requests** - HTTP client
- **Faker** - Test data generation
- **RapidFuzz** - String fuzzy matching

### AI Service
- **Express 5.2.1** - Web framework
- **Multer 2.1.1** - File uploads
- **Mammoth 1.12.0** - DOCX parsing
- **Dotenv 17.4.2** - Environment config
- **CORS 2.8.6** - Cross-origin support

### External APIs
- **OpenRouter.ai** - LLM API gateway
- **JSONPlaceholder** - Mock API for testing

---

## Important Concepts

### OpenAPI 3.0.0 Spec
The AI service generates specifications in OpenAPI 3.0.0 format:

```json
{
  "openapi": "3.0.0",
  "info": { "title": "...", "version": "1.0.0" },
  "paths": {
    "/users": {
      "post": {
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": { "email": { "type": "string" } },
                "required": ["email"]
              }
            }
          }
        }
      }
    }
  }
}
```

### Requirement Extraction
The backend receives requirements in structured format:

```json
{
  "action": "create",        // HTTP method: POST, GET, PUT, DELETE
  "entity": "User",          // Resource being accessed
  "fields": [                // Schema fields
    { "name": "email", "required": true, "type": "string" }
  ],
  "constraints": ["Unique email"],  // Business rules
  "ambiguities": ["...unclear intent..."]  // Parsing notes
}
```

### Smart Mapping
Backend uses RapidFuzz to match requirements to endpoints:
- Action mapping: "create"→POST, "fetch"→GET, etc.
- Entity matching: Fuzzy string similarity of entity names
- Score calculation: Method match (20 bonus) + path similarity

---

## Environment Variables

### AI Service (.env)
```
API_KEY=sk-or-v1-xxxxxxxxxxxxx  (OpenRouter key)
PORT=3000
```

### Backend (no .env needed, uses default ports)
```
Runs on port 8000
Tests against JSONPlaceholder
```

### Frontend (no .env needed, hardcoded URLs)
```
AI Service: http://localhost:3000
Backend: http://localhost:8000
```

---

## Testing Workflow

1. **Happy Path**: Valid requirement → Correct spec → Successful analysis
2. **Edge Case**: Ambiguous requirement → Multiple interpretations → Flagged in output
3. **Error Path**: Invalid requirement → No valid spec → Error entity shown
4. **Schema Mismatch**: Requirement fields not in API → Issue flagged

---

## Performance Notes

- **AI Parsing**: 2-5 seconds (depends on OpenRouter latency)
- **Backend Analysis**: <1 second per endpoint
- **HTTP Tests**: 1-2 seconds per endpoint
- **Frontend Polling**: 15 attempts × 600ms = up to 9 seconds total

Total time from user input to displayed results: 5-15 seconds

---

## Future Improvement Opportunities

1. **WebSocket support** - Real-time updates instead of polling
2. **Caching** - Cache specs for repeated requirements
3. **Multiple API targets** - Not just JSONPlaceholder
4. **Database storage** - Save analysis history
5. **Authentication** - User authentication and private specs
6. **Batch analysis** - Process multiple requirements simultaneously
7. **Custom prompts** - User-tunable system prompts for AI
8. **Export formats** - YAML, GraphQL, etc.
