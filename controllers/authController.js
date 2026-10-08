import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";





export const register = async (req, res) => {
  const { name, email, password } = req.body;



  try{
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide username, email, and password" });
    }

    const existingUser  =  await prisma.user.findUnique({
        where:{email}, 

    })

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }



    const passHash = await bcrypt.hash(password, 10);

    const user  = await prisma.user.create({
        data:{name, email, passwordHash:passHash

        }

    })

    res.status(201).json({
        message: "User registered successfully",
        user: {     id: user.id,
        name: user.name,
        email: user.email,

        }})

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
            return res.status(400).json({message:"Please provide email and password"})
        }

        const user  =  await prisma.user.findUnique({


            where:{email}
            
        })
 

        if(!user){

            return res.status(404).json({message:"User not found"})
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid password"})
        }


    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });


        
    }
    catch(error){
      console.error("Error logging in user:", error);
      res.status(500).json({ message: "Internal server error" });
    }



  }
