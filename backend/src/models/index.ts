// models/index.js
import mongoose from "mongoose";
import User from "./user.js"; // import model User (Mongoose schema đã export)

// Object db để gom tất cả model
const db = {};

db.mongoose = mongoose;
db.User = User;

export default db;
