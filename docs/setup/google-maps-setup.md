# Configuración de Google Maps API

Esta guía explica cómo configurar Google Maps API para la aplicación, incluyendo la migración a AdvancedMarkerElement y la configuración de restricciones de seguridad.

## ⚠️ IMPORTANTE: Seguridad de la API Key

**Tu API key fue expuesta públicamente.** Por seguridad, debes:

1. **REVOCAR la clave actual inmediatamente** en Google Cloud Console
2. **Crear una nueva API key** con restricciones apropiadas
3. **Nunca compartir tu API key** públicamente

## Paso 1: Obtener una API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Places API (opcional, para búsquedas)
   - Geocoding API (opcional, para convertir direcciones a coordenadas)

4. Ve a **APIs & Services > Credentials**
5. Haz clic en **Create Credentials > API Key**
6. Copia la nueva API key

## Paso 2: Configurar Restricciones de la API Key

**CRÍTICO:** Para resolver el error `RefererNotAllowedMapError`, debes configurar restricciones HTTP:

### Solución Rápida para el Error "RefererNotAllowedMapError"

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Navega a **APIs & Services > Credentials**
3. Encuentra tu API key y haz clic para editarla (o crea una nueva si la anterior fue expuesta)
4. Baja hasta **Application restrictions**
5. Selecciona **HTTP referrers (web sites)**
6. Haz clic en **Add an item** y agrega **cada una** de estas URLs:

   ```
   http://localhost:3001/*
   http://localhost:5173/*
   http://127.0.0.1:3001/*
   http://127.0.0.1:5173/*
   ```

   ⚠️ **IMPORTANTE:** Debes agregar cada URL por separado. No puedes usar comodines para localhost.
   
   Para agregar múltiples URLs:
   - Haz clic en **Add an item** para cada URL
   - O pega todas las URLs separadas por líneas nuevas en el campo de texto

7. En **API restrictions** (más abajo), selecciona **Restrict key** y marca solo:
   - ✅ Maps JavaScript API
   - ✅ Places API (opcional, para búsquedas)
   - ✅ Geocoding API (opcional, para convertir direcciones)

8. Haz clic en **Save** (guardar)

9. ⏱️ **Espera 5-10 minutos** para que los cambios se propaguen

10. Recarga tu aplicación en el navegador (Ctrl/Cmd + Shift + R para limpiar caché)

### URLs para Producción

Cuando despliegues a producción, agrega también:
```
https://tu-dominio.com/*
https://*.tu-dominio.com/*
```

**Nota:** Reemplaza `tu-dominio.com` con tu dominio real (ej: `sundayproperties.com`)

## Paso 3: Configurar en la Aplicación

1. Copia tu API key
2. Crea o edita el archivo `.env` en la raíz del proyecto:
   ```env
   VITE_MAPS_API_KEY=tu-nueva-api-key-aqui
   ```

3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Migración a AdvancedMarkerElement

La aplicación ya está migrada a `google.maps.marker.AdvancedMarkerElement` en lugar del deprecado `google.maps.Marker`.

### Cambios implementados:

- ✅ Uso de `AdvancedMarkerElement` con `PinElement`
- ✅ Librería `marker` incluida en la carga de Google Maps
- ✅ `mapId` configurado en las opciones del mapa (requerido para AdvancedMarkerElement)
- ✅ Marcadores personalizados con colores y escalas

### Requisitos:

- **mapId:** El mapa debe tener un `mapId` configurado (ya implementado como `'PROPERTY_MAP'`)
- **Librería marker:** Debe estar incluida en la carga (ya configurada)
- **Versión weekly:** Usamos la versión semanal para acceso a las últimas características

## Solución de Problemas

### Error: "RefererNotAllowedMapError"

**Causa:** Tu dominio/URL no está en la lista de referers permitidos.

**Solución:**
1. Ve a Google Cloud Console > APIs & Services > Credentials
2. Edita tu API key
3. En "Application restrictions" > "HTTP referrers", agrega tu URL exacta
4. Espera 5-10 minutos para que los cambios se propaguen

### Error: "This API project is not authorized to use this API"

**Causa:** La API no está habilitada en tu proyecto.

**Solución:**
1. Ve a Google Cloud Console > APIs & Services > Library
2. Busca "Maps JavaScript API"
3. Haz clic en "Enable"

### Los marcadores no aparecen

**Posibles causas:**
1. El `mapId` no está configurado correctamente
2. La librería `marker` no está cargada
3. Las coordenadas no son válidas

**Solución:** Verifica que:
- El hook `useGoogleMaps` incluye `'marker'` en las librerías
- Las opciones del mapa incluyen `mapId: 'PROPERTY_MAP'`
- Las coordenadas están en formato `{lat: number, lng: number}`

## Recursos Adicionales

- [Documentación de AdvancedMarkerElement](https://developers.google.com/maps/documentation/javascript/advanced-markers)
- [Guía de Migración](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration)
- [Restricciones de API Keys](https://developers.google.com/maps/api-security-best-practices)
- [Pricing de Google Maps](https://mapsplatform.google.com/pricing/)

## Notas de Seguridad

1. **Nunca commitees tu `.env`** al repositorio
2. **Usa restricciones estrictas** en producción
3. **Monitorea el uso** en Google Cloud Console para detectar uso no autorizado
4. **Rota tus API keys** periódicamente
5. **Usa diferentes keys** para desarrollo y producción

