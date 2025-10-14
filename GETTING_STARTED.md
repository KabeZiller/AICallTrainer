# Getting Started with AI Call Trainer

This guide will help you get the application running on your local machine in under 10 minutes.

## Prerequisites

Before you begin, make sure you have:
- ✅ Python 3.10 or higher
- ✅ Node.js 18 or higher
- ✅ PostgreSQL 15 or higher
- ✅ OpenAI API key with credits
- ✅ Git

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/ai-call-trainer.git
cd ai-call-trainer
```

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Create a new database:
```bash
createdb ai_call_trainer
```

2. Note your connection string:
```
postgresql://username:password@localhost:5432/ai_call_trainer
```

### Option B: Railway PostgreSQL (Recommended for quick start)

1. Visit [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the DATABASE_URL from the dashboard

## Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Now edit `backend/.env` with your credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_call_trainer
OPENAI_API_KEY=sk-your-actual-api-key-here
JWT_SECRET=your-random-secret-here  # Generate with: openssl rand -hex 32
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

Generate a JWT secret:
```bash
openssl rand -hex 32
```

## Step 4: Run Database Migrations

```bash
# Still in backend directory
alembic upgrade head
```

You should see output like:
```
INFO  [alembic.runtime.migration] Running upgrade -> abc123, Initial migration
```

## Step 5: Start the Backend

```bash
python run.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**✅ Backend is now running at http://localhost:8000**

Test it: Visit http://localhost:8000/docs to see the API documentation

## Step 6: Frontend Setup

Open a **new terminal window** (keep backend running).

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

## Step 7: Start the Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.4.9  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Frontend is now running at http://localhost:5173**

## Step 8: Create Your First Account

1. Visit http://localhost:5173
2. Click "Register"
3. Enter your email and password
4. You'll be automatically logged in

## Step 9: Create an Admin Account (Optional)

To upload scripts, you need an admin account.

**Option 1: Via PostgreSQL**
```bash
# Connect to your database
psql ai_call_trainer

# Update a user to admin
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

**Option 2: Modify the code temporarily**

In `backend/app/api/auth.py`, line 26, change:
```python
role=user_data.role  # Change to: role="admin"
```

Register a new account, then change it back.

## Step 10: Upload Your First Script

1. Login with admin account
2. Click "Manage Scripts"
3. Enter a script title: "SaaS Cold Call"
4. Paste a cold call script, for example:

```
Hi [Name], this is [Your Name] from [Company].

I hope I'm not catching you at a bad time? Great!

The reason I'm calling is that we help companies like [Their Company] 
increase sales productivity by 40% through our AI-powered CRM platform.

I noticed on LinkedIn that you're the [Title] at [Company]. 
Are you currently using any CRM tools for your sales team?

[Wait for response]

I'd love to show you how we've helped companies similar to yours 
cut their sales cycle time in half. Would you have 15 minutes 
this week for a quick demo?
```

5. Click "Create Script"
6. Wait ~10 seconds for AI to generate personas
7. Go back to Dashboard - you should see your script with 3 personas!

## Step 11: Make Your First Practice Call

1. Click "Start Practice Call" on your script
2. Select a persona (try "Easy" first)
3. Click "Start Call" 
4. **Grant microphone permissions** when prompted
5. Start talking through your pitch!
6. Click "End Call" when done
7. Review your detailed feedback

## 🎉 You're All Set!

Your AI Call Trainer is now fully operational!

## Quick Reference

### Start Development (After Initial Setup)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Stop Servers

- Press `Ctrl+C` in each terminal

### Reset Database

```bash
cd backend
alembic downgrade base
alembic upgrade head
```

## Common Issues

### "ModuleNotFoundError"
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

### "Connection refused" to database
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env

### "Unauthorized" errors
- Check OPENAI_API_KEY is set correctly
- Verify your OpenAI account has credits

### Microphone not working
- Check browser permissions
- Use Chrome or Edge (best WebRTC support)
- Ensure localhost is allowed to access microphone

### Personas not generating
- Check backend logs for errors
- Verify OpenAI API key
- May take 10-30 seconds for first generation

## Next Steps

1. ✅ Invite team members to register
2. ✅ Create multiple scripts for different scenarios
3. ✅ Practice with Easy → Medium → Hard personas
4. ✅ Check the leaderboard to track progress
5. ✅ Review achievements as you improve

## Need Help?

- Check `README.md` for detailed documentation
- Visit API docs at http://localhost:8000/docs
- Review code comments in the codebase

## Ready to Deploy?

See `DEPLOYMENT.md` for instructions on deploying to Railway!

