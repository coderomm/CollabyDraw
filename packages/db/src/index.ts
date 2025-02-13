import { PrismaClient } from '@prisma/client';

const prismaClinentSingleton = () => {
    return new PrismaClient;
}

type PrismaClinentSingleton = ReturnType<typeof prismaClinentSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClinentSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClinentSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}