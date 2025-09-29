import mongoose from "mongoose";
import {OrderItem} from "../models/OrderItem";
import {Feedback} from "../models/Feedback";
import Product from "../models/Product"; 

const comments = [
  "Sản phẩm rất tốt, chất lượng vượt mong đợi!",
  "Đóng gói cẩn thận, giao hàng nhanh.",
  "Hàng ổn trong tầm giá, sẽ mua lại.",
  "Màu sắc không giống hình lắm nhưng vẫn chấp nhận được.",
  "Chất liệu hơi mỏng, mong shop cải thiện.",
  "Size vừa vặn, mặc thoải mái.",
  "Giá hợp lý, chất lượng tốt.",
  "Nhân viên giao hàng thân thiện.",
  "Hài lòng với dịch vụ chăm sóc khách hàng.",
  "Sẽ giới thiệu cho bạn bè.",
];

async function seedFeedback() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/DB_02");
    console.log("✅ Connected to MongoDB");

    const orderItems = await OrderItem.find({});
    console.log(`🔍 Tìm thấy ${orderItems.length} order items`);

    for (const item of orderItems) {
      // Nếu đã có feedback thì bỏ qua
      if (item.feedback) continue;

      const randomComment =
        comments[Math.floor(Math.random() * comments.length)];
      const randomRating = Math.floor(Math.random() * 5) + 1; // 1–5

      // Tạo feedback mới
      const feedback = await Feedback.create({
        OrderItem: item._id,
        rating: randomRating,
        comment: randomComment,
      });

      // Gắn feedback vào OrderItem
      item.feedback = feedback._id as mongoose.Types.ObjectId;
      await item.save();
    }

    console.log("🎉 Feedback seeding completed.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error seeding feedback:", error);
    await mongoose.disconnect();
  }
}

seedFeedback();
