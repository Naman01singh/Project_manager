import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "task Manager",
            link: "https://yourcompany.com",
        },
    });

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHTML = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML,
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const emailVerificationMailgenContent=(username,verificationUrl)=>{
    return {
        body:{
            name:username,
            intro:"Welcom to our App!we'are excited to have you on board!",
            action:{
                instructions:"To verify your email address, please click the button below:",
                button:{
                    color:"green",
                    text:"Verify Email",
                    link:verificationUrl
                },
            },
            outro:"Need help,or have questions? Just reply to this email,we're always happy to help.",
        },
    };
};

const forgotPasswordMailgenContent=(username,passwordResetUrl)=>{
    return {
        body:{
            name:username,
            intro:"We got a request to reset the password for your account.",
            action:{
                instructions:"To reset your password, please click the button below:",
                button:{
                    color:"red",
                    text:"Reset Password",
                    link:passwordResetUrl
                },
            },
            outro:"Need help,or have questions? Just reply to this email,we're always happy to help.",
        },
    };
};

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,sendEmail
}

// 2a5c313b3b0fb1d47032d5c4b5318696 