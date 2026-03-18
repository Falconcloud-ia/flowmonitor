# FluxMonitor — Estrategia de Prospección Industrial + Postulación CORFO

---

## 1. Análisis del Landing Page Actual

### Diagnóstico
La landing en `fluxmonitor.falcodevs.pro` tiene un problema técnico crítico: el contenido se renderiza 100% con JavaScript client-side. Esto significa que Google, LinkedIn previews, y cualquier bot de crawling ven una página prácticamente vacía. Para prospección B2B esto es grave — un gerente de planta que recibe tu link ve un título genérico antes de que cargue el JS.

### Correcciones prioritarias (antes de prospectar)
- **SSR o pre-rendering**: Implementar Next.js con SSR o al menos un `index.html` con meta tags estáticos y contenido visible sin JS.
- **Meta tags OG**: Título, descripción e imagen para que el link se vea profesional en LinkedIn/WhatsApp.
- **Sección "hero" con propuesta de valor clara**: No "monitoreo industrial" genérico. Algo como: *"Predecimos fallas en tu planta antes de que ocurran. Reduce downtime no planificado en un 30%."*
- **Social proof**: Aunque sea "En validación con plantas industriales en Chile" — algo que ancle confianza.
- **CTA claro**: "Agenda una demo" o "Solicita piloto gratuito" con formulario simple.

---

## 2. Mega-Prompt de Prospección Industrial

### Prompt para usar con Claude (u otro LLM) para generar listas de prospectos:

```
Eres un especialista en desarrollo de negocios B2B para soluciones IoT industriales en Chile y LATAM.

CONTEXTO DEL PRODUCTO:
FluxMonitor es una plataforma SaaS de monitoreo predictivo industrial que:
- Monitorea sensores (temperatura, vibración, presión, humedad, flujo) en tiempo real
- Detecta anomalías y predice fallas antes de que ocurran usando ML (XGBoost + Isolation Forest)
- Envía alertas inteligentes por WhatsApp, SMS y email con escalamiento automático
- Se conecta vía MQTT, HTTP/JSON (y próximamente Modbus, OPC-UA)
- Ofrece dashboard web con analytics, historial y reportes exportables

PROPUESTA DE VALOR:
"Reducir downtime no planificado mediante alertas predictivas con IA, antes de que la falla ocurra"

DIFERENCIADOR vs COMPETENCIA:
- Software-first (no vendemos hardware, nos integramos con sensores existentes)
- SaaS accesible (no requiere consultoría de meses ni inversión CAPEX grande)
- ML predictivo real (no solo alertas por umbral estático como el 90% del mercado)
- Time-to-value rápido: conectar sensor → ver datos → recibir alertas en < 15 minutos

SECTORES OBJETIVO en Chile:
1. Minería: SAG mills, correas transportadoras, bombas
2. Agroindustria: cámaras de frío, invernaderos, plantas procesadoras
3. Manufactura: líneas de producción, compresores, motores
4. Energía: subestaciones, paneles solares, turbinas
5. Agua/Saneamiento: bombas, presión de red, plantas de tratamiento
6. Retail/Logística: cadena de frío (alimentos, farmacéuticos)

TAREA:
Para cada sector, genera:
1. Lista de 10 empresas específicas en Chile que serían prospectos ideales
2. El cargo del decisor clave (ej: Jefe de Mantenimiento, Gerente de Planta, VP Operaciones)
3. El "dolor" específico que FluxMonitor resuelve para esa empresa
4. Un mensaje de primer contacto personalizado (LinkedIn InMail o email frío) de máximo 4 líneas
5. Canales de LinkedIn o eventos industriales donde encontrar a estos decisores

FORMATO: Tabla por sector con columnas [Empresa | Decisor | Dolor | Mensaje | Canal]

CRITERIOS DE SELECCIÓN de prospectos:
- Empresas medianas-grandes (>100 empleados) con operaciones continuas 24/7
- Que tengan equipos críticos donde una falla no planificada cuesta >$50K USD
- Que NO tengan ya sistemas SCADA sofisticados (o que los tengan pero anticuados)
- Que estén en proceso de transformación digital o tengan mandato de eficiencia operacional
```

---

## 3. Competencia en Chile — Mapa Competitivo

| Competidor | Modelo | Fortaleza | Debilidad vs FluxMonitor |
|---|---|---|---|
| **IoT-Monitor** (Las Condes) | Consultoría + HW + SW | Clientes enterprise (Engie) | Caro, lento de implementar |
| **Varitec** | HW + monitoreo remoto | Fuerte en minería, correas | Solo hardware, sin ML predictivo |
| **Wisely** | Consultoría IoT + AI | 7 años de track record | Modelo consultoría, no SaaS escalable |
| **Midda** | Plataforma + sensores | Piloto con Nutrisco (alimentos) | Enfocado en un nicho |
| **Predicted/Arstecne** | HW (sensores wireless) | Fácil instalación | Solo venden hardware, no plataforma |
| **GTD** | Telco + IoT | Infraestructura de datacenter | Genérico, sin especialización predictiva |

### Tu posicionamiento: 
**"La plataforma SaaS que le falta a la industria chilena"** — los competidores venden proyectos de consultoría de $30-100K USD. Tú vendes una suscripción mensual que se conecta en minutos. Esa es la disrupción.

