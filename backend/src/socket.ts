import { Server } from "socket.io";
import http from "http";

let io: Server;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  (global as any).userSocketMap = {};

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("register", (userId: string) => {
      (global as any).userSocketMap[userId] = socket.id;
      console.log(`📡 User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      for (const [uid, sid] of Object.entries((global as any).userSocketMap)) {
        if (sid === socket.id) delete (global as any).userSocketMap[uid];
      }
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
}

// 👇 Export io để các file khác (như NotificationController) dùng emit
export function getIO() {
  if (!io) throw new Error("Socket.io chưa được khởi tạo!");
  return io;
}

