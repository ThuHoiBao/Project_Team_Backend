
import  User  from '../models/User.ts';
import  Product  from '../models/Product';
import  Order  from '../models/Order';
import { AddressDelivery } from '../models/AddressDelivery';
import { Payment } from '../models/Payment';
import { ImageProduct } from '../models/ImageProduct';
import { OrderItem } from '../models/OrderItem';
import { Coupon } from '../models/Coupon'; // Thêm import Coupon model
import ProductSize from '../models/ProductSize';
import Category from '../models/Category';
import { OrderStatus } from '../models/Order'; // Giả sử OrderStatus đã được export từ Order model
import { Coin } from '../models/Coin.ts';

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

    const user3 = new User({
      firstName: 'Tran',
      lastName: 'Van',
      email: 'tran.van@example.com',
      password: 'hashedpassword789',
      phoneNumber: '0911223344',
      gender: true,
      role: 'Customer',
      image: 'user_image_3.jpg',
    });

    const user4 = new User({
      firstName: 'Le',
      lastName: 'Thi',
      email: 'le.thi@example.com',
      password: 'hashedpassword101',
      phoneNumber: '0922334455',
      gender: false,
      role: 'Customer',
      image: 'user_image_4.jpg',
    });

    const user5 = new User({
      firstName: 'Hoang',
      lastName: 'Phuc',
      email: 'hoang.phuc@example.com',
      password: 'hashedpassword112',
      phoneNumber: '0933445566',
      gender: true,
      role: 'Customer',
      image: 'user_image_5.jpg',
    });

    const user6 = new User({
      firstName: 'Huynh',
      lastName: 'Linh',
      email: 'huynh.linh@example.com',
      password: 'hashedpassword131',
      phoneNumber: '0944556677',
      gender: false,
      role: 'Customer',
      image: 'user_image_6.jpg',
    });

    const user7 = new User({
      firstName: 'Phan',
      lastName: 'Anh',
      email: 'phan.anh@example.com',
      password: 'hashedpassword415',
      phoneNumber: '0955667788',
      gender: true,
      role: 'Customer',
      image: 'user_image_7.jpg',
    });

    const user8 = new User({
      firstName: 'Vo',
      lastName: 'Ngoc',
      email: 'vo.ngoc@example.com',
      password: 'hashedpassword161',
      phoneNumber: '0966778899',
      gender: false,
      role: 'Customer',
      image: 'user_image_8.jpg',
    });

    const user9 = new User({
      firstName: 'Dang',
      lastName: 'Minh',
      email: 'dang.minh@example.com',
      password: 'hashedpassword718',
      phoneNumber: '0977889900',
      gender: true,
      role: 'Customer',
      image: 'user_image_9.jpg',
    });

    const user10 = new User({
      firstName: 'Bui',
      lastName: 'Ha',
      email: 'bui.ha@example.com',
      password: 'hashedpassword191',
      phoneNumber: '0988990011',
      gender: false,
      role: 'Customer',
      image: 'user_image_10.jpg',
    });

    const user11 = new User({
      firstName: 'Do',
      lastName: 'Tuan',
      email: 'do.tuan@example.com',
      password: 'hashedpassword202',
      phoneNumber: '0912341234',
      gender: true,
      role: 'Customer',
      image: 'user_image_11.jpg',
    });

    const user12 = new User({
      firstName: 'Ngo',
      lastName: 'Phuong',
      email: 'ngo.phuong@example.com',
      password: 'hashedpassword212',
      phoneNumber: '0923452345',
      gender: false,
      role: 'Customer',
      image: 'user_image_12.jpg',
    });

    const user13 = new User({
      firstName: 'Duong',
      lastName: 'Huy',
      email: 'duong.huy@example.com',
      password: 'hashedpassword223',
      phoneNumber: '0934563456',
      gender: true,
      role: 'Customer',
      image: 'user_image_13.jpg',
    });

    const user14 = new User({
      firstName: 'Ly',
      lastName: 'Thao',
      email: 'ly.thao@example.com',
      password: 'hashedpassword242',
      phoneNumber: '0945674567',
      gender: false,
      role: 'Customer',
      image: 'user_image_14.jpg',
    });

    const user15 = new User({
      firstName: 'Vu',
      lastName: 'Quan',
      email: 'vu.quan@example.com',
      password: 'hashedpassword252',
      phoneNumber: '0956785678',
      gender: true,
      role: 'Customer',
      image: 'user_image_15.jpg',
    });

    const user16 = new User({
      firstName: 'Ho',
      lastName: 'Yen',
      email: 'ho.yen@example.com',
      password: 'hashedpassword262',
      phoneNumber: '0967896789',
      gender: false,
      role: 'Customer',
      image: 'user_image_16.jpg',
    });

    const user17 = new User({
      firstName: 'Dinh',
      lastName: 'Bao',
      email: 'dinh.bao@example.com',
      password: 'hashedpassword272',
      phoneNumber: '0978907890',
      gender: true,
      role: 'Customer',
      image: 'user_image_17.jpg',
    });

    const user18 = new User({
      firstName: 'Mai',
      lastName: 'Trang',
      email: 'mai.trang@example.com',
      password: 'hashedpassword282',
      phoneNumber: '0989018901',
      gender: false,
      role: 'Customer',
      image: 'user_image_18.jpg',
    });

    const user19 = new User({
      firstName: 'Trinh',
      lastName: 'Son',
      email: 'trinh.son@example.com',
      password: 'hashedpassword292',
      phoneNumber: '0913211321',
      gender: true,
      role: 'Customer',
      image: 'user_image_19.jpg',
    });

    const user20 = new User({
      firstName: 'Cao',
      lastName: 'Quynh',
      email: 'cao.quynh@example.com',
      password: 'hashedpassword303',
      phoneNumber: '0924322432',
      gender: false,
      role: 'Customer',
      image: 'user_image_20.jpg',
    });

    const user21 = new User({
      firstName: 'Luong',
      lastName: 'Khai',
      email: 'luong.khai@example.com',
      password: 'hashedpassword313',
      phoneNumber: '0935433543',
      gender: true,
      role: 'Customer',
      image: 'user_image_21.jpg',
    });

    const user22 = new User({
      firstName: 'Vuong',
      lastName: 'Nhi',
      email: 'vuong.nhi@example.com',
      password: 'hashedpassword323',
      phoneNumber: '0946544654',
      gender: false,
      role: 'Customer',
      image: 'user_image_22.jpg',
    });

    const user23 = new User({
      firstName: 'Nguyen',
      lastName: 'An',
      email: 'nguyen.an@example.com',
      password: 'hashedpassword334',
      phoneNumber: '0915678901',
      gender: true,
      role: 'Customer',
      image: 'user_image_23.jpg',
    });

    const user24 = new User({
      firstName: 'Tran',
      lastName: 'Bich',
      email: 'tran.bich@example.com',
      password: 'hashedpassword345',
      phoneNumber: '0984567892',
      gender: false,
      role: 'Customer',
      image: 'user_image_24.jpg',
    });

    const user25 = new User({
      firstName: 'Le',
      lastName: 'Cuong',
      email: 'le.cuong@example.com',
      password: 'hashedpassword356',
      phoneNumber: '0973456783',
      gender: true,
      role: 'Customer',
      image: 'user_image_25.jpg',
    });

    const user26 = new User({
      firstName: 'Pham',
      lastName: 'Dung',
      email: 'pham.dung@example.com',
      password: 'hashedpassword367',
      phoneNumber: '0962345674',
      gender: false,
      role: 'Customer',
      image: 'user_image_26.jpg',
    });

    const user27 = new User({
      firstName: 'Hoang',
      lastName: 'Giang',
      email: 'hoang.giang@example.com',
      password: 'hashedpassword378',
      phoneNumber: '0951234565',
      gender: true,
      role: 'Customer',
      image: 'user_image_27.jpg',
    });

    const user28 = new User({
      firstName: 'Huynh',
      lastName: 'Huong',
      email: 'huynh.huong@example.com',
      password: 'hashedpassword389',
      phoneNumber: '0949876546',
      gender: false,
      role: 'Customer',
      image: 'user_image_28.jpg',
    });

    const user29 = new User({
      firstName: 'Phan',
      lastName: 'Khanh',
      email: 'phan.khanh@example.com',
      password: 'hashedpassword390',
      phoneNumber: '0938765437',
      gender: true,
      role: 'Customer',
      image: 'user_image_29.jpg',
    });

    const user30 = new User({
      firstName: 'Vo',
      lastName: 'Lien',
      email: 'vo.lien@example.com',
      password: 'hashedpassword401',
      phoneNumber: '0927654328',
      gender: false,
      role: 'Customer',
      image: 'user_image_30.jpg',
    });

    const user31 = new User({
      firstName: 'Dang',
      lastName: 'Long',
      email: 'dang.long@example.com',
      password: 'hashedpassword412',
      phoneNumber: '0916543219',
      gender: true,
      role: 'Customer',
      image: 'user_image_31.jpg',
    });

    const user32 = new User({
      firstName: 'Bui',
      lastName: 'My',
      email: 'bui.my@example.com',
      password: 'hashedpassword423',
      phoneNumber: '0905432101',
      gender: false,
      role: 'Customer',
      image: 'user_image_32.jpg',
    });

    const user33 = new User({
      firstName: 'Do',
      lastName: 'Nam',
      email: 'do.nam@example.com',
      password: 'hashedpassword434',
      phoneNumber: '0914321092',
      gender: true,
      role: 'Customer',
      image: 'user_image_33.jpg',
    });

    const user34 = new User({
      firstName: 'Ngo',
      lastName: 'Oanh',
      email: 'ngo.oanh@example.com',
      password: 'hashedpassword445',
      phoneNumber: '0983210983',
      gender: false,
      role: 'Customer',
      image: 'user_image_34.jpg',
    });

    const user35 = new User({
      firstName: 'Duong',
      lastName: 'Phong',
      email: 'duong.phong@example.com',
      password: 'hashedpassword456',
      phoneNumber: '0972109874',
      gender: true,
      role: 'Customer',
      image: 'user_image_35.jpg',
    });

    const user36 = new User({
      firstName: 'Ly',
      lastName: 'Quyen',
      email: 'ly.quyen@example.com',
      password: 'hashedpassword467',
      phoneNumber: '0961098765',
      gender: false,
      role: 'Customer',
      image: 'user_image_36.jpg',
    });

    const user37 = new User({
      firstName: 'Vu',
      lastName: 'Sang',
      email: 'vu.sang@example.com',
      password: 'hashedpassword478',
      phoneNumber: '0950987654',
      gender: true,
      role: 'Customer',
      image: 'user_image_37.jpg',
    });

    const user38 = new User({
      firstName: 'Ho',
      lastName: 'Thuy',
      email: 'ho.thuy@example.com',
      password: 'hashedpassword489',
      phoneNumber: '0949876543',
      gender: false,
      role: 'Customer',
      image: 'user_image_38.jpg',
    });

    const user39 = new User({
      firstName: 'Dinh',
      lastName: 'Tung',
      email: 'dinh.tung@example.com',
      password: 'hashedpassword490',
      phoneNumber: '0938765432',
      gender: true,
      role: 'Customer',
      image: 'user_image_39.jpg',
    });

    const user40 = new User({
      firstName: 'Mai',
      lastName: 'Uyen',
      email: 'mai.uyen@example.com',
      password: 'hashedpassword501',
      phoneNumber: '0927654321',
      gender: false,
      role: 'Customer',
      image: 'user_image_40.jpg',
    });

    const user41 = new User({
      firstName: 'Trinh',
      lastName: 'Viet',
      email: 'trinh.viet@example.com',
      password: 'hashedpassword512',
      phoneNumber: '0916543210',
      gender: true,
      role: 'Customer',
      image: 'user_image_41.jpg',
    });

    const user42 = new User({
      firstName: 'Cao',
      lastName: 'Xuan',
      email: 'cao.xuan@example.com',
      password: 'hashedpassword523',
      phoneNumber: '0905432109',
      gender: false,
      role: 'Customer',
      image: 'user_image_42.jpg',
    });

    await user1.save();
    await user2.save();
    await user3.save();
    await user4.save();
    await user5.save();
    await user6.save();
    await user7.save();
    await user8.save();
    await user9.save();
    await user10.save();
    await user11.save();
    await user11.save();
    await user12.save();
    await user13.save();
    await user14.save();
    await user15.save();
    await user16.save();
    await user17.save();
    await user18.save();
    await user19.save();
    await user20.save();
    await user21.save();
    await user22.save();
    await user23.save();
    await user24.save();
    await user25.save();
    await user26.save();
    await user27.save();
    await user28.save();
    await user29.save();
    await user30.save();
    await user31.save();
    await user32.save();
    await user33.save();
    await user34.save();
    await user35.save();
    await user36.save();
    await user37.save();
    await user38.save();
    await user39.save();
    await user40.save();
    await user41.save();
    await user42.save();

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

    const coin1=new Coin({
      User: user1._id,
      value: 1200,
    })
    const coin2=new Coin({
      User: user2._id,
      value: 1100,
    })

    const saveCoin1= await coin1.save();
    const saveCoin2= await coin2.save();

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
      imageProduct: 'https://storage.googleapis.com/bucket_mobileapp/images/Apple_Iphone_16_Pro_Max_128GB_Den.jpg',
      product: product1._id,
    });

    const imageProduct2 = new ImageProduct({
      imageProduct: 'https://storage.googleapis.com/bucket_mobileapp/images/Apple_Iphone_16_Pro_Max_128GB_Sa_Mac.jpg',
      product: product1._id,
    });

    const imageProduct3 = new ImageProduct({
      imageProduct: 'https://storage.googleapis.com/bucket_mobileapp/images/SAMSUNG_Galaxy%20S25%2B_512GB_Gray.jpg',
      product: product1._id,
    });

    const imageProduct4 = new ImageProduct({
      imageProduct: 'https://storage.googleapis.com/bucket_mobileapp/images/SAMSUNG_Galaxy_A16_5G_Gray.jpg',
      product: product2._id,
    });

    const imageProduct5 = new ImageProduct({
      imageProduct: 'https://storage.googleapis.com/bucket_mobileapp/images/I24_Ultra_5G_Unlocked_Phones_Black.jpg',
      product: product2._id,
    });

    const imageProduct6 = new ImageProduct({
      imageProduct: 'https://storage.googleapis.com/bucket_mobileapp/images/I24_Ultra_5G_Unlocked_Phones_Gray.jpg',
      product: product2._id,
    });

    const imageProduct7 = new ImageProduct({
      imageProduct: 'https://storage.googleapis.com/bucket_mobileapp/images/Apple_Iphone_16_Pro_Max_128GB_Sa_Mac.jpg',
      product: product3._id,
    });

    const imageProduct8 = new ImageProduct({
      imageProduct: 'https://storage.googleapis.com/bucket_mobileapp/images/Apple_Iphone_16_Pro_Max_128GB_Xanh.jpg',
      product: product3._id,
    });

    const imageProduct9 = new ImageProduct({
      imageProduct: 'https://storage.googleapis.com/bucket_mobileapp/images/Apple_Iphone_14_Pro_Max_128GB_Do.webp',
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

