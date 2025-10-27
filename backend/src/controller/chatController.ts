// import { Request, Response } from "express";
// import ChatService from "../service/chatService";

// export const sendChatMessage = async (req: Request, res: Response) => {
//   try {
//     const {  message } = req.body;
//     const userId= req.user.id;
//     console.log("lllllllllll sendChatMessage :"+userId)

//     // Lưu tin nhắn của user
//     const userMessage = await ChatService.saveMessage(userId, message, "user");

//     // Gọi API Gemini để chatbot trả lời
//     const botResponse = await ChatService.getChatbotResponse(message);
    
//     // Lưu tin nhắn của chatbot
//     const botMessage = await ChatService.saveMessage(userId, botResponse, "chatbot");

//     res.status(200).json({
//       userMessage,
//       botMessage,
//     });
//   } catch (error: any) {
//     console.error(error);
//     res.status(500).json({ message: "Something went wrong." });
//   }
// };

// export const getChatHistory = async (req: Request, res: Response) => {
//   try {
//     const userId= req.user.id;
//     console.log("lllllllllll getChatHistory :"+userId)
//     const chatHistory = await ChatService.getChatHistory(userId);
//     const response = {
//       userId: userId,  // Thêm userId vào response
//       chatHistory: chatHistory   // Danh sách đơn hàng
//     };

//     res.status(200).json(response);
//   } catch (error: any) {
//     console.error(error);
//     res.status(500).json({ message: "Unable to fetch chat history." });
//   }
// };

// export const saveSingleMessage = async (req: Request, res: Response) => {
//   try {
//     const {  message, role } = req.body;
//     const userId= req.user.id;
//     console.log("lllllllllll saveSingleMessage :"+userId)
//     if(!userId || !message || !role) return res.status(400).json({ message: "Missing fields" });
//     const saved = await ChatService.saveMessage(userId, message, role); // bạn đã có hàm này
//     res.status(200).json(saved);
//   } catch (err:any) {
//     console.error(err);
//     res.status(500).json({ message: "Unable to save message" });
//   }
// };

// controller/chatController.ts
import { Request, Response } from "express";
import * as ChatService from "../service/chatService";

export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const { message,userId } = req.body;
   // 🔹 userId có thể undefined nếu chưa đăng nhập
    console.log ("ccccccc"+userId)
    let userMsg, botMsg;

    // Nếu userId tồn tại → lưu message
    if (userId) {
      userMsg = await ChatService.saveMessage(userId, message, "user");
    } else {
      userMsg = { role: "user", comment: message, createdAt: new Date() };
    }

    // Lấy trả lời từ chatbot
    const botReply = await ChatService.getChatbotResponse(message);

    if (userId) {
      botMsg = await ChatService.saveMessage(userId, botReply, "chatbot");
    } else {
      botMsg = { role: "chatbot", comment: botReply, createdAt: new Date() };
    }

    res.status(200).json({ userMsg, botMsg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending chat" });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(200).json({ chatHistory: [] }); // 🔹 chưa đăng nhập → trả về rỗng

    const chatHistory = await ChatService.getChatHistory(userId);
    res.status(200).json({ userId, chatHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};
