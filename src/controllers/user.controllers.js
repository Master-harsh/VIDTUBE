import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefereshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
    
        if (!user) {
            throw new ApiError(404, "User not found");
        }
    
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generating tokens");
    }


}


const registerUser = asyncHandler(async (req, res) => {
    // TODO:
    const {fullname, email, username, password} = req.body

    // validation 
    if (
        [fullname, email, username, password].some((field) => 
        field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "fullname is required")
    }


    User.findOne({
        $or: [
            {username}, {email}
        ]
    })

    const existeduser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existeduser) {
        throw new ApiError(409, "user already exists");
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = "";
    if (coverLocalPath) {
        coverImage = await uploadOnCloudinary(coverImage);
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createUser) {
        throw new ApiError(500, "Somthing went wrong while creating user");
    }

    return res
        .status(201)
        .json( new ApiResponse(200, createUser, "user registerd successfully") );

})


const loginUser = asyncHandler(async (req, res) => {
    // get the data from the request body
    const {email, username, password} = req.body;

    // validation
    if (!email ){
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({
        $or: [
            {email}, {username}
        ]
    })

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    // validate password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // generate access and refresh tokens
    const {accessToken, refreshToken} = await generateAccessAndRefereshToken(user._id);

    const loggedInUser = await User.findById(user._id)
    .select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
})


export {
    registerUser,
    loginUser
}