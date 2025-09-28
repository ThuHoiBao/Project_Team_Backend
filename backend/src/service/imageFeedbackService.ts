import { OrderItem } from "../models/OrderItem";
import Product, { IProduct } from "../models/Product";
import ProductSize from "../models/ProductSize";
import { ImageFeedback } from "../models/ImageFeedback";

export const getImageFeedbackService = async (id: string) => {
    try{
        const orderItem = await OrderItem.find({feedback: id}).select("id");
        if(orderItem.length === 0){
            return {
                success: false,
                message: "Feedback not found"
            }
        }
        const orderItemId = orderItem[0].id;
        console.log(orderItemId);
        
        const imageFeedbacks = await ImageFeedback.find({feedback: orderItemId}).select("imageFeedback");
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