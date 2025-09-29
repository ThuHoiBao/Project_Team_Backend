import mongoose from "mongoose";
import {Order} from "../models/Order";
import {OrderItem} from "../models/OrderItem";
import User from "../models/User";
import Product from "../models/Product";
import {AddressDelivery} from "../models/AddressDelivery";

async function seedOrders() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/DB_02");

    // Xoá dữ liệu cũ
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    console.log("Đã xoá dữ liệu Order & OrderItem cũ ✅");

    const users = await User.find({});
    console.log(`Tìm thấy ${users.length} user`);

    for (const user of users) {
      // Lấy addressDelivery đầu tiên
      const addressDelivery = await AddressDelivery.findOne({ user: user._id });
      if (!addressDelivery) {
        console.log(`⚠️ User ${user._id} không có addressDelivery -> bỏ qua`);
        continue;
      }

      // Lấy 5 sản phẩm bất kỳ
      const products = await Product.aggregate([{ $sample: { size: 5 } }]);

      // Tạo Order trước
      const order = await Order.create({
        user: user._id,
        addressDelivery: addressDelivery._id,
        orderItems: [],
      });

      // Tạo OrderItem cho mỗi product
      const orderItems = [];
      for (const product of products) {
        const item = await OrderItem.create({
          order: order._id,
          product: product._id,
          price: product.price || Math.floor(Math.random() * 500) + 100, // nếu chưa có price thì random
          size: "M", // hoặc chọn random trong enum Size nếu bạn có
          quantity: Math.floor(Math.random() * 3) + 1, // 1–3
          feedback: null,
        });
        orderItems.push(item._id);
      }

      // Cập nhật orderItems vào Order
      await Order.findByIdAndUpdate(order._id, {
        $set: { orderItems },
      });

      console.log(`✅ Seeded order cho user ${user._id}`);
    }

    await mongoose.disconnect();
    console.log("Seeder Order xong 🎉");
  } catch (error) {
    console.error("❌ Lỗi Order Seeder:", error);
  }
}

seedOrders();
