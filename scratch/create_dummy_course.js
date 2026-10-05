const mongoose = require('mongoose');

const URI = "mongodb://pheonixnot13_db_user:82yYfFj0VlyWLPlr@ac-jutr0vb-shard-00-00.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-01.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-02.gqpuiuu.mongodb.net:27017/golive?ssl=true&replicaSet=atlas-9hbazk-shard-0&authSource=admin&appName=Cluster0";

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  price: Number,
  status: String,
  curriculum: mongoose.Schema.Types.Mixed
}, { strict: false });

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

async function run() {
  await mongoose.connect(URI, { family: 4 });
  console.log("Connected to DB");

  const newCourse = new Course({
    title: "Next.js Advanced Learning (With Quiz)",
    description: "A test course to demonstrate the new quiz component.",
    category: "Web Development",
    price: 0,
    status: "published",
    curriculum: [
      {
        id: 1,
        title: "Introduction",
        lectures: [
          {
            id: 101,
            title: "Welcome Video",
            type: "video",
            content: "https://www.w3schools.com/html/mov_bbb.mp4"
          },
          {
            id: 102,
            title: "Module 1 Assessment",
            type: "quiz",
            quizData: {
              questions: [
                {
                  question: "Which hook is used to manage state in React?",
                  options: ["useEffect", "useState", "useContext", "useReducer"],
                  correctAnswerIndex: 1
                },
                {
                  question: "Next.js is built on top of which library?",
                  options: ["Vue", "Angular", "React", "Svelte"],
                  correctAnswerIndex: 2
                }
              ]
            }
          }
        ]
      }
    ]
  });

  const savedCourse = await newCourse.save();
  console.log("Dummy course created with ID:", savedCourse._id);

  await mongoose.disconnect();
}

run().catch(console.error);
