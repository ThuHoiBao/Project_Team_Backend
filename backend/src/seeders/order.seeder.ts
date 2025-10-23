import mongoose from "mongoose";
import User from "../models/User";
import Product from "../models/Product"; // Sửa lại: Product là default export
import Order from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Payment, PaymentMethod } from "../models/Payment";
import { CoinUsage } from "../models/coinUsage";
import { AddressDelivery } from "../models/AddressDelivery";
import { Coin } from "../models/Coin"; // 👉 THÊM MỚI: Import model Coin

export const seedOrderDetails = async () => {
  try {
    console.log("Bắt đầu seeding chi tiết đơn hàng...");

    const users = await User.find({});
    const products = await Product.find({});

    if (users.length === 0) throw new Error("Không có User nào để tạo đơn hàng.");
    if (products.length === 0) throw new Error("Không có Product nào để tạo đơn hàng.");
    console.log(`-> Tìm thấy ${users.length} user và ${products.length} product.`);

    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Payment.deleteMany({});
    await CoinUsage.deleteMany({});
    console.log("-> Đã xóa dữ liệu cũ của Order, OrderItem, Payment, CoinUsage.");

    for (const user of users) {
      const addressDelivery = await AddressDelivery.findOne({ user: user._id });
      if (!addressDelivery) {
        console.log(`-> Bỏ qua user ${user.email} vì không có địa chỉ giao hàng.`);
        continue;
      }

      const order = await Order.create({
        user: user._id,
        addressDelivery: addressDelivery._id,
        orderStatus: "ORDERED",
      });

      const orderItemsIds = [];
      let totalAmount = 0;
      const productsInOrderCount = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, productsInOrderCount);

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 2) + 1;
        const item = await OrderItem.create({
          order: order._id,
          product: product._id,
          price: product.price,
          size: "M",
          quantity: quantity,
        });
        orderItemsIds.push(item._id);
        totalAmount += product.price * quantity;
      }

      // 👉 SỬA LỖI LOGIC: Thêm bước kiểm tra và trừ coin của user
      const coinsToUse = 50;
      const userCoinAccount = await Coin.findOne({ User: user._id }); // Tìm ví coin của user

      // Chỉ thực hiện khi user có ví, có đủ tiền, và tổng đơn hàng lớn hơn số coin dùng
      if (userCoinAccount && userCoinAccount.value >= coinsToUse && totalAmount > coinsToUse) {
        // 1. Cập nhật ví coin: Trừ đi số coin đã dùng
        await Coin.findByIdAndUpdate(userCoinAccount._id, { $inc: { value: -coinsToUse } });

        // 2. Ghi lại lịch sử dùng coin
        await CoinUsage.create({ user: user._id, order: order._id, coinsUsed: coinsToUse });

        // 3. Cập nhật tổng tiền
        totalAmount -= coinsToUse;
        console.log(`-> User ${user.email} đã dùng ${coinsToUse} coin.`);
      }

      // d. Tạo Payment với tổng tiền cuối cùng
      const payment = await Payment.create({
        order: order._id,
        paymentMethod: PaymentMethod.COD,
        amount: totalAmount,
        status: true,
      });

      // e. Cập nhật lại Order với các ID liên quan
      await Order.findByIdAndUpdate(order._id, {
        $set: {
          orderItems: orderItemsIds,
          payment: payment._id,
        },
      });

      console.log(`-> Đã tạo thành công đơn hàng cho user ${user.email}`);
    }

    console.log("✅ Seeding chi tiết đơn hàng thành công!");
  } catch (error) {
    throw error;
  }
};