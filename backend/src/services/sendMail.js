import nodemailer from "nodemailer";
import wrapAsync from "../utils/wrapAsync.js";

const sendMail = wrapAsync(async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();

  const mailOptions = {
    from: `"SaaS" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
});

export default sendMail;
