const mongoose = require('mongoose');

const uri = "mongodb://pheonixnot13_db_user:82yYfFj0VlyWLPlr@ac-jutr0vb-shard-00-00.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-01.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-02.gqpuiuu.mongodb.net:27017/golive?ssl=true&replicaSet=atlas-9hbazk-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  // Use a reliable public test video to bypass local encoding/Turbopack issues
  const latestVideo = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  const result = await db.collection('courses').updateMany(
    {}, // Update all courses
    { $set: { 
        status: 'published',
        curriculum: [
          {
            id: 1,
            title: "Main Curriculum",
            lectures: [
              { id: 101, title: "Course Introduction (Test Video)", type: "video", content: latestVideo }
            ]
          }
        ] 
      } 
    }
  );
  
  console.log("Attached external test video to all courses:", result.modifiedCount);
  process.exit(0);
}

run().catch(console.error);
