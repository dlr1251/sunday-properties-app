# ⚡ Solución Rápida: Error RefererNotAllowedMapError

## El Error
```
Google Maps JavaScript API error: RefererNotAllowedMapError
Your site URL to be authorized: http://localhost:3001
```

## Solución en 5 Pasos

### 1. Ve a Google Cloud Console
Abre: https://console.cloud.google.com/apis/credentials

### 2. Encuentra tu API Key
- Busca la API key que estás usando (la que tienes en `VITE_MAPS_API_KEY`)
- Haz clic en ella para editarla

### 3. Configura Restricciones HTTP
- Baja hasta la sección **"Application restrictions"**
- Selecciona **"HTTP referrers (web sites)"**
- Haz clic en **"Add an item"** y agrega estas URLs una por una:

```
http://localhost:3001/*
http://localhost:5173/*
http://127.0.0.1:3001/*
http://127.0.0.1:5173/*
```

⚠️ **CRÍTICO:** Debes agregar cada URL por separado o el error persistirá.

### 4. Guarda
- Haz clic en **"Save"** (Guardar) en la parte inferior

### 5. Espera y Recarga
- ⏱️ Espera **5-10 minutos** (los cambios de Google Cloud pueden tardar)
- Recarga tu aplicación con **Ctrl+Shift+R** (o Cmd+Shift+R en Mac) para limpiar la caché
- Si el error persiste después de 10 minutos, verifica que agregaste las URLs correctamente

## Verificación

Después de seguir estos pasos, el error debería desaparecer y deberías ver el mapa cargando correctamente.

## Si el Error Persiste

1. Verifica que agregaste **exactamente** estas URLs (con el `/*` al final):
   - `http://localhost:3001/*`
   - `http://localhost:5173/*`

2. Verifica que seleccionaste **"HTTP referrers (web sites)"** y no otra opción

3. Verifica que la API **Maps JavaScript API** está habilitada en tu proyecto:
   - Ve a: https://console.cloud.google.com/apis/library
   - Busca "Maps JavaScript API"
   - Asegúrate de que esté **habilitada**

4. Si todo lo anterior está correcto, espera hasta 15 minutos y vuelve a intentar

## Para Producción

Cuando despliegues a producción, también necesitarás agregar tu dominio:
```
https://tu-dominio.com/*
https://*.tu-dominio.com/*
```

