import mongoose, { Document, Model, Types } from "mongoose";
import { start } from "repl";

export interface ICategory extends Document {
  categoryName: string;
  listProduct: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  id?: string; 
}

const CategorySchema = new mongoose.Schema<ICategory>(
  {
    categoryName: { type: String, required: true },
    listProduct: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);


CategorySchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

CategorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
  },
});

export type CategoryDocument = ICategory & Document;

const Category: Model<CategoryDocument> = mongoose.model<CategoryDocument>(
  "Category",
  CategorySchema
);

export default Category;
