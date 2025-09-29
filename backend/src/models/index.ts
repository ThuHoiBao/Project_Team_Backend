// models/index.js
import mongoose from "mongoose";

import User from "./User.ts";
import {Order} from "./Order.ts";
import { OrderItem } from "./OrderItem.ts";
import { AddressDelivery } from "./AddressDelivery.ts";
import { Payment } from "./Payment.ts";
import { Coupon } from "./Coupon.ts";
import Product from "./Product.ts";
import { ImageProduct } from "./ImageProduct.ts";
import {Coin} from "./Coin.ts"
// Object db gom tất cả model
const db = {
    mongoose,
    User,
    Order,
    OrderItem,
    AddressDelivery,
    Payment,
    Coupon,
    Product,
    ImageProduct,
    Coin
};



export default db;
