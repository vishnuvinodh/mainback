import express from "express";
import cors from "cors";
import { connectdb } from "./utils/db.js";
import userrouter from "./routes/userruter.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // important!
app.use('/uploads', express.static('uploads'));


// Routes
app.use("/user", userrouter);

connectdb().then(() => {
  app.listen(5002, () => {
    console.log("Server running");
  });
});