import { User } from "../modles/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent } from "../utils/mail.js";
import jwt from "jsonwebtoken";
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
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,{user:req.user},"Current user fetched successfully")
    )
})
const verifyEmail=asyncHandler(async(req,res)=>{
    const {verificationToken} = req.params;

    if(!verificationToken){
        throw new ApiError(400,"Verification token is missing")
    }

    let hashedToken=crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

    const user=await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
    })
    if(!user){
        throw new ApiError(400,"Token is invalid or has expired");
    }

    user.emailVerificationToken=undefined;
    user.emailVerificationExpiry=undefined;
    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,{isEmailVerified:true},"Email verified successfully")
    )
})
const resendEmailVerification=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id);

    if(!user){
        throw new ApiError(404,"User does not exist")
    }
    if(user.isEmailVerified){
        throw new ApiError(400,"Email is already verified")
    }
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
    return res.status(200).json(
        new ApiResponse(200,null,"Verification email resent successfully")
    )
})
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    }
    
    try{
    const decodeToken=  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodeToken?._id);
    if(!user){
        throw new ApiError(401,"Invalid refresh token");
    }
    if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401,"Invalid refresh token");
    }

    const options ={
        httpOnly:true,
        secure:true
    }
    const {accessToken, newRefreshToken} = await generateAccessandRefreshTokens(user._id);
    user.refreshToken=newRefreshToken;
    await user.save()

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access token refreshed successfully")
    )
    }

    catch(error){
        throw new ApiError(401, "Invalid refresh token");
    }

})

const forgotPasswordRequest=asyncHandler(async(req,res)=>{
    const {email}=req.body;
    const user=await User.findOne({email});
    if(!user){
        throw new ApiError(404,"User with this email does not exist");
    }

    const {unHashedToken,hashedToken,tokenExpiry} =user.generateTEmporaryToken();
    user.forgotPasswordToken=hashedToken;
    user.forgotPasswordExpiry=tokenExpiry;
    await user.save({validateBeforeSave:false});

    await sendEmail({
        email:user.email,
        subject:"Password reset request",
        mailgenContent:forgotPasswordMailgenContent(
            user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
        ),
    });
    return res.status(200).json(
        new ApiResponse(200,null,"Password reset email sent successfully")
    )

})
const resetForgottenPassword=asyncHandler(async(req,res)=>{
        const {resetToken}=req.params;
        const {newPassword}=re.body;

        let hashedToken=crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

        const user=  await User.findOne({
            forgotPasswordToken:hashedToken,
            forgotPasswordExpiry:{$gt:Date.now()}
        })
        if(!user){
            throw new ApiError(400,"Token is invalid or has expired")
        }
        user.forgotPasswordExpiry=undefined;
        user.forgotPasswordToken=undefined;
        user.password=newPassword;
        await user.save({validateBeforeSave:false});

        return res.status(200).json(
            new ApiResponse(200,null,"Password reset successfully")
        )
})
const changePassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    const user=await User.findById(req.user?._id);
    const isPasswordValid= await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid old password");
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(200,null,"Password changed successfully")
    )
})
// const getCurrentUser=asyncHandler(async(req,res)=>{

// })

export { registerUser, generateAccessandRefreshTokens, login,logoutUser,getCurrentUser ,verifyEmail,refreshAccessToken,resendEmailVerification
    ,forgotPasswordRequest,resetForgottenPassword,changePassword
};