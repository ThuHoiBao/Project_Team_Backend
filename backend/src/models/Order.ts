import mongoose, {Document, Schema, Model} from "mongoose";

export enum OrderStatus {
    ORDERED= "ORDERED",
    CONFIRMED = "CONFIRMED",
    SHIPPED = "SHIPPED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED" ,
    FEEDBACKED ="FEEDBACKED",

}

export interface IOrder extends Document {
    orderItems: mongoose.Types.ObjectId[];
    user: mongoose.Types.ObjectId;
    orderStatus: OrderStatus;
    orderDate: Date;
    payment: mongoose.Types.ObjectId;
    addressDelivery: mongoose.Types.ObjectId;
    coupon: mongoose.Types.ObjectId;
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
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ORDERED,
    },
    orderDate: { type: Date, default: Date.now },
    payment: { type: Schema.Types.ObjectId, ref: "Payment",  },
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


