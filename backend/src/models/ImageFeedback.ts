import mongoose, {Document, Model, Mongoose, Schema} from "mongoose";
export interface ImageFeedbacktSchema extends Document{
    feedback: mongoose.Types.ObjectId;
    imageFeedback: string;
}

const ImageFeedbacktSchema: Schema = new Schema<ImageFeedbacktSchema>(
    {
        imageFeedback: {
            type: String, 
            required: false,
        },
        feedback: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Feedback",
            required: false,
        },
    },
    {
        timestamps: true
    }
);

ImageFeedbacktSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

ImageFeedbacktSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});


export const ImageFeedback: Model<ImageFeedbacktSchema> = mongoose.model<ImageFeedbacktSchema>(
  "ImageFeedback",
  ImageFeedbacktSchema
);