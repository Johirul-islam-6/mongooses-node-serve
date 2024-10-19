import nodemailer from 'nodemailer';
import config from '../../../config';

export async function sendEmail(to: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: config.email,
      pass: config.app_pass,
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: config.email,
    to,
    subject: 'Reset Password Link ✔',
    text: 'Reset password Click this Link. ',
    html,
  });
}
