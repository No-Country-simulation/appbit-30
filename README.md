# App de Orientación Personal — App BiT (B2C)

## Descripción



AppBit es una plataforma de orientación profesional impulsada por IA, diseñada para acompañar a personas de grupos subrepresentados en su desarrollo académico, profesional y personal.

La aplicación integra en una única experiencia:

- Formación y aprendizaje.
- Empleabilidad.
- Mentorías.
- Experiencias inspiradoras.
- Bienestar emocional.

El objetivo es ayudar a cada usuario a identificar sus brechas de conocimiento, construir un plan de crecimiento personalizado y acceder a oportunidades reales de inserción laboral.

---

## Problema

Muchas personas enfrentan múltiples barreras al mismo tiempo:

- Falta de acceso a formación relevante.
- Dificultad para ingresar al mercado laboral.
- Escasez de networking y mentorías.
- Falta de referencias cercanas.
- Problemas de bienestar emocional asociados a procesos de búsqueda laboral prolongados.

La mayoría de las soluciones actuales abordan únicamente una de estas dimensiones.

AppBit busca ofrecer una experiencia integral y personalizada.

---

## Funcionalidades MVP

### Orientación Profesional

- Análisis de perfil.
- Identificación de brechas de habilidades.
- Recomendaciones personalizadas.

### Formación

- Recursos de aprendizaje sugeridos según el perfil del usuario.
- Rutas de aprendizaje orientadas a objetivos concretos.

### Empleabilidad

- Matching con vacantes.
- Visualización de compatibilidad (% de ajuste).
- Identificación de habilidades faltantes.

### Bienestar

- Check-in diario de estado emocional.
- Recomendaciones contextuales.
- Alertas para situaciones de riesgo.

### Mentorías

- Conexión con profesionales y referentes.
- Espacios de networking y acompañamiento.

---

## Arquitectura

### Frontend + BFF

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

### Base de Datos

- Supabase

### Servicio de IA

- Hono
- TypeScript

### Deploy

- Vercel (Web)
- Render / Cloudflare Workers (AI Service)

---

## Estructura del Proyecto

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

## Desarrollo Local

En la raíz del proyecto, instalar dependencias:

pnpm install

En la raíz del proyecto hacer cd apps/web para ejecutar solo la aplicación web
Ejecutar el comando:

pnpm dev:web

En la raíz del proyecto hacer cd apps/ai-service para ejecutar solo el servicio de IA
Ejecutar el comando:

pnpm dev:ai

Para ejecutar ambos servicios, en la raíz del proyecto:

pnpm dev

---

## Variables de Entorno

Ver archivo:

.env.example

---

## Equipo

| Integrante                    | Rol                  |
| ----------------------------- | -------------------- |
| Lorena Paola Sartori          | Project Manager      |
| Franco Baisch                 | Full Stack Developer |
| Cristhian Rodrigo Sosa Zurita | Data Analyst         |
| Agustín Suárez                | AI Engineer          |
| Erica Cristina de Menezes     | QA Tester            |
| Miguel Angel Choque Garcia    | Backend Developer    |

---

## Estado

Actualmente en desarrollo activo.
