from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import datasets, descriptiva

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #Ahora se cambia
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(datasets.router)
app.include_router(descriptiva.router)