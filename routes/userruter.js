import express from "express";
import { addproperty, adminDashboard, agentlist, Agentprofile, allProperties, blockUser, buyproperty, closeDeal, deleteUser, feedsubmit, feedviwe, getAgentProperties,getAgentRequests,getAllPropertiesForAdmin,login,
 profile, register, requestStatus, sendRequestToAgent, updateagent, updateProperty, updatePropertyStatus, updateuser, userlist } from "../controller/usercontroller.js"; 
import { uplode } from "../multer.js";
import verifyToken from "../Middleware/verifyToken.js";
import verifyAdmin from "../Middleware/verifyAdmin.js";

const userrouter = express.Router();

userrouter.post("/register", register);
userrouter.post("/login",login)
userrouter.get("/profile/:id",profile)
userrouter.put("/updateuser/:id",updateuser)
userrouter.get("/userlist",userlist)
userrouter.post("/feedsubmit",feedsubmit)
userrouter.get("/feedviwe",feedviwe)
userrouter.put("/updateagent/:id", uplode.single("profileImage"), updateagent);
userrouter.get("/Agentprofile/:id",Agentprofile)
userrouter.post("/addproperty",verifyToken,uplode.single("image"),addproperty);
userrouter.put("/property/:id", verifyToken,uplode.single("image"),updateProperty);

userrouter.get( "/properties", verifyToken, getAgentProperties);
userrouter.get("/allproperties", allProperties);
userrouter.get("/property/:id", buyproperty);
userrouter.post("/request", verifyToken, sendRequestToAgent);
userrouter.get("/agent/requests", verifyToken, getAgentRequests);
userrouter.put("/request/:id/status", verifyToken, requestStatus);
userrouter.put("/property/:id/status",verifyToken,updatePropertyStatus);
userrouter.put("/property/close/:id", closeDeal);
userrouter.get("/agentlist", agentlist);
userrouter.put("/block/:id", verifyToken, verifyAdmin, blockUser);
userrouter.delete("/delete/:id", verifyToken, verifyAdmin, deleteUser);
userrouter.get("/admin/dashboard", verifyToken, verifyAdmin, adminDashboard);
userrouter.get("/admin/properties", verifyToken, verifyAdmin, getAllPropertiesForAdmin);

export default userrouter;