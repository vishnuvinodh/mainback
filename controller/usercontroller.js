import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import feedback from '../Models/feedback.js';
import user from '../Models/userschema.js';
import { uplode } from '../multer.js';
import addpro from '../Models/addpro.js';
import mongoose from 'mongoose';
import Request from '../Models/Request.js';
import { request } from 'express';
import expertModel from '../Models/expertModel.js';
import SubscriptionPlan from '../Models/subscription.js';

const register = async (req, res) => {
  try {
    const existingUser = await user.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userData = { ...req.body, password: hashedPassword };

    const newUser = new user(userData);
    const savedUser = await newUser.save();

    return res.status(201).json({ message: "User registered successfully", savedUser });
  } catch (error) {
    console.error("Error during registration:", error.message);
    return res.status(500).json({ message: "Error during registration" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await user.findOne({ email });
    if (!response) {
      return res.status(400).json({ message: "User not found" });
    }

    const matchedpassword = await bcrypt.compare(password, response.password);
    if (!matchedpassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

const token = jwt.sign(
  {
    userId: response._id,
    email: response.email,
    usertype: response.usertype   // 👈 ADD THIS
  },
  "abc",
  { expiresIn: "1h" }
);


    res.status(200).json({
      message: "Login successful",
      token,
      _id: response._id,
      usertype: response.usertype,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


const profile=async(req,res)=>{
  try{
    const id=req.params.id;
    const response=await user.findById(id)
    res.json(response)
  }catch(error){
    res.status(500).json({message:"Erorr fetching user"})
  }
}
const updateuser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedata = { ...req.body };

    if (updatedata.password?.trim() === "") {
      delete updatedata.password; 
    } else if (updatedata.password) {
      updatedata.password = await bcrypt.hash(updatedata.password, 10);
    }

    const updateduser = await user.findByIdAndUpdate(id, updatedata, {
      new: true,
    });

    if (!updateduser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updateduser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};
const userlist = async (req, res) => {
  try {
    const users = await user
      .find({ usertype: "user" })   // ✅ correct field
      .select("-password");         // ✅ hide password

    res.status(200).json(users);
  } catch (error) {
    console.error("USER LIST ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


const feedsubmit=async(req,res)=>{
  try{
    const {feedcondent,userId}=req.body;
    console.log("Feedback submit userId:",userId);
    const newfeedbk=new feedback({userId,feedcondent})
    const savefd=await newfeedbk.save();
    res.json(savefd)    
  }catch(error){
    res.status(500).json({message:"Error in submitingv in feedback",error})
  }
}
  
const feedviwe = async (req, res) => {
  try {
    const feedbacks = await feedback
      .find()
      .populate("userId", "name place");

    const respodata = feedbacks.map((f) => ({
      feedcondent: f.feedcondent,
      createdAt: f.createdAt,
      user: {
        name: f.userId ? f.userId.name : "Anonymous",
        place: f.userId ? f.userId.place : "",
      },
    }));

    res.json(respodata);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching feedback",
      error,
    });
  }
};

const updateagent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedata = { ...req.body };

    if (updatedata.password?.trim() === "") {
      delete updatedata.password;
    } else if (updatedata.password) {
      updatedata.password = await bcrypt.hash(updatedata.password, 10);
    }

    if (req.file) {
      updatedata.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedagent = await user.findByIdAndUpdate(id, updatedata, {
      new: true,
    });

    if (!updatedagent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json(updatedagent);
  } catch (error) {
    res.status(500).json({ message: "Error updating agent", error });
  }
};

const Agentprofile=async(req,res)=>{
  try{
    const id=req.params.id;
    const response=await user.findById(id)
    res.json(response)
  }catch(error){
    res.status(500).json({message:"Erorr fetching user"})
  }
}
const addproperty = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Property image required" });
    }

    const property = new addpro({
      ...req.body,
      image: `/uploads/${req.file.filename}`,
      agentId: req.user.userId, // from JWT middleware
    });

    await property.save();

    res.status(201).json({
      message: "Property added successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding property", error });
  }
};  


 const updateProperty = async (req, res) => {
  try {
    const property = await addpro.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // OPTIONAL: ownership check (recommended)
    if (property.agentId?.toString() !== req.user.userId
) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // update fields
    Object.keys(req.body).forEach((key) => {
      property[key] = req.body[key];
    });

    // update image ONLY if new image uploaded
    if (req.file) {
      property.image = req.file.filename;
    }

    await property.save();

    res.json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};

const getAgentProperties = async (req, res) => {
  try {
    const agentId = req.user.userId;

    const properties = await addpro.find({ agentId });

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching agent properties:", error);
    res.status(500).json({ message: "Error fetching agent properties" });
  }
};

const allProperties = async (req, res) => {
  try {
    const properties = await addpro
      .find({ status: "available" })   // ✅ filter here
      .sort({ createdAt: -1 });        // ✅ newest first (professional)

    res.status(200).json(properties);
  } catch (error) {
    console.error("ALL PROPERTIES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

const buyproperty = async (req, res) => {
  const { id } = req.params;

  try {
   
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await addpro
  .findById(id)
  .populate("agentId", "name mobile email");


    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const sendRequestToAgent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID required" });
    }

    const property = await addpro.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const alreadyRequested = await Request.findOne({
      userId,
      propertyId,
    });

    if (alreadyRequested) {
      return res.status(400).json({ message: "Already requested" });
    }

    const newRequest = await Request.create({
      userId,
      agentId: property.agentId,
      propertyId,
    });

    res.status(201).json({
      success: true,
      message: "Request sent to agent",
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

 const getAgentRequests = async (req, res) => {
  try {
    const agentId = req.user.userId;

    const requests = await Request.find({ agentId })
      .populate("userId", "name email mobile")
      .populate("propertyId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("AGENT REQUEST ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const requestStatus = async (req, res) => {
  try {
    const { status } = req.body; // accepted | rejected

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Request.findOneAndUpdate(
      {
        _id: req.params.id,
        agentId: req.user.userId, // 🔒 agent can update ONLY their requests
      },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({
      success: true,
      message: `Request ${status}`,
      data: updated,
    });
  } catch (err) {
    console.error("REQUEST STATUS ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body; // available | pending | sold

    if (!["available", "pending", "sold"].includes(status)) {
      return res.status(400).json({ message: "Invalid property status" });
    }

    const property = await addpro.findOneAndUpdate(
      {
        _id: req.params.id,
        agentId: req.user.userId, // 🔒 only owner agent
      },
      { status },
      { new: true }
    );

    if (!property) {
      return res.status(403).json({ message: "Not authorized or not found" });
    }

    res.status(200).json({
      success: true,
      message: "Property status updated",
      property,
    });
  } catch (error) {
    console.error("PROPERTY STATUS ERROR:", error);
    res.status(500).json({ message: "Failed to update property status" });
  }
};
 const closeDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await addpro.findByIdAndUpdate(
      id,
      { status: "closed" },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    console.error("Close Deal Error:", err);
    res.status(500).json({ message: "Failed to close deal" });
  }
};


const agentlist = async (req, res) => {
  try {
    const agents = await user
      .find({ usertype: "agent" })
      .select("-password");

    // Count properties for each agent
    const agentsWithPropertyCount = await Promise.all(
      agents.map(async (agent) => {
        const propertyCount = await addpro.countDocuments({
          agentId: agent._id,
        });

        return {
          ...agent.toObject(),
          propertyCount,
        };
      })
    );

    res.status(200).json(agentsWithPropertyCount);
  } catch (error) {
    console.error("AGENT LIST ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};



const blockUser = async (req, res) => {
  try {
    const foundUser = await user.findById(req.params.id);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    foundUser.status =
      foundUser.status === "blocked" ? "active" : "blocked";

    await foundUser.save();

    res.json({
      message: "User status updated",
      status: foundUser.status,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const foundUser = await user.findById(id);

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (foundUser.usertype === "admin") {
      return res.status(403).json({ message: "Admin cannot be deleted" });
    }

    await user.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({
      message: "Server error while deleting user",
    });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const totalUsers = await user.countDocuments({ usertype: "user" });

    const totalAgents = await user.countDocuments({ usertype: "agent" });

    const totalProperties = await addpro.countDocuments();

    const soldProperties = await addpro.countDocuments({
      status: "sold",
    });

    const availableProperties = await addpro.countDocuments({
      status: "available",
    });

    const totalFeedback = await feedback.countDocuments();

    const totalRequests = await Request.countDocuments();

    res.status(200).json({
      totalUsers,
      totalAgents,
      totalProperties,
      soldProperties,
      availableProperties,
      totalFeedback,
      totalRequests,
      monthlyGrowth: [
        { month: "Jan", growth: 5 },
        { month: "Feb", growth: 8 },
        { month: "Mar", growth: 12 },
        { month: "Apr", growth: 15 },
        { month: "May", growth: 18 },
        { month: "Jun", growth: 22 },
      ],
    });

  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};
 
const getAllPropertiesForAdmin = async (req, res) => {
  try {
    const properties = await addpro
      .find()
      .populate("agentId", "name email") // optional if you store agent reference
      .sort({ createdAt: -1 });

    res.status(200).json(properties);
  } catch (error) {
    console.error("GET ADMIN PROPERTIES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch properties",
    });
  }
};

const addExpert = async (req, res) => {
  try {
    // 1. Added 'phone' to the destructured body
    const { name, title, experience, languages, phone } = req.body;

    // Check if file exists to prevent errors
    const image = req.file ? req.file.filename : "";

    // 2. Added 'phone' to the new model instance
    const expert = new expertModel({
      name,
      title,
      experience,
      languages,
      phone, // <--- This line saves the number to MongoDB
      image
    });

    await expert.save();

    res.json({ success: true, message: "Expert added successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error adding expert" });
  }
};

const getExperts = async (req, res) => {

  try {

    const experts = await expertModel.find();

    res.status(200).json(experts);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Error fetching experts" });

  }

};

 const deleteExpert = async (req, res) => {
  try {

    const { id } = req.params;

    const expert = await expertModel.findByIdAndDelete(id);

    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }

    res.status(200).json({ message: "Expert deleted successfully" });

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Server error" });

  }
};
const updateExpert = async (req, res) => {
  try {
    const { name, title, experience, languages, phone } = req.body;
    let updateData = { name, title, experience, languages, phone };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedExpert = await expertModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ message: "Expert updated successfully", data: updatedExpert });
  } catch (error) {
    res.status(500).json({ message: "Error updating expert" });
  }
};
// Add 'export const' at the beginning
export const createPlan = async (req, res) => {
  try {
    const { title, planType, role, monthlyPrice, features } = req.body;

    // Logic for calculating yearly price (20% discount)
    const standardYearly = monthlyPrice * 12;
    const discountedYearly = Math.round(standardYearly * 0.80);

    let propertyLimit = "N/A";

    if (role === "Agent") {
      propertyLimit = planType === "Gold"
        ? "30 Properties"
        : "Unlimited Properties";
    }

    // Ensure 'SubscriptionPlan' matches the name you used in your import statement!
    const plan = new SubscriptionPlan({
      title,
      planType,
      role,
      monthlyPrice,
      yearlyPrice: discountedYearly,
      propertyLimit,
      features
    });

    await plan.save();

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { monthlyPrice, role, planType } = req.body;

    // Recalculate values in case price/type changed
    const standardYearly = monthlyPrice * 12;
    const discountedYearly = Math.round(standardYearly * 0.80);
    
    let propertyLimit = "N/A";
    if (role === "Agent") {
      propertyLimit = planType === "Gold" ? "30 Properties" : "Unlimited Properties";
    }

    const updated = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { 
        ...req.body, 
        yearlyPrice: discountedYearly, 
        propertyLimit 
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Plan updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    await SubscriptionPlan.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Plan deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export { register,login,profile,updateuser,userlist,feedsubmit,feedviwe,updateagent,
  Agentprofile,addproperty,updateProperty,getAgentProperties,allProperties,buyproperty,
  sendRequestToAgent,getAgentRequests,requestStatus,updatePropertyStatus,closeDeal,agentlist,
   blockUser,deleteUser,adminDashboard,getAllPropertiesForAdmin,addExpert,getExperts,deleteExpert,updateExpert,getPlans,updatePlan,deletePlan};
    