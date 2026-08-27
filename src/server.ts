import app from "./app";
import prisma from "./lib/prisma";
import { env } from "./config/env";

const bootstrap = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    app.listen(env.PORT, () => {
      console.log(`Server running on port http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
};

bootstrap();