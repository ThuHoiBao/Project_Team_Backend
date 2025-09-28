import mongoose, {Schema, Document, Types} from "mongoose";
import { removeVietnameseAccents } from "../utils/textUtils"; // Import function helper

export interface IProduct extends Document {// Typescript check datatype
    productName: string;
    productNameNormalized?: string; // Thêm field mới
    listImage?: Types.ObjectId[];
    description?: string;
    descriptionNormalized?: string;
    quantity: number;
    price: number;
    category: mongoose.Types.ObjectId;
    status: boolean;
    createDate?: Date;
    updateDate?: Date;
    productSizes?: mongoose.Types.ObjectId[]; 
}

const ProductSchema: Schema = new Schema<IProduct>( //Define data structure MongoDB
    {
        productName: {type: String, required: true},
        productNameNormalized: {type: String}, // Thêm field mới
        listImage:[
          {
           type: mongoose.Schema.Types.ObjectId,
           ref: "ImageProduct"
          }
        ],
         category: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Category",
              required: true
        },
        description: {type: String},
        descriptionNormalized: {type: String}, // Thêm field mới cho description
        quantity: {type: Number, required: true},
        price: { type: Number, required: true },
        status: {type: Boolean, default: true},
        createDate: {type: Date, default: Date.now},
        updateDate: {type: Date, default: Date.now},
        productSizes: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductSize" }] // Thêm trường productSizes

    },
    {
        timestamps: false
    }
);

// Middleware tự động tạo field normalized khi save
ProductSchema.pre<IProduct>('save', function() {
  if (this.productName) {
    this.productNameNormalized = removeVietnameseAccents(this.productName);
  }
  if (this.description) {
    this.descriptionNormalized = removeVietnameseAccents(this.description);
  }
});

// Middleware tự động tạo field normalized khi update
ProductSchema.pre(['updateOne', 'findOneAndUpdate'], function() {
  const update = this.getUpdate() as any;
  if (update.$set) {
    // Trường hợp update với $set
    if (update.$set.productName) {
      update.$set.productNameNormalized = removeVietnameseAccents(update.$set.productName);
    }
    if (update.$set.description) {
      update.$set.descriptionNormalized = removeVietnameseAccents(update.$set.description);
    }
  } else {
    // Trường hợp update trực tiếp
    if (update.productName) {
      update.productNameNormalized = removeVietnameseAccents(update.productName);
    }
    if (update.description) {
      update.descriptionNormalized = removeVietnameseAccents(update.description);
    }
  }
});

ProductSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

ProductSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id; 
    // Không hiển thị field normalized trong JSON response
    delete ret.productNameNormalized;
    delete ret.descriptionNormalized;
  },
});

export default mongoose.model<IProduct>("Product", ProductSchema);