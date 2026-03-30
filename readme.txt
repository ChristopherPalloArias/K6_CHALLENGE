===========================================================
EJERCICIO 1: Prueba de Carga K6 - FakeStore API
===========================================================

NOTA IMPORTANTE: 
Toda la metodología, estructura del proyecto, diseño de la
arquitectura de pruebas y justificaciones técnicas extendidas
se encuentran documentadas a detalle en el archivo "README.md"
ubicado en la raíz de este repositorio, donde se puede
visualizar con un mejor formato. A continuación, se detalla 
lo estrictamente solicitado para la ejecución del script.

1. TECNOLOGÍAS Y VERSIONES A USAR
-----------------------------------------------------------
- k6: v1.7.0 o superior (Verificado localmente en v1.7.1)
- Sistema Operativo: Linux/Windows/macOS (Testeado en Linux amd64)
- Formato de datos: CSV (Provisto en k6/data/credentials.csv)

2. INSTRUCCIONES DE EJECUCIÓN PASO A PASO
-----------------------------------------------------------
Paso 1: Abrir la terminal o línea de comandos.

Paso 2: Ubicarse en la carpeta raíz del proyecto clonado.
Ejemplo: cd /ruta/al/proyecto/K6_CHALLENGE

Paso 3: Verificar que k6 esté instalado y disponible en el PATH:
Comando: k6 version

Paso 4: Ejecutar la prueba de carga principal de login.
El comando ejecutará el script que contempla los escenarios
de calentamiento, carga sostenida y enfriamiento. Ejecute:

Comando: k6 run k6/scenarios/load-login.js --summary-export=reports/summary.json

Paso 5: (Opcional) Generar guardado de consola en texto.
Si desea guardar lo que imprime la consola en un archivo txt:
Comando: k6 run k6/scenarios/load-login.js | tee reports/textSummary.txt

3. RESULTADOS ESPERADOS
-----------------------------------------------------------
Al finalizar los 3 minutos de duración aproximada, k6 
imprimirá un resumen en pantalla mostrando los "Checks" (validaciones) 
y los "Thresholds" (SLAs). Se espera que la tasa de errores sea 
0% y el tiempo de respuesta promedio menor a 1.5 segundos.
