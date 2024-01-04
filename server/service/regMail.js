import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'dreamyourhome62@gmail.com',
    pass: 'zkunjicljvfljcjt',
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendMail = async (email, subject, msg) => {
  await transporter.sendMail({
    from: 'dreamyourhome62@gmail.com',
    to: email,
    subject: subject,
    text: msg,
    html: `<p>${msg}</p><p>Click the above  link to activate your account</p>`
  })
  console.log('Mail Send............');
  return true;
}