export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  const webhook = process.env.SLACK_WEBHOOK_URL;

  const payload = {
    text: "🆘 *New Nova E‑Sports Helpdesk Ticket*",
    attachments: [
      {
        color: "#00aaff",
        fields: [
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
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Slack webhook error:", err);
    return res.status(500).json({ success: false, error: "Slack webhook failed" });
  }
}
