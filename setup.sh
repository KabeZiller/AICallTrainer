#!/bin/bash

# AI Call Trainer - Quick Setup Script
# This script helps you set up the development environment

set -e

echo "🚀 AI Call Trainer - Setup Script"
echo "=================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10 or higher."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL CLI not found. Make sure PostgreSQL is installed."
fi

echo "✅ Prerequisites check complete"
echo ""

# Backend setup
echo "Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your database URL and OpenAI API key"
else
    echo "✅ .env file already exists"
fi

echo "✅ Backend setup complete"
echo ""

# Frontend setup
cd ../frontend
echo "Setting up frontend..."

echo "Installing Node.js dependencies..."
npm install --silent

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ Frontend .env created"
else
    echo "✅ .env file already exists"
fi

echo "✅ Frontend setup complete"
echo ""

# Final instructions
cd ..
echo "=================================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit backend/.env with your credentials:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - OPENAI_API_KEY (from platform.openai.com)"
echo "   - JWT_SECRET (generate with: openssl rand -hex 32)"
echo ""
echo "2. Run database migrations:"
echo "   cd backend && source venv/bin/activate && alembic upgrade head"
echo ""
echo "3. Start the backend (Terminal 1):"
echo "   cd backend && source venv/bin/activate && python run.py"
echo ""
echo "4. Start the frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Visit http://localhost:5173 to use the app!"
echo ""
echo "📖 For detailed instructions, see GETTING_STARTED.md"
echo "=================================="

