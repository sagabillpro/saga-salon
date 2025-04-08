import path from "path";
import { transporter } from "../config/smtpconfig";
import * as ejs from "ejs";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();
import nodemailer from "nodemailer";

interface invoiceDetails {
  companyName: string;
  companyAddress: string;
  gstNumber: string;
  companyEmail: string;
  companyPhone: string;
  signatureUrl: string;
  logoUrl: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  totalPayable: number;
  clientName: string;
  //add address onlater on
  clientAddress: string;
  clientCity: string;
  clientState: string;
  //add zop code in customer
  clientZip: string;
  clientEmail: string;
  items: {
    description: string;
    quantity: number;
    unitCost: number;
    taxPercentage: string;
    taxAmount: number;
    lineTotal: number;
  }[];
  credentials: {
    mailerUsername: string;
    mailerPassword: string;
    mailerHost: string;
    mailerPort: string;
  };
}
// class invoiceDetails {
//   customer: string;
//   txnDate: string;
//   txnId: string;
//   mobile: string;
//   subTotal: number;
//   tax: number;
//   discount: number;
//   total?: number;
//   email: string;
//   itemData?: {
//     name: string;
//     quantity: number;
//     unitPrice: number;
//     total: number;
//     tax: number;
//     taxName: string;
//   }[];
// }
export default async function invoiceMailer<T extends invoiceDetails>(data: T) {
 
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/templates",
      "sale-invoice.template.ejs"
    );
    const transporter = nodemailer.createTransport({
      host: data.credentials.mailerHost,
      port: Number(data.credentials.mailerPort),
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user:data.credentials.mailerUsername,
        pass: data.credentials.mailerPassword,
      },
    });
    const info = await transporter.sendMail({
      from: `${data.companyName} <${data.companyEmail}>`,
      // '"JH hair & Beauty Studio" <jawedhabibgad@gmail.com>', // sender address
      to: `${data.clientEmail}`, // list of receivers
      subject: `🙏😇 Thanks for visiting ${data.companyName}`,
      //"🙏😇 Thanks for visiting JH hair & beauty studio.", // Subject line
      // text: "Hello world?", // plain text body
      html: await ejs.renderFile(templatePath, {
        data: {
          ...data,
        },
      }), // html body
    });
  } catch (e) {

    throw e;
  }
}
