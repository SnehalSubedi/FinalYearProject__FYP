from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.routes import auth, disease, realtime, insect, weed

# ─────────────────────────────────────────
# Lifespan Events
# ─────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} is starting...")
    yield
    print("🛑 Application shutting down.")

# ─────────────────────────────────────────
# App Instance
# ─────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "REST API for plant disease detection using deep learning. "
        "Includes JWT authentication and a leaf disease classifier."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─────────────────────────────────────────
# CORS — Allow React frontend
# ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React (Create React App)
        "http://localhost:5173",   # React (Vite)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# Routers
# ─────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/v1")
app.include_router(disease.router,  prefix="/api/v1")
app.include_router(realtime.router, prefix="/api/v1")
app.include_router(insect.router,   prefix="/api/v1")
app.include_router(weed.router,     prefix="/api/v1")

# ─────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}