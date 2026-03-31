const transporter = require("./transporter");
const { Verification_Email_Template } = require("./mailTemplate");

const sendOTPEmail = async (email, otp) => {

  const html = Verification_Email_Template
    .replace("{verificationCode}", otp);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    html
  });

};

module.exports = sendOTPEmail;

