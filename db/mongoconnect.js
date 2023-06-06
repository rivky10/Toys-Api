const mongoose = require('mongoose');
const {config} = require("../config/secret")

main().catch(err => console.log(err));

async function main() {
  mongoose.set("strictQuery", false);
  await mongoose.connect(`mongodb+srv://${config.userDb}:${config.userDb}@cluster0.qws6t4l.mongodb.net/toysDB`, () => {
    console.log("Connected to MongoDB");
  });
  // await mongoose.connect('mongodb+srv://Rivky8294:Rivky8294@cluster0.qws6t4l.mongodb.net/black23');
  // console.log("mongo connect")
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}