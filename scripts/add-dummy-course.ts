import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dummyCourse = await prisma.course.create({
    data: {
      title: 'Dummy Video Course for Testing',
      description: 'This is a test course to verify the video player and screen recording.',
      category: 'Testing',
      price: 0,
      thumbnail: 'https://via.placeholder.com/800x450',
      status: 'published',
      curriculum: [
        {
          title: 'Section 1: Video Test',
          lectures: [
            {
              id: 1,
              title: 'Sample Video Lecture',
              type: 'video',
              content: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            }
          ]
        }
      ],
      goals: ['Test Video Player'],
      requirements: ['None'],
      targetAudience: ['Testers']
    }
  });

  console.log('Dummy course created:', dummyCourse.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
