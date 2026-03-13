import mongoose from "mongoose";

const expertSchema = new mongoose.Schema({
    name: { type: String, required: true },
  title: { type: String, required: true },
  experience: { type: String, required: true },
  languages: { type: String, required: true },
  image: { type: String, required: true },
  phone: { type: String, required: true }
});

export default mongoose.model("Expert", expertSchema);