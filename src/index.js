import dotenv from "dotenv";
import DBConnection from "./db/index.js";

dotenv.config();
console.log("importing env", process.env.PORT)
DBConnection()