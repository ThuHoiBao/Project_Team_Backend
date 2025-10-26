import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICoinUsage extends Document {
  User: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  coinsUsed: number;
}

const CoinUsageSchema: Schema = new Schema<ICoinUsage>(
  {
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, 
    },
    coinsUsed: {
      type: Number,
      required: true,
      min: 0, 
    },
  },
  {
    timestamps: true, 
  }
);

CoinUsageSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

CoinUsageSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export const CoinUsage = mongoose.model<ICoinUsage>("coinUsage", CoinUsageSchema);