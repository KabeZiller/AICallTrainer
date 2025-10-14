# Deployment Guide for AI Call Trainer

## Railway Deployment

### Prerequisites
1. GitHub account
2. Railway account ([railway.app](https://railway.app))
3. OpenAI API key

### Step 1: Prepare Repository

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create GitHub repository and push:
```bash
git remote add origin https://github.com/yourusername/ai-call-trainer.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up Railway Project

1. Go to [railway.app](https://railway.app) and login

2. Click "New Project"

3. Select "Deploy from GitHub repo"

4. Choose your `ai-call-trainer` repository

5. Railway will detect both services automatically

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "New"

2. Select "Database" → "PostgreSQL"

3. Railway will automatically create the database and set `DATABASE_URL` environment variable

### Step 4: Configure Environment Variables

#### For Backend Service:

1. Go to backend service settings
2. Add the following variables:

```
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=generate_with_openssl_rand_hex_32
FRONTEND_URL=https://your-frontend-url.railway.app
BACKEND_URL=https://your-backend-url.railway.app
```

Note: Railway will auto-provide `DATABASE_URL`

#### For Frontend Service:

1. Go to frontend service settings
2. Add:

```
VITE_API_URL=https://your-backend-url.railway.app
```

### Step 5: Configure Services

#### Backend Configuration:

1. In backend service settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### Frontend Configuration:

1. In frontend service settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview -- --port $PORT --host 0.0.0.0`

### Step 6: Deploy

1. Railway will automatically deploy when you push to main branch

2. Get your deployment URLs:
   - Backend: `https://your-backend-url.railway.app`
   - Frontend: `https://your-frontend-url.railway.app`

3. Update environment variables with actual URLs

4. Redeploy services

### Step 7: Database Migrations

Railway will automatically run migrations on each deployment via the build command.

To manually run migrations:

1. Go to backend service
2. Click "Settings" → "Deploy"  
3. Trigger manual deployment

### Step 8: Verify Deployment

1. Visit frontend URL
2. Register a new account
3. Create a test script (if admin)
4. Test a call

### Automatic Deployments

Railway automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Monitoring

1. **Logs**: View real-time logs in Railway dashboard
2. **Metrics**: Monitor CPU, memory, and network usage
3. **Deployments**: View deployment history and rollback if needed

### Cost Optimization

1. **Starter Plan**: $5/month includes:
   - 500 hours of execution time
   - 8GB RAM
   - 100GB network egress

2. **Database Backups**: Enabled automatically with Railway Postgres

3. **Scaling**: Scale up/down based on usage

### Troubleshooting

#### Backend Won't Start
- Check `DATABASE_URL` is set
- Verify all environment variables are configured
- Check logs for migration errors

#### Frontend Can't Connect
- Verify `VITE_API_URL` points to correct backend URL
- Check CORS settings in backend
- Ensure backend is deployed and running

#### Database Connection Errors
- Verify PostgreSQL service is running
- Check `DATABASE_URL` format
- Try redeploying backend service

### Rolling Back

If deployment fails:

1. Go to service → "Deployments"
2. Find previous working deployment
3. Click "Redeploy"

### Custom Domain (Optional)

1. Go to service settings
2. Click "Domains"
3. Add custom domain
4. Update DNS records
5. Update environment variables with new domain

## Alternative: Manual VPS Deployment

If you prefer deploying to your own server:

### Using Docker Compose:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ai_call_trainer
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/ai_call_trainer
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://localhost:8000
    ports:
      - "80:80"

volumes:
  postgres_data:
```

Deploy with:
```bash
docker-compose up -d
```

## Security Checklist

- [ ] Environment variables secured
- [ ] JWT_SECRET is strong random value
- [ ] HTTPS enabled (Railway provides automatically)
- [ ] CORS configured correctly
- [ ] Database backups enabled
- [ ] API rate limiting configured
- [ ] Input validation on all endpoints

## Post-Deployment

1. Create admin user
2. Upload first script
3. Test all features:
   - Registration/Login
   - Script creation
   - Voice calls
   - Feedback analysis
   - Leaderboard
4. Monitor OpenAI API usage
5. Set up alerts for errors

