import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // 1. SEND EMAIL USING BREVO SMTP
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
      to: email,
      subject: `Ticket Received: ${subject}`,
      text: `Hi ${name},\n\nWe received your ticket:\n\n${message}\n\nWe'll reply soon.\n\n— Nova Support`,
    });
  } catch (error) {
    console.error("SMTP error:", error);
  }

  // 2. SEND SLACK NOTIFICATION (your existing code)
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🎫 New Ticket\nFrom: ${name} (${email})\nSubject: ${subject}\nMessage: ${message}`,
      }),
    });
  } catch (error) {
    console.error("Slack error:", error);
  }

  return res.status(200).json({ success: true });
}
