import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
export default mongoose.connect(process.env.MONGO_URI||"mongodb+srv://rajdeep:rajdeep123@typo.p13gqn4.mongodb.net/",{
    dbName:"rajdeeptharabhaijogender",
}).then(console.log("running on db")).catch((error)=>console.log(error))