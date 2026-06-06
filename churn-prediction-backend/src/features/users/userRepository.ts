import { prisma } from '@/utils/prisma.js';

class UserRepository {
   async findActiveAgents() {
      return await prisma.user.findMany({
         where: {
            status: 'ACTIVE',
            role: 'CS_AGENT',
         },
         select: {
            id: true,
            name: true,
            email: true,
            role: true,
         },
         orderBy: {
            name: 'asc',
         },
      });
   }
}

export const userRepository = new UserRepository();
