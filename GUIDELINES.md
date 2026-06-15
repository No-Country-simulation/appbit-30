# AppBiT - Development Guidelines

## Objetivo

Este documento define la estructura técnica del proyecto,
las responsabilidades de cada módulo y las reglas que
deben seguir todos los integrantes del equipo.

El objetivo es evitar retrabajo, duplicación de código y
mantener una arquitectura consistente durante todo el hackathon.

---

# Arquitectura General

El proyecto está organizado como un monorepo utilizando PNPM Workspaces.

Estructura:

appbit/

apps/
├── ai-service/
└── web/

packages/
├── shared-schemas/
├── shared-types/

supabase/
├── migrations/
├── seeds/

docs/
├── api/
├── architecture/

---

# Responsabilidades

## apps/web

Responsables principales:
Backend / FullStack

Tecnologías:

- Next.js
- TypeScript
- Tailwind
- Shadcn
- Supabase

Este módulo contiene:

- UI
- Routing
- Auth
- Dashboard
- Server Actions
- Route Handlers
- Integración con Supabase
- Integración con AI Service

NO contiene:

- Prompts
- Lógica del agente
- Código del LLM

---

## apps/ai-service

Responsable principal:
AI Engineer

Tecnologías:

- Hono
- TypeScript
- OpenAI / Gemini / etc

Este módulo contiene:

- Endpoints de IA
- Prompt Engineering
- Agent Logic
- Recommendation Logic

NO contiene:

- Componentes UI
- Acceso directo a Supabase
- Auth

La comunicación ocurre únicamente mediante HTTP.

---

## packages/shared-types

Contiene:

- Interfaces
- DTOs
- Tipos compartidos

Ejemplos:

OrientationRequest

OrientationResponse

HealthRequest

HealthResponse

Toda estructura utilizada por más de una aplicación debe vivir aquí.

---

## packages/shared-schemas

Contiene:

- Schemas Zod
- Validaciones

Ejemplos:

orientationSchema

healthSchema

Las validaciones deben ser reutilizadas por web y ai-service.

---

# Base de Datos

La única fuente de verdad es Supabase.

No crear bases de datos paralelas.

Todas las entidades deben almacenarse en Supabase.

Ejemplo:

- profiles
- vacancies
- resources
- orientations
- check_ins

---

# Flujo de Datos

Usuario

↓

Web (Next.js)

↓

Supabase

↓

AI Service

↓

Supabase

↓

UI

El AI Service no debe ser dueño de datos.

El AI Service recibe contexto y devuelve respuestas.

---

# Variables de Entorno

Todas las variables deben documentarse en:

.env.example

Nunca subir:

.env

.env.local

Credenciales

API Keys

Tokens

---

# Convención de Tareas

Frontend:

FE-001
FE-002
FE-003

Backend:

BE-001
BE-002
BE-003

AI:

AI-001
AI-002
AI-003

QA:

QA-001
QA-002
QA-003

---

# Convención de Branches

feature/FE-001-login

feature/BE-003-auth

feature/AI-002-orientar

bugfix/QA-004-health-check

---

# Deployments

Web:

Vercel

Root Directory:

apps/web

---

AI Service:

Render / Cloudflare

Root Directory:

apps/ai-service

---

# Regla Importante

Antes de crear:

- tablas
- endpoints
- tipos
- schemas

Verificar que no exista una implementación previa.

Evitar duplicación.

---

# Filosofía del MVP

Priorizar:

- velocidad
- claridad
- mantenibilidad

Evitar:

- overengineering
- microservicios innecesarios
- optimizaciones prematuras

El objetivo es entregar un MVP funcional y demostrable.
