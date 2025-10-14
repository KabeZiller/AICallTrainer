# AI Call Trainer MVP

An AI-powered platform for training cold callers with realistic AI personas and detailed performance feedback.

## Features

- 🎯 **Script Management**: Upload and manage cold call scripts
- 🤖 **AI Personas**: Automatically generated personas with 3 difficulty levels (Easy, Medium, Hard)
- 📞 **Realistic Voice Calls**: Practice calls using OpenAI's Realtime API
- 📊 **Performance Analytics**: Detailed feedback on script adherence, objection handling, and more
- 🏆 **Gamification**: Achievements, leaderboards, and progress tracking
- 🔐 **User Authentication**: Secure JWT-based authentication with role-based access

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **OpenAI API** - GPT-5 Thinking for analysis, Realtime API for voice
- **Alembic** - Database migrations

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Shadcn/UI** - Component library
- **TailwindCSS** - Styling
- **React Query** - Data fetching

### Deployment
- **Railway** - Hosting platform with auto-deploy from GitHub

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Update `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_call_trainer
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret  # Generate with: openssl rand -hex 32
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

6. Run migrations:
```bash
alembic upgrade head
```

7. Start the server:
```bash
python run.py
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_API_URL=http://localhost:8000
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Deployment to Railway

### Initial Setup

1. Create a Railway account at [railway.app](https://railway.app)

2. Install Railway CLI:
```bash
npm install -g @railway/cli
```

3. Login to Railway:
```bash
railway login
```

4. Create a new project:
```bash
railway init
```

5. Add PostgreSQL database:
```bash
railway add --database postgres
```

### Environment Variables

Set the following environment variables in Railway dashboard:

- `OPENAI_API_KEY` - Your OpenAI API key
- `JWT_SECRET` - Random secret key
- `FRONTEND_URL` - Your frontend URL (will be provided by Railway)
- `BACKEND_URL` - Your backend URL (will be provided by Railway)
- `DATABASE_URL` - Automatically set by Railway Postgres

### Deploy

1. Connect your GitHub repository to Railway

2. Railway will automatically:
   - Detect Python (backend) and Node.js (frontend)
   - Build both services
   - Run database migrations
   - Deploy the application

3. Push to GitHub to trigger deployment:
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

## Usage

### For Administrators

1. Register with admin role
2. Navigate to "Manage Scripts"
3. Create a new cold call script
4. AI will automatically generate 3 personas (Easy, Medium, Hard)

### For Callers

1. Register/Login as a caller
2. View dashboard with stats and available scripts
3. Select a script to practice
4. Choose a persona difficulty level
5. Click "Start Call" to begin voice practice
6. Receive detailed feedback after the call
7. Track progress on leaderboard

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
ai-call-trainer/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── alembic/          # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities
│   │   └── store/        # State management
│   └── package.json
└── README.md
```

## Key Features Explained

### AI Persona Generation
When you upload a script, GPT-5 Thinking analyzes it and creates 3 unique personas:
- **Easy**: Pleasant and agreeable
- **Medium**: Moderately skeptical
- **Hard**: Very difficult but convincible

### Voice Call Simulation
Uses OpenAI's Realtime API to:
- Simulate realistic phone conversations
- Provide real-time responses based on persona
- Transcribe both caller and persona speech
- Handle natural conversation flow

### Performance Analysis
After each call, GPT-5 Thinking analyzes:
- Script adherence (0-100)
- Objection handling (0-100)
- Tonality & pacing (0-100)
- Value delivery (0-100)
- Overall outcome (success/partial/failure)

### Gamification
- Unlock achievements (First Call, Perfect Pitch, Objection Master, etc.)
- Compete on global leaderboard
- Track improvement over time
- View detailed statistics

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

