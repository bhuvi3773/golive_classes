const mongoose = require('mongoose');

const uri = "mongodb://pheonixnot13_db_user:82yYfFj0VlyWLPlr@ac-jutr0vb-shard-00-00.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-01.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-02.gqpuiuu.mongodb.net:27017/golive?ssl=true&replicaSet=atlas-9hbazk-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const courses = await db.collection('courses').find().toArray();
  
  console.log(`Found ${courses.length} courses`);
  
  for (const c of courses) {
    console.log(`\nCourse ID: ${c._id}`);
    console.log(`Title: ${c.title}`);
    console.log(`Status: ${c.status}`);
    console.log(`Curriculum Length: ${c.curriculum ? c.curriculum.length : 0}`);
    
    if (c.curriculum && c.curriculum.length > 0) {
      for (const sec of c.curriculum) {
        console.log(`  Section: ${sec.title}`);
        if (sec.lectures) {
          for (const lec of sec.lectures) {
            console.log(`    Lecture: ${lec.title} | Type: ${lec.type} | Content: ${lec.content}`);
          }
        }
      }
    }
  }
  process.exit(0);
}

run().catch(console.error);
