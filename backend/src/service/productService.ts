
import Product, { IProduct } from "../models/Product";
// import Category, { ICategory } from "../models/Category";
import { ServiceResponse } from "../types/ServiceResponse";
import mongoose, { Schema, Document, Types } from "mongoose";

export const productDetailService = async (id: string): Promise<ServiceResponse<IProduct>> => {
  try {
    const product = await Product.findById(id)
      .populate("category", "categoryName")
      .populate("listImage", "imageProduct")
      .populate("feedbacks");

    if (!product) {
      return {
        success: false,
        message: "Product not found"
      };
    }

    return {
      success: true,
      message: "Product found",
      data: product
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

    const products = await Product.find({ category: id }).select("productName listImage")

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