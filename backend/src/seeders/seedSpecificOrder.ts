import mongoose from "mongoose";
import Order from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import Product from "../models/Product.js";


const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const seedManyItemsForSpecificOrder = async () => {
  try {
    const TARGET_ORDER_ID = "68f70c6263a1e7ad25341ab9";
    const NUMBER_OF_ITEMS_TO_CREATE = 15; // Số lượng item muốn tạo

    console.log(`🎯 Targeting Order with ID: ${TARGET_ORDER_ID}`);

    // 1. Dọn dẹp OrderItems cũ của đơn hàng này
    console.log("Cleaning up old OrderItems for the target order...");
    const { deletedCount } = await OrderItem.deleteMany({ order: TARGET_ORDER_ID });
    console.log(`-> Deleted ${deletedCount} old item(s).`);

    // 2. Lấy dữ liệu Products để tạo item
    const allProducts = await Product.find({}).lean();
    if (allProducts.length === 0) {
      console.error("No products found in the database. Cannot create OrderItems.");
      return;
    }
    console.log(`Found ${allProducts.length} products to use.`);

    // 3. Tạo các OrderItem mới trong bộ nhớ
    const itemsToCreate = [];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    for (let i = 0; i < NUMBER_OF_ITEMS_TO_CREATE; i++) {
      const randomProduct = getRandomItem(allProducts);
      const newItem = {
        order: TARGET_ORDER_ID,
        product: randomProduct._id,
        price: randomProduct.price,
        size: getRandomItem(sizes),
        quantity: getRandomInt(1, 4),
      };
      itemsToCreate.push(newItem);
    }

    // 4. Thêm đồng loạt các OrderItem mới vào DB
    console.log(`Creating ${itemsToCreate.length} new OrderItems...`);
    const createdItems = await OrderItem.insertMany(itemsToCreate);
    const newItemIds = createdItems.map(item => item._id);

    // 5. Cập nhật lại Order mục tiêu với mảng ID mới
    console.log("Updating target Order with the new item list...");
    await Order.updateOne(
      { _id: TARGET_ORDER_ID },
      { $set: { orderItems: newItemIds } }
    );

    console.log(`✅ Successfully seeded ${NUMBER_OF_ITEMS_TO_CREATE} items for order ${TARGET_ORDER_ID}!`);

  } catch (error) {
    console.error("❌ An error occurred during the specific seeding process:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

// Chạy script
seedManyItemsForSpecificOrder();