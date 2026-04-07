import { User } from "../modles/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js";

const generateAccessandRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    const userExists = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (userExists) {
        throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
        email,
        username,
        password,
        isEmailVerified: false,
    });

    const { unHashed, hashedToken, tokenExpiry } = user.generateTEmporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: "Please verify your email address",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/auth/verify-email/${unHashed}`,
        ),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    res.status(201).json(
        new ApiResponse(
            201,
            { user: createdUser },
            "User registered successfully and verification email has been sent",
        ),
    );
});

const login = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    if (!email) {
        throw new ApiError(400, "Please provide email or username to login");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "Invalid email or password");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid email or password");
    }
    const { accessToken, refreshToken } =
        await generateAccessandRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options = {
        httpOnly: true,
        secure: true,

    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
                "Login succesfully"
            )
        )
});

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },
        {
            new:true,
        },
        
    );
    const options ={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new ApiResponse(200,null,"Logged out successfully")
    )
    });


export { registerUser, generateAccessandRefreshTokens, login,logoutUser };