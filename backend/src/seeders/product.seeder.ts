// product.seeder.ts
import mongoose from "mongoose";
import Product from "../models/Product";
import Category from "../models/Category";
import elasticClient from "../config/elasticClient";
import { removeVietnameseAccents } from "../utils/textUtils"; // Import function helper

async function seedProducts() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/DB_Futu");

    // Xoá product cũ
    await Product.deleteMany({});
    console.log("Đã xoá dữ liệu product cũ ✅");

    // Xóa và tạo lại Elasticsearch index
    try {
      await elasticClient.indices.delete({ index: "products" });
      console.log("Đã xóa Elasticsearch index cũ ✅");
    } catch (error) {
      console.log("Index không tồn tại, tiếp tục tạo mới");
    }

    // Tạo mapping cho Elasticsearch với field normalized
    await elasticClient.indices.create({
      index: "products",
      body: {
        mappings: {
          properties: {
            id: { type: "keyword" },
            productName: { type: "text", analyzer: "standard" },
            productNameNormalized: { type: "text", analyzer: "standard" }, // Field mới
            description: { type: "text" },
            descriptionNormalized: { type: "text" }, // Field mới
            price: { type: "float" },
            quantity: { type: "integer" },
            category: { type: "keyword" },
            status: { type: "boolean" },
            createDate: { type: "date" },
            updateDate: { type: "date" }
          }
        }
      }
    });
    console.log("Đã tạo Elasticsearch mapping mới ✅");

    // Lấy categories từ DB
    const categories = await Category.find({});
    if (categories.length === 0) {
      throw new Error("Không có category nào, hãy chạy category.seeder trước!");
    }

    const allProducts: any[] = [];

    for (const category of categories) {
      const productsData = Array.from({ length: 15 }).map((_, i) => {
        const productName = `${category.categoryName} Sản phẩm ${i + 1}`;
        const description = `Mô tả cho ${category.categoryName} sản phẩm ${i + 1}`;
        
        return {
          productName: productName,
          productNameNormalized: removeVietnameseAccents(productName), // Tự động tạo field normalized
          description: description,
          descriptionNormalized: removeVietnameseAccents(description), // Tự động tạo field normalized
          quantity: Math.floor(Math.random() * 100) + 10,
          price: Math.floor(Math.random() * 500000) + 100000,
          category: category._id,
          feedbacks: [],
          status: true,
        };
      });

      const products = await Product.insertMany(productsData);
      allProducts.push(...products);

      // Gắn productId vào category
      const productIds = products.map((p) => p._id);
      await Category.findByIdAndUpdate(category._id, {
        $push: { listProduct: { $each: productIds } },
      });

      // Index Elasticsearch với field normalized
      for (const product of products) {
        const productId = product._id as mongoose.Types.ObjectId;
        const categoryId = product.category as mongoose.Types.ObjectId;

        await elasticClient.index({
          index: "products",
          id: productId.toString(),
          document: {
            id: productId.toString(),
            productName: product.productName,
            productNameNormalized: product.productNameNormalized, // Index field normalized
            description: product.description,
            descriptionNormalized: product.descriptionNormalized, // Index field normalized
            price: product.price,
            quantity: product.quantity,
            category: categoryId.toString(), 
            status: product.status,
            createDate: product.createDate,
            updateDate: product.updateDate,
          },
        });
      }

      console.log(`Đã tạo 15 sản phẩm cho category ${category.categoryName} ✅`);
      console.log(`  - Ví dụ: "${products[0].productName}" -> "${products[0].productNameNormalized}"`);
    }

    console.log("Seeder Product hoàn tất 🎉");
    console.log(`Tổng cộng đã tạo ${allProducts.length} sản phẩm với field normalized`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Lỗi Product Seeder:", error);
    process.exit(1);
  }
}

seedProducts();