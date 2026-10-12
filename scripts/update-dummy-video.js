const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateVideo() {
  const dummyCourse = await prisma.course.findFirst({
    where: { title: 'Dummy Video Course for Testing' }
  });

  if (dummyCourse) {
    const updatedCurriculum = [
      {
        title: 'Section 1: Video Test',
        lectures: [
          {
            id: 1,
            title: 'Sample Video Lecture',
            type: 'video',
            content: 'https://www.w3schools.com/html/mov_bbb.mp4' // Much more reliable test video URL
          }
        ]
      }
    ];

    await prisma.course.update({
      where: { id: dummyCourse.id },
      data: { curriculum: updatedCurriculum }
    });
    console.log('Dummy course video updated.');
  } else {
    console.log('Dummy course not found.');
  }
}

updateVideo().then(() => prisma.$disconnect()).catch(console.error);
