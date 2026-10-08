import prisma from '../prisma';

export const ProgressRepository = {
  async findProgress(userId: string, courseId: string) {
    return prisma.progress.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });
  },

  async markLectureCompleted(userId: string, courseId: string, lectureId: number) {
    const progress = await this.findProgress(userId, courseId);
    
    let completedLectures = progress?.completedLectures || [];
    if (!completedLectures.includes(lectureId)) {
      completedLectures.push(lectureId);
    }

    return prisma.progress.upsert({
      where: {
        userId_courseId: { userId, courseId }
      },
      update: {
        completedLectures,
        lastAccessedLecture: lectureId,
      },
      create: {
        userId,
        courseId,
        completedLectures: [lectureId],
        lastAccessedLecture: lectureId,
      }
    });
  },

  async updateLastAccessed(userId: string, courseId: string, lectureId: number) {
    return prisma.progress.upsert({
      where: {
        userId_courseId: { userId, courseId }
      },
      update: {
        lastAccessedLecture: lectureId,
      },
      create: {
        userId,
        courseId,
        lastAccessedLecture: lectureId,
      }
    });
  }
};
