// import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, ticketID, replyMessage } = req.body || {};

    if (!email || !ticketID || !replyMessage) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing RESEND_API_KEY");

    const emailPayload = {
      from: "Nova E‑Sports Support <noreply@resend.dev>",
      to: email,
      subject: `Reply to your ticket (${ticketID})`,
      html: `
        <h2>Nova E‑Sports Support</h2>
        <p>Hi,</p>
        <p>We have an update on your ticket:</p>
        <p><strong>${ticketID}</strong></p>
        <p>${replyMessage}</p>
        <br>
        <p>— Nova E‑Sports Support Team</p>
      `
    };

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailPayload)
    });

    if (!emailRes.ok) {
      const text = await emailRes.text();
      throw new Error("Resend error: " + text);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("CRASH:", err);
    return res.status(500).json({ error: err.message });
  }
}
