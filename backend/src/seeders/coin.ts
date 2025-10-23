import { Coin } from "../models/Coin";
import  User  from "../models/User"; // Import model User để lấy dữ liệu

export const seedCoins = async () => {
  try {
    console.log("Bắt đầu seeding Coin...");

    // 1. Lấy tất cả User đang có trong database
    const users = await User.find({});

    // 2. Kiểm tra an toàn: Dừng lại nếu không có user nào
    if (users.length === 0) {
      throw new Error("Không tìm thấy User nào trong database. Không thể seed Coin.");
    }
    console.log(`-> Tìm thấy ${users.length} user để tạo Coin.`);

    // 3. Xóa dữ liệu Coin cũ (tùy chọn, nhưng nên có để làm sạch)
    await Coin.deleteMany({});
    console.log("-> Đã xóa dữ liệu Coin cũ.");

    for (const user of users) {
      await Coin.findOneAndUpdate(
        { User: user._id },
        {
          User: user._id,
          value: Math.floor(Math.random() * 4001) + 1000, 
        },
        { upsert: true, new: true }
      );
    }

    console.log(`✅ Đã tạo/cập nhật Coin cho ${users.length} user thành công!`);
  } catch (error) {
    throw error;
  }
};