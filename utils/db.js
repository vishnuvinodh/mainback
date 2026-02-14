import mongoose from "mongoose";
import 'dotenv/config';

const db_url = process.env.url;

export async function connectdb() {
  try {
    await mongoose.connect(db_url);
    console.log("Database Connected");
  } catch (e) {
    console.log("Error Occurred:", e.message);
  }
}
