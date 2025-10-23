import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Product from "../models/Product.js"; // <-- Đảm bảo đường dẫn này đúng



export const seedProducts = async () => {
  try {
    // 1. Xóa hết sản phẩm cũ để tránh trùng lặp
    console.log("Deleting old products...");
    await Product.deleteMany({});
    console.log("-> Old products have been deleted.");

    // 2. Tạo một vài ID giả cho Category
    const fakeCategoryIds = [
      "68f6eb6a73fa3840304e459e",
      "68f6eb6a73fa3840304e459f"
    ];

    const productsToCreate = [];
    const numberOfProducts = 20;

    // 3. Tạo 20 sản phẩm với dữ liệu ngẫu nhiên
    for (let i = 0; i < numberOfProducts; i++) {
      const productName = faker.commerce.productName();
      const productData = {
        productName: productName,
        description: faker.commerce.productDescription(),
        quantity: faker.number.int({ min: 10, max: 200 }),
        // Giá được làm tròn đến hàng nghìn
        price: Math.round(faker.number.int({ min: 50000, max: 3000000 }) / 1000) * 1000,
        // Chọn ngẫu nhiên một category từ danh sách giả
        category: fakeCategoryIds[Math.floor(Math.random() * fakeCategoryIds.length)],
        status: true,
      };
      productsToCreate.push(productData);
    }

    // 4. Thêm tất cả sản phẩm vào DB trong một lần
    console.log(`Creating ${productsToCreate.length} new products...`);
    await Product.insertMany(productsToCreate);

    console.log("✅ Successfully seeded 20 products!");

  } catch (error) {
    console.error("❌ Error seeding products:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

// Chạy seeder
seedProducts();