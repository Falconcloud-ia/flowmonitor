# 🔥 Flow-Monitor: Industrial IoT Monitoring System

Sistema de monitoreo de sensores IoT en tiempo real con capacidades de ingesta masiva, detección de anomalías mediante IA y un dashboard reactivo de alto rendimiento.

## 🏗️ Arquitectura
El sistema consta de 3 capas principales:
1.  **Capa 1 (Ingesta)**: Recibe datos de sensores (HTTP/JSON).
2.  **Capa 2 (Core Inteligencia)**: Procesa datos, aplica reglas de negocio y modelos predictivos.
3.  **Capa 3 (Dashboard)**: Visualización en tiempo real y gestión de alertas.

---

## 🚀 Guía de Instalación Rápida

### Prerrequisitos
*   Python 3.10+
*   Node.js 18+

### 1. Configuración del Backend (Python)
```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configuración del Frontend (React)
```bash
cd dashboard
npm install
cd ..
```

---

## ▶️ Ejecución del Sistema

Para levantar todo el stack, necesitas 3 terminales:

**Terminal 1: Backend API**
```bash
source venv/bin/activate
python -m action_layer.api
# Corre en http://localhost:8001
```

**Terminal 2: Dashboard Frontend**
```bash
cd dashboard
npm run dev
# Corre en http://localhost:5173
```

**Terminal 3: Simulación de Sensores (Demo)**
```bash
source venv/bin/activate
python run_live_demo.py
```

---

## 🧪 Pruebas de Carga (Benchmark Industrial)
Incluimos scripts para evaluar la capacidad de la infraestructura ("Stress Testing").

**Prueba Estándar (Multi-nodo):**
Simula 20 sensores enviando datos simultáneamente.
```bash
python run_load_test.py --nodes 20 --duration 60
```

**Prueba Extrema (Nuclear Mode):**
Utiliza `aiohttp` y `uvloop` para generar >200,000 peticiones.
⚠️ **Advertencia**: Puede saturar la red local.
```bash
# Generar 1 millón de peticiones con 500 conexiones concurrentes
python load_async_test.py --total 1000000 --concurrency 500
```

---

## 📂 Estructura del Proyecto
*   `/action_layer`: API Backend (FastAPI).
*   `/ingestion`: Adaptadores de entrada de datos.
*   `/intelligence_core`: Lógica de negocio y modelos de IA.
*   `/dashboard`: Frontend React + Vite + Tailwind.
*   `/sensors`: Simuladores de dispositivos IoT.
*   `INFRASTRUCTURE_PLAN.md`: Plan de escalado a Kubernetes.

---

## ☁️ Despliegue (Roadmap)
Ver `INFRASTRUCTURE_PLAN.md` para detalles sobre la arquitectura de microservicios con Docker y Kubernetes diseñada para soportar >2M req/ciclo.
