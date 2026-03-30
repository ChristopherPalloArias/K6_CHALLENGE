---
description: 'Genera los scripts de prueba de k6 (smoke, load, stress, spike) orquestando los config/helpers basados en la spec aprobada.'
agent: qa-agent
---

# `implement-k6-script`

Genera el código para ejecutar escenarios de pruebas de rendimiento usando la herramienta k6 a partir de una spec aprobada.

## Objetivo
Tomar los assets base reusables generados con `implement-k6-assets` y programar los flujos de negocio (scripts ejecutables) que representan las pruebas de rendimiento exigidas en el baseline y criterios de la spec.

## Tareas

1. Localiza la spec `APPROVED` dentro de `.github/specs/`.
2. Identifica los archivos generados en `k6/config/`, `k6/lib/` y `k6/data/`.
3. Crea el script de prueba principal, generalmente en `k6/scripts/` (ej: `k6/scripts/main-load-test.js` o lo que designe la spec).
4. Implementa el ciclo de vida de k6:
   - **`setup()`**: (Opcional) Inicialización única antes de las pruebas. Extrae y retorna configuraciones que requieren configuración API.
   - **Módulo Default (`export default function()`)**: Lógica iterativa controlada por `options.js` implementando las peticiones utilizando las funciones de cliente (`k6/lib/http-client.js`) y testeos de validación (`k6/lib/checks.js`).
   - **`teardown()`**: (Opcional) Limpieza posterior a las pruebas si se indicó en la spec.
5. Emplea métricas y escenarios apropiados para modelar carga, picos, o stress de acuerdo a los "Scenarios" que provee k6, en lugar de usar configuraciones antiguas y rígidas.

## Restricciones
- El archivo o script final solo debe limitarse a orquestar y accionar las llamadas, dejando lógica extensa a módulos de `lib/`.
- No colocar contraseñas físicas ("hardcoded"). Usar variables de entorno de `__ENV`.
- Preferir "scenarios" complejos (ej: `ramping-vus`, `constant-arrival-rate`) si la spec menciona un target de RPS (Requests Per Second) o carga incremental.
- Nunca usar variables globales para los estados mutados. Las VUs son instancias separadas.
- Escribir en JavaScript idiomático (ES6+) válido para k6.

## Salida
Confirmación del script final diseñado, que demuestre que la spec ha sido cubierta y referenciando comandos exactos (e.g. `k6 run k6/scripts/performance-test.js`).
