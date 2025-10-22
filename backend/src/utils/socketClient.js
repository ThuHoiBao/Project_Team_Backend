import { io } from "socket.io-client";

const NEST_GATEWAY_URL = "http://localhost:9090"; // URL NestJS (cổng admin)

const socket = io(NEST_GATEWAY_URL, {
  transports: ["websocket"],
  reconnection: true,
});

socket.on("connect", () => {
  console.log("✅ Connected to NestJS WebSocket server");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from NestJS WebSocket server");
});

socket.on("user_notification", (data) => {
  console.log("📢 Nhận thông báo mới từ admin:", data);
  // Bạn có thể:
  // - Lưu DB
  // - Gửi mail
  // - Emit ra FE user (qua socket riêng hoặc SSE)
});

export default socket;
