import mongoose from "mongoose";
import Product from "../models/Product";
import ProductSize, { Size, IProductSize } from "../models/ProductSize";

// Hàm chọn ngẫu nhiên n phần tử từ array
function getRandomSizes(n: number): Size[] {
  const sizes = Object.values(Size);
  const shuffled = sizes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

async function seedProductSizes() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/DB_02");

    // Xóa dữ liệu cũ
    await ProductSize.deleteMany({});
    console.log("Đã xoá dữ liệu product size cũ ✅");

    // Reset listSize trong Product
    await Product.updateMany({}, { $set: { productSizes: [] } });
    console.log("Đã reset listSize trong Product ✅");

    // Lấy tất cả sản phẩm
    const products = await Product.find({});
    console.log(`Tìm thấy ${products.length} sản phẩm`);

    for (const product of products) {
      // chọn 3 size ngẫu nhiên
      const randomSizes = getRandomSizes(3);

      const sizesToInsert: IProductSize[] = randomSizes.map(
        (size) =>
          ({
            product: product._id as mongoose.Types.ObjectId,
            size,
            quantity: Math.floor(Math.random() * 50) + 10, // random 10–59
          } as IProductSize)
      );

      // Thêm sizes vào ProductSize
      const insertedSizes = await ProductSize.insertMany(sizesToInsert);

      // Lấy id của các size vừa thêm
      const sizeIds = insertedSizes.map((s) => s._id);

      // Cập nhật listSize trong product
      await Product.findByIdAndUpdate(product._id, {
        $push: { productSizes: { $each: sizeIds } },
      });
    }

    await mongoose.disconnect();
    console.log("Seeder ProductSize xong 🎉");
  } catch (error) {
    console.error("Lỗi ProductSize Seeder:", error);
  }
}

seedProductSizes();
