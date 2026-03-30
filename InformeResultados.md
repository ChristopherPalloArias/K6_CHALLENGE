# Informe de Resultados — Prueba de Carga
## App Transaction Balance · k6 Load Test

| Campo | Detalle |
|---|---|
| **Autor** | Christopher Ismael Pallo Arias |
| **Correo** | christopher.pallo@sofka.com.co |
| **Celular** | 0995312828 |
| **Fecha** | 2025-04-24 |
| **Herramienta** | k6 (Grafana) |
| **Escenario** | App Transaction Balance – Prueba de Carga Escalonada (Stage 0, 1, 2) |

---

## 1. Resumen Ejecutivo (Análisis de Resultados)

Con base en los artefactos provistos para evaluación (`textSummary.txt` y diagrama de monitoreo), se ha realizado un análisis forense de la prueba de carga previamente ejecutada sobre el servicio **App Transaction Balance**. Los datos reflejan que la evidencia corresponde a una ejecución escalonada, habiéndose inyectado un pico de **140 VUs** sostenidos y evidenciando un throughput máximo en la gráfica de **82.6 req/s**.

Del examen al log de salida de k6, se constata un volumen total de **276,650 solicitudes HTTP**. De estas, el **97.55%** procesaron respuestas exitosamente, mientras que el **2.44%** (6,759 solicitudes) registraron fallo — un valor que, si bien se ubica estadísticamente por debajo del umbral estándar de aceptación (< 3%), esconde una anomalía crítica en su distribución.

> ⚠️ **Atención:** Aunque el check global de "failed_requests" se presenta matemáticamente aprobado (2.44%), el análisis minucioso de las etapas demuestra que casi la totalidad absoluta de estos fallos se concentró en la **Etapa 1** (6,756 errores HTTP 4xx y 5xx). Esto indica que no son errores aislados, sino que el servidor fue llevado a un cuello de botella y sobrepasó su límite en la rampa de máxima carga.

---

## 2. Parámetros de la Prueba

| Parámetro | Valor |
|---|---|
| Total de iteraciones ejecutadas | 276,650 |
| Throughput sostenido (RPS global) | 73.18 req/s |
| Throughput pico observado (diagrama) | 82.6 req/s @ 140 VUs |
| Virtual Users máximos (VUs max) | 140 |
| Duración total aproximada | ~63 minutos (01:40 – 02:30 aprox.) |
| Datos recibidos | 842 MB (223 kB/s) |
| Datos enviados | 588 MB (156 kB/s) |

---

## 3. Análisis de Métricas de Rendimiento

### 3.1 Tiempo de Respuesta HTTP (`http_req_duration`)

| Percentil / Estadístico | Valor (Total) | Valor (Solo respuestas exitosas) | Evaluación |
|---|---|---|---|
| Promedio (avg) | 861.68 ms | 735.84 ms | ✅ Dentro del umbral |
| Mediana (p50) | 613.42 ms | 600.70 ms | ✅ Óptima |
| Percentil 90 (p90) | 1,280 ms | 1,220 ms | ✅ Aceptable |
| Percentil 95 (p95) | 1,570 ms | 1,420 ms | ⚠️ Borderline |
| Máximo (max) | 29,930 ms (~30 s) | 26,720 ms (~27 s) | ❌ Crítico |
| Mínimo (min) | 191.86 ms | 244.92 ms | ✅ Saludable |

> **Interpretación:** La mediana de 613 ms indica que la mitad de las solicitudes se resuelven en menos de 0.6 segundos, lo cual es una base robusta. Sin embargo, el **valor máximo de ~30 segundos** es una señal de alarma: existen solicitudes individuales cuyos tiempos de espera se extienden dramáticamente, probablemente causadas por saturación del backend durante el pico de carga de la Etapa 1. El p95 de 1,570 ms supera ligeramente el umbral típico de 1,500 ms, evidenciando inestabilidad en la cola alta de distribución.

---

### 3.2 Tasa de Fallo y Distribución por Etapa

| Métrica | Valor | Evaluación |
|---|---|---|
| Total de solicitudes fallidas | 6,759 (2.44%) | ⚠️ Aprobado (límite < 3%) |
| Solicitudes exitosas | 269,891 (97.55%) | ✅ Correcto |

**Distribución de errores por Etapa y tipo:**

| Indicador | Cantidad | Tasa (req/s) | Tipo de error | Etapa |
|---|---|---|---|---|
| y_failed_request_stage_0_HTTP5xx | 1 | 0.000265/s | Error de Servidor (5xx) | ✅ Etapa 0 — Mínimo impacto |
| y_failed_request_stage_1_HTTP4xx | 769 | 0.203/s | Error de Cliente (4xx) | ⚠️ Etapa 1 — Moderado |
| y_failed_request_stage_1_HTTP5xx | 5,987 | 1.584/s | Error de Servidor (5xx) | ❌ Etapa 1 — CRÍTICO |
| y_failed_request_stage_2_HTTP5xx | 2 | 0.000529/s | Error de Servidor (5xx) | ✅ Etapa 2 — Recuperación |

