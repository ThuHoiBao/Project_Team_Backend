// repository/orderRepository.ts

import { Order } from '../models/Order';
import { IOrder } from '../models/Order';

// Lấy tất cả đơn hàng của người dùng theo userId
export const findOrdersByUserId = async (userId: string): Promise<IOrder[]> => {
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
