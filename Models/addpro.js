import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    protype: {
      type: String,
      required: true,
    },

    proold: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    bedrooms: {
      type: Number,
    },

    bathrooms: {
      type: Number,
    },

    description: {
      type: String,
    },

    image: {
      type: String,
      required: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    sqft: {
  type: Number,
    },

  carParking: {
  type: Number,
  },

  facing: {
  type: String,
   },

  furnishing: {
  type: String,
  },
  floor:{
    type:String,
  },
  postedby:{
    type:String,
  },
  status: {
  type: String,
  enum: ["available", "closed", "sold"],
  default: "available",
},
  
  },
  { timestamps: true   }
);

export default mongoose.model("property", propertySchema);