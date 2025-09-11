import mongoose, {Document, Schema, Model} from "mongoose";

export enum OrderStatus {
    WAITING_CONFIRMATION= "WAITING_CONFIRMATION",
    CONFIRMED = "CONFIRMED",
    SHIPPING = "SHIPPING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED" 
}

export interface IOrder extends Document {
    orderItems: mongoose.Types.ObjectId[];
    user: mongoose.Types.ObjectId;
    orderStatus: OrderStatus;
    orderDate: Date;
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
      default: OrderStatus.WAITING_CONFIRMATION,
    },
    orderDate: { type: Date, default: Date.now },
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

export const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);


