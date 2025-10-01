//feedbackRepository
import db from "../models/index.ts";
const { Order, Coin, Feedback, ImageFeedback, OrderItem, OrderStatus }: any = db;

export class FeedbackRepository {
  async createFeedback(orderItemId: string, rating: number, comment: string) {
    return await Feedback.create({
      OrderItem: orderItemId,
      rating,
      comment,
      date: new Date(),
    });
  }

async createImageFeedback(feedbackId: string, url: string) {
  return await ImageFeedback.create({ feedback: feedbackId, imageFeedback: url });
}

async updateImageFeedbackUrl(imageId: string, url: string) {
  return await ImageFeedback.findByIdAndUpdate(
    imageId,
    { imageFeedback: url },
    { new: true }
  );
}


  async updateOrderItemFeedback(orderItemId: string, feedbackId: string) {
    return await OrderItem.findByIdAndUpdate(
      orderItemId,
      { feedback: feedbackId },
      { new: true }
    );
  }

  async addCoin(userId: string, value: number) {
    return await Coin.create({ User: userId, value });
  }
  // Cập nhật coin cho user
  async updateUserCoin  (userId: string, amount: number) {
  return await Coin.findOneAndUpdate(
    { User: userId },
    { $inc: { value: amount } }, // cộng thêm coin
    { new: true, upsert: true }
  );
};
  async findOrderItem(orderItemId: string) {
    return await OrderItem.findById(orderItemId).populate("order");
  }

  async markOrderFeedbackedIfAllDone(orderId: string) {
    const order = await Order.findById(orderId).populate("orderItems");
    if (!order) return null;

    const allFeedbacked = order.orderItems.every((item: any) => item.feedback);
    if (allFeedbacked) {
      order.orderStatus = OrderStatus.FEEDBACKED;
      await order.save();
    }
    return order;
  }
  async updateOrderStatus(orderId: string, status: string)  {
    return await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );
  };

  // feedbackRepository.ts
// feedbackRepository.ts
async getFeedbacksByOrderId(orderId: string) {
  return await Order.findById(orderId)
    .populate({
      path: "user",
      select: "firstName lastName image"
    })
    .populate({
      path: "orderItems",
      populate: [
        {
          path: "product",
          populate: { path: "listImage", model: "ImageProduct" }
        },
        {
          path: "feedback" // ❌ đừng populate ImageFeedback ở đây
        }
      ]
    });
}


}
