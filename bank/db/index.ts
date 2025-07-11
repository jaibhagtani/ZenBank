// Everyone is importing DB dependency by this DB module
// Not directly from node modules

// Good Practice
import { PrismaClient } from "./node_modules/@prisma/client/extension"

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;