export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  console.log('New Nova E‑Sports Ticket:');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Message:', message);

  return res.status(200).json({ success: true });
}
