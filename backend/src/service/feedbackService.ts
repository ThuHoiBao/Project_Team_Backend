import  {FeedbackRepository}  from "../repository/feedbackRepository.ts";
import { uploadImageToGCS } from "../service/uploadImageService.ts";
import { OrderStatus } from "../models/Order";
import { FeedbackResponseDTO } from "../dto/responseDTO/FeedbackResponseDTO.ts";
import db from "../models/index.ts";
const { Order, Coin, Feedback, ImageFeedback, OrderItem }: any = db;
const feedbackRepo = new FeedbackRepository();

export class FeedbackService {
  async handleBulkFeedback(feedbacks: any[], files: Express.Multer.File[]) {
    for (let i = 0; i < feedbacks.length; i++) {
      const { comment, rating, orderItemId, userId ,orderId} = feedbacks[i];

      // tìm OrderItem
      const orderItem = await feedbackRepo.findOrderItem(orderItemId);
      if (!orderItem) throw new Error("OrderItem không tồn tại");

      //  Tạo Feedback
      const feedback = await feedbackRepo.createFeedback(orderItemId, rating, comment);
      await feedbackRepo.updateOrderItemFeedback(orderItemId, feedback.id);
      //  Upload ảnh
      const relatedFiles = files.filter(
        (f) => f.fieldname === `feedbacks[${i}].images`
      );
    for (const file of relatedFiles) {
      const imageRecord = await feedbackRepo.createImageFeedback(feedback.id, "");
      const filename = `${imageRecord.id}_${file.originalname}`;
      const url = await uploadImageToGCS(file.buffer, filename);
      await feedbackRepo.updateImageFeedbackUrl(imageRecord.id, url);
    }

      //  Cộng Xu nếu hợp lệ
    if (comment.length >= 50) {
    if (relatedFiles.length === 1) {
        await feedbackRepo.updateUserCoin(userId, 100); // đúng 1 ảnh → 100 Xu
    } else if (relatedFiles.length > 1) {
        await feedbackRepo.updateUserCoin(userId, 200); // nhiều hơn 1 ảnh → 200 Xu
    }
    }
      const orderObjectId = typeof orderId === "string"
    ? orderId
    : orderId._id || orderId;  // nếu là object, lấy _id

      //  Update trạng thái Order
      console.log(orderObjectId)
      await feedbackRepo.updateOrderStatus(orderObjectId,OrderStatus.FEEDBACKED); 
    }
  }
  async getFeedbacksByOrder(orderId: string): Promise<FeedbackResponseDTO[]> {
    const order = await feedbackRepo.getFeedbacksByOrderId(orderId);
    if (!order) throw new Error("Order không tồn tại");

    const user = order.user;
    const userName = `${user.firstName} ${user.lastName || ""}`.trim();
    const imageUser = user.image || "";

    const feedbackDTOs: FeedbackResponseDTO[] = [];

    for (const orderItem of order.orderItems) {
      if (!orderItem.feedback) continue; // chưa có feedback thì bỏ qua

      const fb = orderItem.feedback;
      const product = orderItem.product;

      const dto = new FeedbackResponseDTO();
      dto.rating = fb.rating.toString();
      dto.comment = fb.comment;
      dto.date = fb.date;
      dto.userName = userName;
      dto.imageUser = imageUser;
      dto.productName = product.productName;
      dto.imageProduct = product.listImage?.length
        ? product.listImage[0].imageProduct // lấy 1 ảnh đầu tiên
        : "";

      // mảng image feedback
      const imgs = await ImageFeedback.find({ feedback: fb._id });
      dto.imageFeedbacks = imgs.map((img:any) => img.imageFeedback);

      feedbackDTOs.push(dto);
    }

    return feedbackDTOs;
  }

}
