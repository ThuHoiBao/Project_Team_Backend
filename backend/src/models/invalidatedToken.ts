// models/InvalidatedToken.js
import mongoose from "mongoose";

const InvalidatedTokenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // jti
  expiryTime: { type: Date, required: true },
});

export default mongoose.model("InvalidatedToken", InvalidatedTokenSchema);
