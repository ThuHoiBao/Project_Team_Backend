import Product, { IProduct } from "../models/Product"; 
import elasticClient from "../config/elasticClient";
import { removeVietnameseAccents } from "../utils/textUtils"; // Import function helper

interface GetProductsParams {
  categoryId?: string;
  page?: number;
  limit?: number;
  q?: string;
  priceIncrease?: boolean;
  priceDecrease?: boolean;
  newest?: boolean;
}

export const getProducts = async ({
  categoryId,
  page = 1,
  limit = 10,
  q,
  priceIncrease = false,
  priceDecrease = false,
  newest = false,
}: GetProductsParams) => {
  const skip = (page - 1) * limit;

  // Khởi tạo queryBody
  const queryBody: any = {
    from: skip,
    size: limit,
    sort: [],
    query: {
      bool: {
        filter: categoryId ? [{ term: { category: categoryId } }] : [],
      },
    },
  };

  // Sắp xếp
  if (priceIncrease) {
    queryBody.sort.push({ price: { order: "asc" } });
  } else if (priceDecrease) {
    queryBody.sort.push({ price: { order: "desc" } });
  } else if (newest) {
    queryBody.sort.push({ createDate: { order: "desc" } });
  }

  // Tìm kiếm theo productName
  if (q) {
    const normalizedQuery = removeVietnameseAccents(q); // Normalize query string
    const queryTerms = normalizedQuery.trim().split(/\s+/);
    
    queryBody.query.bool.must = queryTerms.map((term) => ({
      bool: {
        should: [
          // Search trong field productName gốc (có dấu)
          { prefix: { productName: term.toLowerCase() } },
          {
            fuzzy: {
              productName: {
                value: term.toLowerCase(),
                fuzziness: "AUTO",
                prefix_length: 1,
              },
            },
          },
          { wildcard: { productName: `*${term.toLowerCase()}*` } },
          
          // Search trong field productNameNormalized (không dấu) - QUAN TRỌNG
          { prefix: { productNameNormalized: term } },
          {
            fuzzy: {
              productNameNormalized: {
                value: term,
                fuzziness: "AUTO",
                prefix_length: 1,
              },
            },
          },
          { wildcard: { productNameNormalized: `*${term}*` } },
          
          // Có thể thêm search trong description nếu muốn
          { wildcard: { descriptionNormalized: `*${term}*` } },
        ],
        minimum_should_match: 1,
      },
    }));
  } else {
    if (!queryBody.query.bool.must) {
      queryBody.query = { bool: queryBody.query.bool };
      queryBody.query.bool.must = [{ match_all: {} }];
    }
  }

  console.log("Elasticsearch query:", JSON.stringify(queryBody, null, 2)); // Debug log

  // Gọi Elasticsearch
  const result = await elasticClient.search({
    index: "products",
    body: queryBody,
  });

  const products = (result.hits.hits as any[]).map((hit) => ({
    id: hit._id,
    ...hit._source,
  }));

  return {
    products,
    total: (result.hits.total as any).value,
    currentPage: page,
    totalPages: Math.ceil((result.hits.total as any).value / limit),
  };
};