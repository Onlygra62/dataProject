from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
from src.services.ingest import Dataset
from src.core.cache import cache
from src.schemas.dataset import UploadResponse
from src.exceptions import *

router = APIRouter()

@router.post("/datasets", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    try:
        dataset = Dataset(file)
        dataset_id = str(uuid.uuid4())
        cache[dataset_id] = (dataset.df())
        
        return UploadResponse(
            dataset_id= dataset_id,
            dataframe= dataset.dict(),
            preview= f"http://127.0.0.1:8000/datasets/{dataset_id}/preview",
            full= f"http://127.0.0.1:8000/datasets/{dataset_id}/full"
        )
        
    except FormatoInvalido as e:
        raise HTTPException(status_code=400, detail=str(e))
        

@router.get("/datasets/{dataset_id}/preview")
async def dataset_preview(dataset_id: str):
    if dataset_id not in cache:
        raise HTTPException(status_code=404, detail="Dataset not found...")
    df = cache[dataset_id]
    return df.head().to_dict(orient="records")

@router.get("/datasets/{dataset_id}/full")
async def dataset_preview(dataset_id: str):
    if dataset_id not in cache:
        raise HTTPException(status_code=404, detail="Dataset not found...")
    df = cache[dataset_id]
    return df.to_dict(orient="records")