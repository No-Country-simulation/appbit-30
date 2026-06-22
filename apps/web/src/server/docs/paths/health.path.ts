// apps/web/src/server/docs/paths/health.path.ts

export const healthPaths = {
    '/api/health/db': {
        get: {
            summary: 'Chequeo de salud de la Base de Datos',
            tags: ['Infraestructura'],
            description: 'Verifica la conectividad directa con el pool de PostgreSQL de Supabase.',
            responses: {
                200: {
                    description: 'Conexión exitosa con la base de datos',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'up' },
                                    database: { type: 'string', example: 'connected' },
                                    timestamp: { type: 'string', example: '2026-06-18T14:04:21.000Z' },
                                },
                            },
                        },
                    },
                },
                500: {
                    description: 'Error de conectividad',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'down' },
                                    database: { type: 'string', example: 'disconnected' },
                                    error: { type: 'string', example: 'DATABASE_URL no configurada' },
                                    timestamp: { type: 'string', example: '2026-06-18T14:04:21.000Z' },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
}