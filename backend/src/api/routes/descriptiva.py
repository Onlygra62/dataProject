from fastapi import APIRouter, HTTPException

from src.core.cache import cache
from src.schemas.descriptive import DescriptiveStatsResponse
from src.services.descriptive_stats import compute_descriptive

router = APIRouter()


@router.get("/datasets/{dataset_id}/summary", response_model=DescriptiveStatsResponse)
async def dataset_summary(dataset_id: str):
    if dataset_id not in cache:
        raise HTTPException(status_code=404, detail="Dataset not found...")

    df = cache[dataset_id]
    columnas = compute_descriptive(df)

    if not columnas:
        raise HTTPException(
            status_code=400,
            detail="El dataset no tiene columnas numericas para analizar.",
        )

    return DescriptiveStatsResponse(dataset_id=dataset_id, columnas=columnas)
