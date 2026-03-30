===========================================================
EJERCICIO 1: Prueba de Carga K6 - FakeStore API
Instrucciones de Ejecución Paso a Paso
===========================================================

NOTA IMPORTANTE: 
Toda la metodología, estrategia parametrizada (Constant-Arrival-Rate),
y reporte forense ampliado de resultados, se encuentran formalmente 
documentados en profundidad en el archivo central "README.md"
ubicado en la raíz del repositorio o Github. A continuación, 
se detalla lo estrictamente solicitado para la réplica en consola.

1. TECNOLOGÍAS Y VERSIONES A USAR
-----------------------------------------------------------
- Herramienta de Carga: k6 (Versión requerida: v1.7.0 o superior)
- Lenguaje Automatización: JavaScript ECMAScript 6 (Motor Go nativo de k6)
- Sistema Operativo: Multiplataforma (Linux, Windows o macOS)
- Control de Versiones: Git (v2.30 o superior)
- Formato de Parametrización: Archivo CSV Integrado ('k6/data/credentials.csv')

2. INSTRUCCIONES DE EJECUCIÓN PASO A PASO (CÓMO REPLICAR EL TEST)
-----------------------------------------------------------
Paso A: Abra la terminal de comandos de su sistema operativo nativo.

Paso B: Descargue e ingrese al repositorio matriz del proyecto.
Comando principal:
> git clone https://github.com/ChristopherPalloArias/K6_CHALLENGE.git
> cd K6_CHALLENGE

Paso C: Verifique que la herramienta k6 esté disponible globalmente sin errores.
(Si no está instalada o este comando falla, descargue su distribución desde k6.io).
> k6 version

Paso D: Lance la automatización del escenario End-to-End de Autenticación.
Pegue y ejecute unilinealmente la siguiente instrucción en su consola (este comando dispara todo, orquesta los reportes lógicos a .json y extrae el texto puro para leer):

> k6 run k6/scenarios/load-login.js --summary-export=reports/summary.json | tee reports/textSummary.txt

3. RESULTADOS, EVIDENCIAS E INTERPRETACIÓN (SLA DE SALIDA)
-----------------------------------------------------------
La arquitectura del script automatizado sostendrá matemáticamente un tráfico pesado de 20 TPS (Transacciones por Segundo) simulando usuarios virtuales concurrentes por 3 minutos exactos, probando la estabilidad real temporal del servidor ajeno contra Fake Store.

Al finalizar, podrá visualizar gráficamente en su consola misma y acceder manualmente al registro guardado dentro de la carpeta /reports/. 

Revise la Tasa de Éxito en la sección final de los "Checks" (✔ 100%) indicando aserción de creación tokenizada 'Status 201', y confirme que el umbral vital del tiempo de respuesta ('http_req_duration') mantiene un Average global calificado verde, inferior a los draconianos 1.5s permitidos.
