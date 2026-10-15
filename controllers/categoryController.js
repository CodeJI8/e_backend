import prisma from "../config/prisma.js";
import { sendResponse, serverError } from "../utils/response.js";
export const createCategory = async(req, res) =>{

    const {name  ,  sortOrder , isActive , parentId } = req.body;
const imageUrl = req.file
  ? `/uploads/${req.file.filename}`
  : null;


    try {

        const category  = await prisma.category.create({

            data:{
               name , 
                imageUrl , 
                sortOrder , 
                isActive ,
                parentId
            }
        })

        return sendResponse(res, 201 , "Category created Successfully" , category)

        
    } catch (error) {
        console.log(error)
        return serverError(res, error);
        
    }





}

export const editCategory = async(req, res) =>{
    
}


export const deleteCategory = async(req, res) =>{
    
}



export const getCategory = async(req, res) =>{
    
}



