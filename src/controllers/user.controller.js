import { asyncHandler } from "../utils/asyncHandler.js";


const resgisterUser = asyncHandler( async (req, res) => {
    return res.status(200).json({
        message: "Ok"
    })
})


export {resgisterUser}