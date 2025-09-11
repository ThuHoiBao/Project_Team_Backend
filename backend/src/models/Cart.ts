import mongoose, {Schema, Document, Types} from "mongoose";

export interface ICart extends Document {
    cartItems: mongoose.Types.ObjectId[];
    user: mongoose.Types.ObjectId;
}

const CartSchema: Schema = new Schema<ICart>(
{
    cartItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CartItem",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

CartSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});


CartSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export const Cart = mongoose.model<ICart>("Cart", CartSchema);