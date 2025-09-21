#!/bin/bash

echo "🚀 Setting up Twilio Video for HireMeNow..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Installing Twilio SDK...${NC}"
cd backend
npm install twilio
cd ..

echo -e "${GREEN}✅ Twilio SDK installed${NC}"

echo -e "${BLUE}Step 2: Creating environment file...${NC}"
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo -e "${YELLOW}📝 Created backend/.env file${NC}"
    echo -e "${YELLOW}⚠️  Please update backend/.env with your Twilio credentials${NC}"
else
    echo -e "${GREEN}✅ Environment file already exists${NC}"
fi

echo -e "${BLUE}Step 3: Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo -e "${BLUE}Step 4: Starting frontend server...${NC}"
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}🎉 Setup complete!${NC}"
echo -e "${BLUE}Backend running on: http://localhost:3001${NC}"
echo -e "${BLUE}Frontend running on: http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Go to https://console.twilio.com/recover"
echo "2. Enter recovery code: RAAQN95WYKSD9AR6ZJFGTCYC"
echo "3. Get your credentials and update backend/.env"
echo "4. Test real video calls at http://localhost:5173"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
