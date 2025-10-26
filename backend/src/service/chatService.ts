import Chat, { ChatRole } from "../models/chat";
import axios from "axios";

// API Gemini URL
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCsg6uCoLormzHk3Or01l_HPpGN4aguovI";

// Lưu tin nhắn vào MongoDB
const saveMessage = async (userId: string, message: string, role: ChatRole) => {
  const chatMessage = new Chat({
    userId,
    comment: message,
    role,
  });

  return await chatMessage.save();
};

// Gửi tin nhắn đến API Gemini để chatbot trả lời
const getChatbotResponse = async (message: string) => {
  try {
    const response = await axios.post(API_URL, {
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const data = await response.data;
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, I couldn't understand your question.";
  }
};

// Lấy lịch sử tin nhắn của người dùng từ MongoDB
const getChatHistory = async (userId: string) => {
  return await Chat.find({ userId }).sort({ date: 1 });
};

export default { saveMessage, getChatbotResponse, getChatHistory };
