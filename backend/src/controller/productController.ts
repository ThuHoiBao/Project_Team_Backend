import { productDetailService, findProductByCategoryIdService } from "../service/productService";
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
  const { id } = req.params;
  
  try {
    const response = await findProductByCategoryIdService(id);

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};