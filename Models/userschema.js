import mongoose from "mongoose";

let userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
         unique: true,
        lowercase: true,
        trim: true
    },
    mobile:{
        type:String,
        required:true
    },
     DOB:{
        type:Date,
        
    },
    addrass:{
        type:String
    
    },
     prooftype:{
        type:String,
    
    },
   
    password:{
        type:String,
        required:true
    },
    usertype: {
      type: String,
      default:"user"
      
    },
    proofnum:{
        type:String,
    },
    profileImage :{
        type:String,
    },
    experiance:{
        type:String,
    },
    language:{
        type:String,
    },
    profession:{
        type:String,
    },
    status: {
     type: String,
     default: "active"  
     },

})
let user=mongoose.model("user",userschema)
export default user;