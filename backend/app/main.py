from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings, validate_production_settings
from app.database import Base, engine
from app.routers import auth_router, pipeline_router
from app.scheduler import create_and_start_scheduler

validate_production_settings()
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(pipeline_router.router)


@app.on_event("startup")
async def on_startup():
    app.state.scheduler = create_and_start_scheduler()


@app.on_event("shutdown")
async def on_shutdown():
    sched = getattr(app.state, "scheduler", None)
    if sched and sched.running:
        sched.shutdown(wait=False)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME, "llm_mode": settings.LLM_MODE}
