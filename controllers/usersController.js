import prisma from "../config/prisma.js";

export const getMe = async (req, res) => {

    try {

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            },

            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });



    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }



}