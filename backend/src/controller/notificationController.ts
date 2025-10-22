import { Request, Response } from "express";
import Notification from "../models/Notification";
import User from "../models/user";
import { getIO } from "../socket";

// ✅ Gửi thông báo đến tất cả user
export const broadcastNotification = async (req: Request, res: Response) => {
    console.log("📩 Nhận yêu cầu broadcast từ admin:", req.body);

    try {
        const { title, message, type } = req.body;
        const io = getIO();
        const users = await User.find();
        const notifications: any[] = [];

        for (const user of users) {
            const noti = await Notification.create({
                userId: user._id,
                title,
                message,
                type,
                isRead: false,
            });
            notifications.push(noti);

            // Gửi socket real-time nếu user đang online
            const socketId = (global as any).userSocketMap?.[user._id.toString()];
            console.log("ddd", socketId);
            
            if (socketId) {
                io.to(socketId).emit("notification", noti);
                console.log(`📤 Sent notification to user ${user._id}`);
            } else {
                console.log(`⚠️ User ${user._id} not connected`);
            }
        }

        return res.json({
            message: "Đã gửi thông báo đến tất cả user",
            count: notifications.length,
        });
    } catch (error) {
        console.error("Broadcast error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ✅ Lấy danh sách thông báo của 1 user
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const notis = await Notification.find({ userId }).sort({ createdAt: -1 });
        return res.json(notis);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

// ✅ Đánh dấu thông báo là đã đọc
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const noti = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );
        return res.json(noti);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};
