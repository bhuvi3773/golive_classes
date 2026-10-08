import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export const UserRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        purchasedCourses: true,
        wishlist: true,
      }
    });
  },

  async findByValidResetToken(token: string) {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: { gt: new Date() }
      }
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },

  async addToWishlist(userId: string, courseId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        wishlist: {
          connect: { id: courseId }
        }
      }
    });
  },

  async removeFromWishlist(userId: string, courseId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        wishlist: {
          disconnect: { id: courseId }
        }
      }
    });
  }
};
