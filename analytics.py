import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

class GeoSpatialAnalytics:
    @staticmethod
    def create_geodataframe(df: pd.DataFrame) -> gpd.GeoDataFrame:
        """Convierte coordenadas en puntos geométricos Shapely."""
        geometry = [Point(xy) for xy in zip(df['longitude'], df['latitude'])]
        gdf = gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")
        return gdf

    @staticmethod
    def filter_outliers(gdf: gpd.GeoDataFrame, column: str = "price_per_m2") -> gpd.GeoDataFrame:
        """Filtra valores extremos del valor por m2 usando el Rango Intercuartílico (IQR)."""
        q1 = gdf[column].quantile(0.25)
        q3 = gdf[column].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - (1.5 * iqr)
        upper_bound = q3 + (1.5 * iqr)
        
        return gdf[(gdf[column] >= lower_bound) & (gdf[column] <= upper_bound)]