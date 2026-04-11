import {body} from "express-validator";

const userRegisterValidator =()=>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLowercase()
        .withMessage("Username must be in lowercase")
        .isLength({min:3})
        .withMessage("Username must be at least 3 characters long"),
        body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({min:6})
        .withMessage("Password must be at least 6 characters long"),
        body("fullName")
        .trim()
        .optional(),
    ]

}
const userLoginValidator =()=>{
    return [
        body("email")
        .optional()
        .isEmail()
        .withMessage("Invalid email format"),
        body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({min:6})
        .withMessage("Password must be at least 6 characters long"),
    ]
}
const userChangeCurrentPasswordValidator =()=>{
     return [
        body("oldPassword").notEmpty().withMessage("Old password is required")
        .isLength({min:6})
        .withMessage("Old password must be at least 6 characters long"),
        body("newPassword").notEmpty()
        .withMessage("New password is required")
        .isLength({min:6})
        .withMessage("New password must be at least 6 characters long"),
     ]
}
const userForgotPasswordValidator =()=>{
    return [
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
    ]
}
const userResetForgottenPasswordValidator =()=>{
    return [
        body("newPassword").notEmpty().withMessage("New password is required")
        .isLength({min:6})
        .withMessage("New password must be at least 6 characters long"),
    ]
}
export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgottenPasswordValidator

}