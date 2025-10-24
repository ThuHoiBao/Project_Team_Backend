// repository/orderRepository.ts
import { IOrder } from "../models/Order";
import db from "../models/index.ts";
const {Order,Coin,ProductSize,Product,Payment }:any = db;

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
// Tìm order theo orderId và populate payment, user, và orderItems
export const findOrderByIdOne = async (orderId: string) => {
  return await Order.findById(orderId)
    .populate("payment")
    .populate("user")
    .populate({
      path: "orderItems", // Populate orderItems
      populate: {
        path: "product", // Populate product trong orderItem
        select: "productName", // Chọn các trường bạn cần từ Product
      },
    });
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

// repository/orderRepository.ts
// Cập nhật số lượng trong ProductSize khi hủy đơn hàng
export const updateProductSizeQuantity = async (orderItems: any[]) => {
  console.log(orderItems);  // Kiểm tra dữ liệu của orderItems
  try {
    for (const orderItem of orderItems) {
      const { size, quantity, product } = orderItem;

      // Kiểm tra nếu dữ liệu hợp lệ
      console.log(`Processing orderItem: ${JSON.stringify(orderItem)}`);
      if (!size || !quantity || !product) {
        console.log(`Invalid orderItem data: size: ${size}, quantity: ${quantity}, product: ${product}`);
        continue; // Bỏ qua nếu dữ liệu không hợp lệ
      }

      // Tìm ProductSize dựa trên product và size
      const productSize = await ProductSize.findOne({
        product: product,
        size: size,
      });

      if (productSize) {
        // Cộng thêm quantity vào ProductSize
        productSize.quantity += quantity;
        await productSize.save(); // Lưu lại thay đổi vào ProductSize
        console.log(`Updated ProductSize for product: ${product} and size: ${size}`);
      } else {
        console.log(`ProductSize not found for product: ${product} and size: ${size}`);
      }
    }
  } catch (error) {
    console.error("Error updating ProductSize:", error);
    throw new Error("Error updating ProductSize");
  }
};
