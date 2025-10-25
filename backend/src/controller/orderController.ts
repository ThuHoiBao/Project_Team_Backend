// controllers/orderController.ts

import { Request, Response } from 'express';
import { getOrdersByUserId } from '../service/orderService.ts';
import { cancelOrder } from "../service/orderService";

export const cancelOrderController = async (req: Request, res: Response) => {
  try {
    const { userId, orderId } = req.body; // nhận từ body (hoặc req.params nếu bạn muốn)

    const order = await cancelOrder(userId, orderId);

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
    console.log(error)
  }
};
// Lấy tất cả đơn hàng của người dùng
export const getOrdersByUser = async (req: any, res: any) => {
  try {
    const userId = req.user.id; // Lấy userId từ thông tin người dùng (được xác thực trước đó)
    console.log(userId); // In ra userId để kiểm tra

    // Lấy các đơn hàng của người dùng từ database
    const orders = await getOrdersByUserId(userId);

    // Gán userId vào response trả về
    const response = {
      userId: userId,  // Thêm userId vào response
      orders: orders   // Danh sách đơn hàng
    };

    
    res.json(response);  // Trả về response với userId và danh sách đơn hàng
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

