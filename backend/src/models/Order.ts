import mongoose, {Document, Schema, Model} from "mongoose";
import { PaymentMethod } from "./Payment"; 

export enum OrderStatus {
    PENDING_PAYMENT = "PENDING_PAYMENT",
    PROCESSING = "PROCESSING",
    ORDERED= "ORDERED",
    CONFIRMED = "CONFIRMED",
    SHIPPED = "SHIPPED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED" ,
    FEEDBACKED ="FEEDBACKED",
    PAYMENT_FAILED = "PAYMENT_FAILED",
}

export interface IOrderPendingItem {
    productId: mongoose.Types.ObjectId; productName: string; size: string; quantity: number; price: number; image?: string;
}

export interface IOrder extends Document {
    orderItems: mongoose.Types.ObjectId[];
    user: mongoose.Types.ObjectId;
    orderStatus: OrderStatus;
    orderDate: Date;
    pendingItems: IOrderPendingItem[];
    payment?: mongoose.Types.ObjectId;
    addressDelivery: mongoose.Types.ObjectId;
    coupon?: mongoose.Types.ObjectId;
    paymentMethod: PaymentMethod;
    isPaid: boolean;
    paidAt?: Date;
    calculatedSubtotal: number;
    calculatedDiscountValue: number;
    calculatedCoinsApplied: number;
    calculatedCoinValue: number;
    calculatedTotalPrice: number;
    vnpTransactionNo?: string;
    cancellationReason?: string;
}

const OrderSchema: Schema = new Schema<IOrder>(
    {
      orderItems: [
        {
           type: mongoose.Schema.Types.ObjectId,
            ref: "OrderItem",
        },
      ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: true,
        },
    pendingItems: [{
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // Price per item at order time
        image: { type: String },
    }],
    
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ORDERED,
    },
    payment: { type: Schema.Types.ObjectId, ref: "Payment"},
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    orderDate: { type: Date, default: Date.now },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    calculatedSubtotal: { type: Number, required: true },
    calculatedDiscountValue: { type: Number, required: true, default: 0 },
    calculatedCoinsApplied: { type: Number, required: true, default: 0 },
    calculatedCoinValue: { type: Number, required: true, default: 0 },
    calculatedTotalPrice: { type: Number, required: true },
    vnpTransactionNo: { type: String },
    addressDelivery:  { type: Schema.Types.ObjectId, ref: "AddressDelivery", required: true },
    coupon:  { type: Schema.Types.ObjectId, ref: "Coupon" },
    cancellationReason: {
      type: String,
      required: false,
    },
  },
  {
     timestamps: true
  }
);


OrderSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

OrderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export default mongoose.model<IOrder>("Order", OrderSchema);


