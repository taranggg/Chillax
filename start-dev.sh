#!/bin/bash

# Chill Together - Development Startup Script

echo "🎬 Starting Chill Together Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📁 Project Structure:${NC}"
echo "  ├── Backend (Port 3001) - Node.js + Socket.IO"
echo "  └── Frontend (Port 5173/5174) - React + Vite"
echo ""

# Check if we're in the right directory
if [ ! -d "Backend" ] || [ ! -d "frontend" ]; then
    echo -e "${YELLOW}⚠️  Please run this script from the Chill-Together root directory${NC}"
    exit 1
fi

echo -e "${BLUE}🚀 Starting Backend Server...${NC}"
cd Backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Start backend in background
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

sleep 2

echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
cd ..

echo ""
echo -e "${GREEN}🎉 Chill Together is now running!${NC}"
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:5173 (or next available port)"
echo -e "${BLUE}🔌 Backend:${NC}  http://localhost:3001"
echo -e "${BLUE}💬 Socket.IO:${NC} Connected and ready for real-time communication"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Wait for user to stop
trap "echo -e '\n${YELLOW}🛑 Stopping servers...${NC}'; kill $BACKEND_PID $FRONTEND_PID; echo -e '${GREEN}✅ Servers stopped${NC}'; exit 0" INT

# Keep script running
wait