> ❌ **Hallazgo Crítico:** El **99.97% de todos los fallos** (6,756 de 6,759) se concentran en la **Etapa 1**, y de esos, el 88.6% son errores HTTP 5xx (errores internos del servidor). Esto indica que el backend colapsó parcialmente bajo la presión de carga sostenida de los 140 VUs, incapaz de procesar la demanda entrante sin empezar a rechazar peticiones por sobrecapacidad. Los errores 4xx en la Etapa 1 (769) sugieren posiblemente problemas de rate-limiting o autenticación expirando bajo estrés.

---

### 3.3 Tiempos de Red y Conectividad

| Métrica | Promedio | p(90) | p(95) | Evaluación |
|---|---|---|---|---|
| http_req_blocked | 10.97 µs | 0 ms | 0 ms | ✅ Conexiones reutilizadas eficientemente (Keep-Alive) |
| http_req_connecting | 3.30 µs | 0 ms | 0 ms | ✅ TCP Connection Pooling funcionando |
| http_req_tls_handshaking | 7.36 µs | 0 ms | 0 ms | ✅ TLS Sessions en caché — sin overhead de handshake |
| http_req_sending | 43.22 µs | 0 ms | 517 µs | ✅ Payload de envío liviano |
| http_req_receiving | 424.03 µs | 988 µs | 1.05 ms | ✅ Transferencia de respuesta estable |
| http_req_waiting (TTFB) | 861.21 ms | 1.28 s | 1.57 s | ⚠️ Tiempo de espera del servidor elevado |

> **Interpretación:** Los valores de *blocked*, *connecting* y *tls_handshaking* prácticamente en cero confirman que el cliente k6 está utilizando de manera eficiente la reutilización de conexiones TCP (Keep-Alive), eliminando el overhead de establecimiento de conexión. El cuello de botella es puramente el **tiempo de espera del servidor (TTFB)** que consume prácticamente el 100% de la latencia total, indicando que el problema está en el procesamiento a nivel de aplicación/base de datos, no en la red.

---

## 4. Análisis del Diagrama VUs vs. HTTP Requests/s

> **Figura 1:** Gráfica de monitoreo en tiempo real — VUs activos vs. Peticiones por segundo HTTP, ventana temporal: 01:40:00 – 02:30:00.
> Al timestamp **02:02:00**, VUs = 140 (estabilizados), http_reqs = **82.6/s** (pico de throughput registrado).

### 4.1 Comportamiento por Fases Observadas en el Diagrama

| Fase | Ventana Temporal (aprox.) | VUs Activos | RPS Observado | Comportamiento |
|---|---|---|---|---|
| **Rampa ascendente (Ramp-Up)** | 01:40 – 01:50 | 0 → 140 | 0 → ~80/s | Carga escalonada, crecimiento progresivo y lineal. |
| **Carga sostenida (Stage 1 Peak)** | 01:50 – 02:00 | 140 (constante) | ~75–82/s (oscilante) | Máxima presión. Aquí ocurren los 5,987 errores 5xx. |
| **Colapso / Interrupción** | ~02:00 – 02:05 | 140 → ~0 | Caída abrupta a 0 | El backend colapsa o hay una pausa forzada de carga. |
| **Recuperación (Stage 2)** | 02:05 – 02:25 | 0 → ~100 | ~65–80/s | El sistema se recupera gradualmente con menor carga. |
| **Rampa descendente (Ramp-Down)** | 02:25 – 02:30 | ~100 → 0 | ~75 → 0 | Finalización ordenada del test. |

### 4.2 Relación VUs ↔ RPS

La relación entre los VUs y el throughput exhibe un comportamiento **lineal hasta el umbral de saturación (~140 VUs / ~82 RPS)**. Por encima de ese punto, el sistema no escala proporcionalmente: agregar más VUs no traduce en más RPS — en cambio, acumula solicitudes en cola y dispara errores 5xx. Esto clasifica el sistema como un servidor con una **capacidad máxima de servicio efectivo de aproximadamente 80 RPS** bajo la arquitectura y configuración actuales.

La caída abrupta a 0 RPS observable alrededor de las 02:00–02:05 corresponde con el punto de mayor concentración de errores y podría indicar un **reinicio automático del proceso del servidor** (o activación de un circuit-breaker), lo cual está directamente correlacionado con los 5,987 errores HTTP 5xx de la Etapa 1.

---

## 5. Tabla Resumen de Cumplimiento de SLAs

| SLA / Criterio | Umbral | Valor Obtenido | Estado |
|---|---|---|---|
| Tasa de error global | < 3.0% | 2.44% | ✅ APROBADO |
| Check "App Transaction Balance OK" | Positivo | 97.55% (269,891 ✓) | ✅ APROBADO |
| Tiempo de respuesta promedio | < 1,500 ms | 861.68 ms | ✅ APROBADO |
| Percentil 95 (p95) | < 1,500 ms | 1,570 ms | ❌ FALLIDO |
| Tiempo máximo de respuesta | < 5,000 ms (buena práctica) | 29,930 ms | ❌ CRÍTICO |
| Errores 5xx en Stage 1 | 0 (ideal) | 5,987 | ❌ CRÍTICO |
| Estabilidad del throughput | Constante bajo carga sostenida | Colapso detectado ~02:00 | ⚠️ INESTABLE |

