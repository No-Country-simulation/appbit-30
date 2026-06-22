// apps/web/src/server/docs/openapi.config.ts
import { healthPaths } from './paths/health.path'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'AppBit BFF - API Documentation',
        version: '1.0.0',
        description: 'Documentación modular e interactiva del Backend For Frontend (BFF).',
    },
    servers: [
        {
            url: appUrl,
            description: process.env.NODE_ENV === 'production' ? 'Servidor de Producción' : 'Servidor Local de Desarrollo',
        },
    ],
    // FUSIONAR PATHS:
    paths: {
        ...healthPaths,
        // ...authPaths,
    },
    // Configuración lista para JWT y OAuth
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Introduce tu token JWT de Supabase Auth para acceder a los endpoints protegidos.',
            },
        },
    },
}