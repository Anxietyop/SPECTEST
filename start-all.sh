#!/bin/bash

# ====================================
# SPECTEST - All-in-One Startup Script
# ====================================

echo "🚀 Starting SPECTEST services..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Check if all required directories exist
if [ ! -d "backend" ] || [ ! -d "AI/NL-To-JSON" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Invalid project structure"
    exit 1
fi

# Function to start a service
start_service() {
    local name=$1
    local dir=$2
    local command=$3
    
    echo -e "${YELLOW}📦 Starting $name...${NC}"
    (cd "$PROJECT_ROOT/$dir" && eval "$command") &
    sleep 2
}

# Start Backend (FastAPI)
start_service "Backend (FastAPI)" "backend" \
    "source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null; \
    uvicorn main:app --reload --port 8000"

# Start AI Service (Node.js)
start_service "AI Service" "AI/NL-To-JSON/src" \
    "node server.js"

# Start Frontend (Vite)
start_service "Frontend (Vite)" "frontend" \
    "npm run dev"

# Wait a moment for services to start
sleep 3

echo ""
echo -e "${GREEN}✓ All services started!${NC}"
echo ""
echo "🌐 Service URLs:"
echo "  - Frontend:    http://localhost:5173"
echo "  - Backend:     http://localhost:8000"
echo "  - AI Service:  http://localhost:3000"
echo ""
echo "📖 Documentation: See START.md"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running
wait
