import mongoose, { Document, Schema, Model } from "mongoose";

export enum PaymentMethod {
  VNPAY = "VNPAY",
  COD = "COD",
  COIN = "COIN"
}

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  amount: number;
  coponValue: number;
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
    coponValue: { type: Number, required: false },
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
