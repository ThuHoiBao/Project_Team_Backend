import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);
NotificationSchema.virtual("id").get(function (this: INotification) {
    return this._id.toString();
});

NotificationSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
});


const Notification =
    mongoose.models.Notification ||
    mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
