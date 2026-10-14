import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const placeholderCourses = [
  {
    title: 'Introduction to Python — Beginner',
    description: '[Sample Course] Master the fundamentals of Python programming, data structures, and procedural logic with hands-on exercises.',
    category: 'Programming',
    price: 0,
    thumbnail: '',
    status: 'published',
    curriculum: [
      {
        title: 'Section 1: Getting Started with Python',
        lectures: [
          {
            id: 1,
            title: 'Python Installation and Environment Setup',
            type: 'video',
            content: 'https://www.w3schools.com/html/mov_bbb.mp4'
          },
          {
            id: 2,
            title: 'Variables, Expressions, and Data Types',
            type: 'video',
            content: ''
          }
        ]
      },
      {
        title: 'Section 2: Control Structures',
        lectures: [
          {
            id: 3,
            title: 'Conditionals and Loops',
            type: 'video',
            content: ''
          }
        ]
      }
    ],
    goals: ['Understand Python syntax', 'Write basic scripts', 'Work with data structures'],
    requirements: ['Basic computer literacy', 'No programming experience needed'],
    targetAudience: ['Beginners', 'Aspiring software engineers']
  },
  {
    title: 'Web Development Fundamentals — Beginner',
    description: '[Sample Course] Build responsive websites from scratch using semantic HTML5, modern CSS flexbox and grid, and JavaScript.',
    category: 'Web Development',
    price: 499,
    thumbnail: '',
    status: 'published',
    curriculum: [
      {
        title: 'Section 1: HTML5 & Semantic Elements',
        lectures: [
          {
            id: 1,
            title: 'Document Structure & Semantic Tags',
            type: 'video',
            content: 'https://www.w3schools.com/html/mov_bbb.mp4'
          },
          {
            id: 2,
            title: 'Forms, Inputs and Accessible UI',
            type: 'video',
            content: ''
          }
        ]
      },
      {
        title: 'Section 2: Modern CSS Layouts',
        lectures: [
          {
            id: 3,
            title: 'Flexbox and Grid Design Patterns',
            type: 'video',
            content: ''
          }
        ]
      }
    ],
    goals: ['Build modern web layouts', 'Master Flexbox and Grid', 'Understand semantic markup'],
    requirements: ['Web browser (Chrome or Firefox)', 'Code editor (VS Code)'],
    targetAudience: ['Front-end developers', 'Designers learning to code']
  },
  {
    title: 'AWS Cloud Foundations — Beginner',
    description: '[Sample Course] Explore cloud infrastructure essentials including AWS IAM policies, Amazon S3 private storage, and cloud security.',
    category: 'Cloud Computing',
    price: 799,
    thumbnail: '',
    status: 'published',
    curriculum: [
      {
        title: 'Section 1: AWS Architecture & IAM',
        lectures: [
          {
            id: 1,
            title: 'AWS Global Infrastructure & IAM Roles',
            type: 'video',
            content: 'https://www.w3schools.com/html/mov_bbb.mp4'
          },
          {
            id: 2,
            title: 'Securing S3 Buckets & Presigned URLs',
            type: 'video',
            content: ''
          }
        ]
      }
    ],
    goals: ['Configure IAM permissions', 'Manage S3 bucket policies', 'Understand cloud security best practices'],
    requirements: ['Basic networking knowledge'],
    targetAudience: ['Cloud novices', 'DevOps engineers', 'Backend developers']
  },
  {
    title: 'Generative AI Essentials — Beginner',
    description: '[Sample Course] An introductory exploration of modern foundation models, prompt engineering patterns, and autonomous agents.',
    category: 'Artificial Intelligence',
    price: 999,
    thumbnail: '',
    status: 'published',
    curriculum: [
      {
        title: 'Section 1: Core AI Concepts',
        lectures: [
          {
            id: 1,
            title: 'Foundation Models & Transformer Overview',
            type: 'video',
            content: 'https://www.w3schools.com/html/mov_bbb.mp4'
          },
          {
            id: 2,
            title: 'Prompt Architecture & Context Windows',
            type: 'video',
            content: ''
          }
        ]
      }
    ],
    goals: ['Understand generative model behavior', 'Master structured prompting', 'Evaluate multimodal workflows'],
    requirements: ['Basic tech literacy'],
    targetAudience: ['Product managers', 'Engineers', 'AI enthusiasts']
  }
];

export async function seedPlaceholderCourses() {
  console.log('--- Checking & Seeding Placeholder Courses ---');
  let addedCount = 0;

  for (const courseData of placeholderCourses) {
    const existing = await prisma.course.findFirst({
      where: { title: courseData.title }
    });

    if (existing) {
      console.log(`[EXISTS] "${courseData.title}" (ID: ${existing.id})`);
    } else {
      const created = await prisma.course.create({
        data: courseData
      });
      console.log(`[CREATED] "${created.title}" (ID: ${created.id})`);
      addedCount++;
    }
  }

  // Also ensure corresponding categories exist in the Category table
  const categoriesToEnsure = ['Programming', 'Web Development', 'Cloud Computing', 'Artificial Intelligence'];
  for (const catName of categoriesToEnsure) {
    const existingCat = await prisma.category.findFirst({
      where: { name: catName }
    });
    if (!existingCat) {
      await prisma.category.create({
        data: { name: catName, description: `Academy courses in ${catName}` }
      });
      console.log(`[CATEGORY CREATED] ${catName}`);
    }
  }

  console.log(`Placeholder seeding finished. Added: ${addedCount} new courses.`);
}

if (require.main === module) {
  seedPlaceholderCourses()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
