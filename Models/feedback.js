import mongoose from "mongoose";

 let feedbk=new mongoose.Schema({
    feedcondent:{
        type:String,
    },
    userId:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"user"
    },
 },
   {timestamps:true}
)

 const feedback=mongoose.model("feedback",feedbk);

 export default feedback;