import prismaPkg from '@prisma/client'

const { PrismaClient } = prismaPkg

// Reaproveita a conexão entre recarregamentos (node --watch) e invocações quentes na Vercel.
const globalComPrisma = globalThis

export const prisma = globalComPrisma.__headstockPrisma ?? new PrismaClient()
globalComPrisma.__headstockPrisma = prisma