---

## 4. Estrategia CORFO — Rutas de Financiamiento

### Opción A: Start-Up Chile — Ignite (Recomendada)
- **Monto**: Hasta $30.000.000 CLP (cofinanciamiento 90%)
- **Perfil**: Startups con MVP que buscan product-market fit
- **Requisito**: FALCODEVS SpA con < 36 meses de iniciación de actividades
- **Ventaja**: Equity-free, mentorías, cowork, red de inversores
- **Qué financiar**: Fase 1 y 2 del plan de maduración (persistencia, ML, MQTT)

### Opción B: Startup Ciencia — ANID
- **Monto**: Hasta $134.550.000 CLP
- **Perfil**: Empresas de base científico-tecnológica
- **Ángulo**: El componente de ML predictivo (XGBoost, Isolation Forest, detección de anomalías) es I+D aplicada
- **Ventaja**: Monto mayor, más tiempo (12 meses + 6 extensión)
- **Requisito**: Empresa < 10 años, ventas < 25.000 UF

### Opción C: Escala tu Emprendimiento (3IE-USM + CORFO)
- **Perfil**: Startups que necesitan escalar ventas
- **Ventaja**: Mentorías especializadas, red inversores, bajo costo (aporte < 10%)
- **Cuándo**: Después de tener primer cliente pagando

### Opción D: CORFO Metropolitano — Convocatorias 2026
- **Monto**: Parte de $419M distribuidos en 4 programas
- **Ángulo**: Impacto territorial + sostenibilidad (monitoreo para eficiencia energética)

---

## 5. Narrativa para Postulación CORFO

### Problema (por qué importa)
En Chile, la industria minera pierde más de $1.5B USD/año por downtime no planificado. Las plantas manufactureras operan con mantenimiento reactivo — esperan a que la máquina falle. Las soluciones existentes requieren proyectos de consultoría de 6-12 meses y presupuestos de $50-100K USD, dejando fuera al 80% de las empresas medianas.

### Solución (qué es FluxMonitor)
FluxMonitor es una plataforma SaaS de monitoreo predictivo industrial que usa inteligencia artificial para predecir fallas en equipos críticos antes de que ocurran. A diferencia de soluciones tradicionales que solo alertan cuando un umbral se supera, FluxMonitor analiza patrones temporales con modelos de machine learning (XGBoost, Isolation Forest) para estimar el tiempo restante hasta la falla.

### Diferenciación
1. **Software-first**: No vendemos hardware. Nos integramos con sensores existentes vía MQTT, HTTP, y protocolos industriales estándar.
2. **SaaS accesible**: Suscripción mensual desde $X/sensor. Sin CAPEX.
3. **Time-to-value**: De conexión a primera alerta predictiva en menos de 15 minutos.
4. **IA predictiva real**: No alertas estáticas. Modelos que aprenden del comportamiento de cada máquina.

### Mercado
- TAM Chile: +5.000 plantas industriales con equipos críticos monitoreables
- SAM: ~500 empresas medianas-grandes en minería, manufactura, agroindustria
- SOM inicial: 20-50 empresas en los primeros 18 meses

### Tracción actual
- MVP funcional con dashboard en tiempo real, alertas WhatsApp/SMS, y clasificación de riesgo
- Arquitectura de 3 capas validada (ingesta → inteligencia → acción)
- En proceso de integración de ML real y persistencia con TimescaleDB

### Uso de fondos (ejemplo para Ignite - $30M)
- 40% — Desarrollo técnico: ML predictivo, MQTT, persistencia, autenticación
- 25% — Piloto industrial: 2-3 empresas reales con datos de producción
- 20% — Go-to-market: Landing, SDK, documentación, presencia en ferias industriales
- 15% — Operaciones: Infraestructura cloud, herramientas, legal

### Impacto esperado
- Reducción de 25-40% en downtime no planificado para clientes piloto
- Generación de empleo técnico especializado en IoT/ML en Chile
- Posicionamiento de Chile como hub de IoT industrial en LATAM

---

## 6. Plan de Acción Inmediato (Próximos 30 días)

### Semana 1-2: Producto mínimo vendible
- [ ] Corregir landing: meta tags, hero con propuesta de valor, CTA de demo
- [ ] Implementar persistencia PostgreSQL (que los datos no se pierdan al reiniciar)
- [ ] Grabar video demo de 2 minutos mostrando el dashboard en acción

### Semana 2-3: Prospección
- [ ] Ejecutar el mega-prompt de prospección → generar lista de 50 prospectos
- [ ] Crear perfil LinkedIn de FALCODEVS orientado a IoT industrial
- [ ] Enviar primeros 20 mensajes de primer contacto (LinkedIn + email)
- [ ] Identificar 2-3 ferias/eventos industriales en Santiago (Expomin, Fabtech, etc.)

### Semana 3-4: CORFO
- [ ] Verificar elegibilidad de FALCODEVS SpA para Ignite (antigüedad SII)
- [ ] Preparar pitch deck de 10 slides basado en la narrativa de sección 5
- [ ] Contactar ejecutivo CORFO para confirmar próxima ventana de postulación
- [ ] Si califica, explorar también Startup Ciencia ANID como segunda ruta

---

*Documento generado el 18 de marzo de 2026 para FluxMonitor / FALCODEVS SpA*