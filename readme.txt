===========================================================
EJERCICIO 1: Prueba de Carga K6 - FakeStore API
===========================================================

1. TECNOLOGÍAS Y VERSIONES A USAR
-----------------------------------------------------------
- Herramienta de Carga: k6 (Versión requerida: v1.7.0 o superior)
- Lenguaje Automatización: JavaScript (Motor Go nativo de k6)
- Sistema Operativo: Multiplataforma (Linux, Windows o macOS)
- Control de Versiones: Git (v2.30+)
- Formato de Parametrización: Archivo .CSV

2. INSTRUCCIONES DE EJECUCIÓN PASO A PASO (CÓMO REPLICAR EL TEST)
-----------------------------------------------------------
Paso A: Abra la terminal o consola de comandos en su equipo.

Paso B: Navegue hasta la carpeta raíz del repositorio clonado.
Ejemplo de comando: cd /ruta/al/proyecto/K6_CHALLENGE

Paso C: Verifique que la herramienta k6 esté configurada globalmente validando su versión:
Comando a ejecutar: k6 version
(Si el comando falla, instale k6 desde la web oficial de Grafana k6).

Paso D: Ejecute la automatización de la prueba de carga. 
El script está ubicado en la carpeta de "scenarios" y se le ordenará 
que almacene las evidencias estadísticas dentro de la carpeta "reports". 

Copie y pegue en la terminal el siguiente comando completo: 
k6 run k6/scenarios/load-login.js --summary-export=reports/summary.json | tee reports/textSummary.txt

3. EVIDENCIAS Y REPORTES (RESULTADOS DE LA EJECUCIÓN)
-----------------------------------------------------------
Transcurridos exactamente 3 minutos, el motor de K6 dejará de atacar la API y publicará un reporte final por pantalla. Este mismo reporte quedará guardado automáticamente de forma persistente en los siguientes archivos como respaldo de evidencia de ejecución:
- reports/textSummary.txt (Informe en formato texto consolidado).
- reports/summary.json    (Informe matriculado para integración de datos).

Los logs le confirmarán que el escenario logró inyectar los 20 TPS requeridos y que los umbrales (SLAs) cumplieron la regla de < 3% de error y < 1.5s de respuesta, los cuales podrá constatar con los checks verdes.
