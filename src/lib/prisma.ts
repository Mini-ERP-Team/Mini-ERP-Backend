import 'dotenv/config';
import { PrismaClient } from '../../prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || (() => {
  const adapter = new PrismaPg({ 
    connectionString: process.env.DATABASE_URL 
  });
  return new PrismaClient({ adapter });
})();


if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}