// apps/web/app/api/health/db/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export const dynamic = 'force-dynamic' // Evita que Next.js cachee la respuesta

export async function GET() {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        return NextResponse.json(
            { status: 'down', database: 'disconnected', error: 'DATABASE_URL no configurada' },
            { status: 500 }
        )
    }

    // Creamos un Pool de conexiones rápido exclusivo y aislado para este test
    const pool = new Pool({
        connectionString,
        connectionTimeoutMillis: 4000, // Si en 4 segundos no conecta, da timeout
    })

    try {
        // Intentamos conectar y lanzar una consulta ultra ligera
        const client = await pool.connect()
        await client.query('SELECT 1')

        // Liberamos los recursos de inmediato
        client.release()
        await pool.end()

        return NextResponse.json(
            {
                status: 'up',
                database: 'connected',
                timestamp: new Date().toISOString()
            },
            { status: 200 }
        )
    } catch (error) {
        // Nos aseguramos de cerrar el pool en caso de fallo
        await pool.end()
        console.error('🚨 Health check nativo de Postgres falló:', error)

        return NextResponse.json(
            {
                status: 'down',
                database: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown database error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}