import mongoose from "mongoose";
import Order from "../models/Order.js";   // Import model Order
import { Coupon } from "../models/Coupon.js"; // Import model Coupon


// --- Hàm tiện ích để lấy phần tử ngẫu nhiên từ mảng ---
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const addCouponsToOrders = async () => {
  try {
    // 1. Lấy tất cả các coupon có sẵn
    const allCoupons = await Coupon.find({}).select("_id").lean();

    if (allCoupons.length === 0) {
      console.warn("No coupons found in the database. Cannot update orders.");
      return;
    }
    console.log(`Found ${allCoupons.length} available coupons.`);

    // 2. Lấy tất cả các order chưa có coupon
    // Điều kiện { coupon: { $in: [null, undefined] } } sẽ tìm tất cả document không có trường coupon hoặc trường coupon có giá trị null
    const ordersToUpdate = await Order.find({ coupon: { $in: [null, undefined] } });

    if (ordersToUpdate.length === 0) {
      console.log(" All orders already have coupons or there are no orders to update.");
      return;
    }
    console.log(`Found ${ordersToUpdate.length} orders without a coupon. Starting update...`);

    const updateOperations = [];

    // 3. Chuẩn bị thao tác cập nhật cho mỗi order
    for (const order of ordersToUpdate) {
      // Giả lập tỉ lệ 70% các đơn hàng được áp dụng coupon
      if (Math.random() > 0.3) {
        const randomCoupon = getRandomItem(allCoupons);
        
        updateOperations.push({
          updateOne: {
            filter: { _id: order._id },
            update: { $set: { coupon: randomCoupon._id } },
          },
        });
      }
    }

    // 4. Thực hiện cập nhật hàng loạt
    if (updateOperations.length > 0) {
      console.log(`Applying coupons to ${updateOperations.length} orders...`);
      const result = await Order.bulkWrite(updateOperations);
      console.log(`✅ Successfully updated ${result.modifiedCount} orders.`);
    } else {
      console.log("No orders were selected to be updated in this run.");
    }

  } catch (error) {
    console.error(" An error occurred while updating orders:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};
