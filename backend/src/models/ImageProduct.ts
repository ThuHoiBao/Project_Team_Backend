import mongoose, {Document, Model, Mongoose, Schema} from "mongoose";
export interface IImageProduct extends Document{
    imageProduct: string;
    product: mongoose.Types.ObjectId;
}

const ImageProductSchema: Schema = new Schema<IImageProduct>(
    {
        imageProduct: {
            type: String, 
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }
    },
    {
        timestamps: true
    }
);

ImageProductSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

ImageProductSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});


export const ImageProduct: Model<IImageProduct> = mongoose.model<IImageProduct>(
  "ImageProduct",
  ImageProductSchema
);