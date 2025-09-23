// controllers/orderController.ts

import { Request, Response } from 'express';
import { getOrdersByUserId } from '../service/orderService.ts';

// Lấy tất cả đơn hàng của người dùng
export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId; // Lấy userId từ params
    const orders = await getOrdersByUserId(userId);
    res.json(orders);  // Trả về danh sách các đơn hàng
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
