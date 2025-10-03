import Category from '../models/Category'

export const getCategories = async() =>{
    try{
        const categories = await Category.find().select("categoryName");
        if (!categories || categories.length === 0) {
            return {
                success: false,
                message: "Không có danh mục sản phẩm nào trong database",
            };
        }
        return{
            success: true,
            message: categories,
        }

    }
   catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}