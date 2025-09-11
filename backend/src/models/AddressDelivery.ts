import mongoose, { Schema, Document } from "mongoose";

export interface IAddressDelivery extends Document {
  user: mongoose.Types.ObjectId;       
  address: string;
  fullName: string;
  phoneNumber: string;
  isDefault: boolean;
}

const AddressDeliverySchema: Schema = new Schema<IAddressDelivery>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

AddressDeliverySchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

AddressDeliverySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export const AddressDelivery = mongoose.model<IAddressDelivery>(
  "AddressDelivery",
  AddressDeliverySchema
);
