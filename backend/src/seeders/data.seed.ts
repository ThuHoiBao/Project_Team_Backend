import  User  from '../models/User.ts';
import  Product  from '../models/Product';
import { Order } from '../models/Order';
import { AddressDelivery } from '../models/AddressDelivery';
import { Payment } from '../models/Payment';
import { ImageProduct } from '../models/ImageProduct';
import { OrderItem } from '../models/OrderItem';
import { Coupon } from '../models/Coupon'; // Thêm import Coupon model
import ProductSize from '../models/ProductSize';
import Category from '../models/Category';
import { OrderStatus } from '../models/Order'; // Giả sử OrderStatus đã được export từ Order model

enum PaymentMethod {
  VNPAY = "VNPAY",
  COD = "COD",
  COIN = "COIN",
}

// Tạo dữ liệu mẫu
export const seedDatabase = async () => {
  try {
    // Xóa dữ liệu cũ
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await AddressDelivery.deleteMany();
    await Payment.deleteMany();
    await ImageProduct.deleteMany();
    await OrderItem.deleteMany();
    await ProductSize.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany(); // Xóa dữ liệu cũ của Coupon

    // Tạo dữ liệu người dùng
    const user1 = new User({
      firstName: 'Nguyen',
      lastName: 'Thanh',
      email: 'nguyen.thanh@example.com',
      password: 'hashedpassword123',
      phoneNumber: '0912345678',
      gender: true,
      role: 'Customer',
      image: 'user_image_1.jpg',
    });

    const user2 = new User({
      firstName: 'Pham',
      lastName: 'Mai',
      email: 'pham.mai@example.com',
      password: 'hashedpassword456',
      phoneNumber: '0987654321',
      gender: false,
      role: 'Customer',
      image: 'user_image_2.jpg',
    });

    await user1.save();
    await user2.save();

    // Tạo dữ liệu danh mục
    const category1 = new Category({
      categoryName: 'Áo Thun',
    });

    const category2 = new Category({
      categoryName: 'Áo Hoodie',
    });

    await category1.save();
    await category2.save();

    // Tạo sản phẩm và gán danh mục cho sản phẩm
    const product1 = new Product({
      productName: 'Áo Thun Trường Đỏ',
      description: 'Áo thun màu đỏ dành cho các sự kiện của trường.',
      quantity: 200,
      price: 150000,
      category: category1._id,
    });

    const product2 = new Product({
      productName: 'Áo Thun Trường Xanh',
      description: 'Áo thun màu xanh dành cho các sự kiện của trường.',
      quantity: 150,
      price: 160000,
      category: category1._id,
    });

    const product3 = new Product({
      productName: 'Áo Hoodie Trường',
      description: 'Áo hoodie dành cho học sinh vào mùa lạnh.',
      quantity: 100,
      price: 250000,
      category: category2._id,
    });

    await product1.save();
    await product2.save();
    await product3.save();

    // Tạo Coupon
    const coupon1 = new Coupon({
      code: 'DISCOUNT10',
      discountValue: 10,
      maxDiscount: 100000,
      startDate: new Date(),
      endDate: new Date('2025-12-31'),
      isActive: true,
      usedCount: 0,
    });

    const coupon2 = new Coupon({
      code: 'DISCOUNT20',
      discountValue: 20,
      maxDiscount: 200000,
      startDate: new Date(),
      endDate: new Date('2025-12-31'),
      isActive: true,
      usedCount: 0,
    });

    await coupon1.save();
    await coupon2.save();

    // Tạo địa chỉ giao hàng
    const address1 = new AddressDelivery({
      user: user1._id,
      address: '123 Đường A, Quận B, Thành Phố C',
      fullName: 'Nguyen Thanh',
      phoneNumber: '0912345678',
      isDefault: true,
    });

    const address2 = new AddressDelivery({
      user: user2._id,
      address: '456 Đường D, Quận E, Thành Phố F',
      fullName: 'Pham Mai',
      phoneNumber: '0987654321',
      isDefault: false,
    });

    await address1.save();
    await address2.save();

    // Tạo đơn hàng với OrderItem và Coupon
    const order1 = new Order({
      user: user1._id,
      orderStatus: OrderStatus.ORDERED,
      orderDate: new Date(),
      addressDelivery: address1._id,
      coupon: coupon1._id, // Thêm Coupon vào Order
      totalAmount: 0,  // Chưa tính tổng tiền
    });

    const order2 = new Order({
      user: user2._id,
      orderStatus: OrderStatus.ORDERED,
      orderDate: new Date(),
      addressDelivery: address2._id,
      coupon: coupon2._id, // Thêm Coupon vào Order
      totalAmount: 0,  // Chưa tính tổng tiền
    });

    const savedOrder1 = await order1.save();
    const savedOrder2 = await order2.save();

    // Tạo OrderItem và liên kết với Order đã lưu
    const orderItem1 = new OrderItem({
      order: savedOrder1._id,
      product: product1._id,
      price: 150000,
      size: 'M',
      quantity: 2,
      feedback: null,
    });

    const orderItem2 = new OrderItem({
      order: savedOrder1._id,
      product: product2._id,
      price: 160000,
      size: 'L',
      quantity: 1,
      feedback: null,
    });

    const orderItem3 = new OrderItem({
      order: savedOrder2._id,
      product: product3._id,
      price: 250000,
      size: 'XL',
      quantity: 1,
      feedback: null,
    });

    // Lưu OrderItem
    await orderItem1.save();
    await orderItem2.save();
    await orderItem3.save();

    // Cập nhật trường orderItems trong Order
    savedOrder1.orderItems.push(orderItem1._id, orderItem2._id);
    savedOrder2.orderItems.push(orderItem3._id);

    // Tính tổng tiền của đơn hàng
    savedOrder1.totalAmount = (orderItem1.price * orderItem1.quantity) + (orderItem2.price * orderItem2.quantity);
    savedOrder2.totalAmount = orderItem3.price * orderItem3.quantity;

    // Lưu lại Order với các OrderItem đã được thêm vào
    await savedOrder1.save();
    await savedOrder2.save();

    // Tạo thanh toán cho đơn hàng
    const payment1 = new Payment({
      order: savedOrder1._id,
      paymentMethod: PaymentMethod.COD,
      paymentDate: new Date(),
      amount: savedOrder1.totalAmount,
      status: true,
    });

    const payment2 = new Payment({
      order: savedOrder2._id,
      paymentMethod: PaymentMethod.VNPAY,
      paymentDate: new Date(),
      amount: savedOrder2.totalAmount,
      status: true,
    });

    // Lưu thanh toán
    const savedPayment1 = await payment1.save();
    const savedPayment2 = await payment2.save();

    // Cập nhật thanh toán vào đơn hàng
    savedOrder1.payment = savedPayment1._id;
    savedOrder2.payment = savedPayment2._id;

    // Lưu lại Order với thanh toán
    await savedOrder1.save();
    await savedOrder2.save();
// Tạo 3 hình ảnh cho mỗi sản phẩm và lưu vào ImageProduct
    const imageProduct1 = new ImageProduct({
      imageProduct: 'product1_image_1.jpg',
      product: product1._id,
    });

    const imageProduct2 = new ImageProduct({
      imageProduct: 'product1_image_2.jpg',
      product: product1._id,
    });

    const imageProduct3 = new ImageProduct({
      imageProduct: 'product1_image_3.jpg',
      product: product1._id,
    });

    const imageProduct4 = new ImageProduct({
      imageProduct: 'product2_image_1.jpg',
      product: product2._id,
    });

    const imageProduct5 = new ImageProduct({
      imageProduct: 'product2_image_2.jpg',
      product: product2._id,
    });

    const imageProduct6 = new ImageProduct({
      imageProduct: 'product2_image_3.jpg',
      product: product2._id,
    });

    const imageProduct7 = new ImageProduct({
      imageProduct: 'product3_image_1.jpg',
      product: product3._id,
    });

    const imageProduct8 = new ImageProduct({
      imageProduct: 'product3_image_2.jpg',
      product: product3._id,
    });

    const imageProduct9 = new ImageProduct({
      imageProduct: 'product3_image_3.jpg',
      product: product3._id,
    });

    await imageProduct1.save();
    await imageProduct2.save();
    await imageProduct3.save();
    await imageProduct4.save();
    await imageProduct5.save();
    await imageProduct6.save();
    await imageProduct7.save();
    await imageProduct8.save();
    await imageProduct9.save();

    // Cập nhật trường listImage trong Product
    product1.listImage = [imageProduct1._id, imageProduct2._id, imageProduct3._id];
    product2.listImage = [imageProduct4._id, imageProduct5._id, imageProduct6._id];
    product3.listImage = [imageProduct7._id, imageProduct8._id, imageProduct9._id];

    await product1.save();
    await product2.save();
    await product3.save();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
