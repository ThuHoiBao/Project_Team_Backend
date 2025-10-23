import { Coupon } from "../models/Coupon";

export const seedCoupons = async () => {
  try {
    console.log("Bắt đầu seeding Coupon (chỉ %)...");
    await Coupon.deleteMany({});
    console.log("-> Đã xóa dữ liệu coupon cũ.");

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const coupons = [
      {
        code: "SALE10",
        discountValue: 10, // Giảm 10%
        maxDiscount: 50000,    // Tối đa 50,000đ
        startDate: today,
        endDate: nextMonth,
      },
      {
        code: "SALE25",
        discountValue: 25, // Giảm 25%
        maxDiscount: 80000,    // Tối đa 80,000đ
        startDate: today,
        endDate: nextMonth,
      },
      {
        code: "BIGSALE50",
        discountValue: 50, // Giảm 50%
        maxDiscount: 100000,   // Tối đa 100,000đ
        startDate: today,
        endDate: nextMonth,
      },
    ];

    await Coupon.create(coupons);
    console.log(`✅ Đã tạo ${coupons.length} Coupon mẫu (theo %) thành công!`);
  } catch (error) {
    console.error("❌ Lỗi khi seeding Coupon:", error);
    throw error;
  }
};