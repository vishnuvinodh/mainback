import mongoose from "mongoose"; // Changed from 'require'

const subscriptionPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  planType: {
    type: String,
    enum: ["Gold", "Diamond"],
    required: true
  },
  role: {
    type: String,
    enum: ["User", "Agent"],
    required: true
  },
  monthlyPrice: {
    type: Number,
    required: true
  },
  yearlyPrice: {
    type: Number,
    required: true
  },
  propertyLimit: {
    type: String
  },
  features: {
    type: [String]
  }
}, { timestamps: true });

// Changed from 'module.exports'
export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);