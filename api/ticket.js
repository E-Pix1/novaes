// import fetch from "node-fetch";

// Generate Ticket ID
function generateTicketID() {
  const now = Date.now();
  return "NES-" + now.toString().slice(-6);
}

// Send auto-reply email
async function sendEmail(to, ticketID, name, message) {
  const apiKey = process.env.RESEND_API_KEY;

  const emailPayload = {
    from: "Nova E‑Sports Helpdesk <noreply@resend.dev>",
    to,
    subject: `Your Nova E‑Sports Ticket (${ticketID})`,
    html: `
      <h2>Nova E‑Sports Helpdesk</h2>
      <p>Hi ${name},</p>
      <p>Your support request has been received.</p>
      <p><strong>Ticket ID:</strong> ${ticketID}</p>
      <p><strong>Your Message:</strong><br>${message}</p>
      <p>We will get back to you shortly.</p>
      <br>
      <p>— Nova E‑Sports Support Team</p>
    `
  };

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(emailPayload)
  });
}

// MAIN HANDLER — Slack + Email + Ticket ID
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, email, message } = req.body || {};
  const ticketID = generateTicketID();

  // Slack webhook
  const webhook = process.env.SLACK_WEBHOOK_URL;

  const slackPayload = {
    text: `🆘 *New Nova E‑Sports Helpdesk Ticket*`,
    attachments: [
      {
        color: "#00aaff",
        fields: [
          { title: "Ticket ID", value: ticketID, short: true },
          { title: "Name", value: name, short: true },
          { title: "Email", value: email, short: true },
          { title: "Message", value: message, short: false }
        ],
        footer: "Nova ES Helpdesk Bot",
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  try {
    // 1. Send to Slack
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackPayload)
    });

    // 2. Send auto-reply email
    await sendEmail(email, ticketID, name, message);

    return res.status(200).json({ success: true, ticketID });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
}
