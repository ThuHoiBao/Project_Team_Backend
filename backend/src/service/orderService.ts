
import { OrderResponseDTO } from '../dto/responseDTO/OrderResponseDTO';
import { OrderItemResponseDTO } from '../dto/responseDTO/OrderItemResponseDTO';
import db from "../models/index.ts";
const {Order}:any = db;
      
// Lấy tất cả đơn hàng của người dùng theo userId
export const getOrdersByUserId = async (userId: string): Promise<OrderResponseDTO[]> => {
  try {
    const orders = await Order.find({ user: userId })
      .populate("addressDelivery")
      .populate("payment")
      .populate("coupon")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: { path: "listImage" }
        }
      });

    if (!orders || orders.length === 0) {
      throw new Error("No orders found for this user");
    }

    return orders.map((order: any) => {
      const orderResponse = new OrderResponseDTO();
      orderResponse.id = order.id;
      orderResponse.orderStatus = order.orderStatus;
      orderResponse.orderDate = order.orderDate;

      orderResponse.nameUser = order.addressDelivery?.fullName || "";
      orderResponse.address = order.addressDelivery?.address || "";
      orderResponse.phoneNumber = order.addressDelivery?.phoneNumber || "";

      orderResponse.paymentMethod = order.payment?.paymentMethod || "";
      orderResponse.amount = order.payment?.amount || "";
      orderResponse.discount = order.coupon?.discountValue || 0;

      let totalPrice = 0;

      orderResponse.orderItems = order.orderItems.map((item: any) => {
        const dto = new OrderItemResponseDTO();
        dto.id = item.id;
        dto.price = item.price;
        dto.quantity = item.quantity.toString();
        dto.size = item.size;
        dto.productName = item.product?.productName || "";

        let firstImage = "";
        if (item.product?.listImage?.length > 0) {
          firstImage = item.product.listImage[0].imageProduct;
        }
        dto.image = firstImage;

        totalPrice += item.price * item.quantity;
        return dto;
      });

      orderResponse.totalPrice = totalPrice;
      return orderResponse.toPlain();
    });
  } catch (error: any) {
    throw new Error(`Error fetching orders for user: ${error.message}`);
  }
};
