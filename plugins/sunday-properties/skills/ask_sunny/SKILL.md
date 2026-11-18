---
name: ask_sunny
description: Pregunta a Sunny, la asistente pública de Sunday Properties, sobre arriendos y ventas publicados en Medellín. Úsala cuando alguien quiera hablar con Sunny, buscar listados, comparar propiedades o pedir cifras.
---

Sunday Properties publica arriendos y ventas en Medellín. Sunny es la asistente pública; solo conoce listados `published` y campos públicos.

## Cuándo usar cada tool

Usa las tools del servidor MCP `sunday` (Sunday Properties):

- **ask_sunny** — conversación con Sunny. Recomendaciones, seguimiento, tono bilingüe, “qué me conviene”. Pasa `session_id` de la respuesta anterior para mantener contexto.
- **search_listings** — inventario en texto (barrio, tipo, precio). Primera búsqueda estructurada.
- **show_listings** — tarjetas con fotos. “Muéstrame”, galería.
- **listing_stats** — cifras de un listado (precio, COP/m², área, habitaciones, estrato, administración).
- **compare_listings** — 2 a 4 listados lado a lado.

Para una pregunta de inventario, llama `search_listings` (o `show_listings` si piden fotos). Llama `ask_sunny` cuando el usuario quiera hablar con Sunny o una respuesta conversacional. No inventes precios ni disponibilidad; si una tool no trae el dato, dilo.

## Cómo llamar ask_sunny

1. Primera pregunta: `{ "message": "¿qué arriendos hay en Laureles?" }`.
2. Guarda `session_id` del resultado.
3. Seguimiento: el mismo `message` más ese `session_id`.
4. Sin `session_id` se abre una conversación nueva.

Sunny responde en el idioma del visitante (español o inglés).

## Restricciones (igual que la web)

Nunca menciones ni adivines: dirección, coordenadas, dueño o agente, oferta mínima, depósito, notas internas, términos de negociación ni documentos legales. Si falta un campo, dilo y ofrece una visita o que un humano de Sunday haga seguimiento. Los CTA van a la ficha en sundayproperties.co / Agendar visita.
