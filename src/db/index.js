import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config();

// console.log("DB_NAME IS", DB_NAME, "and env for db uri is", process.env.MONGODB_URI)
const DBConnection = async () => {
  try {
    const ConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log("MongoDB Connected, ConnectionInstance", ConnectionInstance.connection.host)
  } catch (error) {
    console.error("error failed during connecting to MongoDB", error);
    process.exit(1);
  }
};


export default DBConnection
