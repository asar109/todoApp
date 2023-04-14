// sending mail through nodemailer

const nodemailer = require("nodemailer");

const sendMail = async (email, subject, body) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    auth: {
      user:process.env.NODEMAILER_USER ,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  // 2) Define the email options and sending to user
  await transporter.sendMail({
    from: "4ddfdbdf2388bc",
    to: email,
    subject: subject,
    html: body,
  }) 
};

module.exports = sendMail;
