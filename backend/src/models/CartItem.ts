import mongoose, {Schema, Document, Types}  from "mongoose";
import { Size } from "./ProductSize";

export interface ICartItem extends Document {
    cart: Types.ObjectId;
    product: Types.ObjectId;
    quantity: number;
    size: string;
}

const CartItemSchema: Schema = new Schema<ICartItem>(
{
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, required: true },
},
{
  timestamps: true,
}
);


CartItemSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

CartItemSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export const CartItem = mongoose.model<ICartItem>("CartItem", CartItemSchema);