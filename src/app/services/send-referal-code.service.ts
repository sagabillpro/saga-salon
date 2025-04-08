import path from "path";
import { transporter } from "../config/smtpconfig";
import * as ejs from "ejs";
import nodemailer from "nodemailer";

export async function sendReferalEmail({
  customer,
  referredPersonName,
  company,
  couponCode,
  expiresIn,
  message,
  credentials
}: {
  customer: { name: string; email: string };
  couponCode: string;
  referredPersonName: string;
  company: { tagLine: string; logo: string; name: string; email: string };
  expiresIn: number;
  message: string;
  credentials: {
    mailerUsername: string;
    mailerPassword: string;
    mailerHost: string;
    mailerPort: string;
  };
}) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + expiresIn);
  // console.log(currentDate.toDateString()); // Example output: "Thu Mar 27 2025"
  const transporter = nodemailer.createTransport({
    host: credentials.mailerHost,
    port: Number(credentials.mailerPort),
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: credentials.mailerUsername,
      pass: credentials.mailerPassword,
    },
  });
  const templatePath = path.join(
    __dirname,
    "../templates/templates",
    "referal.template.ejs"
  );
  const htmlContent = await ejs.renderFile(templatePath, {
    customerName: customer.name,
    referredPersonName: referredPersonName,
    companyLogo: company.logo,
    companyName: company.name,
    companyTagline: company.tagLine,
    couponCode,
    couponExpiry: currentDate.toDateString(),
    companyMessage: message,
  });

  const mailOptions = {
    from: `"${company.name}" <${company.email}>`,
    to: customer.email,
    subject: `A Special Gift for You from  ${company.name}! Your Referral Coupon Inside 🎁!`,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
}
