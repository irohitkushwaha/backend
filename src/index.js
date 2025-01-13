import dotenv from "dotenv";
import DBConnection from "./db/index.js";
import {server} from "./app.js"
dotenv.config();
console.log("importing env", process.env.PORT);

DBConnection()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log("Service is running at port", process.env.PORT);
    });
  })
  .catch((error) => console.error("Error during server listening", error));
