import express from "express";
import { sendChatMessage, getChatHistory,saveSingleMessage } from "../controller/chatController";

const router = express.Router();

// API gửi tin nhắn và nhận phản hồi
// router.post("/send-message", sendChatMessage);

// // API lấy lịch sử trò chuyện của người dùng
// router.get("/history/:userId", getChatHistory);
// router.post("/save-message", saveSingleMessage);

export default router;
