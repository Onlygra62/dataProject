from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from src.services.ingest import DataFrame

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #Ahora se cambia
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "Hello world"}

@app.get("/ingest")
async def root():
    data_frame = DataFrame(os.path.abspath(r"src\services\data.csv"))
    
    return data_frame.dict()