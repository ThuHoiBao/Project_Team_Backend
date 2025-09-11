import mongoose, { Document, Schema, Model } from "mongoose";

export interface IOrderItem extends Document {
  order: mongoose.Types.ObjectId; // ref Order
  product: mongoose.Types.ObjectId; // ref Product
  price: number;
  quantity: number;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);


OrderItemSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});


OrderItemSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});


export const OrderItem: Model<IOrderItem> = mongoose.model<IOrderItem>(
  "OrderItem",
  OrderItemSchema
);
