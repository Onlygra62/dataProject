from typing import Dict, List, Optional

from pydantic import BaseModel


class ColumnDescriptiveStats(BaseModel):
    media: float
    mediana: float
    moda: List[float]
    varianza: float
    desviacion_estandar: float
    minimo: float
    maximo: float
    q1: float
    q2: float
    q3: float
    iqr: float
    coeficiente_variacion: Optional[float]


class DescriptiveStatsResponse(BaseModel):
    dataset_id: str
    columnas: Dict[str, ColumnDescriptiveStats]
