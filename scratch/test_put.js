const mongoose = require('mongoose');

const uri = "mongodb://pheonixnot13_db_user:82yYfFj0VlyWLPlr@ac-jutr0vb-shard-00-00.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-01.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-02.gqpuiuu.mongodb.net:27017/golive?ssl=true&replicaSet=atlas-9hbazk-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const courseId = "6ac0e0062f7bf625e21e06ed"; // Machine course
  
  // Try to update it using Mongoose to see if it works
  const result = await db.collection('courses').updateOne(
    { _id: new mongoose.Types.ObjectId(courseId) },
    { $set: { 
        curriculum: [
          {
            id: 1,
            title: "Test Section",
            lectures: [
              { id: 101, title: "Test Video", type: "video", content: "/uploads/test.mp4" }
            ]
          }
        ] 
      } 
    }
  );
  
  console.log("Update result:", result);
  
  const course = await db.collection('courses').findOne({ _id: new mongoose.Types.ObjectId(courseId) });
  console.log("After update, curriculum length:", course.curriculum ? course.curriculum.length : 0);
  
  process.exit(0);
}

run().catch(console.error);
