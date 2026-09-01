import json

import pandas as pd


def records(df: pd.DataFrame) -> list[dict]:
    """Convierte un DataFrame a registros JSON-safe.

    to_dict deja los NaN/NaT crudos y esos valores no son JSON valido, asi que
    la respuesta falla con "Out of range float values are not JSON compliant"
    en cuanto el archivo trae una celda vacia. to_json los escribe como null.
    """
    return json.loads(df.to_json(orient="records", date_format="iso"))
