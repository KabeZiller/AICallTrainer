# AI Call Trainer - Backend

FastAPI backend for the AI Call Trainer platform.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `JWT_SECRET`: Generate with `openssl rand -hex 32`

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the server:
```bash
python run.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback:
```bash
alembic downgrade -1
```

## Project Structure

```
backend/
├── app/
│   ├── api/          # API route handlers
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic (OpenAI, Realtime API)
│   ├── utils/        # Utilities (auth, helpers)
│   ├── config.py     # Configuration
│   ├── database.py   # Database connection
│   └── main.py       # FastAPI app
├── alembic/          # Database migrations
├── requirements.txt  # Python dependencies
└── run.py           # Server startup script
```

