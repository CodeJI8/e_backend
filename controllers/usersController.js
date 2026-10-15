import prisma from "../config/prisma.js";
import { sendResponse, serverError } from "../utils/response.js";

export const getProfile = async (req, res) => {

    try {

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId    //check auth middle ware if forgot again + auth controller 
            },

            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true
            },
        });
        if (!user) {
            return sendResponse(res, 200, "User not found")
        }

        return sendResponse(res, 200, "Profile fetched", user);



    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return serverError(res);
    }



}


export const editProfile = async (req, res) => {
    const id = req.user.userId

    const { name, email } = req.body

    try {

        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
            },

            select: {
                id: true,
                name: true,
                email: true,
            },

        })
        return sendResponse(res, 200,
            "Profile updated successfully",
            user,
        );



    }
    catch (error) {
        if (error.code === "P2002") {
            // error.meta.target can name the field, but it varies with the Prisma
            // adapter, so don't rely on it. Only email is unique here anyway.
            return sendResponse(res, 409, "This email is already in use");
        }
        if (error.code === "P2025") {
            return sendResponse(res, 404, "User not found");
        }
        console.error("Error updating profile:", error);
        return serverError(res);
    }

}


export const deleteprofile = async (req, res) => {

    try {

        await prisma.user.delete({
            where: {
                id: req.user.userId
            }
        })

        return sendResponse(
            res,
            200,
            "Profile deleted successfully"
        );
    } catch (error) {
        if (error.code === "P2025") {
            return sendResponse(res, 404, "User not found");
        }

        console.error("Error deleting profile:", error);
        return serverError(res);
    }





}
