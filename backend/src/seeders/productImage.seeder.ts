import mongoose from "mongoose";
import Product from "../models/Product";
import { ImageProduct, IImageProduct } from "../models/ImageProduct";

async function seedProductImages() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/DB_02");

    // Xoá dữ liệu cũ
    await ImageProduct.deleteMany({});
    console.log("Đã xoá dữ liệu product image cũ ✅");

    // Reset luôn listImage trong Product
    await Product.updateMany({}, { $set: { listImage: [] } });
    console.log("Đã reset listImage trong Product ✅");

    // Lấy tất cả sản phẩm
    const products = await Product.find({});
    console.log(`Tìm thấy ${products.length} sản phẩm`);

    for (const product of products) {
      const imagesToInsert: IImageProduct[] = [
        {
          imageProduct: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIfl5UKosKZq6mITnyLNmqdV0oGHEN6nDFgg&s",
          product: product._id,
        } as IImageProduct,
        {
          imageProduct: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrNc_Ibg-xLRt4HUL3_3e7BMz4NMSOEW4nnA&s",
          product: product._id,
        } as IImageProduct,
        {
          imageProduct: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_sIsZbM7n6WhWQ0a3ENWIN4V-rPQ4UKQteg&s",
          product: product._id,
        } as IImageProduct,
      ];

      // Thêm images vào ImageProduct
      const insertedImages = await ImageProduct.insertMany(imagesToInsert);

      // Lấy id của các ảnh vừa thêm
      const imageIds = insertedImages.map((img) => img._id);

      // Cập nhật listImage trong product
      await Product.findByIdAndUpdate(product._id, {
        $push: { listImage: { $each: imageIds } },
      });
    }

    await mongoose.disconnect();
    console.log("Seeder ProductImage xong 🎉");
  } catch (error) {
    console.error("Lỗi ProductImage Seeder:", error);
  }
}

seedProductImages();
