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

  async findById(id: string) {
    return prisma.upcomingLaunch.findUnique({
      where: { id },
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

export function canUserAccessLaunchLink(
  userRole: string | null | undefined,
  userPurchasedCategories: string[] | Set<string>,
  launch: { category?: string | null; type?: string | null }
): boolean {
  if (!userRole) return false;
  if (userRole === 'admin' || userRole === 'superadmin') return true;

  if (userRole === 'student') {
    const enrolledSet = userPurchasedCategories instanceof Set
      ? userPurchasedCategories
      : new Set((userPurchasedCategories || []).map(c => c.toLowerCase().trim()));

    const cat = launch.category?.toLowerCase().trim();
    if (cat && enrolledSet.has(cat)) {
      return true;
    }
    // General masterclasses/webinars accessible to any enrolled student
    if (enrolledSet.size > 0 && (launch.type === 'webinar' || cat === 'all' || cat === 'general')) {
      return true;
    }
  }

  return false;
}

export function sanitizeLaunchForUser<T extends { category?: string | null; type?: string | null; link?: string | null }>(
  launch: T,
  canAccess: boolean
): T {
  if (canAccess) return launch;
  return {
    ...launch,
    link: null,
  };
}
