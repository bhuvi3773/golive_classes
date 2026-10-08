import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  return new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy"
      }
    }
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
