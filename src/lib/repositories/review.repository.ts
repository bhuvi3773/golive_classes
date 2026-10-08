import prisma from '../prisma';

export const ReviewRepository = {
  async findByCourse(courseId: string) {
    return prisma.review.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(userId: string, courseId: string, rating: number, comment: string) {
    return prisma.review.create({
      data: {
        userId,
        courseId,
        rating,
        comment,
      }
    });
  }
};
