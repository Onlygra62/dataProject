import statistics
import unittest

import numpy as np
import pandas as pd

from src.services.descriptive_stats import compute_descriptive

# Columna A: moda unica (2 se repite), n impar -> mediana cae en un valor real.
COLUMNA_A = [1, 2, 2, 3, 4]
# Columna B: bimodal (5 y 6 empatados) y con un outlier (100) para que
# varianza/std/CV muevan la aguja de forma clara.
COLUMNA_B = [5, 5, 6, 6, 100]


def _stats_independientes(valores: list[float]) -> dict:
    """Calcula los mismos estadisticos con statistics/numpy, de forma
    completamente separada de services/descriptive_stats.py, para poder
    comparar contra un resultado calculado a mano en vez de contra el
    propio output del codigo.
    """
    media = statistics.fmean(valores)
    mediana = statistics.median(valores)
    moda = sorted(statistics.multimode(valores))
    varianza = statistics.variance(valores)  # muestral (ddof=1) por default
    desviacion = statistics.stdev(valores)
    q1, q2, q3 = np.percentile(valores, [25, 50, 75], method="linear")
    return {
        "media": media,
        "mediana": mediana,
        "moda": moda,
        "varianza": varianza,
        "desviacion_estandar": desviacion,
        "minimo": min(valores),
        "maximo": max(valores),
        "q1": float(q1),
        "q2": float(q2),
        "q3": float(q3),
        "iqr": float(q3 - q1),
        "coeficiente_variacion": (desviacion / media) * 100,
    }


class TestDescriptiveStats(unittest.TestCase):
    def setUp(self):
        self.df = pd.DataFrame(
            {
                "columna_a": COLUMNA_A,
                "columna_b": COLUMNA_B,
                "etiqueta": ["x", "y", "z", "w", "v"],  # no numerica, debe ignorarse
            }
        )
        self.resultado = compute_descriptive(self.df)

    def test_ignora_columnas_no_numericas(self):
        self.assertNotIn("etiqueta", self.resultado)
        self.assertIn("columna_a", self.resultado)
        self.assertIn("columna_b", self.resultado)

    def test_columna_a_contra_calculo_independiente(self):
        esperado = _stats_independientes(COLUMNA_A)
        obtenido = self.resultado["columna_a"]
        for clave, valor_esperado in esperado.items():
            if clave == "moda":
                self.assertEqual(obtenido[clave], valor_esperado)
            else:
                self.assertAlmostEqual(obtenido[clave], valor_esperado, places=9)

    def test_columna_b_contra_calculo_independiente(self):
        esperado = _stats_independientes(COLUMNA_B)
        obtenido = self.resultado["columna_b"]
        for clave, valor_esperado in esperado.items():
            if clave == "moda":
                self.assertEqual(obtenido[clave], valor_esperado)
            else:
                self.assertAlmostEqual(obtenido[clave], valor_esperado, places=9)

    def test_valores_puntuales_calculados_a_mano(self):
        # Columna A = [1, 2, 2, 3, 4]: verificacion literal a mano.
        stats_a = self.resultado["columna_a"]
        self.assertAlmostEqual(stats_a["media"], 2.4, places=9)
        self.assertEqual(stats_a["mediana"], 2)
        self.assertEqual(stats_a["moda"], [2])
        self.assertAlmostEqual(stats_a["varianza"], 1.3, places=9)
        self.assertEqual(stats_a["minimo"], 1)
        self.assertEqual(stats_a["maximo"], 4)
        self.assertAlmostEqual(stats_a["q1"], 2, places=9)
        self.assertAlmostEqual(stats_a["q3"], 3, places=9)
        self.assertAlmostEqual(stats_a["iqr"], 1, places=9)

    def test_ignora_nan(self):
        df = pd.DataFrame({"col": [1, 2, None, 4]})
        resultado = compute_descriptive(df)
        # Debe calcular sobre [1, 2, 4], no sobre 4 valores con NaN adentro.
        self.assertAlmostEqual(resultado["col"]["media"], statistics.fmean([1, 2, 4]))

    def test_dataset_sin_columnas_numericas(self):
        df = pd.DataFrame({"solo_texto": ["a", "b", "c"]})
        resultado = compute_descriptive(df)
        self.assertEqual(resultado, {})

    def test_coeficiente_variacion_none_si_media_es_cero(self):
        df = pd.DataFrame({"col": [-2, -1, 0, 1, 2]})
        resultado = compute_descriptive(df)
        self.assertIsNone(resultado["col"]["coeficiente_variacion"])


if __name__ == "__main__":
    unittest.main()
