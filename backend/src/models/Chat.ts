import mongoose, { Schema, Document } from "mongoose";

// Định nghĩa Enum cho Role
export enum ChatRole {
  USER = "user",
  CHATBOT = "chatbot"
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  comment: string;
  role: ChatRole;
}

const ChatSchema: Schema = new Schema<IChat>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  comment: { type: String, required: true },
  role: { type: String, enum: Object.values(ChatRole), required: true },
}, { timestamps: true });

export default mongoose.model<IChat>("Chat", ChatSchema);
