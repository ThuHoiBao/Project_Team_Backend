import mongoose, { Document, Schema, Model } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

export enum PaymentMethod {
  VNPAY = "VNPAY",
  COD = "COD",
}

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  amount: number;
  status: boolean;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentDate: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PaymentSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

PaymentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export const Payment: Model<IPayment> = mongoose.model<IPayment>(
  "Payment",
  PaymentSchema
);
