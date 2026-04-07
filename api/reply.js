import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "a75396001@smtp-brevo.com",
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

  try {
    await transporter.sendMail({
      from: "Nova Support <support@novaes.ddnsfree.com>",
      to,
      subject,
      text: message,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("SMTP error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
