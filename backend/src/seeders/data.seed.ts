
// import User from '../models/user';
// import Product from '../models/Product';
// import {Order} from '../models/Order';
// import {AddressDelivery} from '../models/AddressDelivery';
// import {Payment} from '../models/Payment';
// import {ImageProduct} from '../models/ImageProduct';
// import {OrderItem} from '../models/OrderItem';
// import ProductSize from '../models/ProductSize';

// import Category from '../models/Category';

// // Tạo dữ liệu mẫu
// export const seedDatabase = async () => {
//   try {
//     // Xóa dữ liệu cũ
//     await User.deleteMany();
//     await Product.deleteMany();
//     await Order.deleteMany();
//     await AddressDelivery.deleteMany();
//     await Payment.deleteMany();
//     await ImageProduct.deleteMany();
//     await OrderItem.deleteMany();
//     await ProductSize.deleteMany();

//     // Tạo dữ liệu người dùng
//     const user1 = new User({
//       firstName: 'Nguyen',
//       lastName: 'Thanh',
//       email: 'nguyen.thanh@example.com',
//       password: 'hashedpassword123',
//       phoneNumber: '0912345678',
//       gender: true,
//       role: 'Customer',
//       image: 'user_image_1.jpg',
//     });

//     const user2 = new User({
//       firstName: 'Pham',
//       lastName: 'Mai',
//       email: 'pham.mai@example.com',
//       password: 'hashedpassword456',
//       phoneNumber: '0987654321',
//       gender: false,
//       role: 'Customer',
//       image: 'user_image_2.jpg',
//     });

//     await user1.save();
//     await user2.save();

//     // Tạo sản phẩm áo
//   // Tạo dữ liệu danh mục
//   const category1 = new Category({
//     categoryName: 'Áo Thun',  // Tên danh mục
//   });

//   const category2 = new Category({
//     categoryName: 'Áo Hoodie',  // Tên danh mục
//   });

//   await category1.save();
//   await category2.save();

//   // Tạo sản phẩm và gán danh mục cho sản phẩm
//   const product1 = new Product({
//     productName: 'Áo Thun Trường Đỏ',
//     description: 'Áo thun màu đỏ dành cho các sự kiện của trường.',
//     quantity: 200,
//     price: 150000,
//     category: category1._id,  // Gán danh mục
//   });

//   const product2 = new Product({
//     productName: 'Áo Thun Trường Xanh',
//     description: 'Áo thun màu xanh dành cho các sự kiện của trường.',
//     quantity: 150,
//     price: 160000,
//     category: category1._id,  // Gán danh mục
//   });

//   const product3 = new Product({
//     productName: 'Áo Hoodie Trường',
//     description: 'Áo hoodie dành cho học sinh vào mùa lạnh.',
//     quantity: 100,
//     price: 250000,
//     category: category2._id,  // Gán danh mục
//   });

//   await product1.save();
//   await product2.save();
//   await product3.save();


//     // Tạo hình ảnh sản phẩm (mỗi sản phẩm có nhiều hình ảnh)
//     const imageProduct1 = new ImageProduct({
//       imageProduct: 'product1_image_1.jpg',
//       product: product1._id,
//     });

//     const imageProduct2 = new ImageProduct({
//       imageProduct: 'product1_image_2.jpg',
//       product: product1._id,
//     });

//     const imageProduct3 = new ImageProduct({
//       imageProduct: 'product1_image_3.jpg',
//       product: product1._id,
//     });

//     const imageProduct4 = new ImageProduct({
//       imageProduct: 'product2_image_1.jpg',
//       product: product2._id,
//     });

//     const imageProduct5 = new ImageProduct({
//       imageProduct: 'product2_image_2.jpg',
//       product: product2._id,
//     });

//     const imageProduct6 = new ImageProduct({
//       imageProduct: 'product2_image_3.jpg',
//       product: product2._id,
//     });

//     const imageProduct7 = new ImageProduct({
//       imageProduct: 'product3_image_1.jpg',
//       product: product3._id,
//     });

//     const imageProduct8 = new ImageProduct({
//       imageProduct: 'product3_image_2.jpg',
//       product: product3._id,
//     });

//     const imageProduct9 = new ImageProduct({
//       imageProduct: 'product3_image_3.jpg',
//       product: product3._id,
//     });

//     await imageProduct1.save();
//     await imageProduct2.save();
//     await imageProduct3.save();
//     await imageProduct4.save();
//     await imageProduct5.save();
//     await imageProduct6.save();
//     await imageProduct7.save();
//     await imageProduct8.save();
//     await imageProduct9.save();

