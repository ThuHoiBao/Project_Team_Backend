// src/models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String },
    email:     { type: String, unique: true, required: true },
    password:  { type: String, required: true },
    address:   { type: String },
    phoneNumber:{ type: String },
    gender:    { type: Boolean },
    roleId:    { type: String },
    positionId:{ type: String },
    image:     { type: String },
  },
  { timestamps: true }
);

UserSchema.virtual("id").get(function () {
  return this._id.toString();
});

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {

  }
});

export default mongoose.model("User", UserSchema);
