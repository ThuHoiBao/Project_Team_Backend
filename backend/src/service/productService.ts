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