import { Request, Response } from "express";
import { getProducts } from "../service/searchService";

export const getProductPagination = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const q = req.query.q as string | undefined;

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const priceIncrease = req.query.priceIncrease === "true";
    const priceDecrease = req.query.priceDecrease === "true";
    const newest = req.query.newest === "true";

    const responseData = await getProducts({
      categoryId,
      page,
      limit,
      q,
      priceIncrease,
      priceDecrease,
      newest,
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error get products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
