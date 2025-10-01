
import { getFilteredProducts } from "../service/filterProductService";
import { log } from "node:console";
import { productDetailService, findProductByCategoryIdService, getSizebyProductIdService, addToWWishlistService,
  deleteFromWishlistService,checkProductExistedWishlistService, getWishlistService, getNewProducts, getTopSellingProducts
 } from "../service/productService";
import { Request, Response } from "express";

export const productDetail = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const response = await productDetailService(id);

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};


export const findProductByCategoryId = async (req: Request, res: Response) => {
  const { id, productId } = req.params;

  try {
    const response = await findProductByCategoryIdService(id, productId);

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};


export const getSizebyProductId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const response = await getSizebyProductIdService(id);
    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


export const addToWWishlist = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id
  
  try {
    const response = await addToWWishlistService(userId, productId);
    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export const getNewProductsController = async (req: Request, res: Response) => {
  try{
    const response = await getNewProducts();
    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


export const deleteFromWishlist = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id
  try {
    const response = await deleteFromWishlistService(userId, productId);
    if (!response.success) {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export const getTopSellingProductsController = async (req: Request, res: Response) => {
  try{
    const response = await getTopSellingProducts();
    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export const filterProductsController = async (req: Request, res: Response) => {
  try {
    const {
      category,
      priceMin,
      priceMax,
      size,
      rating,
      page = "1",
      limit = "10",
    } = req.query;

    const result = await getFilteredProducts({
      category: category as string,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      size: size as string,
      rating: rating ? Number(rating) : undefined,
      page: Number(page),
      limit: Number(limit),
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const checkProductExistedWishlist = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;
  try {
    const response = await checkProductExistedWishlistService(userId, productId);
    return res.status(200).json({
      existed: response
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export const getWishlist = async (req, res) => {
  const userId = req.user.id;
  try {
    const response = await getWishlistService(userId);
    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


