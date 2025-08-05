from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import statsapi
from datetime import date
from pydantic import BaseModel
import random
import json, pathlib

app = FastAPI()

# Allow frontend to access this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can limit this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameInfo(BaseModel):
    game_id: str
    home_team: str
    away_team: str
    game_time: str
    status: str
    home_pitcher: str
    away_pitcher: str
    recommendation: str

@app.get("/")
def read_root():
    return {"message": "MLB Game API is running"}

@app.get("/api/games", response_model=List[GameInfo])
def get_today_games():
    fp = pathlib.Path("data/today.json")
    if not fp.exists():
        raise HTTPException(503, "Predictions not generated yet")

    return [GameInfo(**g) for g in json.load(fp.open())]