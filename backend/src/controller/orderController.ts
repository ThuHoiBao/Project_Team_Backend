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
export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId; // Lấy userId từ params
    const orders = await getOrdersByUserId(userId);
    res.json(orders);  // Trả về danh sách các đơn hàng
  } catch (error : any) {
    res.status(500).json({ message: error.message });
  }
};