//     // Tạo kích thước sản phẩm (mỗi sản phẩm có nhiều kích thước)
//     const productSize1 = new ProductSize({
//       product: product1._id,
//       size: 'M',
//       quantity: 50,
//     });

//     const productSize2 = new ProductSize({
//       product: product1._id,
//       size: 'L',
//       quantity: 100,
//     });

//     const productSize3 = new ProductSize({
//       product: product2._id,
//       size: 'M',
//       quantity: 75,
//     });

//     const productSize4 = new ProductSize({
//       product: product2._id,
//       size: 'XL',
//       quantity: 50,
//     });

//     const productSize5 = new ProductSize({
//       product: product3._id,
//       size: 'L',
//       quantity: 60,
//     });

//     const productSize6 = new ProductSize({
//       product: product3._id,
//       size: 'XL',
//       quantity: 40,
//     });

//     await productSize1.save();
//     await productSize2.save();
//     await productSize3.save();
//     await productSize4.save();
//     await productSize5.save();
//     await productSize6.save();

//     // Cập nhật trường productSizes trong Product
//     product1.productSizes = [productSize1._id, productSize2._id];
//     product2.productSizes = [productSize3._id, productSize4._id];
//     product3.productSizes = [productSize5._id, productSize6._id];

//     await product1.save();
//     await product2.save();
//     await product3.save();

//     // Tạo địa chỉ giao hàng
//     const address1 = new AddressDelivery({
//       user: user1._id,
//       address: '123 Đường A, Quận B, Thành Phố C',
//       fullName: 'Nguyen Thanh',
//       phoneNumber: '0912345678',
//       isDefault: true,
//     });

//     const address2 = new AddressDelivery({
//       user: user2._id,
//       address: '456 Đường D, Quận E, Thành Phố F',
//       fullName: 'Pham Mai',
//       phoneNumber: '0987654321',
//       isDefault: false,
//     });

//     await address1.save();
//     await address2.save();

//  enum PaymentMethod {
//   VNPAY = "VNPAY",
//   COD = "COD",
//   COIN = "COIN"
// }

// // Tạo đơn hàng với 3 OrderItem mỗi đơn hàng
// const order1 = new Order({
//   user: user1._id,
//   orderItems: [
//     new OrderItem({
//       product: product1._id,
//       price: 150000,
//       size: 'M',  // Lưu kích thước vào trường size
//       quantity: 2,
//       feedback: null,  // Cần thay thế ID feedback nếu có
//     }),
//     new OrderItem({
//       product: product2._id,
//       price: 160000,
//       size: 'L',
//       quantity: 1,
//       feedback: null,
//     }),
//     new OrderItem({
//       product: product3._id,
//       price: 250000,
//       size: 'L',
//       quantity: 1,
//       feedback: null,
//     }),
//   ],
//   addressDelivery: address1._id,
//   status: 'SHIPPED',
//   totalAmount: 550000,  // Tổng số tiền cho đơn hàng này (150000 * 2 + 160000 + 250000)
// });

// const order2 = new Order({
//   user: user2._id,
//   orderItems: [
//     new OrderItem({
//       product: product1._id,
//       price: 150000,
//       size: 'M',  // Lưu kích thước vào trường size
//       quantity: 1,
//       feedback: null,
//     }),
//     new OrderItem({
//       product: product2._id,
//       price: 160000,
//       size: 'M',
//       quantity: 2,
//       feedback: null,
//     }),
//     new OrderItem({
//       product: product3._id,
//       price: 250000,
//       size: 'XL',
//       quantity: 1,
//       feedback: null,
//     }),
//   ],
//   addressDelivery: address2._id,
//   status: 'CONFIRMED',
//   totalAmount: 820000,  // Tổng số tiền cho đơn hàng này (150000 + 160000 * 2 + 250000)
// });

// // Lưu đơn hàng trước khi tạo thanh toán
// await order1.save();
// await order2.save();

//     // Tạo thanh toán cho đơn hàng
//     const payment1 = new Payment({
//       order: order1._id,
//       paymentMethod: PaymentMethod.COD,
//       paymentDate: new Date(),
//       amount: 300000,
//       status: true,
//     });

//     const payment2 = new Payment({
//       order: order2._id,
//       paymentMethod: PaymentMethod.VNPAY,
//       paymentDate: new Date(),
//       amount: 160000,
//       status: true,
//     });

//     // Lưu thanh toán sau khi lưu đơn hàng
//     await payment1.save();
//     await payment2.save();

//     // Cập nhật thanh toán vào đơn hàng
//     order1.payment = payment1._id;
//     order2.payment = payment2._id;

//     await order1.save();
//     await order2.save();


//     console.log('Database seeded successfully!');

//   } catch (error) {
//     console.error('Error seeding database:', error);

//   }
// };
