// apps/web/prisma/seed.ts
import { PrismaClient } from '../app/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

// Tomamos la URL directa (mejor para operaciones que no sean transaccionales)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!connectionString) {
    throw new Error('No se encontró la URL de la base de datos en el entorno.')
}

// Creamos el adapter de PostgreSQL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Empezando el sembrado de datos (Seeding)...')

    // Ejemplo: crear un usuario de prueba.
    // Si tu modelo se llama 'usuarios', cambia el nombre aquí.
    const user = await prisma.userProfile.upsert({
        where: { email: 'test.backend@micky.com' },
        update: {},
        create: {
            email: 'test.backend@micky.com',
        },
    })

    console.log(`✅ Seed finalizado con éxito. Usuario creado: ${user.email}`)
}

main()
    .catch((e) => {
        console.error('Error en el seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })