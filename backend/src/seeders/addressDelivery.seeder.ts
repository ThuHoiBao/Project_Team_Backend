import mongoose from "mongoose";
import { AddressDelivery, IAddressDelivery } from "../models/AddressDelivery";
import User from "../models/User";

async function seedAddressDeliveries() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/DB_02");

    // Xoá dữ liệu cũ
    await AddressDelivery.deleteMany({});
    console.log("Đã xoá dữ liệu AddressDelivery cũ ✅");

    // Reset field AddressDelivery trong User
    await User.updateMany({}, { $set: { AddressDelivery: [] } });

    // Lấy tất cả user
    const users = await User.find({});
    console.log(`Tìm thấy ${users.length} user`);

    for (const user of users) {
      const seedData: Partial<IAddressDelivery>[] = [
        {
          user: user._id as mongoose.Types.ObjectId,
          address: "123 Đường ABC, Quận 1, TP.HCM",
          fullName: user.fullName || `${user.firstName} ${user.lastName}` || "Nguyễn Văn A",
          phoneNumber: "0901234567",
          isDefault: true,
        },
        {
          user: user._id as mongoose.Types.ObjectId,
          address: "456 Đường XYZ, Quận 3, TP.HCM",
          fullName: user.fullName || `${user.firstName} ${user.lastName}` || "Nguyễn Văn A",
          phoneNumber: "0917654321",
          isDefault: false,
        },
      ];

      // Thêm vào AddressDelivery collection
      const createdAddresses = await AddressDelivery.insertMany(seedData);

      // Lấy _id của các AddressDelivery
      const addressIds = createdAddresses.map((addr) => addr._id);

      // Update vào User
      await User.findByIdAndUpdate(user._id, {
        $set: { AddressDelivery: addressIds },
      });
    }

    await mongoose.disconnect();
    console.log("Seeder AddressDelivery xong 🎉");
  } catch (error) {
    console.error("Lỗi AddressDelivery Seeder:", error);
  }
}

seedAddressDeliveries();
