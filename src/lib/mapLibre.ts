import type { StyleSpecification } from 'maplibre-gl';

/** OpenFreeMap vector style — no API key, works on iPhone Safari via MapLibre. */
export const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Raster fallback if the vector style fails to load. */
export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  name: 'OSM raster',
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.de/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.de/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.de/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

export { OPENFREEMAP_STYLE_URL as MAP_STYLE };
