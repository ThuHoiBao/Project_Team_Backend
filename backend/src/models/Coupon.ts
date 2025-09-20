import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string; 
  discountValue: number; 
  maxDiscount?: number; 
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usedCount: number; 
  order: mongoose.Types.ObjectId;
}

const CouponSchema: Schema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    discountValue: { type: Number, required: true },
    maxDiscount: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usedCount: { type: Number, default: 0 },
    order:  { type: Schema.Types.ObjectId, ref: "Order" },
  },
  {
    timestamps: true,
  }
);

// virtual id
CouponSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

CouponSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export const Coupon: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", CouponSchema);
