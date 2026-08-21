from fastapi import FastAPI
import os
from src.services.ingest import DataFrame

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello world"}

@app.get("/ingest")
async def root():
    data_frame = DataFrame(os.path.abspath(r"src\services\data.csv"))
    return data_frame.dict()