import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    gmail: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    uniqueid: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
