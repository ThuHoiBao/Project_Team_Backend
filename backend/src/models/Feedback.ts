import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  OrderItem: mongoose.Types.ObjectId;
  rating: number;      
  comment: string;
  date: Date;
}

const FeedbackSchema: Schema = new Schema<IFeedback>(
  {
    OrderItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
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
    date: { type: Date, default: Date.now },
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
