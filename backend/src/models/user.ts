// src/models/User.ts
import mongoose from "mongoose";

export enum EnumRole {
  Admin = 'Admin',
  Customer = 'Customer'
}

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String },
    email:     { type: String, unique: true, required: true },
    password:  { type: String, required: true },
    phoneNumber:{ type: String },
    gender:    { type: Boolean },
    role: {
      type: String,
      enum: Object.values(EnumRole),
      default: EnumRole.Customer
    },
    image:     { type: String },
    AddressDelivery: [
      {
        type: mongoose.Types.ObjectId,
        ref: "AddressDelivery"
      }
    ],
    orders: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Order"
      },
    ],
    cart: 
      {
        type: mongoose.Types.ObjectId,
        ref: "Cart"
      }, 
     coin: {
        type: mongoose.Types.ObjectId,
        ref: "Coin"
     }
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

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;