import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { sendResponse ,serverError } from "../utils/response.js";





export const register = async (req, res) => {
  const { name, email, password } = req.body;
const profileImage = req.file
  ? `/uploads/${req.file.filename}`
  : null;



  try{

    
    if (!name || !email || !password) {
   return sendResponse(res, 400, "Please provide name, email, and password");
    }

    const existingUser  =  await prisma.user.findUnique({
        where:{email}, 

    })

    if (existingUser) {
return sendResponse(res, 409, "Email already registered");
    }



    const passHash = await bcrypt.hash(password, 10);

    const user  = await prisma.user.create({
        data:{name, email, passwordHash:passHash ,
            profileImage,

        }

    })

return sendResponse(res, 201, "User registered successfully", {
    id: user.id,
    name: user.name,
    email: user.email,
});

  }
  catch(error){
    console.error("Error registering user:", error);
  
    res.status(500).json({ message: error.message });
  }

}


  export const login  =  async (req, res) =>{

    const {email, password} = req.body;
    try{

               if(!email || !password){
       return sendResponse(res, 400, "Please provide email and password");
        }

        const user  =  await prisma.user.findUnique({


            where:{email}
            
        })
 

        if(!user){

           return sendResponse(res, 404, "User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if(!isPasswordValid){
   return sendResponse(res, 401, "Invalid password");
        }


    const token = jwt.sign(
      {
        userId: user.id,      // ei line e userID te user.id ta ache , jeita pore middlewaree req.user e nichi  check authmiddle ware and for usage check usercontroller 
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

 return sendResponse(res, 200, "Login successful", {
    id: user.id,
    name: user.name,
    email: user.email,
}, { token });


        
    }
    catch(error){
      console.error("Error logging in user:", error);
      return serverError(res);
    }



  }
