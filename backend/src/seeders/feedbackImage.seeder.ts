import mongoose from "mongoose";
import { ImageFeedback } from "../models/ImageFeedback";  // import model feedback image
import {OrderItem} from "../models/OrderItem";             // model OrderItem

async function seedFeedbackImages() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/DB_02");

    // Xoá dữ liệu cũ
    await ImageFeedback.deleteMany({});
    console.log("Đã xoá dữ liệu feedback image cũ ✅");

    // Lấy tất cả OrderItem (feedback)
    const orderItems = await OrderItem.find({});
    console.log(`Tìm thấy ${orderItems.length} order items`);

    for (const orderItem of orderItems) {
      const imagesToInsert = [
        {
          imageFeedback: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIfl5UKosKZq6mITnyLNmqdV0oGHEN6nDFgg&s",
          feedback: orderItem._id,
        },
        {
          imageFeedback: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_sIsZbM7n6WhWQ0a3ENWIN4V-rPQ4UKQteg&s",
          feedback: orderItem._id,
        },
      ];

      // Thêm ảnh feedback
      await ImageFeedback.insertMany(imagesToInsert);
    }

    await mongoose.disconnect();
    console.log("Seeder FeedbackImage xong 🎉");
  } catch (error) {
    console.error("Lỗi FeedbackImage Seeder:", error);
  }
}

seedFeedbackImages();
