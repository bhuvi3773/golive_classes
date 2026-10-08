import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export const DiscussionRepository = {
  async findByCourse(courseId: string) {
    return prisma.discussion.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(data: Prisma.DiscussionCreateInput) {
    return prisma.discussion.create({
      data,
    });
  },

  async addReply(discussionId: string, userId: string, text: string) {
    return prisma.discussionReply.create({
      data: {
        discussionId,
        userId,
        text,
      }
    });
  }
};
