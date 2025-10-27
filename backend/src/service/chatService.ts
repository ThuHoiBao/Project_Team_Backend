// import Chat, { ChatRole } from "../models/chat";
// import axios from "axios";

// // API Gemini URL
// const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDvTgPpiOUcmeEFQBoSg6CvNyksz53vkpw";

// // Lưu tin nhắn vào MongoDB
// const saveMessage = async (userId: string, message: string, role: ChatRole) => {
//   const chatMessage = new Chat({
//     userId,
//     comment: message,
//     role,
//   });

//   return await chatMessage.save();
// };

// // Gửi tin nhắn đến API Gemini để chatbot trả lời
// const getChatbotResponse = async (message: string) => {
//   try {
//     const response = await axios.post(API_URL, {
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: message }],
//         },
//       ],
//     });

//     const data = await response.data;
//     return data.candidates[0].content.parts[0].text;
//   } catch (error) {
//     console.error("Error calling Gemini API:", error);
//     return "I'm sorry, I couldn't understand your question.";
//   }
// };

// // Lấy lịch sử tin nhắn của người dùng từ MongoDB
// const getChatHistory = async (userId: string) => {
//   return await Chat.find({ userId }).sort({ date: 1 });
// };

// export default { saveMessage, getChatbotResponse, getChatHistory };
import Chat, { ChatRole } from "../models/chat";
import axios from "axios";

const API_KEY = "AIzaSyDvTgPpiOUcmeEFQBoSg6CvNyksz53vkpw";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// 🔹 Dữ liệu train nội bộ của shop
// trainingData.ts
export const trainingData = [
  // 🏪 Giới thiệu chung
  {
    question: [
      "ute shop là gì",
      "shop bạn là ai",
      "bạn là chatbot gì",
      "shop hoạt động ở đâu",
      "shop có thật không"
    ],
    answer:
      "UTE Shop là cửa hàng thời trang chính thức của Trường Đại học Sư phạm Kỹ thuật TP.HCM 🎓. Shop chuyên bán áo khoác, áo thun, áo sơ mi và phụ kiện các khoa. Mình là Chatbot của UTE Shop, giúp bạn tra cứu thông tin, đặt hàng và hỗ trợ nhanh chóng 🤖."
  },

  // 🧥 Danh mục sản phẩm
  {
    question: [
      "shop bán gì",
      "shop có những loại áo nào",
      "danh mục sản phẩm",
      "shop có những loại hàng gì",
      "các loại áo ở shop"
    ],
    answer:
      "UTE Shop hiện có 3 danh mục chính:\n1️⃣ Áo khoác khoa (logo từng khoa)\n2️⃣ Áo thun khoa (cotton 100%)\n3️⃣ Áo sơ mi khoa (thêu logo tinh tế)\nNgoài ra, còn có phụ kiện như nón, túi tote, móc khóa sinh viên 🎒."
  },

  // 🔥 Sản phẩm bán chạy
  {
    question: [
      "sản phẩm bán chạy",
      "áo nào được mua nhiều nhất",
      "top sản phẩm nổi bật",
      "áo hot trend",
      "sản phẩm hot"
    ],
    answer:
      "Các sản phẩm bán chạy nhất tại UTE Shop gồm:\n⭐ Áo khoác khoa Công Nghệ Thông Tin (màu navy)\n⭐ Áo thun khoa Cơ Khí (đen)\n⭐ Áo sơ mi khoa Kinh Tế (trắng)\nTất cả đều là lựa chọn hàng đầu của sinh viên UTE 💙."
  },

  // 💰 Giá bán & size
  {
    question: [
      "áo có mấy size",
      "size nào vừa",
      "bảng size áo",
      "giá bao nhiêu",
      "áo thun giá bao nhiêu"
    ],
    answer:
      "Các sản phẩm của UTE Shop có đủ size: S, M, L, XL, XXL.\n💸 Giá tham khảo:\n- Áo khoác: 250.000đ\n- Áo thun: 180.000đ\n- Áo sơ mi: 230.000đ\nTùy chương trình khuyến mãi, giá có thể thay đổi nhẹ nhé!"
  },

  // 👕 Áo khoác
  {
    question: [
      "áo khoác có mấy loại",
      "áo khoác của khoa nào",
      "chất liệu áo khoác",
      "áo khoác có logo không"
    ],
    answer:
      "Áo khoác của UTE Shop gồm nhiều mẫu theo từng khoa (CNTT, Cơ Khí, Điện - Điện Tử, Kinh Tế...). Chất liệu nỉ bông dày dặn, thấm hút mồ hôi, logo khoa được in/thêu rõ nét 🧥."
  },

  // 👕 Áo thun
  {
    question: [
      "áo thun của shop có mấy màu",
      "áo thun chất liệu gì",
      "áo thun có in logo không",
      "áo thun khoa cntt"
    ],
    answer:
      "Áo thun UTE Shop làm bằng cotton 100%, co giãn tốt, màu sắc đa dạng (đen, trắng, xanh navy, đỏ đô). Có in logo các khoa như CNTT, Cơ Khí, Điện - Điện Tử, Kinh Tế... 👕."
  },

  // 👔 Áo sơ mi
  {
    question: [
      "áo sơ mi có mấy mẫu",
      "áo sơ mi có màu gì",
      "áo sơ mi của khoa nào",
      "áo sơ mi form gì"
    ],
    answer:
      "Áo sơ mi UTE Shop có mẫu tay ngắn và tay dài, màu trắng hoặc xanh nhạt, form slimfit lịch sự. Logo khoa được thêu tinh tế ở ngực trái 👔."
  },

  // 📦 Đặt hàng
  {
    question: [
      "làm sao đặt hàng",
      "mua hàng như thế nào",
      "shop có bán online không",
      "hướng dẫn đặt áo"
    ],
    answer:
      "Bạn có thể đặt hàng qua app hoặc website của UTE Shop. Chọn sản phẩm → chọn size → thêm vào giỏ hàng → xác nhận đơn.\nShop hỗ trợ thanh toán khi nhận hàng (COD) hoặc chuyển khoản 💳."
  },

  // 🚚 Vận chuyển
  {
    question: [
      "shop giao hàng ở đâu",
      "phí ship bao nhiêu",
      "bao lâu nhận hàng",
      "giao hàng tận nơi không"
    ],
    answer:
      "Shop giao hàng toàn quốc 🇻🇳. Thời gian giao hàng:\n- TP.HCM: 1–3 ngày\n- Ngoại tỉnh: 3–5 ngày\nPhí ship từ 25.000đ tuỳ khu vực. Đơn từ 500.000đ được miễn phí vận chuyển 🚚."
  },
  {
    question: [
      "shop mở cửa lúc mấy giờ",
      "giờ làm việc của shop",
      "shop có làm cuối tuần không",
      "ngày nghỉ của shop",
      "khi nào shop đóng cửa"
    ],
    answer:
      "⏰ Giờ làm việc của UTE Shop:\n- Thứ 2 đến Thứ 7: 8h00 – 18h00\n- Chủ nhật: nghỉ.\nBạn vẫn có thể đặt hàng online 24/7, shop sẽ xử lý đơn vào giờ hành chính nhé!"
  },
  // 🔁 Đổi trả
  {
    question: [
      "đổi hàng sao",
      "chính sách đổi trả",
      "hàng lỗi có đổi không",
      "đổi size được không"
    ],
    answer:
      "UTE Shop hỗ trợ đổi hàng trong vòng 3 ngày nếu sản phẩm lỗi, nhầm size hoặc chưa sử dụng. Sản phẩm cần còn nguyên tag, bao bì và chưa giặt nhé 🔁."
  },

  // 🧺 Khuyến mãi
  {
    question: [
      "có khuyến mãi không",
      "giảm giá bao nhiêu",
      "chương trình sale",
      "combo áo"
    ],
    answer:
      "Shop thường có các chương trình khuyến mãi như:\n🎁 Mua 2 áo thun tặng 1 móc khóa\n🎁 Giảm 10% khi mua combo áo khoác + áo thun\n🎁 Free ship đơn hàng trên 500.000đ.\nBạn có thể theo dõi fanpage để cập nhật ưu đãi mới nhất!"
  },

  // 📞 Liên hệ & hỗ trợ
  {
    question: [
      "liên hệ shop thế nào",
      "shop có fanpage không",
      "số điện thoại shop",
      "địa chỉ shop"
    ],
    answer:
      "UTE Shop địa chỉ: 01 Võ Văn Ngân, Thủ Đức, TP.HCM 🏬.\nHotline: 0977 123 456 📞.\nFanpage: facebook.com/uteshop.\nEmail: support@uteshop.vn."
  },

  // ❓ Hỏi ngoài phạm vi
  {
    question: [
      "hôm nay thời tiết sao",
      "ai là hiệu trưởng ute",
      "shop có bán điện thoại không"
    ],
    answer:
      "Xin lỗi 🙏 Mình chỉ có thể trả lời các câu hỏi liên quan đến sản phẩm, dịch vụ và chính sách của UTE Shop thôi nhé!"
  },

  // 💬 Giao tiếp tự nhiên
  {
    question: ["xin chào", "chào shop", "hi", "hello", "bạn ơi"],
    answer: "Chào bạn 👋 Mình là Chatbot của UTE Shop, mình có thể giúp gì cho bạn hôm nay nè?"
  },
  {
    question: ["cảm ơn", "thank you", "thanks"],
    answer: "Không có gì ạ 💙 Cảm ơn bạn đã ghé UTE Shop!"
  },
  {
    question: ["tạm biệt", "bye", "bái bai"],
    answer: "Hẹn gặp lại bạn nha 👋 Chúc bạn một ngày vui vẻ!"
  }
];


