from pydantic import BaseModel
from typing import List, Any

class UploadResponse(BaseModel):
    dataset_id: str
    dataframe: List[Any]
    preview: str
    full:str