import { Feedback } from "../models/Feedback";

export const getTopFeedbackNewest = async () => {
  try {
    const feedbacks = await Feedback.aggregate([
      // Join sang OrderItem
      {
        $lookup: {
          from: "orderitems",
          localField: "OrderItem",
          foreignField: "_id",
          as: "orderItem",
        },
      },
      { $unwind: "$orderItem" },

      // Join sang Order
      {
        $lookup: {
          from: "orders",
          localField: "orderItem.order",
          foreignField: "_id",
          as: "order",
        },
      },
      { $unwind: "$order" },

      // Join sang User
      {
        $lookup: {
          from: "users",
          localField: "order.user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Sắp xếp theo rating cao → mới nhất
      { $sort: { rating: -1, createdAt: -1 } },

      // Nhóm theo user → chỉ lấy feedback tốt nhất của mỗi user
      {
        $group: {
          _id: "$user._id",
          feedback: { $first: "$$ROOT" },
        },
      },

      // Lấy lại object feedback
      { $replaceRoot: { newRoot: "$feedback" } },

      // Giới hạn 6 user khác nhau
      { $limit: 6 },

      // Chỉ giữ field cần thiết
      {
        $project: {
          rating: 1,
          comment: 1,
          createdAt: 1,
          "user.firstName": 1,
          "user.lastName": 1,
        },
      },
    ]);

    if (!feedbacks || feedbacks.length === 0) {
      return {
        success: false,
        message: "Chưa có đánh giá nào",
      };
    }

    return {
      success: true,
      data: feedbacks,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
    };
  }
};
