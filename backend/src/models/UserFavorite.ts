import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserFavorite extends Document {
    user_id: Types.ObjectId; 
    product_id: Types.ObjectId; 
    created_at?: Date; 
}

// Định nghĩa Schema cho MongoDB
const UserFavoriteSchema: Schema = new Schema<IUserFavorite>(
    {
        // id (Primary Key) sẽ được MongoDB tự động tạo là _id
        
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Giả định tên model User là "User"
            required: true,
            index: true // Tạo index để tăng tốc độ truy vấn theo user
        },
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product", // Liên kết đến model Product
            required: true,
            index: true // Tạo index để tăng tốc độ truy vấn theo product
        }
    },
    {
        timestamps: true 
    }
);

// Tạo index kết hợp (compound index) để đảm bảo mỗi cặp (user_id, product_id) là duy nhất
// Điều này ngăn người dùng lưu cùng một sản phẩm vào mục yêu thích hai lần.
UserFavoriteSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

// Tạo virtual 'id' để chuẩn hóa cách truy cập ID (như trong model Product của bạn)
UserFavoriteSchema.virtual("id").get(function (this: any) {
    return this._id.toString();
});

// Cấu hình toJSON để loại bỏ _id và thêm virtuals khi chuyển đổi sang JSON
UserFavoriteSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id; 
    },
});

// Export model
export default mongoose.model<IUserFavorite>("UserFavorite", UserFavoriteSchema);