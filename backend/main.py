from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from backend.core.config import settings
from backend.routers import auth, users, startups, validation, roadmap, funding, network, opportunities, copilot, admin, utils, public_profile_router
from backend.core.logger import logger
from backend.core.db_seeder import seed_initial_data

# Initialize and Seed Database
try:
    seed_initial_data()
    logger.info("Successfully checked and seeded MongoDB.")
except Exception as e:
    logger.error(f"Error seeding MongoDB: {str(e)}")


# Create FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

if os.path.exists("scs"):
    app.mount("/static", StaticFiles(directory="scs"), name="static")


# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for student ease, config limits in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["Authentication"])
app.include_router(users.router, prefix=settings.API_V1_STR, tags=["Users"])
app.include_router(startups.router, prefix=settings.API_V1_STR, tags=["Startups"])
app.include_router(validation.router, prefix=settings.API_V1_STR, tags=["AI Validation"])
app.include_router(roadmap.router, prefix=settings.API_V1_STR, tags=["Roadmap"])
app.include_router(funding.router, prefix=settings.API_V1_STR, tags=["Funding"])
app.include_router(network.router, prefix=settings.API_V1_STR, tags=["Network"])
app.include_router(opportunities.router, prefix=settings.API_V1_STR, tags=["Opportunities"])
app.include_router(copilot.router, prefix=settings.API_V1_STR, tags=["AI Copilot"])
app.include_router(admin.router, prefix=settings.API_V1_STR, tags=["Admin Panel"])
app.include_router(utils.router, prefix=settings.API_V1_STR, tags=["Utilities"])
app.include_router(public_profile_router.router, prefix=settings.API_V1_STR, tags=["Public Profiles"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the STUDLYF Workspace API. Documentation available at /api/docs"}
