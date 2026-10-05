const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const URI = "mongodb://pheonixnot13_db_user:82yYfFj0VlyWLPlr@ac-jutr0vb-shard-00-00.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-01.gqpuiuu.mongodb.net:27017,ac-jutr0vb-shard-00-02.gqpuiuu.mongodb.net:27017/golive?ssl=true&replicaSet=atlas-9hbazk-shard-0&authSource=admin&appName=Cluster0";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isVerified: Boolean,
  profileSetupCompleted: Boolean
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(URI, { family: 4 });
  console.log("Connected to DB");

  const email = "superadmin@golive.com";
  const password = await bcrypt.hash("superadmin", 10);

  let user = await User.findOne({ email });
  if (user) {
    user.password = password;
    user.role = 'superadmin';
    user.isVerified = true;
    user.profileSetupCompleted = true;
    await user.save();
    console.log("Superadmin user updated successfully.");
  } else {
    user = new User({
      name: "The Boss",
      email: email,
      password: password,
      role: 'superadmin',
      isVerified: true,
      profileSetupCompleted: true
    });
    await user.save();
    console.log("Superadmin user created successfully.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
