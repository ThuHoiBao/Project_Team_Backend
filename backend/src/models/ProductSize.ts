import mongoose, { Schema, Document } from "mongoose";
export enum Size {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL"
}
export interface IProductSize extends Document {
  product: mongoose.Types.ObjectId; 
  size: Size;                       
  quantity: number;                 
}

const ProductSizeSchema: Schema = new Schema<IProductSize>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: {
      type: String,
      enum: Object.values(Size),
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

ProductSizeSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

ProductSizeSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export default mongoose.model<IProductSize>("ProductSize", ProductSizeSchema);
