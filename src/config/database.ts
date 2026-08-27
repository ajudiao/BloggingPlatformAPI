import { PrismaClient } from "@prisma/client/extension";
import { env } from "./env";


export const dbConfig = {
    url: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production',
    maxConnections: env.NODE_ENV === 'production' ? 20 : 5,
}

// Exemplo de exportação de cliente da BD
// const prisma = new PrismaClient({datasources: {db: {url: dbConfig.url}}})