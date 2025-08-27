import nodemailer from "nodemailer";

/**
 * Hàm gửi email sử dụng Nodemailer
 * Sử dụng thông tin email trong .env
 */
const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    // Tạo transporter từ thông tin email trong .env
    const transporter = nodemailer.createTransport({
      service: "gmail",  // hoặc có thể thay đổi nếu dùng các dịch vụ khác như SendGrid, Mailgun, v.v.
      auth: {
        user: process.env.EMAIL_USER,  // Email của bạn (từ .env)
        pass: process.env.EMAIL_PASS,  // Password của email (từ .env)
      },
    });

    // Cấu hình email
    const mailOptions = {
      from: process.env.EMAIL_USER,  // Địa chỉ email gửi đi
      to,                           // Địa chỉ email nhận
      subject,                      // Chủ đề của email
      text,                          // Nội dung email
    };

    // Gửi email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
