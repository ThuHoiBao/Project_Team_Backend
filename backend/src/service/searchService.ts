import Product, { IProduct } from "../models/Product";
import Fuse from "fuse.js";
import { removeVietnameseAccents } from "../utils/textUtils";

interface GetProductsParams {
  categoryId?: string;
  page?: number;
  limit?: number;
  q?: string;
  priceIncrease?: boolean;
  priceDecrease?: boolean;
  newest?: boolean;
}

interface ProductWithNormalized {
  productName: string;
  description?: string;
  price: number;
  createDate?: Date;
  productNameNormalized: string;
  descriptionNormalized: string;
  [key: string]: any; // Cho phép các fields khác từ IProduct
}

interface GetProductsResult {
  products: IProduct[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const getProducts = async ({
  categoryId,
  page = 1,
  limit = 10,
  q,
  priceIncrease = false,
  priceDecrease = false,
  newest = false,
}: GetProductsParams): Promise<GetProductsResult> => {
  const skip = (page - 1) * limit;

  // Bước 1: Lấy products từ MongoDB với filter cơ bản
  const query: Record<string, any> = { status: true };
  
  if (categoryId) {
    query.category = categoryId;
  }

  let allProducts: IProduct[] = await Product.find(query)
    .populate({
      path: "listImage",
      select: "imageProduct -_id",
    })
    .lean();

  // Bước 2: Fuzzy search nếu có query
  if (q && q.trim()) {
    const normalizedQuery = removeVietnameseAccents(q.trim().toLowerCase());
    
    // Cấu hình Fuse.js - Tối ưu cho exact match và word boundary
    const fuseOptions = {
      keys: [
        {
          name: "productNameNormalized",
          weight: 1,
        },
        {
          name: "productName",
          weight: 0.8,
        },
        {
          name: "descriptionNormalized",
          weight: 0.2,
        },
      ],
      threshold: 0.3, // Chặt chẽ hơn (giảm từ 0.4 xuống 0.3)
      distance: 50, // Giảm distance để ưu tiên exact match
      minMatchCharLength: 1,
      includeScore: true,
      ignoreLocation: true, // Quan trọng: tìm match ở bất kỳ vị trí nào
      findAllMatches: true, // Tìm tất cả matches
      useExtendedSearch: false, // Tắt extended search cho đơn giản
    };

    // Thêm field normalized vào mỗi product
    const productsWithNormalized = allProducts.map((p: any) => ({
      ...p,
      productNameNormalized: removeVietnameseAccents((p.productName || "").toLowerCase()),
      descriptionNormalized: removeVietnameseAccents((p.description || "").toLowerCase()),
    }));

    // Khởi tạo Fuse
    const fuse = new Fuse(productsWithNormalized, fuseOptions);

    // Search với pattern matching để ưu tiên exact word match
    const searchPattern = normalizedQuery
      .split(/\s+/)
      .map(word => `'${word}`) // Dùng single quote để search exact match
      .join(" ");

    let searchResults = fuse.search(searchPattern);
    
    // Nếu không tìm thấy với exact match, thử fuzzy search thông thường
    if (searchResults.length === 0) {
      searchResults = fuse.search(normalizedQuery);
    }

    // Sort kết quả theo score (score thấp = match tốt hơn)
    searchResults.sort((a, b) => {
      const scoreA = a.score || 1;
      const scoreB = b.score || 1;
      
      // Ưu tiên match chính xác toàn bộ query
      const aExactMatch = a.item.productNameNormalized.includes(normalizedQuery);
      const bExactMatch = b.item.productNameNormalized.includes(normalizedQuery);
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Ưu tiên match ở đầu tên
      const aStartsWith = a.item.productNameNormalized.startsWith(normalizedQuery);
      const bStartsWith = b.item.productNameNormalized.startsWith(normalizedQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Cuối cùng sort theo score
      return scoreA - scoreB;
    });
    
    // Lấy products từ kết quả search
    allProducts = searchResults.map((result) => result.item);

    console.log(`Fuzzy search found ${allProducts.length} products for query: "${q}"`);
  }

  // Bước 3: Sắp xếp
  if (priceIncrease) {
    allProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (priceDecrease) {
    allProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (newest) {
    allProducts.sort((a, b) => {
      const dateA = new Date(a.createDate || 0).getTime();
      const dateB = new Date(b.createDate || 0).getTime();
      return dateB - dateA;
    });
  }

  // Bước 4: Phân trang
  const total = allProducts.length;
  const paginatedProducts = allProducts.slice(skip, skip + limit);

  return {
    products: paginatedProducts,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};