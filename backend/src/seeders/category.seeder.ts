// category.seeder.ts
import mongoose from "mongoose";
import Category from "../models/Category";

async function seedCategories() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/DB_02");

    // Xoá categories cũ
    await Category.deleteMany({});
    console.log("Đã xoá dữ liệu category cũ ✅");

    // Thêm categories mới
    const categories = await Category.insertMany([
      { categoryName: "Áo Thun" },
      { categoryName: "Áo khoác" },
      { categoryName: "Áo sơ mi" },
    ]);

    console.log("Đã tạo categories ✅", categories);

    await mongoose.disconnect();
    console.log("Seeder Category xong 🎉");
  } catch (error) {
    console.error("Lỗi Category Seeder:", error);
  }
}

seedCategories();
