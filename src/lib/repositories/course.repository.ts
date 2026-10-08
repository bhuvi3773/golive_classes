import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export const CourseRepository = {
  async findAll() {
    return prisma.course.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },

  async findPublished() {
    return prisma.course.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' }
    });
  },

  async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        reviews: true,
      }
    });
  },

  async create(data: Prisma.CourseCreateInput) {
    return prisma.course.create({
      data,
    });
  },

  async update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  },

  async getPurchasedCourses(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { purchasedCourses: true }
    });
    return user?.purchasedCourses || [];
  },
  
  async addPurchase(userId: string, courseId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        purchasedCourses: {
          connect: { id: courseId }
        }
      }
    });
  }
};
