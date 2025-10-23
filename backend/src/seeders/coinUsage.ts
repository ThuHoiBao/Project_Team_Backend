import mongoose from "mongoose";
import { CoinUsage } from "../models/coinUsage.js";
import Order from "../models/Order.js"; // Import model Order

// --- Hàm tiện ích ---
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Seeder for CoinUsage collection.
 * This function assumes that Order and User data already exist.
 */
export const seedCoinUsage = async () => {
  try {
    // 1. Xóa dữ liệu CoinUsage cũ
    console.log("Clearing old CoinUsage data...");
    await CoinUsage.deleteMany({});
    console.log("-> Old CoinUsage data cleared.");

    // 2. Lấy tất cả các Order (chỉ lấy _id và user để tối ưu)
    const allOrders = await Order.find({}).select("_id user").lean();

    if (allOrders.length === 0) {
      console.warn("⚠️ No orders found. Cannot seed CoinUsage data.");
      return;
    }

    console.log(`Found ${allOrders.length} orders to potentially create CoinUsage for.`);

    const coinUsagesToCreate = [];

    // 3. Lặp qua các order và tạo dữ liệu CoinUsage một cách ngẫu nhiên
    for (const order of allOrders) {
      // Giả lập tỉ lệ 50% đơn hàng có sử dụng coin cho thực tế
      if (Math.random() > 0.5) {
        const newCoinUsage = {
          user: order.user, // Lấy user từ chính order đó
          order: order._id, // Lấy _id của order
          coinsUsed: getRandomInt(10, 500), // Sử dụng từ 10 đến 500 coin
        };
        coinUsagesToCreate.push(newCoinUsage);
      }
    }

    // 4. Thêm dữ liệu vào database
    if (coinUsagesToCreate.length > 0) {
      console.log(`Creating ${coinUsagesToCreate.length} new CoinUsage records...`);
      await CoinUsage.insertMany(coinUsagesToCreate);
      console.log("✅ Successfully seeded CoinUsage data!");
    } else {
      console.log("No new CoinUsage records were created in this run.");
    }

  } catch (error) {
    console.error("❌ Error seeding CoinUsage data:", error);
    throw error; // Ném lỗi ra ngoài để file seeder chính có thể bắt được
  }
};