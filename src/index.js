import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./database/index.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Error: ${error}`);
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`backend is listining on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB connection error: ${error}`);
  });
