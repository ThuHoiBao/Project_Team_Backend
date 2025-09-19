import User from "../models/user"

export const getUsernameByIdService = async (id: string) => {
    try {
        const user = await User.findById(id).select("firstName lastName");
        if (!user) {
            return {
                success: false,
                message: "User not found"
            }
        }
        return {
            success: true,
            message: "User found",
            data: user.firstName + " " + user.lastName
        }
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        }
    }
}