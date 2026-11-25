import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

/** SMTP settings live only in the server's secrets file (mail.env). Without them, email login is disabled. */
export const mailEnabled = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
let tx: Transporter | null = null;
function transport() {
  return (tx ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465), secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  }));
}
export async function sendMail(to: string, subject: string, text: string, html: string) {
  await transport().sendMail({ from: `"نور لأمي" <${process.env.MAIL_FROM || process.env.SMTP_USER}>`, to, subject, text, html });
}
