import { OrderItem } from "../models/OrderItem";
import Product, { IProduct } from "../models/Product";
import ProductSize from "../models/ProductSize";
// import Category, { ICategory } from "../models/Category";
import { ServiceResponse } from "../types/ServiceResponse";
import mongoose, { Schema, Document, Types } from "mongoose";

export const productDetailService = async (id: string) => {
  try {
    const product = await Product.findById(id)
      .populate("category", "categoryName")
      .populate("listImage", "imageProduct");

    if (!product) {
      return {
        success: false,
        message: "Product not found"
      };
    }
    const orderItems = await OrderItem.find({ product: id })
    .populate("feedback").populate("order");
    const feedbacks = orderItems
      .map((oi) => ({
        feedback: oi.feedback,
        order: oi.order,
      }))
      .filter((f) => f.feedback != null);
    // const orderItems = await OrderItem.find({ product: id })
    //   .populate("feedback");
      

    // const order = await OrderItem.find({ product: id }).populate("order", "user").select("id");

    // const feedbacks = orderItems.map((oi) => oi.feedback).filter((fb) => fb != null);
    return {
      success: true,
      message: "Product found",
      data: { product, feedbacks }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
};


export const findProductByCategoryIdService = async (id: string) => {
  try {

    const products = await Product.find({ category: id }).select("productName listImage price").populate("listImage").limit(4);

    if (!products || products.length === 0) {
      return {
        success: false,
        message: "No products found for this category"
      };
    }

    return {
      success: true,
      message: "Products found",
      data: products
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
};



export const getSizebyProductIdService = async (id) => {
  try {
    const sizes = await ProductSize.find({ product: id })
    if (!sizes || sizes.length === 0) {
      return {
        success: false,
        message: "Size not found"
      }
    }
    return {
      success: true,
      message: "Size found",
      data: sizes
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}

export const getNewProducts = async () => {
  try {
    // Lấy 8 sản phẩm mới nhất
    const productList = await Product.find({})
      .sort({ createDate: -1 })
      .limit(8)
      .populate("listImage", "imageProduct")
      .select ("productName listImage price");

    if (!productList || productList.length === 0) {
      return {
        success: false,
        message: "Không có sản phẩm nào trong database",
      };
    }

    // Tính rating trung bình cho từng sản phẩm
    const data = await Promise.all(
      productList.map(async (product) => {
        const orderItemList = await OrderItem.find({ product: product._id })
          .populate("feedback").lean();

        if (!orderItemList || orderItemList.length === 0) {
          return {
            product,
            averageRating: 0, // chưa có feedback
          };
        }

        // Lấy danh sách rating từ feedback
        const ratings = orderItemList
          .map((item) => item.feedback?.rating)
          .filter((r) => typeof r === "number");

        const totalRating = ratings.reduce((total, r) => total + r, 0);
        const averageRating =
          ratings.length > 0 ? totalRating / ratings.length : 0;

        return {
          product,
          averageRating,
        };
      })
    );

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};


export const getTopSellingProducts = async () => {
  try {
    const productList = await Product.find()
      .populate("listImage", "imageProduct")
      .select ("productName listImage price");
    
    if (!productList || productList.length === 0) {
      return {
        success: false,
        message: "Không có sản phẩm nào trong database",
      };
    }
    // Tìm số  lượng sản phẩm đã bán ra tương ứng với mỗi sản phẩm
   const productSellingQuantity = [];
    for (const product of productList) {
      const orderItemList = await OrderItem.find({ product: product._id });
      const sellingQuantity = orderItemList.reduce(
        (total, r) => total + (r.quantity || 0),
        0
      );
      productSellingQuantity.push({ product, sellingQuantity });
    }

    // Lấy ra 6 những sản phẩm có quantity cao nhất
    const topProducts = productSellingQuantity
    .sort((a, b) => b.sellingQuantity - a.sellingQuantity)
    .slice(0, 6);

    // Tính rating trung bình cho từng sản phẩm
    const data = await Promise.all(
      topProducts.map(async ({ product, sellingQuantity }) => {
        const orderItemList = await OrderItem.find({ product: product._id })
          .populate("feedback")
          .lean();

        if (!orderItemList || orderItemList.length === 0) {
          return {
            product,
            sellingQuantity,
            averageRating: 0,
          };
        }

        const ratings = orderItemList
          .map((item) => item.feedback?.rating)
          .filter((r) => typeof r === "number");

        const totalRating = ratings.reduce((total, r) => total + r, 0);
        const averageRating =
          ratings.length > 0 ? totalRating / ratings.length : 0;

        return {
          product,
          sellingQuantity,
          averageRating,
        };
      })
    );

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
