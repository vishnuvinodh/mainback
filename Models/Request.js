import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
     ref: "user", required: true },
    agentId: 
    { type: mongoose.Schema.Types.ObjectId, 
      ref: "user", required: true },
    propertyId: { 
      type: mongoose.Schema.Types.ObjectId,
       ref: "property", required: true },
    propertyTitle: String,
    userName: String,
    
    status: {
  type: String,
  enum: ["pending", "accepted", "rejected"],
  default: "pending"
}

  },
  { timestamps: true }
);

export default mongoose.model("request", requestSchema);
