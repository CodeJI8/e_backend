import prisma from "../config/prisma.js";
import { sendResponse, serverError } from "../utils/response.js";
export const createCategory = async (req, res) => {

  const { name, sortOrder, isActive } = req.body;
  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : null;


  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");


  const parentId = req.body.parentId
    ? Number(req.body.parentId)
    : null;

  try {

    const category = await prisma.category.create({

      data: {
        name,
        slug,
        imageUrl,
        sortOrder,
        isActive,
        parentId
      }
    })

    return sendResponse(res, 201, "Category created Successfully", category)


  } catch (error) {
    console.log(error)
    return serverError(res, error);

  }


}

export const editCategory = async (req, res) => {

  try {
    const id = Number(req.params.id);
    const { name, sortOrder, isActive, parentId } = req.body;


    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    const update = await prisma.category.update({
      where: {
        id: id
      },
      data: {
        ...(name !== undefined && { name }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(imageUrl !== undefined && { imageUrl }),

        ...(parentId !== undefined && {
          parentId: parentId === null || parentId === ""
            ? null
            : Number(parentId)
        })
      }
    });



    return sendResponse(res, 200, "Category edited successfully ", update)


  } catch (error) {

    console.error("Edit category error:", error);
    return serverError(res);
  }
}

export const deleteCategory = async (req, res) => {
  try {


    const id = Number(req.params.id);

    await prisma.category.delete({

      where: { id: id }
    })

    return sendResponse(
      res,
      200,
      "Category deleted successfully"
    );

  } catch (error) {

    console.error("Delete category error:", error);
    return serverError(res);


  }
}

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { id: "asc" },
      ],
    });

    return sendResponse(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    console.log(error);
    return serverError(res, error);
  }
};


