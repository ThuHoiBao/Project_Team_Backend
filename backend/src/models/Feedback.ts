import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;      
  comment: string;
}

const FeedbackSchema: Schema = new Schema<IFeedback>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, 
  }
);

FeedbackSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

FeedbackSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export const Feedback = mongoose.model<IFeedback>("Feedback", FeedbackSchema);
