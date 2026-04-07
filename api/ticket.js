// import fetch from "node-fetch";

// Generate Ticket ID
function generateTicketID() {
  const now = Date.now();
  return "NES-" + now.toString().slice(-6);
}

// Send auto-reply email
async function sendEmail(to, ticketID, name, message) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) throw new Error("Missing RESEND_API_KEY");

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
}

// MAIN HANDLER — Slack + Email + Ticket ID
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const ticketID = generateTicketID();

    // Slack webhook
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) throw new Error("Missing SLACK_WEBHOOK_URL");

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

    const slackRes = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackPayload)
    });

    if (!slackRes.ok) {
      const text = await slackRes.text();
      throw new Error("Slack error: " + text);
    }

    // Send auto-reply email
    await sendEmail(email, ticketID, name, message);

    return res.status(200).json({ success: true, ticketID });
  } catch (err) {
    console.error("CRASH:", err);
    return res.status(500).json({ error: err.message });
  }
}
