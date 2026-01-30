# 🚨 SOLUCIÓN INMEDIATA: Error RefererNotAllowedMapError

## Tu Error Actual:
```
RefererNotAllowedMapError
Your site URL to be authorized: http://localhost:3001
```

## Pasos para Resolver (2 minutos):

1. **Abre:** https://console.cloud.google.com/apis/credentials

2. **Haz clic en tu API Key** para editarla

3. **En "Application restrictions":**
   - Selecciona: **"HTTP referrers (web sites)"**
   - Agrega estas URLs (cada una en una línea nueva):
     ```
     http://localhost:3001/*
     http://localhost:5173/*
     ```

4. **Guarda** (botón Save al final)

5. **Espera 5-10 minutos** y recarga tu app

## ¿Aún no funciona?

Verifica que:
- ✅ Agregaste las URLs con `/*` al final
- ✅ Seleccionaste "HTTP referrers" (no "None")
- ✅ La Maps JavaScript API está habilitada
- ✅ Esperaste al menos 10 minutos después de guardar

## Más detalles: Ver `docs/setup/QUICK_FIX_GOOGLE_MAPS_ERROR.md`
