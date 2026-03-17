---
name: readme-bilingual
description: Translate and restructure the Flow-Monitor README.md to English (primary) with Spanish secondary section. Also add GitHub repo metadata. Use this skill when asked to "traducir README", "README en inglés", "descripción del repo", "GitHub topics", or any documentation improvement task.
---

# README Bilingual + GitHub Metadata — Flow-Monitor

## Context

The current README.md is entirely in Spanish. Since the LinkedIn strategy targets international recruiters with an English-first profile, the repo README must match. The rule: **English primary, Spanish secondary**.

## README Structure

```
# 🔥 Flow-Monitor: Industrial IoT Monitoring System
[English content — complete]

---

## 🇪🇸 Versión en Español
[Spanish content — summarized, links to English sections]
```

## Required Sections (English)

1. **Short description** (2–3 lines): what it is, what problem it solves, key tech
2. **Architecture diagram** (ASCII or table): the 3-layer pipeline
3. **Quick Start**: setup + run instructions
4. **Load Testing**: the benchmark commands (this is a differentiator — keep it)
5. **Project Structure**: folder table
6. **Deployment Roadmap**: Docker + Kubernetes reference to INFRASTRUCTURE_PLAN.md
7. **Tech Stack badge list**: Python, FastAPI, React, Vite, Tailwind, Docker, Kubernetes, SQLite

## Badges to Add at Top

```markdown
![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![License](https://img.shields.io/badge/license-MIT-blue)
```

## GitHub Repo Metadata

Remind the user to update these manually on GitHub (cannot be done via file):

**Description:**
```
Industrial IoT real-time monitoring system — anomaly detection, predictive analytics, 3-layer pipeline. FastAPI + React + Kubernetes.
```

**Topics (add all):**
```
iot, fastapi, python, react, real-time, anomaly-detection, kubernetes, docker, tailwind, monitoring, industrial
```

**Website:** (if deployed) or leave blank

## Translation Rules

- Technical terms stay in English regardless of language section: FastAPI, Docker, Kubernetes, SSE, HPA, etc.
- Code blocks are never translated
- Commands are never translated
- The Spanish section is a summary (~30% of content), not a full translation — link to English sections with anchors

## Output

Overwrite `README.md` in place. Do not create a separate file. After editing, output a summary of what changed.
