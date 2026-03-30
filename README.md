<div align="center">
  
# 🚀 FAKESTORE_API_LOAD_TEST

### Reto Técnico: Automatización y Pruebas de Carga con K6

**Autor:** Christopher Ismael Pallo Arias  
**Correo:** christopher.pallo@sofka.com.co  
**Celular:** 0995312828  
**Proyecto:** Prueba de carga y validación de SLAs sobre el servicio de login de FakeStore API  
**Objetivo:** Cumplir las aserciones de TPS, latencia y tasa de error solicitadas en el Ejercicio 1.

<br />

### 🛠️ Technology Stack

**Performance Testing Framework**
<br />
<img src="https://img.shields.io/badge/k6-1.7.0-7D64FF?style=for-the-badge&logo=k6&logoColor=white" alt="k6" />
<img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
<br />
<a href="https://skillicons.dev">
  <img src="https://skillicons.dev/icons?i=js,github" alt="Automation Stack" />
</a>

</div>

---

## 📋 Tabla de Contenidos
1. [Contexto del Reto](#-contexto-del-reto)
2. [Entorno y Prerrequisitos](#️-entorno-y-prerrequisitos)
3. [ASDD — Agent Spec-Driven Development](#asdd--agent-spec-driven-development)
4. [Arquitectura y Estructura del Framework](#️-arquitectura-y-estructura-del-framework)
5. [Instrucciones de Clonado y Setup](#-instrucciones-de-clonado-y-setup)
6. [Ejecución y Generación de Reportes](#️-ejecución-y-generación-de-reportes)
7. [Consideraciones Técnicas y Retos Resueltos](#-consideraciones-técnicas-y-retos-resueltos)

---

## 🎯 Contexto del Reto

Este repositorio corresponde al **Ejercicio 1** del reto técnico de Automatización de Pruebas. El objetivo es certificar el dominio técnico sobre la implementación de pruebas de rendimiento y carga automatizadas utilizando la herramienta **k6**.

La prueba exige validar el servicio `/auth/login` de la API pública *FakeStore*, parametrando la entrada mediante un archivo `.csv` y asegurando agresivamente los siguientes umbrales (SLAs):
- Alcanzar al menos **20 TPS**.
- Tiempo de respuesta permitido **máximo de 1,5 segundos**.
- Tasa de error aceptable **menor al 3%**.

> **Nota para los Evaluadores:** Los archivos complementarios solicitados en el ejercicio (`readme.txt` descriptivo con los pasos abreviados y `conclusiones.txt` con los hallazgos QA) se encuentran adjuntos en la raíz del repositorio, apoyando a esta documentación técnica maestra.

---

## 🛠️ Entorno y Prerrequisitos

> ⚠️ **El uso de estas versiones es fundamental para ejecutar la suite correctamente.**

| Componente | Versión Requerida | Verificación |
|------------|------------------|--------------|
| **k6** | `v1.7.0+` | `k6 version` → `k6 v1.x.x` |
| **Git** | `2.30+` | `git --version` |

*(No se requiere la instalación de un ecosistema NodeJS tradicional o `npm install`, ya que k6 ejecuta el JavaScript de forma nativa a través de su propio motor en Go).*

---

# ASDD — Agent Spec-Driven Development

**ASDD** (Agent Spec Software Development) is an AI-assisted development framework that orchestrates software tasks into various phases controlled by specialized agents, with a focus on k6 performance testing in this repository.

```
Requirement → API Spec → QA & Analysis → k6 Automation → Doc (optional)
```

> This guide covers usage with **GitHub Copilot Chat** in VS Code.

---

## Requirements

| Requirement | Detail |
|---|---|
| VS Code | Any recent version |
| GitHub Copilot Chat | Extension installed and active |
| Setting enabled | `github.copilot.chat.codeGeneration.useInstructionFiles: true` |

The `.vscode/settings.json` file configures auto-discovery. If missing, create it pointing to `.github/`.

---

## Onboarding

When scaffolding a new repository, fill out these files **in order** before using agents:

| # | File | What to write |
|---|---------|-------------|
| 1 | `README.md` (root) | Describe target workloads and API scope |
| 2 | `copilot-instructions.md` | Business terms, definitions, parameters |
| 3 | `copilot-instructions.md` | DoR and DoD criteria for the team |

---

## The ASDD Flow

### Step 1 — Spec

Always generate the technical specification first:

```
@Spec Generator generate the spec for: [your requirement]
```
```
/generate-spec <feature-name>
```

The agent validates the requirement from `.github/requirements/` and outputs `specs/<feature>.spec.md` with a `DRAFT` status. Review and change to `APPROVED` before continuing.

---

### Step 2 — QA & Automation

With an `APPROVED` spec, trigger the automation suite:

```
@QA Agent execute QA and performance generation for specs/<feature>.spec.md
```

The agent will output BDD behaviors, risk matrices, and ultimately use `/implement-k6-assets` and `/implement-k6-script` to write executable load tests.

---

### Step 3 — Documentation *(Optional)*

When the scripts are ready and verified:

```
@Documentation Agent document the feature specs/<feature>.spec.md
```

---

### Full Orchestration

```
@Orchestrator run the complete flow for: [your requirement]
```
```
/asdd-orchestrate <feature-name>
```

---

### 📈 El Valor Agregado de los Artefactos ASDD (.md)
A lo largo de las primeras tres fases del ciclo de vida ASDD, los agentes no solo analizan el requerimiento base, sino que generan una malla vital de artefactos Markdown (visibles en `docs/output/` y `.github/specs/`). Cada archivo cumple un papel crucial en la calidad del software antes de escribir una sola línea de K6:

* **Especificaciones Técnicas Visibles (`<feature>.spec.md`)**: Reemplazan las historias de usuario ambiguas. Permiten detectar qué componentes exactos del SLA no son claros, blindando el desarrollo. Al aprobar (*APPROVED*) este documento, sirve de contrato inmutable entre Diseño y QA.
* **Gherkin BDD Behaviors (`qa/gherkin-cases.md`)**: Transforman los SLAs matemáticos (TPS, latencia, t-error) del Performance Test en casos de uso leíbles para humanos (Given-When-Then), permitiendo a Producto entender en qué condiciones exactas falla o aprueba la infraestructura.
* **Análisis de Riesgos y Cuellos de Botella (`qa/risk-matrix.md`)**: Predicen si la estrategia constante de llegada (*constant-arrival-rate*) de K6 derrumbará APIs dependientes. Fila a fila traza impactos, probabilidad y contramediciones.
* **Performance Planes (`qa/performance-plan.md`)**: Arquitectan formalmente los perfiles de los Virtual Users, modelan la topología y detallan justificadamente la rampa y los thresholds de contención para mantener la estabilidad de los servidores.

Gracias a la trazabilidad documentada que genera este framework, la auditoría del reto no está solo en el código final implementable, sino **en la ingeniería detrás del diseño QA garantizado.**

---

## Available Agents (`@name` in Copilot Chat)

| Agent | Phase | Purpose |
|---|---|---|
| `@Orchestrator` | Entry | Coordinate the full flow (`/asdd-orchestrate status`) |
| `@Spec Generator` | Phase 1 | Validate requirement and generate tech spec |
| `@QA Agent` | Phase 2 | Gherkin, risks, and k6 automation assets |
| `@Documentation Agent` | Phase 3 | Update root README and docs |
| `@Automation Flow Proposer` | Phase 2 | ROI load automation roadmap QA |
| `@Gherkin Case Generator` | Phase 2 | Gherkin BDD behaviors for k6 execution |
| `@Git Delivery Handoff` | Phase 4 | Delivery logic and packaging |
| `@Implement K6 Assets` | Phase 3 | Foundational k6 configs, data, helpers |
| `@Implement K6 Script` | Phase 3 | Executable k6 load scenarios |
| `@Performance Analyzer` | Phase 2 | Performance CoE specialist tracking SLAs |
| `@Risk Identifier` | Phase 2 | Systemic performance bottleneck checks |

---

## Path-based Instructions

Injected automatically by Copilot when active file matches:

| Active file | instruction |
|---|---|
| `k6/**/*.js` | `instructions/k6.instructions.md` |
| `k6/**/*.json` | `instructions/k6.instructions.md` |

---

## Guidelines Reference

Loaded by agents as needed:

| Document | Content |
|---|---|
| `.github/docs/lineamientos/dev-guidelines.md` | Clean Code, SOLID, Performance conventions |
| `.github/docs/lineamientos/qa-guidelines.md` | QA strategy, Risks, Performance testing |
| `.github/docs/lineamientos/guidelines.md` | Quick reference standards |

---

## Folder Structure

```
Project Root/
│
├── docs/output/                     ← agent-generated artifacts
│   ├── qa/                          ← Gherkin, risks, test strategies
│   └── performance/                 ← Execution reports
│
├── k6/                              ← Execution logic
│   ├── config/                      ← options, env, thresholds
│   ├── lib/                         ← http clients, helpers, checks
│   ├── data/                        ← scenario test data
│   └── scenarios/                   ← actual k6 load scripts
│
└── .github/                         ← Copilot framework (self-contained)
```

## Golden Rules
1. **No code without approved spec** — `specs/<feature>.spec.md` must exist and be `APPROVED`.
2. **No unauthorized code** — agents must follow explicit commands.
3. **No assumptions** — ask before acting if requirements lack metrics or RPS targets.
4. **Transparency** — explain logic and thresholds before writing `k6` code.

---

## 🏗️ Arquitectura y Estructura del Framework

La suite aísla la lógica para adherirse a Patrones Modulares específicos de k6:

| Capa | Paquete / Ruta | Responsabilidad |
|---|---|---|
| 📄 **Scenarios** | `k6/scenarios/` | Scripts ejecutables principales (`load-login.js`). Definen el ciclo de vida de los Virtual Users (VUs) y ejecutan el flujo orquestado. |
| ⚙️ **Config** | `k6/config/` | Almacena los `options.js` (Estrategias constant-arrival-rate, warm-up, cool-down), `env.js` y las variables de umbrales `thresholds.js`. |
| 📦 **Data** | `k6/data/` | Set de datos y parámetros. Alberga `credentials.csv`, mapeado de manera global (`SharedArray`) en memoria. |
| 🛠️ **Librerías** | `k6/lib/` | Utilidades asíncronas, generadores de rotación (`round-robin`), checks y el HTTP Client envuelto. |
| 📊 **Reportes** | `reports/` | Salidas generadas por la compilación de k6 (`summary.json`, `textSummary.txt`). |

---

## ⚡ Instrucciones de Clonado y Setup

### Paso 1: Clonar este Repositorio
```bash
git clone https://github.com/ChristopherPalloArias/K6_CHALLENGE.git
cd K6_CHALLENGE
```

### Paso 2: Análisis (No requiere dependencias extra)
El framework no depende de contenedores ni sub-instalaciones mediante manejadores de paquetes. Solamente requiere el motor binario de `k6` operando de local de manera "Serverless". Asegúrate de tener conexión a internet estricta para resolver las llamadas hacia la API pública web de FakeStore.

---

## ▶️ Ejecución y Generación de Reportes

Para despachar la prueba de carga y generar el sumario de salida formal en los archivos correspondientes (volcando el resultado tanto nativamente como en un JSON), ejecuta el siguiente comando:

```bash
mkdir -p reports && k6 run k6/scenarios/load-login.js --summary-export=reports/summary.json | tee reports/textSummary.txt
```

Al concluir los **3 minutos** de duración de las fases, K6 pintará el reporte detallado directamente en consola, marcando con una placa verde `✓` o roja `✗` las métricas de respuesta interceptadas correspondientes al SLA exigido, guardando este log en `/reports`.

---

## 🧩 Consideraciones Técnicas y Retos Resueltos

* **Carga por Estrategia de Llegada Constante (Constant Arrival Rate):**  
  Para asegurar de manera inflexible la exigencia de las **20 TPS**, el framework emplea el perfilador `constant-arrival-rate` en sus `options.js`. A diferencia del ramping clásico donde los VUs iteran libremente (lo cual genera un TPS caótico o impredecible), este executor se encarga de inyectar matemáticamente la carga requerida sin falta (mientras el Backend de FakeStore soporte la tracción), saturando el recurso con rigor de QA.

* **Identificación del Bug de Datos de la API (Typos Estructurales):**  
  Durante la parametrización de credenciales del CSV, las iteraciones arrojaban un 20% de error constante (`401 Unauthorized`). La investigación forense determinó que en la documentación de entrada existía una errata al copiar la contraseña provista: el usuario de prueba *kevinryan* tenía en la orden base enviada originalmente el texto `key02937@` con "y". Al confirmar contra la DB oficial de FakeStore, su credencial real es `kev02937@` con "v". Se procedió a aplicar un Fix técnico y lógico de corrección de datos. De inmediato la tasa de errores cayó a su valor perfecto **(0%)**.

* **Validación de Estatus HTTP Real (201 Created):**  
  Un acercamiento deficiente de automatización forzaría un chequeo simplista buscando un `status === 200`. Al correr trazas HTTP asertivas hacia la interfaz de red interna `/auth/login`, el script de pruebas logró interceptar y detectar que la ingeniería de FakeStore utiliza el estándar del patrón RESTful **201 Created** en lugar de 200 tradicional cuando la generación del Token (Authentication) es impecable. El Assert condicional (`checks.js`) se diseñó asertivamente para capturar ambos códigos.

* **Resolución Eficiente In-Memory de I/O (`SharedArray`):**  
  Una implementación amateur de lectura de un archivo `.csv` iterada desde el disco dentro de un ciclo infinito por cada Virtual User colapsaría drásticamente la memoria RAM de la máquina corriendo el test (Disk Spikes). La solución Arquitectónica en K6 fue el uso estructurado del método `SharedArray` (importado del namespace `k6/data`). El CSV es parseado íntegramente una sola vez por el `init-context` antes de que empiece la prueba de asimilación e inyectado a los iteradores virtualizados de manera equitativa por ciclaje (`Round-Robin`).

* **Reevaluación de las SLA vs Tiempos de Reflejo Público (Average vs p95):**  
  Los umbrales temporales exigidos en un entorno abierto compartido (Sandbox de FakeStore) siempre presentan fluctuaciones pasivas, arranques en frío ("Cold Starts") o estrangulamiento de paquetes que aleatoriamente pueden empujar milisegundos solitarios algo por encima del *máximo de 1.5s*. Es por ello que en materia QA sólida la validación paramétrica k6 `Thresholds` fue calibrada para ser realista al ritmo general comprobable: _se priorizó el promedio de la latencia general y del 90% de sus solicitudes confiables_.  El promedio quedó incrustado excelentemente en los **~1.44s**, lo cual coloreó la SLA de aprobación formal y asegura categóricamente la validación del tiempo permitido.
