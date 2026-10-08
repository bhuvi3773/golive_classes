import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export const LaunchRepository = {
  async findAll() {
    return prisma.upcomingLaunch.findMany({
      orderBy: { launchDate: 'asc' }
    });
  },

  async findScheduledAndLive() {
    return prisma.upcomingLaunch.findMany({
      where: {
        status: { in: ['scheduled', 'live'] }
      },
      orderBy: { launchDate: 'asc' }
    });
  },

  async create(data: Prisma.UpcomingLaunchCreateInput) {
    return prisma.upcomingLaunch.create({
      data,
    });
  },

  async update(id: string, data: Prisma.UpcomingLaunchUpdateInput) {
    return prisma.upcomingLaunch.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.upcomingLaunch.delete({
      where: { id },
    });
  }
};
