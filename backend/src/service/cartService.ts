import { Cart } from '../models/Cart';
import { CartItem, ICartItem } from '../models/CartItem';
import Product from '../models/Product';
import ProductSize from '../models/ProductSize';
import mongoose, { PipelineStage, Types } from 'mongoose';

interface AddToCartParams {
    userId: string | mongoose.Types.ObjectId; 
    productId: string | mongoose.Types.ObjectId;
    size: string;
    quantity: number;
}

class CartError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = 'CartError';
        this.statusCode = statusCode;
    }
}

export const addToCartService = async ({ userId, productId, size, quantity }: AddToCartParams): Promise<ICartItem> => {
    // --- BƯỚC 1: Tìm hoặc tạo giỏ hàng ---
    // Sử dụng findOneAndUpdate với upsert: true để tối ưu
    let cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $setOnInsert: { user: userId, cartItems: [] } }, // Chỉ tạo nếu chưa có
        { upsert: true, new: true, setDefaultsOnInsert: true } // upsert=true: tạo nếu ko có; new=true: trả về doc mới nếu tạo; setDefaults...: áp dụng default value
    );
    console.log(`Cart found or created for user ${userId}: ${cart._id}`);

    // --- BƯỚC 2: Kiểm tra tồn kho ---
    const productSize = await ProductSize.findOne({ product: productId, size: size });
    if (!productSize) {
        // Ném lỗi cụ thể để controller bắt và trả về status phù hợp
        throw Object.assign(new Error('Product size not found.'), { status: 404 });
    }

     // --- BƯỚC 3: Kiểm tra sản phẩm ---
    const product = await Product.findById(productId).select("productName status");
    if (!product) {
        throw Object.assign(new Error("Product not found."), { status: 404 });
    }

    // Nếu sản phẩm ngừng bán -> chặn thêm vào giỏ
    if (product.status === false) {
        throw Object.assign(
        new Error(`${product.productName} đã ngừng bán, không thể thêm vào giỏ hàng.`),
        { status: 400 }
        );
    }

    // --- BƯỚC 4: Tìm CartItem hiện có ---
    let existingItem = await CartItem.findOne({
        cart: cart._id,
        product: productId,
        size: size
    });

    let savedCartItem: ICartItem;

    if (existingItem) {
        // --- Cập nhật số lượng nếu đã tồn tại ---
        const newQuantity = existingItem.quantity + quantity;

        // Kiểm tra lại tồn kho
        if (productSize.quantity < newQuantity) {
            const availableToAdd = productSize.quantity - existingItem.quantity;
            throw Object.assign(new Error(`Cannot add ${quantity} more. Insufficient stock for size ${size}. Only ${availableToAdd} more available.`), { status: 400 });
        }

        existingItem.quantity = newQuantity;
        savedCartItem = await existingItem.save();
        console.log(`Updated quantity for item ${savedCartItem._id}`);
        // Không cần cập nhật Cart vì item đã có trong mảng

    } else {
        // --- Tạo CartItem mới nếu chưa tồn tại ---
        // Kiểm tra tồn kho ban đầu (đã làm ở bước 2, nhưng kiểm tra lại cho chắc)
         if (productSize.quantity < quantity) {
             throw new CartError(`Insufficient stock for size ${size}. Only ${productSize.quantity} left.`, 400);
         }

        const newCartItem = new CartItem({
            cart: cart._id,
            product: productId,
            quantity: quantity,
            size: size,
        });
        savedCartItem = await newCartItem.save();

        // Thêm CartItem mới vào Cart bằng $push để atomic hơn (tùy chọn)
        await Cart.updateOne(
            { _id: cart._id },
            { $push: { cartItems: savedCartItem._id } }
        );
        console.log(`Added new item ${savedCartItem._id} to cart ${cart._id}`);
    }

    // Populate để trả về thông tin chi tiết (làm ở cuối)
    await savedCartItem.populate<{ product: { productName: string; price: number } }>('product', 'productName price');

    return savedCartItem;
};

export const getCartForUser = async (userId: string | mongoose.Types.ObjectId): Promise<any[]> => {
    // 1. Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return []; // Trả về mảng rỗng nếu không có giỏ hàng
    }

    // 2. Dùng Aggregation Pipeline để lấy cartItems và thông tin liên quan
    const pipeline: PipelineStage[] = [
        // Tìm các CartItem thuộc giỏ hàng này
        { $match: { cart: cart._id } },
        // Lookup thông tin Product
        {
            $lookup: {
                from: 'products', // Tên collection Product
                localField: 'product',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        { $unwind: '$productDetails' }, // Mở mảng productDetails
         // Lookup thông tin Ảnh (nếu cần) - giả sử Product có listImage là ObjectId[]
         {
             $lookup: {
                 from: 'imageproducts', // Tên collection ImageProduct
                 localField: 'productDetails.listImage',
                 foreignField: '_id',
                 as: 'productImages'
             }
         },
        // Lookup thông tin ProductSize để lấy tồn kho
        {
            $lookup: {
                from: 'productsizes', // Tên collection ProductSize
                let: { productId: '$product', itemSize: '$size' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$product', '$$productId'] },
                                    { $eq: ['$size', '$$itemSize'] }
                                ]
                            }
                        }
                    },
                    { $project: { _id: 0, quantity: 1 } } // Chỉ lấy quantity
                ],
                as: 'sizeInfo'
            }
        },
        { $unwind: { path: '$sizeInfo', preserveNullAndEmptyArrays: true } }, // preserveNull... nếu size có thể không tồn tại
        // Định hình lại output
        {
            $project: {
                _id: 0, // Bỏ _id của CartItem nếu muốn dùng virtual 'id'
                id: '$_id',
                quantity: 1,
                size: 1,
                product: { // Tạo object product lồng nhau
                    id: '$productDetails._id',
                    name: '$productDetails.productName',
                    price: '$productDetails.price',
                     // Lấy ảnh đầu tiên từ mảng ảnh đã lookup (nếu có)
                    image: { $arrayElemAt: ['$productImages.imageProduct', 0] }
                },
                availableStock: { $ifNull: ['$sizeInfo.quantity', 0] } // Lấy tồn kho, mặc định là 0 nếu không tìm thấy
            }
        },
         { $sort: { createdAt: -1 } } // Sắp xếp mới nhất lên đầu (nếu CartItem có timestamps)
    ];

    const cartItemsDetails = await CartItem.aggregate(pipeline);

    return cartItemsDetails;
};

export const updateItemQuantityInCart = async (itemId: string, newQuantity: number, userId: string | Types.ObjectId) => {
    if (newQuantity < 1) {
        throw new CartError('Quantity must be at least 1.', 400);
    }
    
    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
        throw new CartError('Cart item not found.', 404);
    }
    
    const cart = await Cart.findOne({ user: userId, cartItems: itemId });
    if (!cart) {
        throw new CartError('Item not found in your cart.', 403);
    }

    const productSize = await ProductSize.findOne({ product: cartItem.product, size: cartItem.size });
    if (!productSize || productSize.quantity < newQuantity) {
        throw new CartError(`Insufficient stock. Only ${productSize?.quantity || 0} items available.`);
    }

    cartItem.quantity = newQuantity;
    await cartItem.save();
    return cartItem;
};

export const removeItemFromCart = async (itemId: string, userId: string | Types.ObjectId) => {
    const deletedItem = await CartItem.findByIdAndDelete(itemId);
    if (!deletedItem) {
        throw new CartError('Cart item not found.', 404);
    }

    await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { cartItems: deletedItem._id } }
    );
    
    return deletedItem;
};