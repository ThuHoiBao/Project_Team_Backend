import { OrderItem } from "../models/OrderItem";
import Product, { IProduct } from "../models/Product";
import ProductSize from "../models/ProductSize";
import UserFavorite from "../models/UserFavorite"; // Import model (export default)
import { IUserFavorite } from "../models/UserFavorite"; // Import interface (export named)
import {ImageProduct} from "../models/ImageProduct";
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


export const findProductByCategoryIdService = async (categoryId: string, productId: string) => {
  try {
    const products = await Product.find({
      category: categoryId,
      _id: { $ne: productId }   // loại bỏ sản phẩm hiện tại
    })
      .select("productName listImage price")
      .populate("listImage")
      .limit(4);

    if (!products || products.length === 0) {
      return {
        success: false,
        message: "No related products found"
      };
    }

    return {
      success: true,
      message: "Related products found",
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


export const addToWWishlistService = async (userId: string, productId: string) => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);
    const existed = await UserFavorite.findOne({
      user_id: userObjectId,
      product_id: productObjectId
    })
    if (existed)
      return {
        success: false,
        message: "existed"
      }
    const newFavorite: IUserFavorite = new UserFavorite({
      user_id: userObjectId,
      product_id: productObjectId
    })
    const savedFavorite = await newFavorite.save();
    return {
      success: true,
      data: savedFavorite
    };

  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error("Sản phẩm đã tồn tại trong danh sách yêu thích.");
    }
    return {
      success: false,
      message: `Không thể thêm sản phẩm vào danh sách yêu thích ${error.message}`
    }
  }
}


export const deleteFromWishlistService = async (userId: string, productId: string) => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);
    const deleted = await UserFavorite.deleteOne({
      user_id: userObjectId,
      product_id: productObjectId
    })
    if (!deleted)
      throw new Error("Cannot delete from wishlist")
    return {
      success: true,
      data: "deleted from wishlist"
    };

  } catch (error: any) {
    throw new Error("Cannot delete from wishlist")
  }
}


export const checkProductExistedWishlistService = async (userId: string, productId: string) => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);
    const existed = await UserFavorite.findOne({
      user_id: userObjectId,
      product_id: productObjectId
    })
    if (existed)
      return true;
    return false;

  } catch (err: any) {
    console.log("lỗi", err.message);

  }
}

async function getImageProduct(id:string) {
  try{
    const image = await ImageProduct.findOne({product: id}).select("imageProduct");
    return image;

  }catch(error: any) {
    console.log(error.message);
    return null;
  }
}

export const getWishlistService = async (userId: string) => {
  try {
    const products = await UserFavorite.find({ user_id: userId }).populate("product_id");
    if (!products) throw new Error("Không có sản phẩm nào trong danh sách yêu thích")
    const resultPromises  = products.map( async (product) => {
      const productId = product.product_id.id.toString(); 
        const image = await getImageProduct(productId);
       return {
        favoriteProduct: product, 
        imageProduct: image
      };
    })
    const result = await Promise.all(resultPromises);
      

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    }
  }
}