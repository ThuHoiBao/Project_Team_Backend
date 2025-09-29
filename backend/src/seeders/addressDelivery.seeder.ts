import mongoose from "mongoose";
import {AddressDelivery, IAddressDelivery } from "../models/AddressDelivery";
import User from "../models/User";

async function seedAddressDeliveries() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/DB_02");

    // Xoá dữ liệu cũ
    await AddressDelivery.deleteMany({});
    console.log("Đã xoá dữ liệu AddressDelivery cũ ✅");

    // Lấy tất cả user
    const users = await User.find({});
    console.log(`Tìm thấy ${users.length} user`);

    const seedData: Partial<IAddressDelivery>[] = [];

    for (const user of users) {
      // Địa chỉ mặc định
      seedData.push({
        user: user._id as mongoose.Types.ObjectId,
        address: "123 Đường ABC, Quận 1, TP.HCM",
        fullName: user.fullName || "Nguyễn Văn A",
        phoneNumber: "0901234567",
        isDefault: true,
      });

      // Thêm 1 địa chỉ phụ (không bắt buộc)
      seedData.push({
        user: user._id as mongoose.Types.ObjectId,
        address: "456 Đường XYZ, Quận 3, TP.HCM",
        fullName: user.fullName || "Nguyễn Văn A",
        phoneNumber: "0917654321",
        isDefault: false,
      });
    }

    await AddressDelivery.insertMany(seedData);

    await mongoose.disconnect();
    console.log("Seeder AddressDelivery xong 🎉");
  } catch (error) {
    console.error("Lỗi AddressDelivery Seeder:", error);
  }
}

seedAddressDeliveries();
