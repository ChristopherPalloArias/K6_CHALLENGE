---
description: 'Genera assets de fundamentos y configuraciones reusables (env, options, thresholds, helpers) para pruebas k6 basados en la spec aprobada.'
agent: qa-agent
---

# `implement-k6-assets`

Genera los assets base para ejecutar scripts de k6 a partir de una spec técnica con estado `APPROVED`.

## Objetivo
Analizar la especificación y generar implementaciones reusables como datos, configuraciones y librerías auxiliares (helpers), sin escribir la lógica de ejecución del test todavía.

## Tareas

1. Lee la spec `.github/specs/*.spec.md` con estado `APPROVED`.
2. Analiza los umbrales (thresholds), las variables de entorno, la estructura de la base de datos de prueba o la API objetivo, y cualquier precondición.
3. Genera o actualiza bajo la carpeta `k6/`:
   - `k6/config/env.js`: Módulo para la extracción controlada de variables de entorno y valores base (e.g. `BASE_URL`).
   - `k6/config/options.js`: Definición de etapas, escenarios (smoke, load, stress) según la spec.
   - `k6/config/thresholds.js`: Reglas estrictas extraídas de la spec.
   - `k6/lib/http-client.js` o helpers: Clientes pre-configurados para API o interacciones base.
   - `k6/lib/checks.js`: Módulo reusable para validaciones estándar sobre las respuestas.
   - `k6/data/test-data.json`: Datos estáticos definidos explícitamente en la especificación, sin inventar credenciales reales.
4. No generar el script final de ejecución en este paso, solo los assets de soporte.

## Restricciones
- Solo utilizar la información explícita de la spec. No inventar credenciales, endpoints no documendados ni SLAs no especificados.
- Separar config de pruebas funcionales o lógicas.
- Mantener la genericidad. Si algo no aplica a la spec actual, no se genera.
- Exportar los flujos usando ESModules (`export const`).

## Salida
Lista de los archivos creados o actualizados bajo el directorio `k6/` y una explicación breve de su funcionalidad.
