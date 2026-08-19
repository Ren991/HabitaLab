import asyncio
import nest_asyncio
import numpy as np
import pandas as pd
import pydeck as pdk
import streamlit as st

from analytics import GeoSpatialAnalytics
from ml_model import ValuationModel
from scraper import PropertyScraper, save_to_dataframe

# Permitir asyncio anidado para Streamlit
nest_asyncio.apply()

st.set_page_config(page_title="UrbanYield - Heatmap Inmobiliario", layout="wide", page_icon="🏙️")

st.title("🏙️ UrbanYield — Intel de Mercado Inmobiliario $m^2$")
st.markdown("Análisis geoespacial 3D para la detección de oportunidades y valuación urbana.")

# Cargar Datos
@st.cache_data
def load_data():
    scraper = PropertyScraper()
    # Usar event loop existente de asyncio
    loop = asyncio.get_event_loop()
    listings = loop.run_until_complete(scraper.scrape_listings())
    df = save_to_dataframe(listings)
    
    # Generar puntos adicionales dispersos para simular densidad
    np.random.seed(42)
    extra_rows = []
    for _ in range(250):
        base = df.sample(1).iloc[0]
        lat = base['latitude'] + np.random.normal(0, 0.01)
        lon = base['longitude'] + np.random.normal(0, 0.01)
        m2 = max(30, base['surface_m2'] + np.random.normal(0, 15))
        price = max(30000, base['price_usd'] + np.random.normal(0, 20000))
        extra_rows.append({
            'title': 'Publicación Agregada',
            'price_usd': price,
            'surface_m2': m2,
            'price_per_m2': round(price / m2, 2),
            'latitude': lat,
            'longitude': lon,
            'neighborhood': base['neighborhood']
        })
    
    full_df = pd.concat([df, pd.DataFrame(extra_rows)], ignore_index=True)
    gdf = GeoSpatialAnalytics.create_geodataframe(full_df)
    return GeoSpatialAnalytics.filter_outliers(gdf)

# 1. Cargar datos base
gdf = load_data()

# 2. Correr Modelo de Valuación ML
model = ValuationModel()
analyzed_df = model.fit_and_evaluate(gdf)

# 3. Sidebar - Filtros
st.sidebar.header("🎛️ Filtros de Mercado")

status_filter = st.sidebar.multiselect(
    "Estado de Valuación (ML)",
    options=analyzed_df['valuation_status'].unique(),
    default=analyzed_df['valuation_status'].unique()
)

min_val = int(analyzed_df['price_per_m2'].min())
max_val = int(analyzed_df['price_per_m2'].max())

min_price, max_price = st.sidebar.slider(
    "Rango de Precio USD/m²",
    min_value=min_val,
    max_value=max_val,
    value=(500, min(2500, max_val))
)

# 4. Aplicar AMBOS filtros al mismo DataFrame
mask = (
    (analyzed_df['valuation_status'].isin(status_filter)) &
    (analyzed_df['price_per_m2'] >= min_price) &
    (analyzed_df['price_per_m2'] <= max_price)
)
filtered_df = analyzed_df[mask]

# 5. Métricas Principales (Si no hay resultados, evita crash)
if not filtered_df.empty:
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Propiedades Analizadas", len(filtered_df))
    col2.metric("Promedio USD/m²", f"${filtered_df['price_per_m2'].mean():,.0f}")
    col3.metric("Precio Mínimo m²", f"${filtered_df['price_per_m2'].min():,.0f}")
    col4.metric("Precio Máximo m²", f"${filtered_df['price_per_m2'].max():,.0f}")

    st.divider()

    # 6. PyDeck 3D Hexagon Layer
    center_lat = filtered_df['latitude'].mean()
    center_lon = filtered_df['longitude'].mean()

    view_state = pdk.ViewState(
        latitude=center_lat,
        longitude=center_lon,
        zoom=12.5,
        pitch=45,
        bearing=15
    )

    hexagon_layer = pdk.Layer(
        "HexagonLayer",
        data=filtered_df,
        get_position=["longitude", "latitude"],
        radius=150,
        elevation_scale=10,
        elevation_range=[0, 1000],
        pickable=True,
        extruded=True,
        color_range=[
            [65, 182, 196],
            [127, 205, 187],
            [199, 233, 180],
            [237, 248, 177],
            [254, 217, 118],
            [254, 178, 76],
            [253, 141, 60],
            [227, 26, 28]
        ]
    )

    scatter_layer = pdk.Layer(
        "ScatterplotLayer",
        data=filtered_df,
        get_position=["longitude", "latitude"],
        get_color="[255, 140, 0, 160]",
        get_radius=25,
        pickable=True
    )

    deck = pdk.Deck(
        layers=[hexagon_layer, scatter_layer],
        initial_view_state=view_state,
        tooltip={
            "html": "<b>Precio USD/m²:</b> ${price_per_m2}<br/><b>Barrio:</b> {neighborhood}<br/><b>Estado:</b> {valuation_status}",
            "style": {"color": "white", "backgroundColor": "#1E1E1E"}
        }
    )

    st.pydeck_chart(deck)
else:
    st.warning("No se encontraron propiedades con los filtros seleccionados.")