// 🔹 Tạo prompt giới hạn phạm vi trả lời
const buildPrompt = (message: string) => {
  const dataText = trainingData
    .map(t => t.question.map(q => `Q: ${q}\nA: ${t.answer}`).join("\n"))
    .join("\n");
  return `
Bạn là chatbot của UTE Fashion Shop.
Chỉ trả lời trong phạm vi dữ liệu sau, không được bịa câu trả lời:

${dataText}

Nếu câu hỏi ngoài phạm vi: "Xin lỗi, câu hỏi này hiện không nằm trong phạm vi hỗ trợ. Bạn hãy thử lại nhé! 🙏"

Người dùng hỏi: "${message}"
`;
};

export const getChatbotResponse = async (message: string): Promise<string> => {
  try {
    // Kiểm tra nếu message trùng trainingData → trả lời trực tiếp
    const found = trainingData.find(t => t.question.some(q => message.toLowerCase().includes(q.toLowerCase())));
    if (found) return found.answer;

    // Nếu ngoài trainingData → gọi Gemini
    const response = await axios.post(API_URL, {
      contents: [{ role: "user", parts: [{ text: buildPrompt(message) }] }],
    });

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Xin lỗi, câu hỏi này hiện không nằm trong phạm vi hỗ trợ. Bạn hãy thử lại nhé! 🙏";
  } catch (err) {
    console.error(err);
    return "Xin lỗi, hệ thống gặp sự cố 😢";
  }
};

export const saveMessage = async (userId: string, message: string, role: ChatRole) => {
  const chat = new Chat({ userId, comment: message, role });
  return await chat.save();
};

export const getChatHistory = async (userId: string) => {
  return await Chat.find({ userId }).sort({ createdAt: 1 });
};
