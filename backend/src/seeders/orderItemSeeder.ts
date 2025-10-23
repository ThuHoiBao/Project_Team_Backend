import mongoose from "mongoose";
import Order from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import Product from "../models/Product.js"; // <-- Đảm bảo đường dẫn này đúng


const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const reseedOrderItemsForSpecificOrder = async () => {
  try {
    const TARGET_ORDER_ID = "68f70c6263a1e7ad25341ab9";
    const NUMBER_OF_ITEMS_TO_CREATE = 8; // Số lượng item mới muốn tạo cho đơn hàng này

    console.log(`Re-seeding OrderItems for Order ID: ${TARGET_ORDER_ID}`);

    // 1. Kiểm tra xem có sản phẩm nào trong DB không
    const allProducts = await Product.find({}).lean();
    if (allProducts.length === 0) {
      console.error("No products found in the database. Please seed products first.");
      return;
    }
    console.log(`Found ${allProducts.length} products to use for creating items.`);

    // 2. Dọn dẹp OrderItems cũ của đơn hàng này
    console.log("Cleaning up old OrderItems for the target order...");
    const { deletedCount } = await OrderItem.deleteMany({ order: TARGET_ORDER_ID });
    console.log(`-> Deleted ${deletedCount} old item(s).`);

    // 3. Tạo các OrderItem mới trong bộ nhớ bằng cách dùng sản phẩm đã faker
    const itemsToCreate = [];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    for (let i = 0; i < NUMBER_OF_ITEMS_TO_CREATE; i++) {
      const randomProduct = getRandomItem(allProducts); // Lấy sản phẩm ngẫu nhiên
      const newItem = {
        order: TARGET_ORDER_ID,
        product: randomProduct._id,
        price: randomProduct.price, // Lấy giá từ sản phẩm gốc
        size: getRandomItem(sizes),
        quantity: getRandomInt(1, 3), // Mỗi món có số lượng từ 1-3
      };
      itemsToCreate.push(newItem);
    }

    // 4. Thêm đồng loạt các OrderItem mới vào DB
    console.log(`Creating ${itemsToCreate.length} new OrderItems...`);
    const createdItems = await OrderItem.insertMany(itemsToCreate);
    const newItemIds = createdItems.map(item => item._id);

    // 5. Cập nhật lại Order mục tiêu với mảng ID mới
    console.log("Updating target Order with the new item list...");
    const updateResult = await Order.updateOne(
      { _id: TARGET_ORDER_ID },
      { $set: { orderItems: newItemIds } }
    );

    if (updateResult.modifiedCount > 0) {
        console.log(`Successfully re-seeded ${NUMBER_OF_ITEMS_TO_CREATE} items for order ${TARGET_ORDER_ID}!`);
    } else {
        console.warn(`OrderItems were created, but the target Order (${TARGET_ORDER_ID}) was not found or not updated.`);
    }

  } catch (error) {
    console.error("An error occurred during the re-seeding process:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

reseedOrderItemsForSpecificOrder();