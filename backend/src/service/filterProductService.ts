import Product from "../models/Product";
import ProductSize from "../models/ProductSize";
import {OrderItem} from "../models/OrderItem";
import mongoose from "mongoose";

interface FilterOptions {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  size?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

export const getFilteredProducts = async (options: FilterOptions) => {
  const { category, priceMin, priceMax, size, rating, page = 1, limit = 10 } = options;

  const filter: any = {};

  // lọc category
  if (category) {
    filter.category = new mongoose.Types.ObjectId(category);
  }

  // lọc theo khoảng giá
  if (priceMin !== undefined || priceMax !== undefined) {
    filter.price = {};
    if (priceMin !== undefined) filter.price.$gte = priceMin;
    if (priceMax !== undefined) filter.price.$lte = priceMax;
  }

  // lọc theo size (tìm product có size = "L")
  if (size) {
    const productSizes = await ProductSize.find({ size }).select("product");
    const productIds = productSizes.map((ps) => ps.product);

    filter._id = { $in: productIds };
  }

  // lấy danh sách product ban đầu
  let products = await Product.find(filter)
    .select("productName price") // áp dụng cho Product
    .populate({
        path: "listImage",
        select: "imageProduct -_id" // chỉ lấy imageProduct, bỏ _id
    })
    .populate({
        path: "category",
        select: "categoryName -_id" // chỉ lấy categoryName
    })
    .populate({
        path: "productSizes",
        select: "size quantity -_id" // chỉ lấy size và quantity
    })
    .lean();

    const productIds = products.map((p) => p._id);

    const ratings = await OrderItem.aggregate([
      { $match: { product: { $in: productIds } } },
      {
        $lookup: {
          from: "feedbacks", // tên collection Feedback
          localField: "feedback",
          foreignField: "_id",
          as: "feedback",
        },
      },
      { $unwind: "$feedback" },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$feedback.rating" },
        },
      },
    ]);

    const ratingMap: Record<string, number> = {};
    ratings.forEach((r) => {
      ratingMap[r._id.toString()] = r.avgRating;
    });


    // gắn thêm field averageRating
    products = products.map((p) => ({
      ...p,
      averageRating: ratingMap[p._id.toString()] || 0,
    }));

    // nếu có lọc rating thì filter sau
    if (rating !== undefined) {
    products = products.filter((p) => p.averageRating >= rating);
    }
    

  // phân trang
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = products.slice(startIndex, endIndex);

  return {
    total: products.length,
    page,
    limit,
    products: paginatedProducts,
  };
};
