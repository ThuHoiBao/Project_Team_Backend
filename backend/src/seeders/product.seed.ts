import Product from "../models/Product"; // đường dẫn tới model

export const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        {
          productID: 1,
          productName: "Áo thun",
          quantity: 50,
          status: true,
        },
        {
          productID: 2,
          productName: "Quần jean",
          quantity: 30,
          status: true,
        },
      ]);
      console.log("Đã seed dữ liệu Product");
    } else {
      console.log("Product đã tồn tại, không seed");
    }
  } catch (error) {
    console.error("Lỗi seed Product:", error);
  }
};
