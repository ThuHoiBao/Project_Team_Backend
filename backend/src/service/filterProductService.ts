import Product from "../models/Product";
import ProductSize from "../models/ProductSize";
import {OrderItem} from "../models/OrderItem";
import mongoose from "mongoose";

interface FilterOptions {
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  sizes?: string[]; 
  rating?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

// Sửa interface để flexible hơn với _id
interface ProductWithRating {
  _id: any;
  productName: string;
  price: number;
  createDate?: Date;
  listImage?: any[];
  category?: any;
  productSizes?: any[];
  averageRating: number;
  [key: string]: any;
}

export const getFilteredProducts = async (options: FilterOptions) => {
  const { categories, priceMin, priceMax, sizes, rating, page = 1, limit = 10, sort } = options;

  const filter: any = {};

  // lọc category
  if (categories && categories.length > 0) {
    filter.category = { $in: categories.map((id) => new mongoose.Types.ObjectId(id)) };
   

  }

  // lọc theo khoảng giá
  if (priceMin !== undefined || priceMax !== undefined) {
    filter.price = {};
    if (priceMin !== undefined) filter.price.$gte = priceMin;
    if (priceMax !== undefined) filter.price.$lte = priceMax;
  }

  // lọc theo sizes - sản phẩm có ít nhất 1 size trong danh sách sizes
  if (sizes && sizes.length > 0) {
    const productSizes = await ProductSize.find({ size: { $in: sizes } }).select("product");
    const productIds = productSizes.map((ps) => ps.product);

    // Nếu đã có filter._id từ trước (ví dụ từ filter khác), cần merge
    if (filter._id) {
      filter._id = { $in: productIds };
    } else {
      filter._id = { $in: productIds };
    }
  }

  // lấy danh sách product ban đầu
  let products = await Product.find(filter)
    .select("productName price createDate") 
    .populate({
      path: "listImage",
      select: "imageProduct -_id",
    })
    .populate({
      path: "category",
      select: "categoryName -_id",
    })
    .populate({
      path: "productSizes",
      select: "size quantity -_id",
    })
    .lean();

  const productIds = products.map((p) => p._id);

  // lấy rating
  const ratings = await OrderItem.aggregate([
    { $match: { product: { $in: productIds } } },
    {
      $lookup: {
        from: "feedbacks",
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

  // gắn thêm averageRating với type assertion
  let productsWithRating = products.map((p) => ({
    ...p,
    averageRating: ratingMap[p._id.toString()] || 0,
  })) as ProductWithRating[];

  // lọc theo rating nếu có
  if (rating !== undefined) {
    productsWithRating = productsWithRating.filter((p) => p.averageRating >= rating);
  }

  if (sort) {
    switch (sort) {
      case "priceLowHigh":
        productsWithRating.sort((a, b) => a.price - b.price);
        break;
      case "priceHighLow":
        productsWithRating.sort((a, b) => b.price - a.price);
        break;
      case "ratingHighLow":
        productsWithRating.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "newest":
        productsWithRating.sort((a, b) => {
          const dateA = a.createDate ? new Date(a.createDate).getTime() : 0;
          const dateB = b.createDate ? new Date(b.createDate).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        break;
    }
  }

  // phân trang
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = productsWithRating.slice(startIndex, endIndex);

  return {
    total: productsWithRating.length,
    page,
    limit,
    products: paginatedProducts,
  };
};