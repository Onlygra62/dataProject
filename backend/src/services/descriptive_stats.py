import pandas as pd
from collections import Counter


def _mediana(valores_ordenados: list[float]) -> float:
    n = len(valores_ordenados)
    mitad = n // 2
    if n % 2 == 0:
        return (valores_ordenados[mitad - 1] + valores_ordenados[mitad]) / 2
    return valores_ordenados[mitad]


def _moda(valores: list[float]) -> list[float]:
    conteos = Counter(valores)
    frecuencia_max = max(conteos.values())
    modas = [valor for valor, frecuencia in conteos.items() if frecuencia == frecuencia_max]
    # Si todos los valores aparecen la misma cantidad de veces no hay una
    # moda que aporte informacion (serie amodal); se devuelve vacio.
    if frecuencia_max == 1:
        return []
    return sorted(modas)


def _percentil(valores_ordenados: list[float], p: float) -> float:
    """Percentil con interpolacion lineal (mismo criterio que numpy.percentile
    con method="linear", que es el default). Se implementa a mano para poder
    verificarlo contra un calculo manual en los tests.
    """
    n = len(valores_ordenados)
    if n == 1:
        return valores_ordenados[0]

    rango = (p / 100) * (n - 1)
    indice_inferior = int(rango)
    indice_superior = min(indice_inferior + 1, n - 1)
    fraccion = rango - indice_inferior

    valor_inferior = valores_ordenados[indice_inferior]
    valor_superior = valores_ordenados[indice_superior]
    return valor_inferior + (valor_superior - valor_inferior) * fraccion


def _stats_columna(valores: list[float]) -> dict:
    n = len(valores)
    valores_ordenados = sorted(valores)

    media = sum(valores) / n

    # Varianza muestral (ddof=1): dividimos por n-1 porque la media usada ya
    # es un estimador calculado a partir de la misma muestra, lo que le resta
    # un grado de libertad. Es el criterio estandar para datos de muestra
    # (y el mismo que usa pandas por defecto).
    if n > 1:
        varianza = sum((x - media) ** 2 for x in valores) / (n - 1)
    else:
        varianza = 0.0
    desviacion_estandar = varianza ** 0.5

    q1 = _percentil(valores_ordenados, 25)
    q2 = _percentil(valores_ordenados, 50)
    q3 = _percentil(valores_ordenados, 75)
    iqr = q3 - q1

    coeficiente_variacion = (desviacion_estandar / media) * 100 if media != 0 else None

    return {
        "media": media,
        "mediana": _mediana(valores_ordenados),
        "moda": _moda(valores),
        "varianza": varianza,
        "desviacion_estandar": desviacion_estandar,
        "minimo": valores_ordenados[0],
        "maximo": valores_ordenados[-1],
        "q1": q1,
        "q2": q2,
        "q3": q3,
        "iqr": iqr,
        "coeficiente_variacion": coeficiente_variacion,
    }


def compute_descriptive(df: pd.DataFrame) -> dict:
    """Calcula estadisticas descriptivas por columna numerica.

    No se usa df.describe(): cada estadistico se calcula explicitamente
    (media, mediana, moda, varianza, desviacion estandar, min/max, cuartiles,
    IQR y coeficiente de variacion) para poder verificar cada formula por
    separado en los tests, en vez de confiar en una caja negra que agrupa
    todo de una.
    """
    columnas_numericas = df.select_dtypes(include="number").columns
    resultado = {}

    for columna in columnas_numericas:
        valores = df[columna].dropna().tolist()
        if not valores:
            continue
        resultado[columna] = _stats_columna(valores)

    return resultado
