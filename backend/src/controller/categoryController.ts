import { Request, Response } from "express";
import { getCategories } from "../service/categoryService";

export const getCategoriesController = async (req: Request, res: Response) => {
  try {
    const response = await getCategories();
    if (!response.success) {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};