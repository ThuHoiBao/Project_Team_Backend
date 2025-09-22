// config/configdb.ts
import mongoose from "mongoose";
import { seedProducts } from "../seeders/product.seed";
import {seedDatabase}  from "../seeders/data.seed"

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI: string = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/DB_02";

    // Phiên bản mới không cần useNewUrlParser và useUnifiedTopology
    await mongoose.connect(mongoURI);

    console.log("MongoDB connection established successfully.");
    // await seedProducts();
    // await seedDatabase();
  } catch (error: any) {  // để TypeScript không báo lỗi khi log error
    console.log("Unable to connect to MongoDB:", error.message || error);
  }
};

export default connectDB;
