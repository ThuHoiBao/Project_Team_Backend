// repository/orderRepository.ts
import { IOrder } from "../models/Order";
import db from "../models/index.ts";
const {Order,Coin}:any = db;

// Lấy tất cả đơn hàng của người dùng theo userId
export const findOrdersByUserId = async (userId: string) => {
  try {
    return await Order.find({ user: userId })
      .populate('orderItems')
      .populate('user')
      .populate('addressDelivery')
      .populate('coupon')
      .populate('payment');
  } catch (error) {
    throw new Error('Error finding orders by user ID');
  }
};
// Tìm order theo orderId và populate payment + user
export const findOrderById = async (orderId: string) => {
  return await Order.findById(orderId)
    .populate("payment")
    .populate("user");
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: string, status: string) => {
  return await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: status },
    { new: true }
  );
};

// Cập nhật coin cho user
export const updateUserCoin = async (userId: string, amount: number) => {
  return await Coin.findOneAndUpdate(
    { User: userId },
    { $inc: { value: amount } }, // cộng thêm coin
    { new: true, upsert: true }
  );
};