---

## 6. Hallazgos Principales

1. **El sistema opera correctamente en carga baja-moderada (Etapa 0):** únicamente 1 error 5xx, tiempos de respuesta estables y throughput lineal. La arquitectura base del sistema es sólida.

2. **Cuello de botella severo al alcanzar los 140 VUs sostenidos (Etapa 1):** El 88.6% de todos los fallos son errores de servidor (5xx), evidenciando que el backend no puede absorber la carga pico sin colapsar parcialmente. Este es el hallazgo más crítico de la prueba.

3. **El p95 supera el umbral de 1.5 s** (1,570 ms vs 1,500 ms), aunque el promedio y la mediana se mantienen saludables. Esto indica una distribución de latencia con cola pesada (*heavy-tail*) causada por los timeouts de solicitudes que quedan en espera durante el colapso.

4. **La caída abrupta del RPS a 0** visible en el diagrama alrededor de las 02:00 sugiere un evento de reinicio del servidor o activación de un circuit-breaker no planificado. Esto es un riesgo directo de disponibilidad en un entorno productivo.

5. **La infraestructura de red (TLS, TCP, Keep-Alive) funciona perfectamente:** el problema es 100% a nivel de procesamiento de aplicación y/o base de datos, no en la capa de red o conectividad.

---

## 7. Recomendaciones

| Prioridad | Área | Recomendación |
|---|---|---|
| 🔴 **Alta** | Escalabilidad Backend | Investigar el motivo de los 5,987 errores HTTP 5xx en la Etapa 1. Revisar logs del servidor (timeouts de DB, saturación de threads, memory leaks) durante el período 01:50–02:05. |
| 🔴 **Alta** | Estabilidad del Proceso | Confirmar si ocurrió un reinicio del servidor o activación de un circuit-breaker en ~02:00. Si es así, revisar los umbrales de los health-checks y configurar alertas automáticas. |
| 🟡 **Media** | Optimización de SLA p95 | Implementar caché para las consultas frecuentes y considerar paginación para reducir el payload de respuesta. Objetivo: llevar p95 por debajo de 1,200 ms. |
| 🟡 **Media** | Rate Limiting / 4xx | Revisar los 769 errores HTTP 4xx en la Etapa 1. Si son errores de autenticación (401/403), implementar estrategia de token refresh bajo carga. Si son 429, revisar los límites configurados. |
| 🟢 **Baja** | Capacidad Horizontal | Evaluar el escalado horizontal (más instancias del servicio) o un balanceador de carga más agresivo para distribuir los 140 VUs entre múltiples réplicas del servicio. |
| 🟢 **Baja** | Monitoreo Continuo | Integrar k6 con Grafana Cloud o InfluxDB para persistir las métricas históricas y poder comparar ejecuciones a lo largo del tiempo (trend analysis). |

---

## 8. Conclusiones y Recomendaciones de Auditoría

El análisis profundo de las evidencias suministradas permitió diagnosticar de forma clara el punto de quiebre y la salud transaccional del servicio **App Transaction Balance**. Los registros demuestran que el sistema posee una base sana de rendimiento en cargas bajas o ascendentes, presentando una envidiable mediana de respuesta (613 ms) e infraestructura de red sólida al evitar latencias en la conjunción de TLS y flujos TCP. Esto infiere una arquitectura correctamente configurada para el ritmo de operación diaria normal.

No obstante, las trazas reportadas en la *Etapa 1* (fase sostenida de 140 VUs) testifican el **límite de tracción real** del sistema. Acumulando vertiginosamente más de 5,900 errores HTTP 5xx concurrentes en dicha ventana temporal, documentando que el procesamiento del backend o la base de datos se saturó severamente antes de que el throughput pudiera pasar o mantenerse por arriba de los 80 RPS observados en el gráfico. La breve interrupción a "cero" en el gráfico sumada a los errores, podría relacionarse al estrangulamiento de Base de Datos para abrir y sostener nuevas conexiones (DB pool limits exhaustos).

**Veredicto Final:** Para certificar la infraestructura que arrojó esta prueba como APROBADA para su liberación a un ecosistema crítico, es mandatorio remediar las vulnerabilidades de memoria o transaccionalidad descritas bajo carga máxima (Etapa 1). La recuperación posterior es destacable y habla de su resiliencia, pero el derribo o inestabilidad mostrada en la cresta de la métrica (`p95` rebasando el umbral de SLA) lo descarta como óptimo bajo estrés pico recurrente sin previas alertas o mejoras de *AutoScaling*.

---

*Documento generado para: Ejercicio 2 – Análisis de Resultados de Prueba de Carga*  
*Autor: Christopher Ismael Pallo Arias · christopher.pallo@sofka.com.co · 0995312828*
