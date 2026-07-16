export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, email, telefono, servicio, horario, mensaje, website } = req.body;

  // Honeypot anti-spam
  if (website) {
    return res.status(200).json({ success: true });
  }

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre es requerido.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Un correo electrónico válido es requerido.' });
  }
  if (!telefono || !telefono.trim()) {
    return res.status(400).json({ error: 'El teléfono es requerido.' });
  }
  if (!servicio || !servicio.trim()) {
    return res.status(400).json({ error: 'El servicio es requerido.' });
  }
  if (!horario || !horario.trim()) {
    return res.status(400).json({ error: 'El horario preferido es requerido.' });
  }
  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ error: 'Las notas adicionales son requeridas.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL ?? 'priscilasolera@blueroyalespa.com';
  const fromEmail = process.env.RESEND_FROM ?? 'Blue Royale Spa <noreply@blueroyalespa.com>';

  if (!apiKey) {
    console.error('RESEND_API_KEY no configurado');
    return res.status(500).json({ error: 'Error de configuración del servidor.' });
  }

  const emailHtml = `
    <h2>Nueva solicitud de cita — Blue Royale Spa</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Correo:</strong> ${email}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <p><strong>Servicio de interés:</strong> ${servicio}</p>
    <p><strong>Horario preferido:</strong> ${horario}</p>
    <p><strong>Notas:</strong> ${mensaje}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [contactEmail],
      reply_to: email.trim(),
      subject: `Solicitud de cita de ${nombre} — ${servicio}`,
      html: emailHtml,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Resend error:', response.status, err);
    return res.status(500).json({ error: 'No se pudo enviar el mensaje. Intenta de nuevo.' });
  }

  return res.status(200).json({ success: true });
}
