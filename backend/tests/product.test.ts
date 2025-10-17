import { productDetailService } from "../src/service/productService";
import Product from "../src/models/Product";
import { OrderItem } from "../src/models/OrderItem";

// Mock model Mongoose
jest.mock("../src/models/Product");
jest.mock("../src/models/OrderItem");

describe("productDetailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Case 1: id sai định dạng
  it("should return error when invalid id format is passed", async () => {
    (Product.findById as any).mockImplementation(() => {
      throw new Error("Cast to ObjectId failed");
    });

    const result = await productDetailService("");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Cast to ObjectId");
  });

  // Case 2: không tìm thấy product
  it("should return not found when product does not exist", async () => {
    (Product.findById as any).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn((cb) => cb(null)), // fix: simulate async return null
    });

    const result = await productDetailService("9999999999");
    expect(result.success).toBe(false);
    expect(result.message).toBe("Product not found");
  });

  // Case 3: DB lỗi khi truy vấn OrderItem
  it("should handle error when fetching OrderItem throws error", async () => {
    (Product.findById as any).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn((cb) => cb({ _id: "2" })),
    });

    (OrderItem.find as any).mockImplementation(() => {
      throw new Error("Database error in OrderItem");
    });

    const result = await productDetailService("2");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Database error");
  });

  // Case 4: có feedback
  it("should return product and feedback list when found", async () => {
    (Product.findById as any).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn((cb) => cb({ _id: "1", name: "Test Product" })),
    });

    (OrderItem.find as any).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn((cb) =>
        cb([{ feedback: { text: "Good" }, order: { id: 1 } }])
      ),
    });

    const result = await productDetailService("1");
    expect(result.success).toBe(true);
    expect(result.message).toBe("Product found");
    expect(result.data).toBeDefined();
    expect(result.data!.feedbacks).toHaveLength(1);
  });

  // Case 5: orderItems null → lỗi .map
  it("should handle error when orderItems is null", async () => {
    (Product.findById as any).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn((cb) => cb({ _id: "3" })),
    });

    (OrderItem.find as any).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: jest.fn((cb) => cb(null)),
    });

    const result = await productDetailService("3");
    expect(result.success).toBe(false);
    // fix: chấp nhận cả 2 kiểu message
    expect(result.message).toMatch(/(map is not a function|Cannot read properties)/);
  });
});
