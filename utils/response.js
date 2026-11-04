
export const sendResponse = (
    res,
    statusCode,
    message,
    data = null,
    extra = {}
) => {
    return res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 400,
        message,
        ...(data !== null && { data }),
        ...extra,
    });
};



export const serverError = (res, error) => {
    console.error("Server error:", error);
    return sendResponse(res, 500, "Internal server error");
};
