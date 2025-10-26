import Category from '../models/Category'

export const getCategories = async () => {
  try {
    // Chỉ lấy các danh mục có isActive = true
    const categories = await Category.find({ isActive: true }).select("categoryName");

    if (!categories || categories.length === 0) {
      return {
        success: false,
        message: "Không có danh mục sản phẩm nào đang hoạt động trong database",
      };
    }

    return {
      success: true,
      message: categories,
    };

  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};
