import mongoose, {Schema, Document, Types}  from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose); 

export interface ICartItem extends Document{
    cart: Types.ObjectId;
    product: Types.ObjectId;
    quantity: number;
}

const CartItemSchema: Schema = new Schema<ICartItem>(
  {
    cart: {type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true},
    product: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
    quantity: {type: Number, required: true, min: 1},
  },
  {
    timestamps: true,
  }
)

CartItemSchema.plugin(AutoIncrement, {
  inc_field: "cartItemID", 
  start_seq: 1,           
});


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