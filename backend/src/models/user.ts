// src/models/User.ts
import mongoose, { Document, Types } from "mongoose"; // thêm Types

export enum EnumRole {
  Admin = 'Admin',
  Customer = 'Customer'
}

export interface IUser extends Document {
   _id: Types.ObjectId; 
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  gender?: boolean;
  role: EnumRole;
  image?: string;
  AddressDelivery?: mongoose.Types.ObjectId[];
  orders?: mongoose.Types.ObjectId[];
  cart?: mongoose.Types.ObjectId;
  coin?: mongoose.Types.ObjectId;
  googleId?: string;
  provider: "google" | "local";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String },
    email:     { type: String, unique: true, required: true },
    password: {
      type: String,
      required: function(this: IUser) {
        return this.provider === 'local';
      },
    },
    phoneNumber:{ type: String },
    gender:    { type: Boolean },
    role: {
      type: String,
      enum: Object.values(EnumRole),
      default: EnumRole.Customer
    },
    image:     { type: String },
    status: { type: Boolean, default: true }, 
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
     },
    
    //Google login
    googleId: { type: String, unique: true, sparse: true }, // ID Google của user
    provider: { type: String, enum: ['google', 'local'], default: 'local' }, // Xác định nguồn user

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

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;