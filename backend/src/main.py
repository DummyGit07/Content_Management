from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.schemas import contact, user
from src.database.db import engine, Base
from src.routers.register import router as register_router
from src.routers.login import router as login_router

app = FastAPI()

# Allow requests from local frontend (and later production URL)
origins = [
    "http://localhost:5173",  # Vite local dev
    "http://127.0.0.1:5173",  # Vite local dev
    # vercel base url
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(register_router)
app.include_router(login_router)

@app.get("/")
def test():
    return {"OK!!"}