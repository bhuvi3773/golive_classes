import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export const NoteRepository = {
  async findByUserAndCourse(userId: string, courseId: string) {
    return prisma.videoNote.findMany({
      where: { userId, courseId },
      orderBy: { timestamp: 'asc' }
    });
  },

  async create(data: Prisma.VideoNoteCreateInput) {
    return prisma.videoNote.create({
      data,
    });
  },

  async delete(id: string) {
    return prisma.videoNote.delete({
      where: { id },
    });
  }
};
