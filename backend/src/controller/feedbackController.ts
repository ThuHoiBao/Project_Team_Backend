// feedbackController.ts
import { Request, Response } from "express";
import multer from "multer";
import { uploadImageToGCS } from "../service/uploadImageService.ts"; // import hàm upload

// ⚡ cấu hình multer: lưu file vào memory
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/**
 * Controller nhận feedbacks từ frontend + upload ảnh lên GCS
 */
export const bulkFeedback = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const files = req.files as Express.Multer.File[];

    // Gom thành mảng feedbacks[]
    const feedbacks: any[] = [];

    // Parse body
    Object.keys(body).forEach((key) => {
      const match = key.match(/feedbacks\[(\d+)\]\.(.+)/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];

        if (!feedbacks[index]) {
          feedbacks[index] = { comment: "", rating: 0, orderItemId: "", images: [] };
        }

        if (field === "rating") {
          feedbacks[index][field] = parseInt(body[key], 10);
        } else {
          feedbacks[index][field] = body[key];
        }
      }
    });

    // ✅ Upload file lên GCS
    if (Array.isArray(files)) {
      for (const file of files) {
        const match = file.fieldname.match(/feedbacks\[(\d+)\]\.images/);
        if (match) {
          const index = parseInt(match[1], 10);
          const orderItemId = feedbacks[index]?.orderItemId;

          if (orderItemId) {
            // 🔥 Tạo tên file: orderItemId_originalname
            const fileName = `${orderItemId}_${file.originalname}`;
            const url = await uploadImageToGCS(file.buffer, fileName);

            // Push url vào feedbacks[index].images
            feedbacks[index].images.push({
              url,
              filename: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
            });
          }
        }
      }
    }

    // ✅ Log feedbacks cuối cùng
    console.log("✅ Feedbacks sau khi upload GCS:");
    console.dir(feedbacks, { depth: null });

    return res.json({ message: "Upload feedback thành công ✅", feedbacks });
  } catch (err: any) {
    console.error("❌ Lỗi bulkFeedback:", err);
    return res.status(500).json({ message: "Có lỗi server" });
  }
};
