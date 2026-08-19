import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

class ValuationModel:
    def __init__(self):
        self.pipeline = None

    def fit_and_evaluate(self, df: pd.DataFrame) -> pd.DataFrame:
        """Entrena el modelo y predice el precio estimado para cada propiedad."""
        # Definir Features (X) y Target (y)
        features = ['latitude', 'longitude', 'surface_m2', 'neighborhood']
        target = 'price_usd'

        X = df[features]
        y = df[target]

        # Preprocesamiento: One-Hot Encoding para barrios + passthrough de numéricas
        preprocessor = ColumnTransformer(
            transformers=[
                ('cat', OneHotEncoder(handle_unknown='ignore'), ['neighborhood']),
                ('num', 'passthrough', ['latitude', 'longitude', 'surface_m2'])
            ]
        )

        # Pipeline con Random Forest
        self.pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
        ])

        # Entrenamiento
        self.pipeline.fit(X, y)

        # Predicción de precio estimado de mercado
        df = df.copy()
        df['predicted_price_usd'] = self.pipeline.predict(X)
        df['predicted_price_m2'] = df['predicted_price_usd'] / df['surface_m2']

        # Cálculo de desvío porcentual: (Publicado - Estimado) / Estimado
        df['delta_ratio'] = (df['price_usd'] - df['predicted_price_usd']) / df['predicted_price_usd']

        # Clasificación de la propiedad
        def classify_deal(delta):
            if delta <= -0.12:
                return "🔥 Oportunidad (Subvaluada)"
            elif delta >= 0.12:
                return "⚠️ Sobrevaluada"
            return "✅ Precio de Mercado"

        df['valuation_status'] = df['delta_ratio'].apply(classify_deal)
        return df