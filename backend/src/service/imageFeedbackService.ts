import { OrderItem } from "../models/OrderItem";
import Product, { IProduct } from "../models/Product";
import ProductSize from "../models/ProductSize";
import { ImageFeedback } from "../models/ImageFeedback";
import {Feedback} from "../models/Feedback"

export const getImageFeedbackService = async (id: string) => {
    try{
        const imageFeedbacks = await ImageFeedback.find({feedback: id}).select("imageFeedback");
        
        if(!imageFeedbacks) return {
            success: false,
                message: "Image Feedback not found"
        }
        return {
            success: true,
            message:"imageFeedbacks found",
            data: imageFeedbacks
        }
    }catch(err: any){
        return {
            success: false,
            message: err.message
        }
    }
}