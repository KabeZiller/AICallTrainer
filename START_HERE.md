# 🚀 Quick Start Guide

Your AI Call Trainer is now set up and ready to run!

## ✅ What's Already Done

- ✅ Code pushed to GitHub: https://github.com/KabeZiller/AICallTrainer.git
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed  
- ✅ PostgreSQL database created (`ai_call_trainer`)
- ✅ Database migrations applied
- ✅ Environment files configured

## ⚠️ Important: Add Your OpenAI API Key

Before starting, you need to add your OpenAI API key:

1. Open `backend/.env` in a text editor
2. Replace `sk-your-openai-api-key-here` with your actual OpenAI API key
3. Save the file

Get your API key from: https://platform.openai.com/api-keys

## 🏃 Running the Application

You need to run **2 terminals** simultaneously:

### Terminal 1: Backend (FastAPI)

```bash
cd backend
source venv/bin/activate
python run.py
```

The backend will start at: **http://localhost:8000**

### Terminal 2: Frontend (React)

```bash
cd frontend
npm run dev
```

The frontend will start at: **http://localhost:5173**

## 🎯 What to Do Next

1. **Open your browser** and go to: http://localhost:5173

2. **Register** a new account:
   - Click "Register"
   - Enter your email and password
   - You'll be automatically logged in

3. **Become an Admin** (to upload scripts):
   ```bash
   # In a new terminal:
   /opt/homebrew/opt/postgresql@15/bin/psql ai_call_trainer
   
   # Then run:
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   \q
   ```

4. **Upload Your First Script**:
   - Click "Manage Scripts" (admin only)
   - Add a title like "SaaS Cold Call"
   - Paste your cold call script
   - Click "Create Script"
   - Wait ~10 seconds for AI to generate personas

5. **Make Your First Practice Call**:
   - Go back to Dashboard
   - Click "Start Practice Call"
   - Select a persona (try "Easy" first)
   - Click "Start Call"
   - Grant microphone permission
   - Start pitching!

## 📊 API Documentation

Once the backend is running, view the API docs at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛑 Stopping the Application

Press `Ctrl+C` in each terminal to stop the servers.

## 🔧 Troubleshooting

### Backend won't start
- Make sure PostgreSQL is running: `brew services list`
- Check your OpenAI API key in `backend/.env`
- Verify database exists: `/opt/homebrew/opt/postgresql@15/bin/psql -l | grep ai_call_trainer`

### Frontend can't connect
- Ensure backend is running on port 8000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:8000`

### Microphone not working
- Use Chrome or Edge (best WebRTC support)
- Check browser permissions
- Ensure localhost is allowed to access microphone

### Personas not generating
- Verify OpenAI API key is correct
- Check backend logs for errors
- May take 10-30 seconds on first generation

## 📚 More Information

- **Full Documentation**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`  
- **Project Overview**: See `PROJECT_SUMMARY.md`

## 🎉 You're All Set!

Your local development environment is ready. Start making practice calls and improve your cold calling skills!

---

Need help? Check the troubleshooting section above or review the documentation files.

