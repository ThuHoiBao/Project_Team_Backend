import mongoose, { Schema, Document } from "mongoose";

export interface ICoin extends Document {
  User: mongoose.Types.ObjectId;
  value: number; // 1000xu = 1000đ
}

const CoinSchema: Schema = new Schema<ICoin>(
  {
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

CoinSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

CoinSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export const Coin = mongoose.model<ICoin>("Coin", CoinSchema);
