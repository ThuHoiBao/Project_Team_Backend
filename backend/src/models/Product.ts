import mongoose, {Schema, Document, Types} from "mongoose";



export interface IProduct extends Document {// Typescript check datatype
    productName: string;
    listImage?: Types.ObjectId[];
    description?: string;
    quantity: number;
    price: number;
    category: mongoose.Types.ObjectId;
    status: boolean;
    createDate?: Date;
    updateDate?: Date;
    feedbacks: mongoose.Types.ObjectId[];
}

const ProductSchema: Schema = new Schema<IProduct>( //Define data structure MongoDB
    {
        productName: {type: String, required: true},
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
         feedbacks: [ 
        {
            type: mongoose.Types.ObjectId,
            ref: "Feedback"
        }
        ],
        description: {type: String},
        quantity: {type: Number, required: true},
        price: { type: Number, required: true },
        status: {type: Boolean, default: true},
        createDate: {type: Date, default: Date.now},
        updateDate: {type: Date, default: Date.now},
        
    },
    {
        timestamps: false
    }
);


ProductSchema.virtual("id").get(function (this: any) {
  return this._id.toString();
});

ProductSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id; 
  },
});

export default mongoose.model<IProduct>("Product", ProductSchema);