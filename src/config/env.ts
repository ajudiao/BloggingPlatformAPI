import { parse } from 'dotenv';
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.url(),
    CORS_ORIGIN: z.url().default('http://localhost:3000')
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error("Variáveis de ambiente inválidas:", z.treeifyError(parsed.error))
    process.exit(1)
}

export const env = parsed.data
